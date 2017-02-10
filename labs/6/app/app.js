var path = require('path');
var express = require('express')
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

app.use(express.static('frontend'));

var Datastore = require('nedb');
var messages = new Datastore({ filename: 'db/messages.db', autoload: true, timestampData : true});
var users = new Datastore({ filename: 'db/users.db', autoload: true });

var crypto = require('crypto');
var session = require('express-session');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    return next();
});

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

var checkPassword = function(user, password){
    var hash = crypto.createHmac('sha512', user.salt);
    hash.update(password);
    return (hash.digest('base64') === user.saltedHash);
};

var checkAuthentication = function(req, res, next){
    if(session.user){
        req.user = session.user;
        next();
    }
    else
        res.status(403).end("forbidden");
};


// signin, signout

app.delete('/signout/', function (req, res, next) {
    session.user = null;
    res.end();
});

app.post('/signin/', function (req, res, next) {
    users.findOne({username: req.body.username}, function(err, user){
        if (err) res.status(500).end("Database error");
        if ((!user) || (!checkPassword(user, req.body.password))) res.status(401).end("Wrong username or password");
        else{
            session.user = user;
            res.json(user);
        }
    });
});

// Create

app.put('/api/users/', function (req, res, next) {
    var data = new User(req.body);
    users.insert(data, function (err, user) {
        if (err){
            res.status(409).end("Username " + req.body.username + " already exists");
            return next();
        }
        res.json(user);
        return next();
    });
});

app.post('/api/messages/', checkAuthentication, function (req, res, next) {
    if(session.user.username === req.body.username) {
        var message = new Message(req.body);
        messages.insert(message, function (err, data) {
            data.id = data._id;
            res.json(data);
            return next();
        });
    }
    else{
        res.status(403).end("forbidden");
    }
});

// Read

app.get('/api/messages/', function (req, res, next) {
    messages.find({}).sort({createdAt:-1}).limit(5).exec(function(err, selectedMessages) { 
        var usernames = selectedMessages.map(function(e){return {username: e.username};});
        users.find({ $or: usernames}, function(err, selectedUsers){
            selectedMessages.forEach(function(e){
                var user = selectedUsers.find(function(u){return u.username === e.username;});
                e.picture = '/api/users/' + e.username + '/picture/';
                if (user.picture) e.mimetype = user.picture.mimetype
                return e;
            });
            res.json(selectedMessages.reverse());
            return next();
        });
    });
});

app.get('/api/users/:username/picture/', function (req, res, next) {
    users.findOne({username: req.params.username}, function(err, user){
        if (err){
            res.status(404).end("User username:" + req.params.username + " does not exists");
            return next();
        }
        if (user.picture){
            res.setHeader('Content-Type', user.picture.mimetype);
            res.sendFile(path.join(__dirname, user.picture.path));
            return next();
        }
        res.redirect('/media/user.png');
        return next();
    });    
});

// Update

app.patch('/api/users/:username/', checkAuthentication, upload.single('picture'), function (req, res, next) {
    if(session.user.username === req.params.username) {
        users.update({username: req.params.username}, {$set: {picture: req.file}}, {multi:false}, function (err, n) {
            if (err){
                res.status(404).end("User username:" + req.params.username + " does not exists");
                return next();
            }
            res.json("");
            return next();
        });
    }
    else{
        res.status(403).end("forbidden");
    }
});

app.patch('/api/messages/:id/', checkAuthentication, function (req, res, next) {
    var data = {};
    data[req.body.action] = 1;
    messages.update({_id: req.params.id},{$inc: data},  {multi:false}, function (err, n) {
        if (err){
            res.status(404).end("Message id:" + req.params.id + " does not exists");
            return next();
        }
        res.json("");
        return next();
    });
    return next();
});

// Delete

app.delete('/api/messages/:id/', checkAuthentication, function (req, res, next) {
    messages.findOne({_id: req.params.id, username: session.user.username}, function(err, result){
        if(result === null){
            res.status(403).end("forbidden");
            return next();
        }
    });
    messages.remove({ _id: req.params.id, username: session.user.username }, { multi: false }, function(err, num) {  
        console.log(num)
        if(num===0){
            res.status(404).end("Message id:" + req.params.id + " does not exists");
            return next();
        }
        res.end();
        return next();
    });
});

app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});


app.listen(3000, function () {
  console.log('App listening on port 3000')
});