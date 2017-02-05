/*jshint esversion: 6*/

var model = (function(){
    "use strict";
    
    var curr_id = null;        //index of the image that is currently displayed
   // var curr_comment = -1;      //which comment is currently at the top 
    var newer_comment = null;
    var older_comment = null;
    var curr_comment = null;
    var newest_comment = null;


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
                model.getOlderTen();
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
                curr_id = image.left;
                if(curr_id === undefined)
                    curr_id = null;
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
        var url = "http://localhost:3000/api/images/" + curr_id;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var image = JSON.parse(this.responseText);
                curr_id = image.right;
                if(curr_id === undefined)
                    curr_id = null;
                model.getImageAt(curr_id);
                model.getOlderTen();
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
        if(id === undefined)
            id = null;

        var method = "GET";
        var url = "http://localhost:3000/api/images/" + id;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var image = JSON.parse(this.responseText);
                if(this.status !== 404){
                    if(image){
                        if(typeof(image.picture) == "string")
                            image.path = image.picture;

                        else
                            image.path = "http://localhost:3000/api/images/" + id + "/picture";

                        curr_id = image._id;
                        newer_comment = null;
                        older_comment = null;

                        //model.getOlderTen();
                        document.dispatchEvent(new CustomEvent("onImageRetrieved", {detail: image}));
                    }
                }
                else
                    //curr_id = null
                    document.dispatchEvent(new CustomEvent("404", {detail: image}));

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
                curr_id = JSON.parse(this.responseText);
                if(curr_id !== null){
                    model.getImageAt(curr_id);
                }
                else{
                    curr_id = null;
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
newest_comment = JSON.parse(this.responseText)
console.log(newest_comment)
                model.getComments("http://localhost:3000/api/comments/" + null + "&" + curr_id + "&" + 10 + "&older");
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    };

    //gets the next 10 comment after and including the one at id and tells the view to display them
    model.getComments = function(url){


        var method = "GET";
        //var url = "http://localhost:3000/api/comments/" + id + "&" + curr_id + "&" + 10;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var result = JSON.parse(this.responseText);
                console.log(result);
                if(result.length != 0){
                    curr_comment = result[0]._id;
                    newer_comment = result[0].newer_comment;
                    result.newer_comment = newer_comment;
                    older_comment = result[result.length - 1].older_comment;
                    result.older_comment = older_comment;
                }
                else{
                    curr_comment = null;
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
        model.getComments(url);
    };

    //gets the next 10 newer comments
    model.getNewerTen = function(){
        //curr_comment+10 will get the same comments that are currently
        //displayed so curr_comments+20 will get the 10 comments newer
        //the ones currently displayed


console.log(newer_comment)
        var url = "http://localhost:3000/api/comments/" + newer_comment + "&" + curr_id + "&" + 10 + "&newer";
        model.getComments(url);
    };

    //removes the comment from the image and updates the local storage
    model.deleteComment = function(id){        
        var method = "DELETE";
        var url = "http://localhost:3000/api/comments/" + id + "/"
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
   console.log(this.responseText)
//   older_comment = null;
older_comment=curr_comment;
   model.getOlderTen();
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);


/*
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
*/
    };


    //gets next_id and images from local storage and gets the image at the id provided
    model.load = function(id){


        //if id was not specified in url use first image as default if images is not empty
        if(id === ""){
            model.getImageAt(null);
            return;
        }

        //if the id argurment was formatted properly in the url and the value was a number get the image with that id
        else if(id.slice(0,4) == "?id="){
            curr_id = id.slice(4);
        }
        else{
            curr_id = -1;   //check
        }
console.log(curr_id)
    //    if(curr_id != -1){
            model.getImageAt(curr_id);
      //  }
    };



///////////////////////////////////////////////////
//first get it working with one user only
/////////////////////////////////////////////////
model.checkNewestComment = function(){
    console.log("before")
    var method = "GET";
        var url = "http://localhost:3000/api/comments/null&" + curr_id + "&1&older";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                var result = JSON.parse(this.responseText);
                console.log(result);
                console.log("ahhhhhhhhhhhh")
                //console.log(result[0]._id, newest_comment)
                if((result.length == 1) && (result[0]._id != newest_comment)){
                    older_comment = null;
                    curr_comment = result[0]._id;
                    newest_comment = result[0]._id
                    model.getOlderTen();
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
        
};



    //make sure that what the user sees is up to date
    (function scheduler(){
        setTimeout(function(e){
            model.getImageAt(curr_id);
            model.checkNewestComment();
            older_comment = curr_comment;
            model.getOlderTen();

           /* if(curr_id != -1){
            model.getImageAt(curr_id);
            }*/

            scheduler();
        },2000);
    }());










//constantly get the current image
//call getCommentAt(curr_comment)
//find a way to constantly get the older comments starting with the one at the top



// element 0 of array returned




//when trying to have multiple users maybe dont refresh the comments everytime
//maybe only update comments if 203 or something (no change)




    return model;
    
}());






//seems to work for deleteing images





////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
//decide what to do with comments, right now if comment is added by one
//person  the other person will click newer comment to see the new comment
//maybe do what you do when a single person deletes (when ever there is an
//insert or delete reset the comments [look at the newest one])
//
//
//
//delete sort of works (doesnt pull up comments for user when other user
//deletes) but if you naviggate to the first comment it will fix itself so
//the first page has 10 comments
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


//check that comments can be navigated seperately and that a delete on one will delete from the other
//if it doesnt work try after comment delete call getOlderTen on curr_comment, and if that is null call getNewerTen on curr_comment


//maybe try if the array returned has < 10 items and the last item.older!=null 
//wont work