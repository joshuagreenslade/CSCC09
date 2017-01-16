/*jshint esversion: 6*/

var model = (function(){
    "use strict";
    
    var local_datastore = [];

    var model = {};
    
    model.createMessage = function(data){
        local_datastore.push(data);
    	document.dispatchEvent(new CustomEvent("onNewMessage", {detail: data}));
    };

    model.downVote = function(data){
    	var down_button = data.down_button;
    	var count = parseInt(data.value) + 1;
    	var new_data = {down_button, count};
    	document.dispatchEvent(new CustomEvent("onNewDownCount", {detail: new_data}));
    };

    model.upVote = function(data){
    	var up_button = data.up_button;
    	var count = parseInt(data.value) + 1;
    	var new_data = {up_button, count};
    	document.dispatchEvent(new CustomEvent("onNewUpCount", {detail: new_data}));
    };

    model.getMessages = function(){
        var messages = JSON.parse(localStorage.getItem("messages"));
console.log("retrieving messages");
console.log(messages)
        document.dispatchEvent(new CustomEvent("onMessagesRetrieved", {detail: messages}));
    };

    model.saveMessage = function(message){
console.log(message);
        //get the stored messages, append the new message, store the messages
        var messages = JSON.parse(localStorage.getItem("messages"));
        if(messages != null){
console.log("its not null")
console.log(message)
            messages.push(message);
        }
        else {
console.log("it is null")
console.log(message);
            messages = [message];
            console.log(messages);
        }

        console.log("_________________")
        console.log(messages)
        console.log(JSON.parse(localStorage.getItem("messages")))
    console.log(JSON.stringify(messages))
        localStorage.setItem("messages", JSON.stringify(messages));
        console.log(messages)
console.log("message saved");
console.log(JSON.parse(localStorage.getItem("messages")))
console.log("+++++++++++++++")
    };


    model.updateMessages = function(messages){
        //replace old data
        localStorage.setItem("messages", JSON.stringify(messages));
    };

    return model;
    
}());