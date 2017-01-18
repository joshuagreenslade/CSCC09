/*jshint esversion: 6*/

var model = (function(){
    "use strict";
    
    var local_datastore = [];

    var model = {};
    
    model.createMessage = function(data){
        local_datastore.push(data);
    	document.dispatchEvent(new CustomEvent("onNewMessage", {detail: data}));
    };

    model.vote = function(data){
    	var button = data.button;
    	var count = parseInt(data.value) + 1;
    	var new_data = {button, count};
    	document.dispatchEvent(new CustomEvent("onNewCount", {detail: new_data}));
    };

    model.getMessages = function(){
    	var messages = localStorage.getItem("messages");
        document.dispatchEvent(new CustomEvent("onMessagesRetrieved", {detail: messages}));
    };

    model.saveMessage = function(message){
        localStorage.setItem("messages", message);
    };


    return model;
    
}());