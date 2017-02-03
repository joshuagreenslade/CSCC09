var path = require('path');
var express = require('express')
var app = express();

var multer = require('multer');
var upload = multer({dest: 'uploads/'});

var Datastore = require('nedb')
var counters = new Datastore({ filename: 'db/counters.db', autoload: true});
var images = new Datastore({ filename: 'db/images.db', autoload: true, timestampData: true});
var comments = new Datastore({ filename: 'db/comments.db', autoload: true, timestampData: true});

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
})


///////////////////////////////////////////////////////////////////
//images have left and right values (like a linked list)
//////////////////////////////////////////////////////////////////




//create

app.post('/api/images/', upload.single('picture'), function(req, res, next){
	console.log(req.body)
	console.log(req.file)

counters.findOne({_id: 'image'}, function(err, counter){


var count = counter.count;
	counters.update({_id: "image"}, {_id: "image", count: count+1})

var file;
	if(req.file === undefined){
		file = req.body.picture
	}
	else{
		file = req.file
	}


	images.findOne({right: null}, function(err, result){
		if(result){
			var left = result._id
			result.right = count;
			images.update({right: null}, result)
		}
		else{
			//images is empty
			var left = null
		}

		images.insert({_id: count, picture: file, title: req.body.title, author: req.body.author, left: left, right: null}, function(err, insert_result){
			console.log("old", result)
			console.log("new", insert_result)
				res.json(insert_result._id)
				next();
			});
		})

	})
});

app.post('/api/comments/', function(req, res, next){
	counters.findOne({_id: "comments"}, function(err, counter){
		var count = counter.count;
		var image_id = req.body.image_id;
		console.log("count: ", count)
		counters.update({_id: "comments"}, {count: count+1})
		comments.findOne({newer_comment: null, image_id: image_id}, function(err, result){
			if(result){
				var older_comment = result._id;
				result.newer_comment = count;
				comments.update({newer_comment: null, image_id: image_id}, result);
			}
			else{
				var older_comment = null;
			}
			comments.insert({_id: count, image_id: image_id, author: req.body.author, message: req.body.message, date: req.body.date, older_comment: older_comment, newer_comment: null}, function(err, insert_result){
console.log(insert_result._id);
				res.json(insert_result._id);
				next();
			})
		});
	});
});


//read

//stops 204 errors from http://stackoverflow.com/questions/35408729/express-js-prevent-get-favicon-ico
app.get('/favicon.ico', function(req, res, next) {
    res.sendStatus(204);
    next();
});

app.get('/api/images/:id', function(req, res, next){
	console.log(req.params.id)
	images.findOne({_id: JSON.parse(req.params.id)}, function(err, result){
		if(result){

console.log("+++++++++++++++++++++++++++")
console.log(result)
			res.json(result);
			next();
		}
		else{
			res.status(404).json("Image: " + req.params.id + " does not exist");
			next();
		}
	});
});

app.get('/api/images/:id/picture', function(req, res, next){
	images.findOne({_id: JSON.parse(req.params.id)}, function(err, result){
		if(result){
			res.setHeader('Content-Type', result.picture.mimetype)
	        res.sendFile(path.join(__dirname, result.picture.path))
    	}
    	else{
            res.status(404).json("Image " + req.params.id + " does not exists");
    	}
    	next();
	});
});

app.get('/api/comments/:firstComment&:imageId&:num&:direction', function(req, res, next){

	var firstComment = JSON.parse(req.params.firstComment);
	var imageId = JSON.parse(req.params.imageId);
	var num = JSON.parse(req.params.num);
	var direction = req.params.direction;

	console.log(firstComment, imageId, num, direction)



/////////////////////////////////////////////////////
//dont reshuffle, could be thousands of comments
//////////////////////////////////////////////////




var query = {image_id: imageId};
var order = {_id: -1};

	if((direction == "older") && (firstComment !== null)){
		query._id = {$lte: firstComment};
	}
	else if((direction == "newer") && (firstComment !== null)){
		query._id = {$gte: firstComment};
		order._id = 1;
	}

	comments.find(query).sort(order).limit(num).exec(function(err, result){
		if((direction == "newer") && (firstComment !== null)){
			res.json(result.reverse());
		}
		else{
			res.json(result);
		}
		next();
	});	
});

//update
//delete

app.delete('/api/images/:id', function(req, res, next){
	console.log("deleting ", req.params.id)
	images.findOne({_id: JSON.parse(req.params.id)}, function(err, result){
		if(result){
			var next_id = result.left;
			if(next_id === null)
				next_id = result.right;

			images.findOne({_id: result.left}, function(err, left_res){
				if(left_res){
					console.log("left not null")
					console.log("left's old right ", left_res.right)
					left_res.right = result.right;
					console.log("left's new right ", left_res.right)
					images.update({_id: result.left}, left_res);	
				}
			});
			images.findOne({_id: result.right}, function(err, right_res){
				if(right_res){
					console.log("right not null")
					console.log("right's old left ", right_res.left)
					right_res.left = result.left;
					console.log("right's new left ", right_res.left)
					images.update({_id: result.right}, right_res);
				}
			});
			images.remove({_id: JSON.parse(req.params.id)});
console.log(next_id)
			res.json(next_id);
			next();
		}
		else{

			//////////////////////////////
			//figure out what to do
			//////////////////////////////

		}
	})
})




app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});


app.listen(3000, function () {
  console.log('App listening on port 3000')
});