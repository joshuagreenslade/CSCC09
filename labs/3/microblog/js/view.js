/*jshint esversion: 6*/

var view = (function(){
    "use strict";

    window.onload = function(e){
console.log("loading");
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


    //initalize the pre-existing messages' up and down button on click methods
    var message = document.getElementsByClassName("message");
    for(var i=0; i<message.length; i++) {


        //get the element's up and down button
    	var down_button = document.getElementsByClassName("down_button")[i];
    	var up_button = document.getElementsByClassName("up_button")[i];
    	
    	down_button.onclick = function(e){
        	var value = down_button.innerHTML;
    		var data = {down_button, value};
        	document.dispatchEvent(new CustomEvent("onDownVote", {detail: data}));
        };

        up_button.onclick = function(e){
    		var value = up_button.innerHTML;
    		var data = {up_button, value};
        	document.dispatchEvent(new CustomEvent("onUpVote", {detail: data}));
        };
    };

    var view = {};

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
//        document.getElementById("messages").prepend(e);

        //request to save this element
console.log("message inserted");
console.log(e);
var test = document.getElementById("messages").innerHTML;
        document.dispatchEvent(new CustomEvent("onMessageInsert", {detail: test/*e*/}));

        //set the onclick method for up and down buttons in the new element
		var down_button = e.children[2].children[0];
		var up_button = e.children[2].children[1];

		down_button.onclick = function(e){
	    	var value = down_button.innerHTML;
	    	var data = {down_button, value};
	    	document.dispatchEvent(new CustomEvent("onDownVote", {detail: data}));
	    };

	    up_button.onclick = function(e){
	    	var value = up_button.innerHTML;
	    	var data = {up_button, value};
	    	document.dispatchEvent(new CustomEvent("onUpVote", {detail: data}));
	    };
    };

    view.updateDownCount = function(data){
	    var down_button = data.down_button;
    	var count = data.count;
    	down_button.innerHTML = count;

        //update storage
        var messages = document.getElementsByClassName("message");
        document.dispatchEvent(new CustomEvent("onVoteUpdate", {detail: messages}));
    };

    view.updateUpCount = function(data){
	    var up_button = data.up_button;
    	var count = data.count;
    	up_button.innerHTML = count;

        //update storage
        var messages = document.getElementsByClassName("message");
        document.dispatchEvent(new CustomEvent("onVoteUpdate", {detail: messages}));
    };

    view.displayMessages = function(messages){
console.log("displaying messages");
console.log(messages);
//console.log(messages[0]);
        //if not null prepend messages to messages element
        if(messages != null) {
            for(var i=0; i<messages.length; i++){
//                document.getElementById("messages").prepend(messages[i]);
            };
        };
    };

/*
       //prepend stored data




        var messages = ["test", "hi"];  //swap with request once coded






        if(messages) {

            //not null prepend to messages element
            for(var i=0; i<messages.length; i++){
                document.getElementById("messages").prepend(messages[i]);
            };
        };
*/




    return view;
    
}());