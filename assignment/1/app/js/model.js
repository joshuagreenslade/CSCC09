/*jshint esversion: 6*/

var model = (function(){
    "use strict";
    
    var next_id = 0;            
    var curr_index = -1;        //index of the image that is currently displayed
    var curr_comment = -1;      //which comment is currently at the top
    var images = [];    


    var Image = (function(){
        return function Image(data){
            this.id = next_id++;
            this.comments = [];
            this.next_comment = 0;
            this.file = data.file;
            this.title = data.title;
            this.author = data.author;
        };
    }());


    var model = {};


     //the base64Conversion function uses code from lecture 4 demos https://github.com/ThierrySans/cscc09-w17/blob/master/lectures/4/demos/ajax/static/js/script.js

    //convert the image file to a base64 data url and pass it to the upload image function
    model.base64Conversion = function(data){
        var reader = new FileReader();
        reader.onload = function(e){
            data.file = reader.result;
            model.uploadImage(data);
        };
        reader.readAsDataURL(data.file);
    };

    //creates an Image object, adds it to the list, saves it to local storage, and tells the view to display it
    model.uploadImage = function(data){
        var image = new Image(data);
        images.push(image);
        curr_index = images.length - 1;
        model.save();

        image.has_left = images[curr_index - 1] !== undefined;
        image.has_right = false;

        document.dispatchEvent(new CustomEvent("onImageRetrieved", {detail: image}));
        model.getCommentsAt(curr_comment);
    };

    //gets the image to the left of the current one
    model.getLeftImage = function(){
        model.getImageAt(curr_index - 1);
    };

    //gets the image to the right of the current one
    model.getRightImage = function(){
        model.getImageAt(curr_index + 1);
    };

    //tells the view which image it at index in images, redirects to 404 page if there is no image at that index in images
    model.getImageAt = function(index){
        var image = images[index];
        curr_index = index;
        if(image){
            image.has_left = images[index - 1] !== undefined;
            image.has_right = images[index + 1] !== undefined;
            document.dispatchEvent(new CustomEvent("onImageRetrieved", {detail: image}));
            curr_comment = image.comments.length - 1;
            model.getCommentsAt(curr_comment);
        }
        else{
            document.dispatchEvent(new CustomEvent("404"));
        }
    };

    //removes the image from the images list, update the local storage, and get the left or right image if there is one
    model.deleteImage = function(){
        images.splice(curr_index, 1);
        model.save();

        //is there an image to the left
        if(images[curr_index-1]){
            model.getImageAt(curr_index-1);
        }

        //is there an image to the right
        else if(images[curr_index]){
            model.getImageAt(curr_index);
        }
        else{
            curr_index = -1;
            curr_comment = -1;
            document.dispatchEvent(new CustomEvent("onRemoveImage"));
        }
    };

    //adds the comment to the corresponding image and update the local storage
    model.saveComment = function(data){
        data.id = images[curr_index].next_comment;
        images[curr_index].next_comment++;
        images[curr_index].comments.push(data);
        curr_comment = images[curr_index].comments.length - 1;

        model.save();
        model.getCommentsAt(curr_comment);
    };

    //gets the next 10 comment going from index to index-10 and tells the view to display them
    model.getCommentsAt = function(index){
        var comments = images[curr_index].comments;
        var data = comments.filter(function(comment){
            return (comments.indexOf(comment)>index-10 && comments.indexOf(comment)<=index);
        });

        data.newer_comments = (comments[index+1] !== undefined);
        curr_comment = index-10;
        data.older_comments = (comments[curr_comment] !== undefined);
        document.dispatchEvent(new CustomEvent("onCommentsRetrieved", {detail: data}));
    };

    //gets the next 10 older comments
    model.getOlderTen = function(){
        //curr_comment is the index of the comment one spot older than
        //the ones currently displayed
        model.getCommentsAt(curr_comment);
    };

    //gets the next 10 newer comments
    model.getNewerTen = function(){
        //curr_comment+10 will get the same comments that are currently
        //displayed so curr_comments+20 will get the 10 comments newer
        //the ones currently displayed
        model.getCommentsAt(curr_comment+20);
    };

    //removes the comment from the image and updates the local storage
    model.deleteComment = function(index){
        images[curr_index].comments.splice(parseInt(index), 1);

        //reset the id's of each comment
        var comments = images[curr_index].comments;
        for(var i=0; i<comments.length; i++){
            comments[i].id = i;
        }
        images[curr_index].next_comment = i;
        curr_comment = images[curr_index].comments.length - 1;
        model.save();
        model.getCommentsAt(curr_comment);
    };

    //save next_id and images to local storage
    model.save = function(){
        localStorage.setItem("next_id", JSON.stringify(next_id));
        localStorage.setItem("images", JSON.stringify(images));
    };

    //gets next_id and images from local storage and gets the image at the id provided
    model.load = function(id){

        //initalize next_id
        next_id = JSON.parse(localStorage.getItem("next_id"));
        if(!next_id){
            next_id = 0;
        }

        //initialize images array
        images = JSON.parse(localStorage.getItem("images"));
        if(!images){
            images = [];
        }

        //if id was not specified in url use first image as default if images is not empty
        if(id === ""){
            if(images[0] === undefined){
                return;
            }
            curr_index = 0;
        }

        //if the id argurment was formatted properly in the url and the value was a number get the image with that id
        else if((id.slice(0,4) == "?id=") && (!isNaN(parseInt(id.slice(4))))){
            var image = images.find(function(image){
                return (image.id === parseInt(id.slice(4)));
            });
            curr_index = images.indexOf(image);
        }
        else{
            curr_index = -1;
        }

        model.getImageAt(curr_index);
    };


    return model;
    
}());