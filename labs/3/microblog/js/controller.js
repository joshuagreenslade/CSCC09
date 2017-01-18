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

    document.addEventListener("onVote", function(e){
    	var data = e.detail;
    	model.vote(data);
    });
    
    document.addEventListener("onNewCount", function(e){
    	var data = e.detail;
    	view.updateCount(data);
    });

    document.addEventListener("onPageLoad", function(e){
        model.getMessages();
    });

    document.addEventListener("onMessagesRetrieved", function(e){
        var messages = e.detail;
        view.displayMessages(messages);
    });
    
    document.addEventListener("onMessageInsert", function(e){
        var message = e.detail;
        model.saveMessage(message);
    });

    document.addEventListener("onVoteUpdate", function(e) {
        var messages = e.detail;
        model.saveMessage(messages);
    });

}(model, view));