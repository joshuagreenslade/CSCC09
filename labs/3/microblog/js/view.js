/*jshint esversion: 6*/

var view = (function(){
    "use strict";

    window.onload = function(e){

        //request stored data
        document.dispatchEvent(new CustomEvent("onPageLoad"));
    };
    
    document.getElementById("create_message_form").onsubmit = function(e){
    	
    	// prevent from refreshing the page on submit
        e.preventDefault();
        
        // read form elements
        var username = document.getElementById("create_message_name").value;
        var content = document.getElementById("create_message_content").value;
        
        var info = {username, content};

        // clean form 
        document.getElementById("create_message_form").reset();

        //notify the controller
        document.dispatchEvent(new CustomEvent("onFormSubmit", {detail: info}));
    };

    var view = {};


    //sets the onClick methods for the button
	view.setOnClick = function(button) {

		button.onclick = function(e){
			button = e.target;
			var value = e.target.innerHTML;
			var data = {button, value};
			document.dispatchEvent(new CustomEvent("onVote", {detail: data}));
		};
	};


	//initialize the thumb buttons for each message
    view.initalizeButtons = function() {

	    //initalize the pre-existing messages' up and down button on click methods
	    var message = document.getElementsByClassName("message");
	    for(var i = 0; i < message.length; i++) {

	        //get the element's up and down buttons
	    	var down_button = document.getElementsByClassName("down_button")[i];
	    	var up_button = document.getElementsByClassName("up_button")[i];

			view.setOnClick(down_button);
			view.setOnClick(up_button);
    	}
	};


    view.insertMessage = function(message){

    	var username = message.username;
    	var content = message.content;

    	var e = document.createElement('div');
        e.className = "message";
        e.innerHTML = `
                <div class="message_header">
                    <div class="message_avatar"><img src="media/user.png" alt="${username}"/></div>
                    <div class="message_name">${username}</div>
                </div>
                <div class="message_content">${content}</div>
                <div class="message_vote">
                    <div class="down_button vote_button">0</div>
                    <div class="up_button vote_button">0</div>
                </div>`;

        // add this element to the document
        document.getElementById("messages").prepend(e);

		view.initalizeButtons();
        //request to save this element

		var messages = document.getElementById("messages").innerHTML;
        document.dispatchEvent(new CustomEvent("onMessageInsert", {detail: messages}));
    };


    view.updateCount = function(data){
	    var button = data.button;
    	var count = data.count;
    	
    	button.innerHTML = count;

        //update storage
        var messages = document.getElementById("messages").innerHTML;
        document.dispatchEvent(new CustomEvent("onVoteUpdate", {detail: messages}));
    };


    view.displayMessages = function(messages){

        //if not null prepend messages to messages element
        if(messages !== null) {
        	document.getElementById("messages").innerHTML = "";
            document.getElementById("messages").innerHTML += messages;
        }

        view.initalizeButtons();
    };

    return view;
    
}());