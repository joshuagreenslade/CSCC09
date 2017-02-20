var crypto = require('crypto');
var path = require('path');
var express = require('express');
var app = express();
var fs = require('fs');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var https = require('https');
var validator = require('express-validator');

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var Datastore = require('nedb');
var images = new Datastore({ filename: 'db/images.db', autoload: true, timestampData : true});
var comments = new Datastore({ filename: 'db/comments.db', autoload: true, timestampData : true});
var galleries = new Datastore({ filename: 'db/galleries.db', autoload: true, timestampData: true});

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(validator());

var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true, sameSite: true}
}));

var privateKey = fs.readFileSync( 'server.key' );
var certificate = fs.readFileSync( 'server.crt' );
var config = {
        key: privateKey,
        cert: certificate
};

app.use(express.static('frontend'));

app.use(function (req, res, next){
    console.log("HTTPS request", req.method, req.url, req.body);
    return next();
});


//Authentication

//check that the password provided is the correct password for the given user
var checkPassword = function(user, password){
        var hash = crypto.createHmac('sha512', user.salt);
        hash.update(password);
        var value = hash.digest('base64');
        return (user.saltedHash === value);
};


//signin, signout

//sign the user in and put the user into the session
app.post('/api/signin/', function (req, res, next) {

	//check for invalid username or password
	req.checkBody('username').notEmpty().isAlphanumeric();
	req.checkBody('password').notEmpty().isAlphanumeric();
	req.getValidationResult().then(function(errors){
		if(errors.mapped().username)
			return res.status(400).end("Invalid username, must only contain numbers or letters");
		if(errors.mapped().password)
			return res.status(400).end("Invalid password, must only contain numbers or letters");

	    //look for the user in the db and confirm that the given password is correct
	    galleries.findOne({username: req.body.username}, function(err, user){
	        if (err) return res.status(500).end(err);
	        if (!user || !checkPassword(user, req.body.password))
	        	return res.status(401).end("Unauthorized");
	        req.session.user = user;
	        user.curr_user = user.username;
	        res.json(user);
	        return next();
	    });
    });
});

//sign the user out and destroy the session
app.get('/api/signout/', function (req, res, next) {
    req.session.destroy(function(err) {
        if (err) return res.status(500).end(err);
        return res.status(200).end("signed out");
    });
});


//Create

//creates a new user and put the user into the session
app.post('/api/users/', function(req, res, next){

	//check for invalid username or password
	req.checkBody('username').notEmpty().isAlphanumeric();
	req.checkBody('password').notEmpty().isAlphanumeric();
	req.getValidationResult().then(function(errors){
		if(errors.mapped().username)
			return res.status(400).end("Invalid username, must only contain numbers or letters");
		if(errors.mapped().password)
			return res.status(400).end("Invalid password, must only contain numbers or letters");

		//check if the user already exists
		galleries.findOne({username: req.body.username}, function(err, user){
			if(err) return res.status(500).end(err);
			if(user) return res.status(409).end("Username " + req.body.username + " already exists");

			//create the salted hash
		    var salt = crypto.randomBytes(16).toString('base64');
		    var hash = crypto.createHmac('sha512', salt);
		    hash.update(req.body.password);
		    
		    //link the new user to the previous one
		    galleries.findOne({right: null}, function(err, result){
		    	if(err) return res.status(500).end(err);
		    	var left = null;
		    	if(result)
		    		left = result.username;

			    //insert the new user
			    galleries.insert({username: req.body.username, salt: salt, saltedHash: hash.digest('base64'), left: left, right: null}, function(err, user){
			    	if(err) return res.status(500).end(err);

			    	//link the new user to the previous one
			    	if(result){
			    		result.right = user.username;
			    		galleries.update({username: result.username}, result);
			    	}
			    	req.session.user = user;
			    	user.curr_user = user.username;
			    	return res.json(user);
			    });
		    });
		});
	});
});

//adds the image info to the gallery's image database, and if picture is a file upload it
app.post('/api/galleries/:gallery/images/', upload.single('picture'), function(req, res, next){
	var file = req.file;
	if(file === undefined)
		file = req.body.picture;

	//check for invalid gallery, picture, title
	req.checkParams('gallery').notEmpty().isAlphanumeric();
	req.checkBody('title').notEmpty();
	req.checkBody('picture').isURL({protocols: ['https'], require_protocol: true});
	req.getValidationResult().then(function(errors){
		if(errors.mapped().gallery){
			
			//delete the uploaded image
			if(file.path) fs.unlink(file.path);
			return res.status(400).end("Invalid gallery name, must only contain numbers or letters");
		}
		if(errors.mapped().title){

			//delete the uploaded image
			if(file.path) fs.unlink(file.path);
			return res.status(400).end("Invalid title, must not be empty");
		}
		
		//if file is a string and picture is not a valid https url
		if(errors.mapped().picture && (typeof(file) === "string"))
			return res.status(400).end("Invalid url, must start with https://");
		
		//escape all dangerous characters in the title
		req.sanitizeBody('title').escape();

		//make sure that only the gallery owner can upload an image
		if((!req.session.user) || (req.session.user.username !== req.params.gallery)){

			//delete the uploaded image
			if(file.path) fs.unlink(file.path);
			return res.status(401).end("Forbidden");
		}

		//link the gallery's previous image to the new one
		images.findOne({gallery: req.params.gallery, right: null}, function(err, result){
			if(err){

				//delete the uploaded image
				if(file.path) fs.unlink(file.path);
				return res.status(500).end(err);
			}
			var left = null;
			if(result)
				left = result._id;

			//add the image info to the gallery's images database
			images.insert({gallery: req.params.gallery, picture: file, title: req.body.title, author: req.session.user.username, left: left, right: null}, function(err, insert_result){
				if(err){

					//delete the uploaded image
					if(file.path) fs.unlink(file.path);
					return res.status(500).end(err);
				}

				//link the new image to the previous one in the gallery
				if(result){
					result.right = insert_result._id;
					images.update({_id: result._id}, result);
				}
				res.json(insert_result._id);
				return next();
			});
		});
	});
});

//adds the comment to the comments database and links it to the image with id imageId in gallery
app.post('/api/galleries/:gallery/images/:imageId/comments/', function(req, res, next){

	//check for invalid gallery, imageId, message, date
	req.checkParams('gallery').notEmpty().isAlphanumeric();
	req.checkParams('imageId').notEmpty().isAlphanumeric();
	req.checkBody('message').notEmpty();
	req.checkBody('date').isDate();
	req.getValidationResult().then(function(errors){
		if(errors.mapped().gallery)
			return res.status(400).end("Invalid gallery name, must only contain numbers or letters");
		if(errors.mapped().imageId)
			return res.status(400).end("Invalid image id, must only contain numbers or letters");
		if(errors.mapped().message)
			return res.status(400).end("Invalid message, must not be empty");
		if(errors.mapped().date)
			return res.status(400).end("Invalid date");

		//escape all dangerous characters in the message
		req.sanitizeBody('message').escape();

		if(!req.session.user)
			return res.status(401).end("Forbidden");

		//check that image exists in gallery
		images.findOne({gallery: req.params.gallery, _id: req.params.imageId}, function(err, image){
			if(err) return res.status(500).end(err);
			if(image === null)
				return res.status(404).json("Image with id " + req.params.imageId + " does not exist in gallery " + req.params.gallery);
			
			//link the previous comment with the same imageId in gallery to the new comment 
			comments.findOne({gallery: req.params.gallery, newer_comment: null, image_id: req.params.imageId}, function(err, result){
				if(err) return res.status(500).end(err);
				var older_comment = null;
				if(result)
					older_comment = result._id;

				//add the comment to the comments database
				comments.insert({gallery: req.params.gallery, image_id: req.params.imageId, author: req.session.user.username, message: req.body.message, date: req.body.date, older_comment: older_comment, newer_comment: null}, function(err, insert_result){
					if(err) return res.status(500).end(err);

					//link the new comment to the previous comment
					if(result){
						result.newer_comment = insert_result._id;
						comments.update({_id: result._id}, result, function(err){
							if(err) return res.status(500).end(err);
						});
					}
					res.json(insert_result._id);
					return next();
				});
			});
		});
	});
});


//Read

//gets the current user's gallery or returns null if there is no signed in user
app.get('/api/galleries/currentGallery/', function(req, res, next){
	if(!req.session.user)
		return res.json(null);

	galleries.findOne({username: req.session.user.username}, function(err, user){
		if(err) return res.status(500).end(err);
		user.curr_user = req.session.user.username;
		res.json(user);
		return next();
	});
});

//gets the gallery if the given gallery exists
app.get('/api/galleries/:gallery/', function(req, res, next){

	//check for invalid gallery name
	req.checkParams('gallery').notEmpty().isAlphanumeric();
	req.getValidationResult().then(function(errors){
		if(errors.mapped().gallery)
			return res.status(400).end("Invalid gallery name, must only contain numbers or letters");

		if(!req.session.user)
			return res.status(401).end("Forbidden");

		galleries.findOne({username: req.params.gallery}, function(err, gallery){
			if(err) return res.status(500).end(err);
			if(gallery){
				gallery.curr_user = req.session.user.username;
				res.json(gallery);
				return next();
			}
			else
				res.status(404).end("Gallery " + req.params.gallery + " does not exist");
		});
	});
});

//stops 404 favicon errors from http://stackoverflow.com/questions/35408729/express-js-prevent-get-favicon-ico
app.get('/favicon.ico', function(req, res, next) {
    res.sendStatus(204);
    return next();
});

//gets the image data for the image with the given id in the given gallery
app.get('/api/galleries/:gallery/images/:id/', function(req, res, next){

	//check for invalid gallery, id
	req.checkParams('gallery').notEmpty().isAlphanumeric();
	req.checkParams('id').notEmpty().isAlphanumeric();
	req.getValidationResult().then(function(errors){
		if(errors.mapped().gallery)
			return res.status(400).end("Invalid gallery name, must only contain numbers or letters");
		if(errors.mapped().id)
			return res.status(400).end("Invalid image id, must only contain numbers or letters");

		if(!req.session.user)
			return res.status(401).end("Forbidden");

		if(req.params.id !== "first"){

			//finds the image with the given id in the given gallery
			images.findOne({_id: req.params.id, gallery: req.params.gallery}, function(err, result){
				if(err) return res.status(500).end(err);
				if(result){
					result.curr_user = req.session.user.username;
					res.json(result);
					return next();
				}
				else return res.status(404).json("Image with id " + req.params.id + " does not exist in gallery " + req.params.gallery);
			});
		}
		else{

			//gets the first image in the gallery
			images.findOne({gallery: req.params.gallery}).sort({createdAt: 1}).exec(function(err, result){
				if(err) return res.status(500).end(err);
				if(result)
					result.curr_user = req.session.user.username;
				res.json(result);
				return next();
			});
		}
	});
});

//gets the picture file with the given id in the given gallery
app.get('/api/galleries/:gallery/images/:id/picture/', function(req, res, next){

	//check for invalid gallery, id
	req.checkParams('gallery').notEmpty().isAlphanumeric();
	req.checkParams('id').notEmpty().isAlphanumeric();
	req.getValidationResult().then(function(errors){
		if(errors.mapped().gallery)
			return res.status(400).end("Invalid gallery name, must only contain numbers or letters");
		if(errors.mapped().id)
			return res.status(400).end("Invalid image id, must only contain numbers or letters");

		if(!req.session.user)
			return res.status(401).end("Forbidden");

		//return the image's url
		images.findOne({_id: req.params.id, gallery: req.params.gallery}, function(err, result){
			if(err) return res.status(500).end(err);
			if(result){
				res.setHeader('Content-Type', result.picture.mimetype);
		        res.sendFile(path.join(__dirname, result.picture.path));
		    	return next();
	    	}
	    	else return res.status(404).json("Image with id " + req.params.id + " does not exists in gallery " + req.params.gallery);
		});
	});
});

//gets comments for the given image in the given gallery, starting at the given comment where the comments are sorted as specified and stopping after
//limit is reached, the default for limit is 10 and the default for sort is decreasing
app.get('/api/galleries/:gallery/images/:imageId/comments/:firstComment/', function(req, res, next){

	//check for invalid gallery, imageId, firstComment
	req.checkParams('gallery').notEmpty().isAlphanumeric();
	req.checkParams('imageId').notEmpty().isAlphanumeric();
	req.checkParams('firstComment').notEmpty().isAlphanumeric();
	req.getValidationResult().then(function(errors){
		if(errors.mapped().gallery)
			return res.status(400).end("Invalid gallery name, must only contain numbers or letters");
		if(errors.mapped().imageId)
			return res.status(400).end("Invalid image id, must only contain numbers or letters");
		if(errors.mapped().firstComment)
			return res.status(400).end("Invalid comment id, must only contain numbers or letters");

		if(!req.session.user)
			return res.status(401).end("Forbidden");

		var firstComment = req.params.firstComment;
		var imageId = req.params.imageId;
		var limit = req.query.limit;
		var sort = req.query.sort;

		//make sure that if limit was provided that it is a number
		if(limit === undefined)
			limit = 10;
		else if(Number.isInteger(limit))
			return res.status(400).json("Invalid arguments. Limit must be an integer and " + limit + " is not");

		//make sure that if sort was provided that it is either "decreasing" or "increasing"
		if(sort === undefined)
			sort = "decreasing";
		else if((sort !== "decreasing") && (sort !== "increasing"))
			return res.status(400).json("Invalid arguments. Sort must be a decreasing or increasing and " + sort + " is not");

		var search = {_id: firstComment, image_id: imageId, gallery: req.params.gallery};
		if(firstComment === "last")
			search = {image_id: imageId, gallery: req.params.gallery};

		//get the current comment for the image in the current gallery
		comments.findOne(search).sort({createdAt: -1}).exec(function(err, comment){
			if(err) return res.status(500).end(err);

			//default database query that will get the comments in decreasing order of creation for the given image in the given gallery
			var query = {image_id: imageId, gallery: req.params.gallery};
			var order = {createdAt: -1};

			if(comment){

				//modify the query to get the comments who were created before or at the same time as firstComment
				if(sort == "decreasing")
					query.createdAt = {$lte: comment.createdAt};

				//modify the query to get the comments who were created after of at the same time as firstComment
				else if(sort == "increasing"){
					query.createdAt = {$gte: comment.createdAt};
					order.createdAt = 1;
				}
			}

			//get comments resulting from the query, stopping after limit is reached
			comments.find(query).sort(order).limit(limit).exec(function(err, result){
				if(err) return res.status(500).end(err);

				if(sort == "increasing")
					result.reverse();
				res.json({comments: result, curr_user: req.session.user.username});
				return next();
			});	
		});
	});
});


//Update

//api does not currently support update


//Delete

//deletes the image with the given id and its comments from the given gallery
app.delete('/api/galleries/:gallery/images/:id/', function(req, res, next){

	//check for invalid gallery, imageId
	req.checkParams('gallery').notEmpty().isAlphanumeric();
	req.checkParams('id').notEmpty().isAlphanumeric();
	req.getValidationResult().then(function(errors){
		if(errors.mapped().gallery)
			return res.status(400).end("Invalid gallery name, must only contain numbers or letters");
		if(errors.mapped().id)
			return res.status(400).end("Invalid image id, must only contain numbers or letters");

		//make sure only the gallery owner can delete an image
		if((!req.session.user) || (req.session.user.username !== req.params.gallery))
			return res.status(401).end("Forbidden");

		//get the image to be deleted from the given gallery
		images.findOne({_id: req.params.id, gallery: req.params.gallery}, function(err, result){
			if(err) return res.status(500).end(err);
			if(result){

				//find the next image's id in the gallery
				var next_id = result.left;
				if(next_id === null)
					next_id = result.right;

				//update the left image's right image link
				images.findOne({_id: result.left}, function(err, left_res){
					if(err) return res.status(500).end(err);
					if(left_res){
						left_res.right = result.right;
						images.update({_id: result.left}, left_res);	
					}
				});

				//update the right image's left image link
				images.findOne({_id: result.right}, function(err, right_res){
					if(err) return res.status(500).end(err);
					if(right_res){
						right_res.left = result.left;
						images.update({_id: result.right}, right_res);
					}
				});

				//remove the image from the db and the uploads directory
				images.remove({_id: result._id}, function(err){
					if(err) return res.status(500).end(err);
					if(result.picture.path)
						fs.unlink(result.picture.path);

					//delete the comments associated with that image
					comments.remove({image_id: result._id}, function(err){
						if(err) return res.status(500).end(err);
					});
					
					res.json(next_id);
					return next();
				});
			}
			else return res.status(404).json("Image " + req.params.id + " does not exists in the gallery " + req.params.gallery);
		});
	});
});

//deletes the comment with the given id from the given image in the given gallery
app.delete('/api/galleries/:gallery/images/:imageId/comments/:id/', function(req, res, next){

	//check for invalid gallery, imageId, id
	req.checkParams('gallery').notEmpty().isAlphanumeric();
	req.checkParams('imageId').notEmpty().isAlphanumeric();
	req.checkParams('id').notEmpty().isAlphanumeric();
	req.getValidationResult().then(function(errors){
		if(errors.mapped().gallery)
			return res.status(400).end("Invalid gallery name, must only contain numbers or letters");
		if(errors.mapped().imageId)
			return res.status(400).end("Invalid image id, must only contain numbers or letters");
		if(errors.mapped().id)
			return res.status(400).end("Invalid comment id, must only contain numbers or letters");

		if(!req.session.user)
			return res.status(401).end("Forbidden");

		//get the comment to be deleted from the given image in the given gallery
		comments.findOne({_id: req.params.id, image_id: req.params.imageId, gallery: req.params.gallery}, function(err, comment){
			if(err) return res.status(500).end(err);
			if(comment){

				//make sure that only the comment author or gallery owner can delete a comment
				if((comment.author !== req.session.user.username) && (comment.gallery !== req.session.user.username))
					return res.status(401).end("Forbidden");

				//update the older_comment's newer_comment link
				comments.findOne({_id: comment.older_comment}, function(err, older_comment){
					if(err) return res.status(500).end(err);
					if(older_comment){
							older_comment.newer_comment = comment.newer_comment;
							comments.update({_id: older_comment._id}, older_comment);
						}
				});

				//update the newer_comment's older_comment link
				comments.findOne({_id: comment.newer_comment}, function(err, newer_comment){
					if(err) return res.status(500).end(err);
					if(newer_comment){
						newer_comment.older_comment = comment.older_comment;
						comments.update({_id: newer_comment._id}, newer_comment);
					}
				});

				comments.remove({_id: comment._id}, function(err){
					if(err) return res.status(500).end(err);
					res.json(req.params.id);
					return next();
				});
			}
			else return res.status(404).json("Comment with id " + req.params.id + " does not exists with image " + req.params.imageId + " in gallery " + req.params.gallery);
		});
	});
});


app.use(function (req, res, next){
    console.log("HTTPS Response", res.statusCode);
});


https.createServer(config, app).listen(3000, function () {
  console.log('App listening on port 3000');
});