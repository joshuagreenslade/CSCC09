/*jshint esversion: 6*/

var model = (function(){
    "use strict";
    
    var curr_id = -1;        //index of the image that is currently displayed
   // var curr_comment = -1;      //which comment is currently at the top 
    var newer_comment = null;
    var older_comment = null;


    var model = {};


    //creates an Image object, adds it to the list, saves it to local storage, and tells the view to display it
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
                model.getImageAt(curr_id)
            }
        };
        xhr.open(method, url, true);
        xhr.send(formdata);

//dont need to call if calling it in getImageAt
//        model.getCommentsAt(curr_comment);

    };

    //gets the image to the left of the current one
    model.getLeftImage = function(){
        var method = "GET";
        var url = "http://localhost:3000/api/images/" + curr_id;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var image = JSON.parse(this.responseText);
                model.getImageAt(image.left);
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //gets the image to the right of the current one
    model.getRightImage = function(){
        var method = "GET";
        var url = "http://localhost:3000/api/images/" + curr_id;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var image = JSON.parse(this.responseText);
                model.getImageAt(image.right);
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//when switching between images too fast sometimes it gets backloged with favicon requests that fail and may take awhile while they catch up
//asked on piazza
//
//app freezes when using uploaded images but not when using url images, so
//for now test with urls and try to fix files later. maybe that its each
//time the image is switched http has to request the image over and over,
//this causes the extra favicon requests, and for url it just displays
//image at that link
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //tells the view which image it at index in images, redirects to 404 page if there is no image at that index in images
    model.getImageAt = function(id){
        var method = "GET";
        var url = "http://localhost:3000/api/images/" + id;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var image = JSON.parse(this.responseText);
                if(image){
                    if(typeof(image.picture) == "string"){
                        image.path = image.picture;
                    }
                    else{
                        image.path = "http://localhost:3000/api/images/" + id + "/picture";
                    }
                    curr_id = image._id;
                    newer_comment = null
                    older_comment = null
//why are the buttons not disapearing or comments not displaying????
    console.log("blaaaaaaaa")
                    model.getOlderTen();
                    document.dispatchEvent(new CustomEvent("onImageRetrieved", {detail: image}));
        //            curr_comment = image.comments.length - 1;

                }
                else{
                    /////////////////////////////////////////////
                    //check what lab 5 does to display 404 error
                    /////////////////////////////////////////////
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //removes the image from the images list, update the local storage, and get the left or right image if there is one
    model.deleteImage = function(){
        var method = "Delete";
        var url = "http://localhost:3000/api/images/" + curr_id;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var next = JSON.parse(this.responseText);
                if(next !== null){
                    model.getImageAt(next);
                }
                else{
                    curr_id = -1;
                    //curr_comment = -1;
                    document.dispatchEvent(new CustomEvent("onRemoveImage"));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };




    //adds the comment to the corresponding image and update the local storage
    model.saveComment = function(data){
        data.image_id = curr_id;
        var method = "POST";
        var url = "http://localhost:3000/api/comments/"
        var body = JSON.stringify(data);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
   //             curr_comment = JSON.parse(this.responseText);
//console.log("_id: ", curr_comment)
                model.getComments("http://localhost:3000/api/comments/" + null + "&" + curr_id + "&" + 10 + "&older");
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    };

    //gets the next 10 comment after and including the one at id and tells the view to display them
    model.getComments = function(url){



/////////////////////////////////////////////////////
//dont reshuffle comment id's after a delete could be thousands of comments
/////////////////////////////////////////////////////
console.log(url)
        var method = "GET";
        //var url = "http://localhost:3000/api/comments/" + id + "&" + curr_id + "&" + 10;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var result = JSON.parse(this.responseText);
                console.log(result);
                if(result.length != 0){
                    console.log("length is not 0")
                    //curr_comment = result[result.length-1]._id-1;
                    newer_comment = result[0].newer_comment;
                    result.newer_comment = newer_comment;
                    older_comment = result[result.length - 1].older_comment;
                    result.older_comment = older_comment;
                }
                else{
                    console.log("length is 0")
                    //curr_comment = -1;
                    newer_comment = null;
                    result.newer_comment = newer_comment;
                    older_comment = null;
                    result.older_comment = older_comment;
                }
                //console.log(curr_comment)
                document.dispatchEvent(new CustomEvent("onCommentsRetrieved", {detail: result}));
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);


/*

        var comments = images[curr_index].comments;
        var data = comments.filter(function(comment){
            return (comments.indexOf(comment)>index-10 && comments.indexOf(comment)<=index);
        });

        data.newer_comments = (comments[index+1] !== undefined);
        curr_comment = index-10;
        data.older_comments = (comments[curr_comment] !== undefined);
        document.dispatchEvent(new CustomEvent("onCommentsRetrieved", {detail: data}));
*/
    };

    //gets the next 10 older comments
    model.getOlderTen = function(){
        //curr_comment is the index of the comment one spot older than
        //the ones currently displayed
console.log(older_comment)
        var url = "http://localhost:3000/api/comments/" + older_comment + "&" + curr_id + "&" + 10 + "&older";
        console.log(url)
        model.getComments(url);
    };

    //gets the next 10 newer comments
    model.getNewerTen = function(){
        //curr_comment+10 will get the same comments that are currently
        //displayed so curr_comments+20 will get the 10 comments newer
        //the ones currently displayed


console.log(newer_comment)
        var url = "http://localhost:3000/api/comments/" + newer_comment + "&" + curr_id + "&" + 10 + "&newer";
        console.log(url)
        model.getComments(url);
    };






///////////////////////////////
///////////////////////////////
//start here (delete comment)
///////////////////////////////
////////////////////////////////






/////////////////
//not fixed yet
/////////////////

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
  /*      next_id = JSON.parse(localStorage.getItem("next_id"));
        if(!next_id){
            next_id = 0;
        }

        //initialize images array
        images = JSON.parse(localStorage.getItem("images"));
        if(!images){
            images = [];
        }
*/
        //if id was not specified in url use first image as default if images is not empty
        if(id === ""){
 //           if(images[0] === undefined){
   //             return;
     //       }
      //      curr_id = 0;
        }

        //if the id argurment was formatted properly in the url and the value was a number get the image with that id
        else if(id.slice(0,4) == "?id="){
            curr_id = id.slice(4);
        }
        else{
            curr_id = -1;
        }

        if(curr_id != -1){
            model.getImageAt(curr_id);
        }
    };



///////////////////////////////////////////////////
//first get it working with one user only
/////////////////////////////////////////////////



/*
    //make sure that what the user sees is up to date
    (function scheduler(){
        setTimeout(function(e){
            if(curr_id != -1){
            model.getImageAt(curr_id);
            }
            scheduler();
        },2000);
    }());
*/

    return model;
    
}());