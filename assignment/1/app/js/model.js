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


        document.dispatchEvent(new CustomEvent("onNewImage", {detail: data}));
        model.getOlderTen();
    };

    model.getLeftImage = function(){
        var new_index = images[images.indexOf(curr_id) - 1];
        var data = image_storage[new_index];
        if(!data){
            return;
        }
        curr_id = new_index;
        document.dispatchEvent(new CustomEvent("onImageRetrieved", {detail: data}));
        curr_comment = image_storage[new_index].comments.length - 1;
        model.getOlderTen();
    };

    model.getRightImage = function(){
        var new_index = images[images.indexOf(curr_id) + 1];
        var data = image_storage[new_index];
        if(!data){
            return;
        }
        curr_id = new_index;
        document.dispatchEvent(new CustomEvent("onImageRetrieved", {detail: data}));
        curr_comment = image_storage[new_index].comments.length - 1;
        model.getOlderTen();
    };

/*    model.getImageAt = function(index){
        var image = image_storage[index];
        document.dispatchEvent(new CustomEvent("onImageRetrieved", {detail: image}));
    };
*/
    model.deleteImage = function(){
        var index = curr_id;
        
        //is there an image to the left
        if(!isNaN(images[images.indexOf(curr_id)-1])){
            model.getLeftImage();
        }

        //is there an imageto the right
        else if(!isNaN(images[images.indexOf(curr_id)+1])){
            model.getRightImage();
        }
        else{
            curr_id = null;
            document.dispatchEvent(new CustomEvent("onRemoveImage"));
            curr_comment = -1;
        }

        delete image_storage[index];
        images.splice(images.indexOf(index), 1);
    };

    model.saveComment = function(data){
        data.id = image_storage[curr_id].next_comment;
        image_storage[curr_id].next_comment++;
        image_storage[curr_id].comments.push(data);
        curr_comment = image_storage[curr_id].comments.length - 1;
        model.getOlderTen();
    };


    model.getOlderTen = function(){
        var data = [];
        var comments = image_storage[curr_id].comments

        for(var i = curr_comment; i>curr_comment-10; i--){
            if(i>=0 && i<comments.length){
                data.push(comments[i])
            }
        }
        curr_comment = i;
console.log(curr_comment)
        document.dispatchEvent(new CustomEvent("onCommentsRetrieved", {detail: data}));
    };

    model.getNewerTen = function(){
        var data = [];
        var comments = image_storage[curr_id].comments
        curr_comment+=11;
        for(var i = curr_comment; i<curr_comment+10; i++){
            if(i>=0 && i<comments.length){
                data.push(comments[i])
            }
        }
        data.reverse();
        curr_comment = i - 11;
console.log(curr_comment)
        document.dispatchEvent(new CustomEvent("onCommentsRetrieved", {detail: data}));
    };

    model.deleteComment = function(index){
        image_storage[curr_id].comments.splice(parseInt(index), 1);

        var comments = image_storage[curr_id].comments;
        for(var i=0; i<comments.length; i++){
            comments[i].id = i;
        }
        
        image_storage[curr_id].next_comment = i;
        curr_comment = image_storage[curr_id].comments.length - 1;
        model.getOlderTen();
    };


///////////////////////////////////////////////////////////////////////
//put comments above comment form????
//hide newer and older buttons if there are no newer or older comments
//hide image navigation arrows if there is no picture in that direction
//maybe try to not go to start of comments when one is deleted
////////////////////////////////////////////////////////////////////////


    return model;
    
}());