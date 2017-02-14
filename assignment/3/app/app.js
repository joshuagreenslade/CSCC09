var path = require('path');
var express = require('express');
var app = express();

var multer = require('multer');
var upload = multer({dest: 'uploads/'});

var Datastore = require('nedb');
var images = new Datastore({ filename: 'db/images.db', autoload: true, timestampData : true});
var comments = new Datastore({ filename: 'db/comments.db', autoload: true, timestampData : true});

var fs = require('fs');

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static('frontend'));


app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    return next();
});


//Create

//adds the image info to the image database, and if picture is a file upload it
app.post('/api/images/', upload.single('picture'), function(req, res, next){

	var file = req.file;
	if(file === undefined)
		file = req.body.picture;

	//link the previous image to the new one
	images.findOne({right: null}, function(err, result){
		var left = null;
		if(result)
			left = result._id;

		//add the image info to the images database
		images.insert({picture: file, title: req.body.title, author: req.body.author, left: left, right: null}, function(err, insert_result){

			//link the new image to the previous one
			if(result){
				result.right = insert_result._id;
				images.update({_id: result._id}, result);
			}
			res.json(insert_result._id);
			return next();
		});
	});
});

//adds the comment to the comments database and links it to the image with id imageId
app.post('/api/images/:imageId/comments/', function(req, res, next){
	var image_id = req.params.imageId;

	//link the previous comment with the same image id to the new comment 
	comments.findOne({newer_comment: null, image_id: image_id}, function(err, result){
		var older_comment = null;
		if(result)
			older_comment = result._id;

		//add the comment to the comments database
		comments.insert({image_id: image_id, author: req.body.author, message: req.body.message, date: req.body.date, older_comment: older_comment, newer_comment: null}, function(err, insert_result){

			//link the new comment to the previous comment
			if(result){
				result.newer_comment = insert_result._id;
				comments.update({_id: result._id}, result);
			}
			res.json(insert_result._id);
			return next();
		});
	});
});


//Read

//stops 404 favicon errors from http://stackoverflow.com/questions/35408729/express-js-prevent-get-favicon-ico
app.get('/favicon.ico', function(req, res, next) {
    res.sendStatus(204);
    return next();
});

//gets the image data for the image with the given id
app.get('/api/images/:id/', function(req, res, next){
	var id = req.params.id;
	if(id !== "first"){

		//finds the image with _id id
		images.findOne({_id: id}, function(err, result){
			if(result)
				res.json(result);
			else
				res.status(404).json("Image with id " + id + " does not exist");
			return next();
		});
	}
	else{

		//gets the first image
		images.findOne({}).sort({createdAt: 1}).exec(function(err, result){
			res.json(result);
			return next();
		});
	}
});

//gets the picture file with the given id
app.get('/api/images/:id/picture/', function(req, res, next){
	var id = req.params.id;

	//return the image url
	images.findOne({_id: id}, function(err, result){
		if(result){
			if(typeof(result.picture) == "string")
				res.json(result.picture);
			else{
				res.setHeader('Content-Type', result.picture.mimetype);
		        res.sendFile(path.join(__dirname, result.picture.path));
	    	}
    	}
    	else
            res.status(404).json("Image with id " + req.params.id + " does not exists");
    	return next();
	});
});

//gets comments for the image with 'imageId', starting at 'firstComment' where the comments are sorted as specified and stopping after limit is reached
//the default for limit is 10 and the default for sort is decreasing
app.get('/api/images/:imageId/comments/:firstComment/', function(req, res, next){
	var firstComment = req.params.firstComment;
	var imageId = req.params.imageId;
	var limit = req.query.limit;
	var sort = req.query.sort;

	//make sure that if limit or sort was provided that they are valid
	if(limit === undefined)
		limit = 10;
	else if(isNaN(limit)){
		res.status(400).json("Invalid arguments. Limit must be a number and " + limit + " is not");
		return next();
	}
	if(sort === undefined)
		sort = "decreasing";
	else if((sort !== "decreasing") && (sort !== "increasing")){
		res.status(400).json("Invalid arguments. Sort must be a decreasing or increasing and " + sort + " is not");
		return next();
	}

	var search = {_id: firstComment};
	if(firstComment === "last")
		search = {image_id: imageId};

	//get the current comment
	comments.findOne(search).sort({createdAt: -1}).exec(function(err, comment){

		//default database query that will get the comments in decreasing order of creation
		var query = {image_id: imageId};
		var order = {createdAt: -1};

		if(comment){

			//modify the query to get the comments who were created before or at the same time as firstComment
			if((sort == "decreasing"))
				query.createdAt = {$lte: comment.createdAt};

			//modify the query to get the comments who were created after of at the same time as firstComment
			else if((sort == "increasing")){
				query.createdAt = {$gte: comment.createdAt};
				order.createdAt = 1;
			}
		}

		//get comments resulting from the query, stopping after limit is reached
		comments.find(query).sort(order).limit(limit).exec(function(err, result){
			if((sort == "increasing"))
				res.json(result.reverse());
			else
				res.json(result);
			return next();
		});	
	});
});


//Update

//api does not currently support update


//Delete

//deletes the image with the given id
app.delete('/api/images/:id/', function(req, res, next){
	var id = req.params.id;

	//get the image to be deleted
	images.findOne({_id: id}, function(err, result){
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

			images.remove({_id: id});
			fs.unlink(result.picture.path);
			res.json(next_id);
		}
		else
            res.status(404).json("Image " + id + " does not exists");		
		return next();
	});
});

//deletes the comment with the given id
app.delete('/api/comments/:id/', function(req, res, next){
	var id = req.params.id;

	//get the comment to be deleted
	comments.findOne({_id: id}, function(err, comment){
		if(comment){

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
			res.json(id);
			return next();
		}
		else
            res.status(404).json("Comment with id " + id + " does not exists");
	});
});


app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});


app.listen(3000, function () {
  console.log('App listening on port 3000');
});