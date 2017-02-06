/*jshint esversion: 6*/

var view = (function(){
    "use strict";

    //passes the arguments entered in the url to the model
    window.onload = function(e){
        var id = location.search;
        document.dispatchEvent(new CustomEvent("onPageLoad", {detail: id}));
    };

    //toggles the visibility of the image upload form
    document.getElementById("hide_button").onclick = function(e){
        if(document.getElementById("upload_form").style.display == "none"){
            document.getElementById("upload_form").style.display = "flex";
        }
        else{
            document.getElementById("upload_form").style.display = "none";
        }
    };

    //shows the url input and hides the file input when the url radio button is selected
    document.getElementById("url_radio").onclick = function(e){
        document.getElementById("file_input").style.display = "none";
        document.getElementById("url_input").style.display = "inline";
    };

    //shpws the file input and hides the url input when the file radio button is selected
    document.getElementById("file_radio").onclick = function(e){
        document.getElementById("file_input").style.display = "inline";
        document.getElementById("url_input").style.display = "none";
    };

    //gets the input from the form and gets the model to upload it
    document.getElementById("add_image_form").onsubmit = function(e){
        e.preventDefault();

        var file;
        var title = document.getElementById("upload_title").value;
        var author = document.getElementById("upload_author").value;
        var data;

        //make sure title and author inputs are not empty
        if((title !== "") && (author !== "")) {

            //if the file is a url get model to upload it
            if((document.getElementById("url_radio").checked) && (document.getElementById("url_input").value !== "")){
                file = document.getElementById("url_input").value;
            }

            //if file is uploaded get model to convert it to a base64 data url
            else if((document.getElementById("file_radio").checked) && (document.getElementById("file_input").value !== "")){
                file = document.getElementById("file_input").files[0];
            }

            //if no file or url was given
            else{
                return;
            }

            //reset everything except the radio buttons
            document.getElementById("upload_title").value = "";
            document.getElementById("upload_author").value = "";
            document.getElementById("file_input").value = "";
            document.getElementById("url_input").value = "";

            data = {file, title, author};
            document.dispatchEvent(new CustomEvent("onImageUpload", {detail: data}));
        }
    };

    //tells the model to get the left image
    document.getElementById("left_arrow").onclick = function(e){
        document.dispatchEvent(new CustomEvent("getLeftImage"));
    };

    //tells the model to get the right image
    document.getElementById("right_arrow").onclick = function(e){
        document.dispatchEvent(new CustomEvent("getRightImage"));
    };

    //tells model to delete the image
    document.getElementById("delete_image").onclick = function(e){
        document.dispatchEvent(new CustomEvent("deleteImage"));
    };

    //gets the inputs from the comment form and tells the model to add it to the current image's comments
    document.getElementById("comment_form").onsubmit = function(e){
        e.preventDefault();

        var author = document.getElementById("comment_author").value;
        var message = document.getElementById("message_content").value;
        var date = new Date().toLocaleDateString();
        var data = {author, message, date};

        //make sure that the comment has an author and a message
        if((author === "") || (message === "")){
            return;
        }

        document.getElementById("comment_form").reset();
        document.dispatchEvent(new CustomEvent("onNewComment", {detail: data}));
    };

    //tells the model to get the 10 newer comments
    document.getElementById("newer_comments").onclick = function(e){
        document.dispatchEvent(new CustomEvent("getNewerComments"));
    };

    //tells the model to get the 10 older comments
    document.getElementById("older_comments").onclick = function(e){
        document.dispatchEvent(new CustomEvent("getOlderComments"));
    };


    var view = {};


    //image methods

    //put the image, title, and author from data into the DOM
    view.displayImage = function(data){
        document.getElementById("image_stuff").innerHTML = `
                    <img id="image" src=${data.path} alt=${data.title}>
                    <label id="image_name">Title: ${data.title}</label>
                    <label id="author_name">By: ${data.author}</label>`;

        document.getElementById("display").style.display = "inline";
        document.getElementById("delete_image").style.display = 'inline';
        document.getElementById("messages").style.display = "inline";
        document.getElementById("comment_form").style.display = "flex";
        history.pushState(null, "", `index.html?id=${data._id}`);

        //if no left image set left arrow's visibility to hidden
        if(data.left !== null){
            document.getElementById("left_arrow").style.visibility = "visible";
        }
        else{
            document.getElementById("left_arrow").style.visibility = "hidden";
        }

        //if no right image set right arrow's visibility to hidden
        if(data.right !== null){
            document.getElementById("right_arrow").style.visibility = "visible";
        }
        else{
            document.getElementById("right_arrow").style.visibility = "hidden";
        }
    };

    //removes the image from the DOM
    view.removeImage = function(){
        document.getElementById("image_stuff").innerHTML = "";
        document.getElementById("display").style.display = "none";
        document.getElementById("messages").style.display = "none";
        document.getElementById("comment_form").style.display = "none";
        history.pushState(null, "", `index.html`);
    };


    //comment methods

    //puts the comments in data into the DOM
    view.displayComments = function(data){

        //remove old comments
        document.getElementById("message_area").innerHTML = "";

        //create a comment element for each comment in data
        for(var i=0; i<data.length; i++){
            var author = data[i].author;
            var message = data[i].message;
            var date = data[i].date;
            var id = data[i]._id;

            var e = document.createElement('div');
            e.className = "message";
            e.id = id;
            e.innerHTML = `
                    <div class="message_header">
                        <div class="message_name">${author}</div>
                        <div class="date">${date}</div>                    
                    </div>
                    <div class="message_content">${message}</div>
                    <button type="button" class="btn">Delete</button>`;

            document.getElementById("message_area").append(e);

            //initialize delete button for the message
            view.setDelete(document.getElementById(id).children[2]);
        }

        //if there are no newer comments hide the newer comments button
        if(data.newer_comment !== null){
            document.getElementById("newer_comments").style.visibility = "visible";
        }
        else{
            document.getElementById("newer_comments").style.visibility = "hidden";
        }

        //if there are no older comments hide te older comments button
        if(data.older_comment !== null){
            document.getElementById("older_comments").style.visibility = "visible";
        }
        else{
            document.getElementById("older_comments").style.visibility = "hidden";
        }
    };

    //tells the model to delete the comment
    view.setDelete = function(button){
        button.onclick = function(e){
            var id = button.parentNode.id;
            document.dispatchEvent(new CustomEvent("onDeleteComment", {detail: id}));
        };
    };

    //sends the user a 404 message
    view.send404 = function(message){
        document.getElementById("image_stuff").innerHTML = `
                    <img id="image" src="/media/404error.png" alt="404 error">
                    <label id="image_name">${message}</label>
                    <button type="button" class="btn" id="return_to_start">Return To Start Of Gallery</button>`;

        document.getElementById("return_to_start").onclick = function(e){
            document.dispatchEvent(new CustomEvent("returnToStart"));
        };

        document.getElementById("display").style.display = "inline";
        document.getElementById("delete_image").style.display = "none";
        document.getElementById("messages").style.display = "none";
        document.getElementById("comment_form").style.display = "none";
        document.getElementById("right_arrow").style.visibility = "hidden";
        document.getElementById("left_arrow").style.visibility = "hidden";
    };

    return view;
    
}());