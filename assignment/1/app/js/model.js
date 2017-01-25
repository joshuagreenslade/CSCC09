/*jshint esversion: 6*/

var model = (function(){
    "use strict";
    
    var next_id = 0;    //id of next image to be inserted
    var curr_id = null; //current id of image
    var curr_comment = -1;    //which comment is currently at the top
    var images = [];    //list of picture id's
    var image_storage = {}; //dictionary of pictures with id as key

    var model = {};


    model.uploadImage = function(data){
        images.push(next_id);
        data.id = next_id;
        data.comments = [];
        data.next_comment = 0;
        image_storage[next_id] = data;
        next_id += 1;
        curr_id = data.id;
        model.save();

        data.has_left = images[images.indexOf(curr_id) - 1] !== undefined;
        data.has_right = false;

        document.dispatchEvent(new CustomEvent("onNewImage", {detail: data}));
        model.getCommentsAt(curr_comment);
    };

    model.getLeftImage = function(){
        var new_index = images[images.indexOf(curr_id) - 1];
        model.getImageAt(new_index);
    };

    model.getRightImage = function(){
        var new_index = images[images.indexOf(curr_id) + 1];
        model.getImageAt(new_index);
    };

    model.getImageAt = function(index){
        var data = image_storage[index];
        curr_id = index;
        if(data){
            data.has_left = images[images.indexOf(curr_id) - 1] !== undefined;
            data.has_right = images[images.indexOf(curr_id) + 1] !== undefined;

            document.dispatchEvent(new CustomEvent("onImageRetrieved", {detail: data}));
            curr_comment = image_storage[index].comments.length - 1;
            model.getCommentsAt(curr_comment);
        }
        else{
            document.dispatchEvent(new CustomEvent("404"));
        }
    };

    model.deleteImage = function(){
        var index = images.indexOf(curr_id);
        
        //delete the image
        delete image_storage[curr_id];
        images.splice(images.indexOf(curr_id), 1);
        model.save();

        //is there an image to the left
        if(!isNaN(images[index-1])){
            model.getImageAt(images[index-1]);
        }

        //is there an image to the right
        else if(!isNaN(images[index])){
            model.getImageAt(images[index]);
        }
        else{
            curr_id = null;
            document.dispatchEvent(new CustomEvent("onRemoveImage"));
            curr_comment = -1;
        }
    };

    model.saveComment = function(data){
        data.id = image_storage[curr_id].next_comment;
        image_storage[curr_id].next_comment++;
        image_storage[curr_id].comments.push(data);
        curr_comment = image_storage[curr_id].comments.length - 1;
        model.save();
        model.getCommentsAt(curr_comment);
    };

    model.getCommentsAt = function(index){
        var data = [];
        var comments = image_storage[curr_id].comments;
        data.newer_comments = (comments[index+1] !== undefined);
        for(var i = index; i>index-10; i--){
            if(i>=0 && i<comments.length){
                data.push(comments[i]);
            }
        }
        curr_comment = i;
        data.older_comments = (comments[curr_comment] !== undefined);
        document.dispatchEvent(new CustomEvent("onCommentsRetrieved", {detail: data}));
    };

    model.getOlderTen = function(){
        model.getCommentsAt(curr_comment);
    };

    model.getNewerTen = function(){
        model.getCommentsAt(curr_comment+20);
    };

    model.deleteComment = function(index){
        image_storage[curr_id].comments.splice(parseInt(index), 1);

        var comments = image_storage[curr_id].comments;
        for(var i=0; i<comments.length; i++){
            comments[i].id = i;
        }
        image_storage[curr_id].next_comment = i;
        curr_comment = image_storage[curr_id].comments.length - 1;
        model.save();
        model.getCommentsAt(curr_comment);
    };

    model.save = function(){
        localStorage.setItem("next_id", JSON.stringify(next_id));
        localStorage.setItem("images", JSON.stringify(images));
        localStorage.setItem("image_storage", JSON.stringify(image_storage));
    };

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

        //images image_storage
        image_storage = JSON.parse(localStorage.getItem("image_storage"));
        if(!image_storage){
            image_storage = {};
        }

        //if id was not specified in url use first image as default
        if(id === ""){
            curr_id = images[0];
            if(curr_id === undefined){
                return;
            }
        }

        //if the url was formatted properly and the value was a number
        else if((id.slice(0,4) == "?id=") && (!isNaN(parseInt(id.slice(4))))){
            curr_id = parseInt(id.slice(4));
        }
        else{
            curr_id = null;
        }

        model.getImageAt(curr_id);
    };


    return model;
    
}());