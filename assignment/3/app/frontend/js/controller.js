(function(model, view){
    "use strict";


    //model dispatched events

    document.addEventListener("onGalleryRetrieved", function(e){
        var gallery = e.detail;
        view.displayGallery(gallery);
    });

    document.addEventListener("onImageRetrieved", function(e){
        var image = e.detail;
        view.displayImage(image);
    });

    document.addEventListener("onRemoveImage", function(e){
        var gallery = e.detail;
        view.removeImage(gallery);
    });

    document.addEventListener("onCommentsRetrieved", function(e){
        var data = e.detail;
        view.displayComments(data);
    });

    document.addEventListener("error", function(e){
        var error = e.detail;
        view.sendError(error);
    });

    document.addEventListener("displayError", function(e){
        var message = e.detail;
        view.displayError(message);
    });


    //view dispatched events

    document.addEventListener("onPageLoad", function(e){
        var args = e.detail;
        model.load(args);
    });

    document.addEventListener("returnToStart", function(e){
        model.returnToStart();
    });

    document.addEventListener("onSignIn", function(e){
        var data = e.detail;
        model.signIn(data);
    });

    document.addEventListener("onSignUp", function(e){
        var data = e.detail;
        model.signUp(data);
    });

    document.addEventListener("onSignOut", function(e){
        model.signOut();
    });

    document.addEventListener("onImageUpload", function(e){
        var data = e.detail;
        model.uploadImage(data);
    });

    document.addEventListener("onNewComment", function(e){
        var data = e.detail;
        model.saveComment(data);
    });

    document.addEventListener("returnToGallery", function(e){
        model.getUserGallery();
    });

    document.addEventListener("getLeftGallery", function(e){
        model.getLeftGallery();
    });

    document.addEventListener("getRightGallery", function(e){
        model.getRightGallery();
    });

    document.addEventListener("getLeftImage", function(e){
        model.getLeftImage();
    });

    document.addEventListener("getRightImage", function(e){
        model.getRightImage();
    });

    document.addEventListener("getOlderComments", function(e){
        model.getOlderTen();
    });

    document.addEventListener("getNewerComments", function(e){
        model.getNewerTen();
    });

    document.addEventListener("deleteImage", function(e){
        model.deleteImage();
    });

    document.addEventListener("onDeleteComment", function(e){
        var id = e.detail;
        model.deleteComment(id);
    });

}(model, view));