var model = (function(){
    "use strict";
    
    var doAjax = function (method, url, body, json, callback){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(e){
            switch(this.readyState){
                 case (XMLHttpRequest.DONE):
                    if (this.status === 200) {
                        if (json) return callback(null, JSON.parse(this.responseText));
                        return callback(null, this.responseText);
                    }else{
                        return callback(this.responseText, null);
                    }
            }
        };
        xhttp.open(method, url, true);
        if (json) xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send((body)? JSON.stringify(body) : null);  
    };
    
    var model = {};
    
    // init

    model.init = function (){
        model.getMessages();
        model.getUsers();
    }
    
    // create
    
    model.createUser = function(data){
        doAjax('PUT', '/api/users/', data, true, function(err, data){
            if (err) console.error(err);
            else document.dispatchEvent(new CustomEvent("userUpdated", {'detail': data}));
        });
    }
    
    model.createMessage = function (data){
        doAjax('POST', '/api/messages/', data, true, function(err, data){
            if (err) console.error(err);
            else document.dispatchEvent(new CustomEvent("messageUpdated", {'detail': data}));
        });
    };
    
    // read
    
    model.getMessages = function (){
        doAjax("GET", "/api/messages/", null, true, function(err, data){
            if (err) console.error(err);
            else document.dispatchEvent(new CustomEvent("messagesUpdated", {'detail': data}));
        });
    };
    
    model.getUsers = function (){
        doAjax("GET", "/api/users/", null, true, function(err, data){
            if (err) console.error(err);
            else document.dispatchEvent(new CustomEvent("usersUpdated", {'detail': data}));
        });
    };
    
    // update
    
    model.updateUser = function (data){
        var method = "PATCH";
        var url = "http://localhost:3000/api/users/" + data.username + "/";
        var formdata = new FormData();
        formdata.append("picture", data.picture);
        formdata.append("username", data.username);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE){
                     document.dispatchEvent(new CustomEvent("userUpdated", {'detail': data}));
            }
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    };
    
    model.upvoteMessage = function (id){
        doAjax("PATCH", "/api/messages/" + id + "/", {action: "upvote"}, true, function(err, data){
            if (err) console.error(err);
            else document.dispatchEvent(new CustomEvent("messageUpdated", {'detail': data }));
        });
    };
    
    model.downvoteMessage = function (id){
        doAjax("PATCH", "/api/messages/" + id + "/", {action: "downvote"}, true, function(err, data){
            if (err) console.error(err);
            else document.dispatchEvent(new CustomEvent("messageUpdated", {'detail': data }));
        });
    };

    // delete
    
    model.deleteMessage = function (id){
        doAjax("DELETE", "/api/messages/" + id + "/", null, true, function(err, data){
            if (err) console.error(err);
            else document.dispatchEvent(new CustomEvent("messageUpdated", {'detail': data }));

        });
    };
    
    return model;
    
}())

