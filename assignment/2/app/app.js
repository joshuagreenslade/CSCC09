//var path = require('path');
var express = require('express');
var app = express();

var multer = require('multer');
var upload = multer({dest: 'uploads/'});

var Datastore = require('nedb');
var counters = new Datastore({ filename: 'db/counters.db', autoload: true});
var images = new Datastore({ filename: 'db/images.db', autoload: true});
var comments = new Datastore({ filename: 'db/comments.db', autoload: true});

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static('frontend'));


app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    return next();
});


//initialize counters the first time the server starts
counters.find({}, function(err, counter){
	if(counter[0] === undefined){
		counters.insert({_id: 'image', count: 0});
		counters.insert({_id: 'comments', count: 0});	
	}
});


//create

//adds the image info to the image database, and if picture is a file upload it
app.post('/api/images/', upload.single('picture'), function(req, res, next){

	//increment the counter
	counters.findOne({_id: 'image'}, function(err, counter){
		var count = counter.count;
		counters.update({_id: "image"}, {_id: "image", count: count + 1});

		var file = req.file;
		if(file === undefined)
			file = req.body.picture;

		//link the new image to the previous one
		images.findOne({right: null}, function(err, result){
			var left = null;
			if(result){
				left = result._id;
				result.right = count;
				images.update({right: null}, result);
			}

			//add the image info to the images database
			images.insert({_id: count, picture: file, title: req.body.title, author: req.body.author, left: left, right: null}, function(err, insert_result){
				res.json(insert_result._id);
				next();
			});
		});
	});
});

//adds the comment to the comments database
app.post('/api/comments/', function(req, res, next){
	var image_id = req.body.image_id;

	//increment the counter
	counters.findOne({_id: "comments"}, function(err, counter){
		var count = counter.count;
		counters.update({_id: "comments"}, {count: count + 1});

		//link the new comment to the previous one with the same image id
		comments.findOne({newer_comment: null, image_id: image_id}, function(err, result){
			var older_comment = null;
			if(result){
				older_comment = result._id;
				result.newer_comment = count;
				comments.update({newer_comment: null, image_id: image_id}, result);
			}

			//add the comment to the comments database
			comments.insert({_id: count, image_id: image_id, author: req.body.author, message: req.body.message, date: req.body.date, older_comment: older_comment, newer_comment: null}, function(err, insert_result){
				res.json(insert_result._id);
				next();
			});
		});
	});
});


//read

//stops 404 favicon errors from http://stackoverflow.com/questions/35408729/express-js-prevent-get-favicon-ico
app.get('/favicon.ico', function(req, res, next) {
    res.sendStatus(204);
    next();
});

//gets the image with the given id
app.get('/api/images/:id', function(req, res, next){
	var id = JSON.parse(req.params.id);

	if(id !== null){
		//finds the image with _id id
		images.findOne({_id: id}, function(err, result){
			if(result)
				res.json(result);
			else
				res.status(404).json("Image with id " + req.params.id + " does not exist");

			next();
		});
	}
	else{
		//gets the first image
		images.findOne({}).sort({_id: 1}).exec(function(err, result){
			res.json(result);
			next();
		});
	}
});

//gets the picture file with the given id
app.get('/api/images/:id/picture', function(req, res, next){
	images.findOne({_id: JSON.parse(req.params.id)}, function(err, result){
		if(result){
			res.setHeader('Content-Type', result.picture.mimetype);
	        res.sendFile(path.join(__dirname, result.picture.path));
    	}
    	else
            res.status(404).json("Image " + req.params.id + " does not exists");

    	next();
	});
});

//gets comments for the image with 'imageId', starting at 'firstComment' and getting either the next 'num' older or newer comments
app.get('/api/comments/:firstComment&:imageId&:num&:direction', function(req, res, next){

	//parameters from url
	var firstComment = JSON.parse(req.params.firstComment);
	var imageId = JSON.parse(req.params.imageId);
	var num = JSON.parse(req.params.num);
	var direction = req.params.direction;

	//default database query that will get the comments in order from newest to oldest
	var query = {image_id: imageId};
	var order = {_id: -1};

	//modify the query to get the comments equal to or older than the firstComment
	if((direction == "older") && (firstComment !== null))
		query._id = {$lte: firstComment};

	//modify the query to get the comments equal to or newer than the firstComment
	else if((direction == "newer") && (firstComment !== null)){
		query._id = {$gte: firstComment};
		order._id = 1;
	}

	//get at most 'num' comments resulting from the query
	comments.find(query).sort(order).limit(num).exec(function(err, result){
		if((direction == "newer") && (firstComment !== null))
			res.json(result.reverse());
		else
			res.json(result);

		next();
	});	
});

//update

//api does not currently support update


//delete

//deletes the image with the given id
app.delete('/api/images/:id', function(req, res, next){

	//get the image to be deleted
	images.findOne({_id: JSON.parse(req.params.id)}, function(err, result){
		if(result){

			//find the next image's id
			var next_id = result.left;
			if(next_id === null)
				next_id = result.right;

			//update the left image's right image link
			images.findOne({_id: result.left}, function(err, left_res){
				if(left_res){
					left_res.right = result.right;
					images.update({_id: result.left}, left_res);	
				}
			});

			//update the right image's left image link
			images.findOne({_id: result.right}, function(err, right_res){
				if(right_res){
					right_res.left = result.left;
					images.update({_id: result.right}, right_res);
				}
			});

			images.remove({_id: JSON.parse(req.params.id)});
			res.json(next_id);
		}
		else
            res.status(404).json("Image " + req.params.id + " does not exists");
		
		next();
	});
});

//deletes the comment with the given id
app.delete('/api/comments/:id', function(req, res, next){
	var id = JSON.parse(req.params.id);
	
	//get the comment to be deleted
	comments.findOne({_id: id}, function(err, comment){

		//update the older_comment's newer_comment link
		comments.findOne({_id: comment.older_comment}, function(err, older_comment){
			if(older_comment){
					older_comment.newer_comment = comment.newer_comment;
					comments.update({_id: older_comment._id}, older_comment);
				}
		});

		//update the newer_comment's older_comment link
		comments.findOne({_id: comment.newer_comment}, function(err, newer_comment){
			if(newer_comment){
				newer_comment.older_comment = comment.older_comment;
				comments.update({_id: newer_comment._id}, newer_comment);
			}
		});

		comments.remove({_id: comment._id});
		res.json(comment);
		next();	
	});
});


app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});


app.listen(3000, function () {
  console.log('App listening on port 3000');
});