/*jshint esversion: 6*/

var model = (function(){
    "use strict";
    
    var curr_id = "first";      //id of the image that is currently displayed
    var newer_comment = null;   //id of the next newer comment
    var older_comment = null;   //id of the next older comment
    var curr_comment = "last";    //id of the top comment that is being displayed
    var newest_comment = null;  //id of the newest comment for the current image
    var curr_gallery = null;


    var model = {};


    //scheduler, load, returnToStart

    //make sure that what the user sees is up to date
    (function scheduler(){
        setTimeout(function(e){
            if(curr_gallery !== null){
                model.getImageAt(curr_id);
                model.checkNewestComment();
                older_comment = curr_comment;
                model.getOlderTen();
            }
            scheduler();
        },2000);
    }());

    //loads the image with the id provided as an argument in the url
    model.load = function(args){





//make api delete comment method only work if the user who is signed in
//wrote the comment or owns the gallery, so if the gallery passed in the
//url or the author of the comment is the same as the one in the cookie
//allow deletion
//
//then hide the delete button if not allowed to click

//////////////////////////////////////////////////////////////////////////////////
//do this
//
//Gallery owners can upload and delete pictures to their own gallery only
//Authenticated users can post comments on any picture of any gallery
//Authenticated users can delete any one of their own comments but not others
//Gallery owners can delete any comment on any picture from their own gallery
///////////////////////////////////////////////////////////////////////////////////






        ////////////////////////////////////////////////////////////////////////////////
        //still need to
        //enter invalid or no gallery display error and hide all upload forms
        //
        //
        //prevent unsigned in users from doing something
        //only the owner can add/delete images (if they try give error[because they could unhide it themselves] and hide the buttons)
        //any signed in user can comment
        //only comment creator or gallery owner can delete comment
        ////////////////////////////////////////////////////////////////////////////////














//want to add a bool that says if the gallery belongs to the current user
//that view will use to hide upload and delete buttons
//maybe just set user



        //if empty load login or users gallery if signed in
        if(args === ""){
            var method = "GET";
            var url = "/api/gallery/";
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState === XMLHttpRequest.DONE){
                    var gallery = JSON.parse(this.responseText);
                    if(gallery !== null){
                        curr_gallery = gallery.username;
                        model.getImageAt("first");
                        document.dispatchEvent(new CustomEvent("onGalleryRetrieved", {detail: gallery}));
                    }
/*                    else{
                        document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
                    }
*/                }
            };
            xhr.open(method, url, true);
            xhr.send(null);
        }

        //if arguments were given to the url
        else if(args.slice(0,1) === "?"){
            var args = args.slice(1).split('&');
            if(args.length > 2){
                document.dispatchEvent(new CustomEvent("displayError", {detail: "Url was not formatted properly"}));
                return;
            }

            //get the args
            curr_gallery = null;
            curr_id = null;
            for(var i=0; i<args.length; i++) {
                args[i] = args[i].split("=")
                if((curr_gallery === null) && (args[i][0] === "gallery")){
                    curr_gallery = args[i][1];
                }
                else if((curr_id === null) && (args[i][0] === "id")){
                    curr_id = args[i][1];
                }
                else{
                    document.dispatchEvent(new CustomEvent("displayError", {detail: "Url was not formatted properly"}));
                    return;
                }
            }

            if(curr_id === null)
                curr_id = "first";

            if(curr_gallery === null){
                document.dispatchEvent(new CustomEvent("displayError", {detail: "Url was not formatted properly"}));
                return;
            }
            else{

                //check that gallery for curr_gallery exists
                model.getImageAt(curr_id);
                model.getGalleryAt(curr_gallery);
  /*              var method = "GET";
                var url = "/api/gallery/" + curr_gallery + "/";
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (this.readyState === XMLHttpRequest.DONE){
                        var gallery = JSON.parse(this.responseText);
                        if(gallery === null){
                            var message = "Gallery " + curr_gallery + " does not exist"
                            document.dispatchEvent(new CustomEvent("displayError", {detail: message}));
                            return;
                        }
                        model.getImageAt(curr_id);   
                    }
                };
                xhr.open(method, url, true);
                xhr.send(null);
    */
            }
        }
        else{
            document.dispatchEvent(new CustomEvent("displayError", {detail: "Url was not formatted properly"}));
            return;
        }
    };

    //get the current gallery
    model.getGalleryAt = function(gallery_name){
        var method = "GET";
        var url = "/api/gallery/" + gallery_name + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    var gallery = JSON.parse(this.responseText);
                    if(gallery === null){
                        var message = "Gallery " + gallery_name + " does not exist"
                        document.dispatchEvent(new CustomEvent("displayError", {detail: message}));
                        return;
                    }
                    curr_gallery = gallery.username;
                    document.dispatchEvent(new CustomEvent("onGalleryRetrieved", {detail: gallery}));
                }
                else
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}))
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //gets the gallery to the left of the current one
    model.getLeftGallery = function(){
        curr_id = "first";
        newer_comment = null;
        older_comment = null;
        curr_comment = "last";
        newest_comment = null;

        var method = "GET";
        var url = "/api/gallery/" + curr_gallery + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    var gallery = JSON.parse(this.responseText);
                    curr_gallery = gallery.left;
                    model.getImageAt("first");
                    model.getGalleryAt(curr_gallery);
                }
                else{
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //gets the gallery to the right of the current one
    model.getRightGallery = function(){
        curr_id = "first";
        newer_comment = null;
        older_comment = null;
        curr_comment = "last";
        newest_comment = null;

        var method = "GET";
        var url = "/api/gallery/" + curr_gallery + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    var gallery = JSON.parse(this.responseText);
                    curr_gallery = gallery.right;
                    model.getImageAt("first");
                    model.getGalleryAt(curr_gallery);
                }
                else{
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };


    //gets the first image in the gallery
    model.returnToStart = function(){
        model.getOlderTen();
        model.getImageAt("first");
    };


    //signIn, signUp, signOut

    //signs the user in
    model.signIn = function(data){
        var method = "POST";
        var url = "/api/signin/";
        var body = JSON.stringify(data);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    var user = JSON.parse(this.responseText);
                    curr_gallery = user.username;
                    model.getImageAt("first");
                    document.dispatchEvent(new CustomEvent("onGalleryRetrieved", {detail: user}));
                }
                else
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    };

    //sign up the user
    model.signUp = function(data){
        var method = "POST";
        var url = "/api/users/";
        var body = JSON.stringify(data);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    var user = JSON.parse(this.responseText);
                    curr_gallery = user.username;
                    model.getImageAt("first");
                    document.dispatchEvent(new CustomEvent("onGalleryRetrieved", {detail: user}));
                }
                else
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    };

    //sign out the user
    model.signOut = function(){
        var method = "GET";
        var url = "/api/signout/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){

                    //reset the gallery
                    curr_gallery = null;
                    curr_id = "first";
                    newer_comment = null;
                    older_comment = null;
                    curr_comment = "last";
                    newest_comment = null;
                    curr_gallery = null;
                }
                else
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };


    //Create

    //uploads an image to the current user's gallery and tells the view to display it
    model.uploadImage = function(data){
        var method = "POST";
        var url = "/api/gallery/" + curr_gallery + "/images/";
        var formdata = new FormData();
        formdata.append("picture", data.file);
        formdata.append("title", data.title);
        formdata.append("author", data.author);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    curr_id = JSON.parse(this.responseText);
                    model.getOlderTen();
                    model.getImageAt(curr_id);
                }
                else{
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    };

    //adds the comment to the image that is currently displayed in the current gallery
    model.saveComment = function(data){
        var method = "POST";
        var url = "/api/gallery/" + curr_gallery + "/images/" + curr_id + "/comments/";
        var body = JSON.stringify(data);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    newest_comment = JSON.parse(this.responseText);
                    model.getComments("/api/gallery/" + curr_gallery + "/images/" + curr_id + "/comments/last/?limit=" + 10 + "&sort=decreasing");
                }
                else{
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    };


    //Read

    //gets the image with the given id in the given gallery, gives an error message if there is no image with that id in that gallery
    model.getImageAt = function(id){
        if(id === undefined)
            id = "first";

        var method = "GET";
        var url = "/api/gallery/" + curr_gallery + "/images/" + id + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    var image = JSON.parse(this.responseText);
                    if(image){
                        if(typeof(image.picture) == "string")
                            image.path = image.picture;
                        else
                            image.path = "/api/gallery/" + image.gallery + "/images/" + image._id + "/picture/";

                        curr_id = image._id;
                        newer_comment = null;
                        older_comment = null;
                        image.gallery = curr_gallery
                        document.dispatchEvent(new CustomEvent("onImageRetrieved", {detail: image}));
                    }
                    else{
                        curr_id = "first";
                        newer_comment = null;
                        older_comment = null;
                        curr_comment = "last";
                        newest_comment = null;
                        document.dispatchEvent(new CustomEvent('onRemoveImage', {detail: curr_gallery}));
                    }
                }
                else
                    document.dispatchEvent(new CustomEvent("error", {detail: this.responseText}));
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //gets the image to the left of the current one in the current gallery
    model.getLeftImage = function(){
        var method = "GET";
        var url = "/api/gallery/" + curr_gallery + "/images/" + curr_id + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    var image = JSON.parse(this.responseText);
                    curr_id = image.left;
                    if(curr_id === undefined)
                        curr_id = "first";
                    model.getOlderTen();
                    model.getImageAt(curr_id);
                }
                else{
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //gets the image to the right of the current one in the current gallery
    model.getRightImage = function(){
        var method = "GET";
        var url = "/api/gallery/" + curr_gallery + "/images/" + curr_id + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    var image = JSON.parse(this.responseText);
                    curr_id = image.right;
                    if(curr_id === undefined)
                        curr_id = "first";
                    model.getOlderTen();
                    model.getImageAt(curr_id);
                }
                else{
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
                }
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
                else{
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //gets the next 10 older comments for the current image in the current gallery
    model.getOlderTen = function(){
        if(curr_id == "first")
            return;
        if(older_comment === null)
            older_comment = "last";
        var url = "/api/gallery/" + curr_gallery + "/images/"+ curr_id + "/comments/" + older_comment + "/?limit=" + 10 + "&sort=decreasing";
        model.getComments(url);
    };

    //gets the next 10 newer comments for the current image in the current gallery
    model.getNewerTen = function(){
        if(curr_id == "first")
            return;
        if(newer_comment === null)
            newer_comment = "last";
        var url = "/api/gallery/" + curr_gallery + "/images/" + curr_id + "/comments/" + newer_comment + "/?limit=" + 10 + "&sort=increasing";
        model.getComments(url);
    };

    //checks that a new comment hasn't been added, and if there was display it
    model.checkNewestComment = function(){
        if(curr_id == "first")
            return;
        var method = "GET";
        var url = "/api/gallery/" + curr_gallery + "/images/" + curr_id + "/comments/last/?limit=1&sort=decreasing";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    var result = JSON.parse(this.responseText);

                    //if a newer comment was added display it
                    if((result.length == 1) && (result[0]._id != newest_comment)){
                        older_comment = null;
                        curr_comment = result[0]._id;
                        newest_comment = result[0]._id;
                        model.getOlderTen();
                    }
                }
                else{
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };


    //Update

    //update is not currently supported


    //Delete

    //deletes the image in gallery and gets the left or right image if there is one
    model.deleteImage = function(){
        var method = "Delete";
        var url = "/api/gallery/" + curr_gallery + "/images/" + curr_id + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    curr_id = JSON.parse(this.responseText);
                    if(curr_id !== null){
                        model.getImageAt(curr_id);
                    }
                    else{
                        curr_id = "first";
                        document.dispatchEvent(new CustomEvent("onRemoveImage", {detail: curr_gallery}));
                    }
                }
                else{
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    //deletes the comment with the id specified for the given image in the given gallery
    model.deleteComment = function(id){        
        var method = "DELETE";
        var url = "/api/gallery/" + curr_gallery + "/images/" + curr_id + "/comments/" + id + "/";
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                if(this.status < 400){
                    older_comment = curr_comment;
                    model.getOlderTen();
                }
                else{
                    document.dispatchEvent(new CustomEvent("displayError", {detail: this.responseText}));
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(null);
    };

    return model;
    
}());