var crypto = require('crypto');
var path = require('path');
var express = require('express')
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

var Datastore = require('nedb');
var messages = new Datastore({ filename: 'db/messages.db', autoload: true, timestampData : true});
var users = new Datastore({ filename: 'db/users.db', autoload: true });

/////////////////////////////////////////////////////////////////////////////
//how to run
//
//
//
//
//to test on windows do the following:
//in command prompt
//
// docker-machine start default
// SET DOCKER_TLS_VERIFY=1
// SET DOCKER_HOST=tcp://192.168.99.100:2376
// SET DOCKER_CERT_PATH=C:\Users\Joshua\.docker\machine\machines\default
// SET DOCKER_MACHINE_NAME=default
// docker start my_memcached
//
//then in this file use '192.168.99.100:11211' as the arg for Memcached
//(if it doesnt work do
// docker-machine ip default
//and use that ip:11211 instead of 192.168.99.100:11211)
//
//start nodemon app.js
//type https://localhost:3000 into browser
//
//when done do
// docker stop my_memcached
// docker-machine stop default
//
//
//
//to run on the docker server:
//first in this file use 'localhost:11211' as the arg for Memcached
//in command prompt in the greensl4/labs/8 directory do
// docker build -t my_image .
// docker run -p 443:3000 --name my_container -d my_image
//
//then to run type https://192.168.99.100/ into the browser (the port of 443 is assumed)
//if that doesn't work iin command prompt do
// docker-machine ip default
//and use that ip instead of 192.168.99.100
//
//when done do
// docker stop my_container
// docker rm my_container
// docker-machine stop default
/////////////////////////////////////////////////////////////////////////////

var Memcached = require('memcached');
var memcached = new Memcached(/*'192.168.99.100:11211'*/'localhost:11211');

//memcached stuff
var warmCache = function(){
    messages.find({}).sort({createdAt:-1}).limit(5).exec(function(err, data){
        if(err) return console.log(err);
        var messages = data.map(function(message){return message});
        memcached.set('messages', messages, 0, function(err){
            if(err) console.log(err);
        });
    });
}

var getMessages = function(callback){

    memcached.get('messages', function(err, messages){
        if(err) return callback(err, null);
        return callback(null, messages);
    });
}

var storeMessage = function(message, callback){
    messages.insert(message, function(err, data){
        if(err) return callback(err, null);
        warmCache();
        return callback(null, data);
    });
}


// Message constructor
var Message = function(message){
        this.content = message.content;
        this.username = message.username;
        this.upvote = (message.upvote)? message.upvote : 0;
        this.downvote = (message.downvote)? message.downvote : 0;
};

var User = function(user){
    var salt = crypto.randomBytes(16).toString('base64');
    var hash = crypto.createHmac('sha512', salt);
    hash.update(user.password);
    this.username = user.username;
    this.picture = null;
    this.salt = salt;
    this.saltedHash = hash.digest('base64');
};

// Authentication

var checkPassword = function(user, password){
        var hash = crypto.createHmac('sha512', user.salt);
        hash.update(password);
        var value = hash.digest('base64');
        return (user.saltedHash === value);
};

var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, sameSite: true }
}));

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    return next();
});

// sanitization and validation
var expressValidator = require('express-validator');
app.use(expressValidator({
    customValidators: {
        isAction: function(value) {
            return (['upvote','downvote'].indexOf(value) > -1);
        },
        fail: function(value){
            return false;
        }
    }
})); 

app.use(function(req, res, next){
    Object.keys(req.body).forEach(function(arg){
        switch(arg){
            case 'username':
                req.checkBody(arg, 'invalid username').isAlpha();
                break;
            case 'password':
                break;
            case 'content':
                req.sanitizeBody(arg).escape();
                break
            case 'action':
                req.checkBody(arg, 'invalid action').isAction();
                break;
            default:
                req.checkBody(arg, 'unknown argument').fail();
        }
    });
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) return res.status(400).send('Validation errors: ' + util.inspect(result.array()));
        else next();
    });
});

// serving the frontend

app.get('/', function (req, res, next) {
    if (!req.session.user) return res.redirect('/signin.html');
    return next();
});

app.get('/profile.html', function (req, res, next) {
    if (!req.session.user) return res.redirect('/signin.html');
    return next();
});

app.get('/signout/', function (req, res, next) {
    req.session.destroy(function(err) {
        if (err) return res.status(500).end(err);
        return res.redirect('/signin.html');
    });
});

app.use(express.static('frontend'));

// signout, signin

app.get('/api/signout/', function (req, res, next) {
    req.session.destroy(function(err) {
        if (err) return res.status(500).end(err);
        return res.end();
    });
});

app.post('/api/signin/', function (req, res, next) {
    if (!req.body.username || ! req.body.password) return res.status(400).send("Bad Request");
    users.findOne({username: req.body.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user || !checkPassword(user, req.body.password)) return res.status(401).end("Unauthorized");
        req.session.user = user;
        res.cookie('username', user.username, {secure: true, sameSite: true});
        return res.json(user);
    });
});

// Create

app.put('/api/users/', function (req, res, next) {
    var data = new User(req.body);
    users.findOne({username: req.body.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("Username " + req.body.username + " already exists");
        users.insert(data, function (err, user) {
            if (err) return res.status(500).end(err);
            return res.json(user);
        });
    });
});

app.post('/api/messages/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    req.body.username = req.session.user.username;
    var message = new Message(req.body);

    storeMessage(message, function(err, data){
        if(err) return res.status(500);
        else{
            data.id = data._id;
            return res.json(data);
        }
    });
});

// Read

app.get('/api/messages/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    
    getMessages(function(err, messages){
        if (err) res.status(500).end(err);
        else{
            var usernames = messages.map(function(e){return {username: e.username};});
            users.find({ $or: usernames}, function(err, selectedUsers){
            messages.forEach(function(e){
                var user = messages.find(function(u){return u.username === e.username;});
                e.picture = '/api/users/' + e.username + '/picture/';
                if (user.picture) e.mimetype = user.picture.mimetype
                return e;
            });
            return res.json(messages.reverse());
        });
        }
    })
});

app.get('/api/users/:username/picture/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    users.findOne({username: req.params.username}, function(err, user){
        if (err) return res.status(404).end("User username:" + req.params.username + " does not exists");
        if (user.picture){
            res.setHeader('Content-Type', user.picture.mimetype);
            return res.sendFile(path.join(__dirname, user.picture.path));
        }
        return res.redirect('/media/user.png');
    });    
});

// Update

app.patch('/api/users/:username/', upload.single('picture'), function (req, res, next) {
     if (req.params.username !== req.session.user.username) return res.status(403).send("Forbidden");
     users.update({username: req.params.username}, {$set: {picture: req.file}}, {multi:false}, function (err, n) {
         if (err) return res.status(404).end("User username:" + req.params.username + " does not exists");
         return res.json("");
     });        
});

app.patch('/api/messages/:id/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var data = {};
    data[req.body.action] = 1;
    messages.update({_id: req.params.id},{$inc: data},  {multi:false}, function (err, n) {
        if (err) return res.status(404).end("Message id:" + req.params.id + " does not exists");
        warmCache();
        return res.json("");
    });
});

// Delete

app.delete('/api/messages/:id/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    messages.findOne({ _id: req.params.id }, function(err, message){
        if (err) return res.status(404).end("Message id:" + req.params.id + " does not exists");
        if (message.username !== req.session.user.username) return res.status(403).send("Unauthorized");
        messages.remove({ _id: req.params.id }, { multi: false }, function(err, num) {  
            if (err) return res.status(500).send("Database error");
            warmCache();
            return res.end();
        });
    });
});

var fs = require('fs');
var https = require('https');
var privateKey = fs.readFileSync( 'server.key' );
var certificate = fs.readFileSync( 'server.crt' );
var config = {
        key: privateKey,
        cert: certificate
};
https.createServer(config, app).listen(3000, function () {
    warmCache();
    console.log('HTTPS on port 3000');
});