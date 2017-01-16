(function(model, view){
    "use strict";

    document.addEventListener("onFormSubmit", function(e){
		var message = e.detail;
		model.createMessage(message);

    });

    document.addEventListener("onNewMessage", function(e){
    	var message = e.detail;
    	view.insertMessage(message);
    });

    document.addEventListener("onDownVote", function(e){
    	var data = e.detail;
    	model.downVote(data);
    });
    
    document.addEventListener("onNewDownCount", function(e){
    	var data = e.detail;
    	view.updateDownCount(data);
    });

    document.addEventListener("onUpVote", function(e){
    	var data = e.detail;
    	model.upVote(data);
    });
    
    document.addEventListener("onNewUpCount", function(e){
    	var data = e.detail;
    	view.updateUpCount(data);
    });

}(model, view));