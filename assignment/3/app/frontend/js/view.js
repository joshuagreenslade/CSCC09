/*jshint esversion: 6*/

var view = (function(){
    "use strict";

    //passes the arguments entered in the url to the model
    window.onload = function(e){
        var args = location.search;
        document.dispatchEvent(new CustomEvent("onPageLoad", {detail: args}));
    };


    //signup, signin, signout elements

    //switch to signup form
    document.getElementById("sign_up_button").onclick = function(e){
        document.getElementById("error").innerHTML = "";

        //show the signup form and switch to signin button
        document.getElementsByClassName("sign_up_stuff")[0].style.display = "flex";
        document.getElementsByClassName("sign_up_stuff")[1].style.display = "flex";

        //hide the signin form and switch to signup button
        document.getElementsByClassName("sign_in_stuff")[0].style.display = "none";
        document.getElementsByClassName("sign_in_stuff")[1].style.display = "none";
    };

    //switch to signin form
    document.getElementById("sign_in_button").onclick = function(e){
        document.getElementById("error").innerHTML = "";

        //show the signin form and switch to signup button
        document.getElementsByClassName("sign_in_stuff")[0].style.display = "flex";
        document.getElementsByClassName("sign_in_stuff")[1].style.display = "flex";

        //hide the signup form and switch to signin button
        document.getElementsByClassName("sign_up_stuff")[0].style.display = "none";
        document.getElementsByClassName("sign_up_stuff")[1].style.display = "none";
    };

    //signs out the user
    document.getElementById("sign_out_button").onclick = function(e){
        document.getElementById("error").innerHTML = "";

        //show the signin form and switch to signup button
        document.getElementsByClassName("sign_in_stuff")[0].style.display = "flex";
        document.getElementsByClassName("sign_in_stuff")[1].style.display = "flex";

        //hide signout button and the image stuff
        document.getElementById("sign_out_button").style.display = "none";
        document.getElementById("add_image_form").style.display = "none";
        document.getElementById("image_stuff").innerHTML = "";
        document.getElementById("display").style.display = "none";
        document.getElementById("messages").style.display = "none";
        document.getElementById("comment_form").style.display = "none";

        //hide the gallery info
        history.pushState(null, "", `index.html`);
        document.getElementById("gallery_name").innerHTML = "";
        document.getElementById("gallery_navigation").style.display = "none";

        document.dispatchEvent(new CustomEvent("onSignOut"));
    };

    //signs in the user
    document.getElementById("sign_in_form").onsubmit = function(e){
        e.preventDefault();

        var username = document.getElementById("sign_in_username").value;
        var password = document.getElementById("sign_in_password").value;

        if((username !== "") && (password !== "")){
            var data = {username, password};
            document.getElementById("sign_in_form").reset();
            document.dispatchEvent(new CustomEvent("onSignIn", {detail: data}));
        }
    };

    //signs up the user
    document.getElementById("sign_up_form").onsubmit = function(e){
        e.preventDefault();

        var username = document.getElementById("sign_up_username").value;
        var password = document.getElementById("sign_up_password").value;

        if((username !== "") && (password !== "")){
            var data = {username, password};
            document.getElementById("sign_up_form").reset();
            document.dispatchEvent(new CustomEvent("onSignUp", {detail: data}));
        }
    };


    //gallery elements

    //tells the model to get the left user
    document.getElementById("gallery_left_arrow").onclick = function(e){
        document.dispatchEvent(new CustomEvent("getLeftGallery"));
    };

    //tells the model to get the right user
    document.getElementById("gallery_right_arrow").onclick = function(e){
        document.dispatchEvent(new CustomEvent("getRightGallery"));
    };


    //upload image elements

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

    //shows the file input and hides the url input when the file radio button is selected
    document.getElementById("file_radio").onclick = function(e){
        document.getElementById("file_input").style.display = "inline";
        document.getElementById("url_input").style.display = "none";
    };

    //gets the input from the form and gets the model to upload it
    document.getElementById("add_image_form").onsubmit = function(e){
        e.preventDefault();

        var file;
        var title = document.getElementById("upload_title").value;
        var data;

        //make sure title and author inputs are not empty
        if(title !== "") {

            //if the file is a url get model to upload it
            if((document.getElementById("url_radio").checked) && (document.getElementById("url_input").value !== ""))
                file = document.getElementById("url_input").value;

            //if file is uploaded get model to convert it to a base64 data url
            else if((document.getElementById("file_radio").checked) && (document.getElementById("file_input").value !== ""))
                file = document.getElementById("file_input").files[0];

            //if no file or url was given
            else
                return;

            //reset everything except the radio buttons
            document.getElementById("upload_title").value = "";
            document.getElementById("file_input").value = "";
            document.getElementById("url_input").value = "";

            data = {file, title};
            document.dispatchEvent(new CustomEvent("onImageUpload", {detail: data}));
        }
    };


    //image display elements

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


    //comment elements

    //gets the inputs from the comment form and tells the model to add it to the current image's comments
    document.getElementById("comment_form").onsubmit = function(e){
        e.preventDefault();

        var message = document.getElementById("message_content").value;
        var date = new Date().toLocaleDateString();
        var data = {message, date};

        //make sure that the comment has an author and a message
        if(message === "")
            return;

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


    //gallery methods

    //displays the given gallery's info
    view.displayGallery = function(gallery){

        //hide the signup and signin forms aswell as the switch to signin and signup buttons
        document.getElementById("error").innerHTML = "";
        document.getElementsByClassName("sign_in_stuff")[0].style.display = "none";
        document.getElementsByClassName("sign_in_stuff")[1].style.display = "none";
        document.getElementsByClassName("sign_up_stuff")[0].style.display = "none";
        document.getElementsByClassName("sign_up_stuff")[1].style.display = "none";

        document.getElementById("sign_out_button").style.display = "flex"

        //if the gallery belongs to the current user display the upload image form, otherwise hide it
        if(gallery.username === gallery.curr_user)
            document.getElementById("add_image_form").style.display = "flex";
        else
            document.getElementById("add_image_form").style.display = "none";

        //display the gallery info
        history.pushState(null, "", `index.html?gallery=${gallery.username}`);
        document.getElementById("gallery_name").innerHTML = gallery.username + "'s Gallery";
        document.getElementById("gallery_navigation").style.display = "flex";

        //if no user to the left hide the arrow
        if(gallery.left !== null)
            document.getElementById("gallery_left_arrow").style.visibility = "visible";
        else
            document.getElementById("gallery_left_arrow").style.visibility = "hidden";
        
        //if no user to the right hide the arrow
        if(gallery.right !== null)
            document.getElementById("gallery_right_arrow").style.visibility = "visible";
        else
            document.getElementById("gallery_right_arrow").style.visibility = "hidden";
    };


    //image methods

    //put the image, title, and author from data into the DOM
    view.displayImage = function(data){

        //hide the delete image button if the current user is not the gallery owner
        if(data.gallery === data.curr_user)
            document.getElementById("delete_image").style.display = "flex";
        else
            document.getElementById("delete_image").style.display = "none";

        //show the image stuff
        document.getElementById("image_stuff").innerHTML = `
                    <img id="image" src=${data.path} alt=${data.title}>
                    <label id="image_name">Title: ${data.title}</label>
                    <label id="author_name">By: ${data.author}</label>`;
        document.getElementById("display").style.display = "inline";
        document.getElementById("messages").style.display = "inline";
        document.getElementById("comment_form").style.display = "flex";
        history.pushState(null, "", `index.html?gallery=${data.gallery}&id=${data._id}`);

        //if no left image set left arrow's visibility to hidden
        if(data.left !== null)
            document.getElementById("left_arrow").style.visibility = "visible";
        else
            document.getElementById("left_arrow").style.visibility = "hidden";

        //if no right image set right arrow's visibility to hidden
        if(data.right !== null)
            document.getElementById("right_arrow").style.visibility = "visible";
        else
            document.getElementById("right_arrow").style.visibility = "hidden";
    };

    //removes the image from the DOM
    view.removeImage = function(gallery){

        //hide image stuff
        document.getElementById("image_stuff").innerHTML = "";
        document.getElementById("display").style.display = "none";
        document.getElementById("messages").style.display = "none";
        document.getElementById("comment_form").style.display = "none";
        history.pushState(null, "", `index.html?gallery=${gallery}`);
    };


    //comment methods

    //puts the comments in data into the DOM
    view.displayComments = function(data){
        var comments = data.comments;
        var user = data.curr_user;

        //remove old comments
        document.getElementById("message_area").innerHTML = "";

        //create a comment element for each comment in data
        for(var i=0; i<comments.length; i++){
            var author = comments[i].author;
            var message = comments[i].message;
            var date = comments[i].date;
            var id = comments[i]._id;

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

            var delete_button = document.getElementById(id).children[2];

            //initialize delete button for the message
            view.setDelete(delete_button);

            //hide the delete button if the user is not allowed to click it
            if((comments[i].author !== user) && (comments[i].gallery !== user))
                delete_button.style.visibility = "hidden";
        }

        //if there are no newer comments hide the newer comments button
        if(comments.newer_comment !== null)
            document.getElementById("newer_comments").style.visibility = "visible";
        else
            document.getElementById("newer_comments").style.visibility = "hidden";

        //if there are no older comments hide te older comments button
        if(comments.older_comment !== null)
            document.getElementById("older_comments").style.visibility = "visible";
        else
            document.getElementById("older_comments").style.visibility = "hidden";
    };

    //tells the model to delete the comment
    view.setDelete = function(button){
        button.onclick = function(e){
            var id = button.parentNode.id;
            document.dispatchEvent(new CustomEvent("onDeleteComment", {detail: id}));
        };
    };


    //error methods

    //sends the user an error message
    view.sendError = function(error){
        var message = error.message;
        var gallery = error.gallery;

        //hide signin, signup form and buttons if they are displayed and show signout button
        document.getElementById("sign_in_form").style.display = "none";
        document.getElementById("sign_in_button").style.display = "none";
        document.getElementById("sign_up_form").style.display= "none";
        document.getElementById("sign_up_button").style.display = "none";
        document.getElementById("sign_out_button").style.display = "flex";

        document.getElementById("image_stuff").innerHTML = `
                    <img id="image" src="/media/404error.png" alt="404 error">
                    <label id="image_name">${message}</label>
                    <button type="button" class="btn" id="return_to_start">Return To Start Of Gallery</button>`;

        //if gallery does not exist return to the users gallery
        if(gallery === null){
            document.getElementById("return_to_start").innerHTML = "Return to your Gallery"
            document.getElementById("return_to_start").onclick = function(e){
                document.dispatchEvent(new CustomEvent("returnToGallery"));
            };
        }

        //if image does not exist return to start of gallery
        else{
            document.getElementById("return_to_start").onclick = function(e){
                document.dispatchEvent(new CustomEvent("returnToStart"));
            };
        }

        //display the 404 error image and hide the other image stuff
        document.getElementById("display").style.display = "inline";
        document.getElementById("delete_image").style.display = "none";
        document.getElementById("messages").style.display = "none";
        document.getElementById("comment_form").style.display = "none";
        document.getElementById("right_arrow").style.visibility = "hidden";
        document.getElementById("left_arrow").style.visibility = "hidden";
    };

    //displays error message
    view.displayError = function(message){
        document.getElementById("error").innerHTML = message;
    };

    return view;
    
}());