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

    document.addEventListener("404", function(e){
        view.load404();
    });


    //view dispatched events

    document.addEventListener("onFileUpload", function(e){
        var data = e.detail;
        model.base64Conversion(data);
    });

    document.addEventListener("onImageUpload", function(e){
        var data = e.detail;
        model.uploadImage(data);
    });

    document.addEventListener("getRightImage", function(e){
        model.getRightImage();
    });

    document.addEventListener("getLeftImage", function(e){
        model.getLeftImage();
    });

    document.addEventListener("deleteImage", function(e){
        model.deleteImage();
    });

    document.addEventListener("onNewComment", function(e){
        var data = e.detail;
        model.saveComment(data);
    });

    document.addEventListener("getNewerComments", function(e){
        model.getNewerTen();
    });

    document.addEventListener("getOlderComments", function(e){
        model.getOlderTen();
    });

    document.addEventListener("onDeleteComment", function(e){
        var id = e.detail;
        model.deleteComment(id);
    });

    document.addEventListener("onPageLoad", function(e){
        var id = e.detail;
        model.load(id);
    });

}(model, view));