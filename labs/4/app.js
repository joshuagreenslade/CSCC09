var express = require('express');
var app = express();
app.use(express.static('frontend'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

var messages = [];

var Message = (function(){
	var id = 0;
	return function Message(message){
		this.id = id++;
		this.content = message.content;
		this.author = message.author;
		this.upvote = 0;
		this.downvote = 0;
	};
}());

app.post('/', function (req, res, next) {
    res.json(req.body);
    next();
});

app.post('/api/messages/', function(req, res, next){
	var message = new Message(req.body);
	messages.push(message);
	var result = {id:message.id};
	res.json(result);
	next();
});

app.get('/api/messages/', function(req, res, next){
	res.json(messages);
	next();
});

app.delete('/api/messages/:id/', function(req, res, next){
	var message = messages.filter(function(message){
		return (message.id === parseInt(req.params.id));
	});
	messages = messages.filter(function(message){
		return (message.id !== parseInt(req.params.id));
	});
	if(message[0] !== undefined){
		var result = {id:message[0].id};
		res.json(result);
	}
	next();
});

app.patch('/api/messages/:id/', function(req, res, next){
	var message = messages.filter(function(message){
		return (message.id === parseInt(req.params.id));
	})[0];
	if(message !== undefined){
		message.upvote += parseInt(req.body.upvote);
		message.downvote += parseInt(req.body.downvote);
		res.json(message);
	}
	next();
});

app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});

app.listen(3000, function () {
    console.log('app listening on port 3000!');
});