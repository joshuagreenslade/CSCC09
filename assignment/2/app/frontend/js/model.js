/*jshint esversion: 6*/

var model = (function(){
    "use strict";
    
    var curr_id = "first";      //id of the image that is currently displayed
    var newer_comment = null;   //id of the next newer comment
    var older_comment = null;   //id of the next older comment
    var curr_comment = "last";    //id of the top comment that is being displayed
    var newest_comment = null;  //id of the newest comment for the current image


    var model = {};


    //scheduler, load, returnToStart

    //make sure that what the user sees is up to date
    (function scheduler(){
        setTimeout(function(e){
            model.getImageAt(curr_id);
            model.checkNewestComment();
            older_comment = curr_comment;
            model.getOlderTen();
            scheduler();
        },2000);
    }());

    //loads the image with the id provided as an argument in the url
    model.load = function(id){

        //if id was not specified in url use first image as default if there is one
        if(id === ""){
            model.getImageAt("first");
        }

        //if the id argurment was formatted properly in the url and the value was a number get the image with that id
        else if(id.slice(0,4) == "?id="){
            curr_id = id.slice(4);
            model.getImageAt(curr_id);
        }
        else{
            var message = id + " is not a valid argument should be ?id=(number)";
            curr_id = id;
            document.dispatchEvent(new CustomEvent("error", {detail: message}));
        }
    };

    //gets the first image in the gallery
    model.returnToStart = function(){
        model.getImageAt("first");
        model.getOlderTen();
    };


    //Create

    //uploads an image and tells the view to display it
    model.uploadImage = function(data){
        var method = "POST";
        var url = "http://localhost:3000/api/images/";
        var formdata = new FormData();
        formdata.append("picture", data.file);
        formdata.append("title", data.title);
        formdata.append("author", data.author);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                curr_id = JSON.parse(this.responseText);
                model.getImageAt(curr_id);
                model.getOlderTen();
            }
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    };

    //adds the comment to the image that is currently displayed
    model.saveComment = function(data){
        var method = "POST";
        var url = "http://localhost:3000/api/images/" + curr_id + "/comments/";
        var body = JSON.stringify(data);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                newest_comment = JSON.parse(this.responseText);
                model.getComments("http://localhost:3000/api/images/" + curr_id + "/comments/last/?limit=" + 10 + "&sort=decreasing");
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    };


    //Read

    //gets the image with the given id, gives an error message if there is no image with that id
    model.getImageAt = function(id){
        if(id === undefined)
            id = "first";

        var method = "GET";
        var url = "http://localhost:3000/api/images/" + id + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var image = JSON.parse(this.responseText);
                if(this.status < 400){
                    if(image){
                        if(typeof(image.picture) == "string")
                            image.path = image.picture;
                        else
                            image.path = "http://localhost:3000/api/images/" + image._id + "/picture/";

                        curr_id = image._id;
                        newer_comment = null;
                        older_comment = null;
                        document.dispatchEvent(new CustomEvent("onImageRetrieved", {detail: image}));
                    }
                    else{
                        curr_id = "first";
                        newer_comment = null;
                        older_comment = null;
                        curr_comment = "last";
                        newest_comment = null;
                        document.dispatchEvent(new CustomEvent('onRemoveImage'));
                    }
                }
                else
                    document.dispatchEvent(new CustomEvent("error", {detail: image}));
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //gets the image to the left of the current one
    model.getLeftImage = function(){
        var method = "GET";
        var url = "http://localhost:3000/api/images/" + curr_id + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var image = JSON.parse(this.responseText);
                curr_id = image.left;
                if(curr_id === undefined)
                    curr_id = "first";
                model.getImageAt(curr_id);
                model.getOlderTen();
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //gets the image to the right of the current one
    model.getRightImage = function(){
        var method = "GET";
        var url = "http://localhost:3000/api/images/" + curr_id + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var image = JSON.parse(this.responseText);
                curr_id = image.right;
                if(curr_id === undefined)
                    curr_id = "first";
                model.getImageAt(curr_id);
                model.getOlderTen();
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //gets the next set of comments specified by the arguments in the url
    model.getComments = function(url){
        var method = "GET";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    var result = JSON.parse(this.responseText);

                    //update the comment info
                    if(result.length !== 0){
                        curr_comment = result[0]._id;
                        newer_comment = result[0].newer_comment;
                        result.newer_comment = newer_comment;
                        older_comment = result[result.length - 1].older_comment;
                        result.older_comment = older_comment;
                    }
                    else{
                        curr_comment = "last";
                        newer_comment = null;
                        result.newer_comment = newer_comment;
                        older_comment = null;
                        result.older_comment = older_comment;
                    }
                    document.dispatchEvent(new CustomEvent("onCommentsRetrieved", {detail: result}));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //gets the next 10 older comments
    model.getOlderTen = function(){
        if(curr_id == "first")
            return;
        if(older_comment === null)
            older_comment = "last";
        var url = "http://localhost:3000/api/images/"+ curr_id + "/comments/" + older_comment + "/?limit=" + 10 + "&sort=decreasing";
        model.getComments(url);
    };

    //gets the next 10 newer comments
    model.getNewerTen = function(){
        if(curr_id == "first")
            return;
        if(newer_comment === null)
            newer_comment = "last";
        var url = "http://localhost:3000/api/images/" + curr_id + "/comments/" + newer_comment + "/?limit=" + 10 + "&sort=increasing";
        model.getComments(url);
    };

    //checks that a new comment hasn't been added, and if there was display it
    model.checkNewestComment = function(){
        if(curr_id == "first")
            return;
        var method = "GET";
        var url = "http://localhost:3000/api/images/" + curr_id + "/comments/last/?limit=1&sort=decreasing";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var result = JSON.parse(this.responseText);

                //if a newer comment was added display it
                if((result.length == 1) && (result[0]._id != newest_comment)){
                    older_comment = null;
                    curr_comment = result[0]._id;
                    newest_comment = result[0]._id;
                    model.getOlderTen();
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };


    //Update

    //update is not currently supported


    //Delete

    //deletes the image and gets the left or right image if there is one
    model.deleteImage = function(){
        var method = "Delete";
        var url = "http://localhost:3000/api/images/" + curr_id + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                curr_id = JSON.parse(this.responseText);
                if(curr_id !== null){
                    model.getImageAt(curr_id);
                }
                else{
                    curr_id = "first";
                    document.dispatchEvent(new CustomEvent("onRemoveImage"));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //deletes the comment with the id specified
    model.deleteComment = function(id){        
        var method = "DELETE";
        var url = "http://localhost:3000/api/comments/" + id + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                older_comment = curr_comment;
                model.getOlderTen();
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    return model;
    
}());