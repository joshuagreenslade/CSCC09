/*jshint esversion: 6*/

var model = (function(){
    "use strict";
    
    var model = {};
    
    model.createMessage = function(message){
    	var new_message = message;
    	document.dispatchEvent(new CustomEvent("onNewMessage", {detail: new_message}));
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

    return model;
    
}());