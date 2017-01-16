(function(model, view){
    "use strict";

    document.addEventListener("onFormSubmit", function(e){
		var data = e.detail;
		model.createMessage(data);

    });

    document.addEventListener("onNewMessage", function(e){
    	var data = e.detail;
    	view.insertMessage(data);
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

    document.addEventListener("onPageLoad", function(e){
console.log("loading displayMessages");
        model.getMessages();
    });

    document.addEventListener("onMessagesRetrieved", function(e){
        var messages = e.detail;
console.log("sending messages");
        view.displayMessages(messages);
    });
    
    document.addEventListener("onMessageInsert", function(e){
        var message = e.detail;
console.log("saving messages");
console.log(message);
        model.saveMessage(message);
    });

    document.addEventListener("onVoteUpdate", function(e) {
        var messages = e.detail;
        model.updateMessage(messages);
    });


}(model, view));