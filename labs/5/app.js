var path = require('path');
var express = require('express')
var app = express();

var multer = require('multer');
var upload = multer({dest: 'uploads/'});

var Datastore = require('nedb')
  , messages = new Datastore({ filename: 'db/messages.db', autoload: true, timestampData: true})
  , users = new Datastore({ filename: 'db/users.db', autoload: true });

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static('frontend'));


app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    return next();
});


// Create

app.put('/api/users/', function (req, res, next) {
    users.findOne({username: req.body.username}, function(err, user){
        if(user){
            res.status(409).json("Username:" + user.username + " already exists");
            return next();
        }
        else{
            users.insert({username: req.body.username, picture: null});
            res.json({username: req.body.username, picture: null});
            return next();
        }
    });
});

app.post('/api/messages/', function (req, res, next) {
    var id;
    do{
        id = Math.random().toString(36).substring(7);
    }while(id in messages);
    req.body.id = id;
    messages.insert({id: id, content: req.body.content, username: req.body.username, upvote: 0, downvote: 0});
    res.json({id: id, content: req.body.content, username: req.body.username, upvote: 0, downvote: 0});
    return next();
});

// Read

app.get('/api/messages/', function (req, res, next) {
   messages.find({}).sort({createdAt:-1}).limit(10).exec(function(err, messages_res){
        res.json(messages_res)
        return next();
    });
});

app.get('/api/users/', function (req, res, next) {
    users.find({}, function(err, user_res){
        res.json(user_res);
        return next();
    });
});

app.get('/api/users/:username/picture', function(req, res, next){
    users.findOne({username: req.params.username}, function(err, user){
        if(user){
            if(user.picture){
                res.setHeader('Content-Type', user.picture.mimetype)
                res.sendFile(path.join(__dirname, user.picture.path))
            }
            else{
                res.status(404).json("Picture for user " + req.params.username + " does not exists");
            }
        }
        else{
            res.status(404).json("User " + req.params.username + " does not exists");
        }
        next();
    });
});

// Update

app.patch('/api/messages/:id/', function (req, res, next) {
    messages.findOne({id: req.params.id}, function(err, message){
        if (!(message)){
            res.status(404).json("Message id:" + message.id + " does not exists");
            return next();
        }
        switch(req.body.action){
            case ("upvote"):
                messages.update({id: message.id}, {id: message.id, content: message.content, username: message.username, upvote: message.upvote+1, downvote: message.downvote})
                break
            case ("downvote"):
                messages.update({id: message.id}, {id: message.id, content: message.content, username: message.username, upvote: message.upvote, downvote: message.downvote+1})
                break;
        }

        messages.findOne({id: message.id}, function(err, message){
            res.json(message);
            return next();
        });
    });
});


app.patch('/api/users/:username/', upload.single('picture'), function(req, res, next) {
    users.update({username: req.body.username}, {username: req.body.username, picture: req.file})
    next();
});

// Delete

app.delete('/api/messages/:id/', function (req, res, next) {
    messages.findOne({id: req.params.id}, function(err, message){
        if (!(message)){
            res.status(404).json("Message id:" + message.id + " does not exists");
            return next();
        } 
        messages.remove({id: message.id});
        res.json(message);
        return next();
    })
});

Object.prototype.values = function(o) { 
    return Object.keys(o).map(function (key) { 
          return o[key]; 
           }); 
};


app.use(function (req, res, next){
    messages.find({}, function(err, message){
        console.log("messages", message);
    });
    users.find({}, function(err, user){
        console.log("users", user);
    });
    console.log("HTTP Response", res.statusCode);
});


app.listen(3000, function () {
  console.log('App listening on port 3000')
});