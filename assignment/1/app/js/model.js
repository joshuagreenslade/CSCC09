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


    model.uploadImage = function(data){
        var image = new Image(data);
        images.push(image);
        curr_index = images.length - 1;
        model.save();

        image.has_left = images[curr_index - 1] !== undefined;
        image.has_right = false;

        document.dispatchEvent(new CustomEvent("onNewImage", {detail: image}));
        model.getCommentsAt(curr_comment);
    };

    model.getLeftImage = function(){
        model.getImageAt(curr_index - 1);
    };

    model.getRightImage = function(){
        model.getImageAt(curr_index + 1);
    };

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

    model.saveComment = function(data){
        data.id = images[curr_index].next_comment;
        images[curr_index].next_comment++;
        images[curr_index].comments.push(data);
        curr_comment = images[curr_index].comments.length - 1;

        model.save();
        model.getCommentsAt(curr_comment);
    };

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

    model.getOlderTen = function(){
        //curr_comment is the index of the comment one spot older than
        //the ones currently displayed
        model.getCommentsAt(curr_comment);
    };

    model.getNewerTen = function(){
        //curr_comment+10 will get the same comments that are currently
        //displayed so curr_comments+20 will get the 10 comments newer
        //the ones currently displayed
        model.getCommentsAt(curr_comment+20);
    };

    model.deleteComment = function(index){
        images[curr_index].comments.splice(parseInt(index), 1);

        var comments = images[curr_index].comments;
        for(var i=0; i<comments.length; i++){
            comments[i].id = i;
        }
        images[curr_index].next_comment = i;
        curr_comment = images[curr_index].comments.length - 1;
        model.save();
        model.getCommentsAt(curr_comment);
    };

    model.save = function(){
        localStorage.setItem("next_id", JSON.stringify(next_id));
        localStorage.setItem("images", JSON.stringify(images));
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

        //if id was not specified in url use first image as default
        if(id === ""){
            if(images[0] === undefined){
                return;
            }
            curr_index = 0;
        }

        //if the url was formatted properly and the value was a number
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