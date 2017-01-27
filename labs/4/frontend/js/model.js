var model = (function(){
    "use strict";
    
    var model = {};
    

    // init
    
    model.getMessages = function(){
        var method = "GET";
        var url = "http://localhost:3000/api/messages";
        var body = null;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(this.readyState === XMLHttpRequest.DONE){
                var messages = JSON.parse(this.responseText);
                document.dispatchEvent(new CustomEvent("messageUpdated", {'detail': messages }));
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    };

    
    // create
    
    model.createMessage = function (data){
        var method = "POST";
        var url = "http://localhost:3000/api/messages/";
        var body = JSON.stringify(data);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(this.readyState === XMLHttpRequest.DONE){
                model.getMessages();
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    };
    
    // update
    
    model.upvoteMessage = function (id){
        var method = "PATCH";
        var url = "http://localhost:3000/api/messages/" + id;
        var body = {upvote : 1, downvote : 0};
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(this.readyState === XMLHttpRequest.DONE){
                model.getMessages();
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(body));
    };
    
    model.downvoteMessage = function (id){
        var method = "PATCH";
        var url = "http://localhost:3000/api/messages/" + id;
        var body = {upvote : 0, downvote : 1};
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(this.readyState === XMLHttpRequest.DONE){
                model.getMessages();
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(body));
    };

    // delete
    
    model.deleteMessage = function (id){
        var method = "DELETE";
        var url = "http://localhost:3000/api/messages/" + id;
        var body = null;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(this.readyState === XMLHttpRequest.DONE){
                model.getMessages();
            }
        };
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    };

    setInterval(function(e){
        model.getMessages();
    }, 2000);

    
    return model;
    
}());