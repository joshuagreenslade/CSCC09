(function(model, view){
    "use strict";


    //model dispatched events

    document.addEventListener("onImageRetrieved", function(e){
        var image = e.detail;
        view.displayImage(image);
    });

    document.addEventListener("onRemoveImage", function(e){
        view.removeImage();
    });

    document.addEventListener("onCommentsRetrieved", function(e){
        var data = e.detail;
        view.displayComments(data);
    });

    document.addEventListener("error", function(e){
        var message = e.detail;
        view.sendError(message);
    });


    //view dispatched events

    document.addEventListener("onPageLoad", function(e){
        var id = e.detail;
        model.load(id);
    });

    document.addEventListener("onImageUpload", function(e){
        var data = e.detail;
        model.uploadImage(data);
    });

    document.addEventListener("getLeftImage", function(e){
        model.getLeftImage();
    });

    document.addEventListener("getRightImage", function(e){
        model.getRightImage();
    });

    document.addEventListener("deleteImage", function(e){
        model.deleteImage();
    });

    document.addEventListener("returnToStart", function(e){
        model.returnToStart();
    });

    document.addEventListener("onNewComment", function(e){
        var data = e.detail;
        model.saveComment(data);
    });

    document.addEventListener("getOlderComments", function(e){
        model.getOlderTen();
    });

    document.addEventListener("getNewerComments", function(e){
        model.getNewerTen();
    });

    document.addEventListener("onDeleteComment", function(e){
        var id = e.detail;
        model.deleteComment(id);
    });

}(model, view));