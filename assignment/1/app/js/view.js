/*jshint esversion: 6*/

var view = (function(){
    "use strict";

    window.onload = function(e){
        var id = location.search;
        document.dispatchEvent(new CustomEvent("onPageLoad", {detail: id}));
    };

    document.getElementById("hide_button").onclick = function(e){
        if(document.getElementById("upload_form").style.display == "none"){
            document.getElementById("upload_form").style.display = "flex";
        }
        else{
            document.getElementById("upload_form").style.display = "none";
        }
    };

    document.getElementById("url_radio").onclick = function(e){
        document.getElementById("file_input").style.display = "none";
        document.getElementById("url_input").style.display = "inline";
    };

    document.getElementById("file_radio").onclick = function(e){
        document.getElementById("file_input").style.display = "inline";
        document.getElementById("url_input").style.display = "none";
    };

    document.getElementById("add_image_form").onsubmit = function(e){
        e.preventDefault();

        var file;
        var title = document.getElementById("upload_title").value;
        var author = document.getElementById("upload_author").value;

        if((title !== "") && (author !== "")) {
            if((document.getElementById("url_radio").checked) && (document.getElementById("url_input").value !== "")){
                file = document.getElementById("url_input").value;
            }
            else if((document.getElementById("file_radio").checked) && (document.getElementById("file_input").value !== "")){
                file = window.URL.createObjectURL(document.getElementById("file_input").files[0]);
            }
            else{
                return;
            }

            //reset everything except the radio buttons
            document.getElementById("upload_title").value = "";
            document.getElementById("upload_author").value = "";
            document.getElementById("file_input").value = "";
            document.getElementById("url_input").value = "";

            var data = {file, title, author};
            document.dispatchEvent(new CustomEvent("onImageUpload", {detail: data}));
        }
    };

    document.getElementById("left_arrow").onclick = function(e){
        document.dispatchEvent(new CustomEvent("getLeftImage"));
    };

    document.getElementById("right_arrow").onclick = function(e){
        document.dispatchEvent(new CustomEvent("getRightImage"));
    };

    document.getElementById("delete_image").onclick = function(e){
        document.dispatchEvent(new CustomEvent("deleteImage"));
    };

    document.getElementById("comment_form").onsubmit = function(e){
        e.preventDefault();

        var author = document.getElementById("comment_author").value;
        var message = document.getElementById("message_content").value;
        var date = new Date().toLocaleDateString();
        var data = {author, message, date};

        document.getElementById("comment_form").reset();

        document.dispatchEvent(new CustomEvent("onNewComment", {detail: data}));
    };

    document.getElementById("newer_comments").onclick = function(e){
        document.dispatchEvent(new CustomEvent("getNewerComments"));
    };

    document.getElementById("older_comments").onclick = function(e){
        document.dispatchEvent(new CustomEvent("getOlderComments"));
    };


    var view = {};


    view.displayImage = function(data){
        document.getElementById("image").src = data.file;
        document.getElementById("image").alt = data.title;
        document.getElementById("image_name").innerHTML = "Title: " + data.title;
        document.getElementById("author_name").innerHTML = "By: " + data.author;
        document.getElementById("hidden").style.display = "inline";
        history.pushState(null, "", `index.html?id=${data.id}`);

        //if no left image set left arrow's visibility to hidden
        if(data.has_left){
            document.getElementById("left_arrow").style.visibility = "visible";
        }
        else{
            document.getElementById("left_arrow").style.visibility = "hidden";
        }

        //if no right image set right arrow's visibility to hidden
        if(data.has_right){
            document.getElementById("right_arrow").style.visibility = "visible";
        }
        else{
            document.getElementById("right_arrow").style.visibility = "hidden";
        }
    };

    view.removeImage = function(){
        document.getElementById("image").src = "";
        document.getElementById("image").alt = "";
        document.getElementById("image_name").innerHTML = "";
        document.getElementById("author_name").innerHTML = "";
        document.getElementById("hidden").style.display = "none";
        history.pushState(null, "", `index.html`);
    };

    view.displayComments = function(data){

        //remove old comments
        document.getElementById("message_area").innerHTML = "";

        for(var i=0; i<data.length; i++){
            var author = data[i].author;
            var message = data[i].message;
            var date = data[i].date;
            var id = data[i].id;

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
        if(data.newer_comments){
            document.getElementById("newer_comments").style.visibility = "visible";
        }
        else{
            document.getElementById("newer_comments").style.visibility = "hidden";
        }

        //if there are no older comments hide te older comments button
        if(data.older_comments){
            document.getElementById("older_comments").style.visibility = "visible";
        }
        else{
            document.getElementById("older_comments").style.visibility = "hidden";
        }
    };

    view.setDelete = function(button){
        button.onclick = function(e){
            var id = button.parentNode.id;
            document.dispatchEvent(new CustomEvent("onDeleteComment", {detail: id}));
        };
    };

    view.load404 = function(){
        window.location.href = "404.html";
    };

    return view;
    
}());