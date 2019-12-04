// Helper Functions:

// To create an alert div with message provided
function create_alert_string(message, alertClass, id){
    f='<div class="alert alert-'+ alertClass + '" role="alert" id="' + id + '">' +
        message +
    '</div>';
    return f;
}

$(document).ready(function(){

    // For toggling Seen Switch
    $('.toggle-group').on("click",function() {
        if($('input[name="seen"]').prop("checked")) {
            $('input[name="seen"]').prop("checked",false);
            $(".toggle-group").animate({left: -$('.seenbutton').innerWidth()},60);
        }
        else {
            $('input[name="seen"]').prop("checked",true);
            $(".toggle-group").animate({left: "0px"},60);
        }
    });

    // For adding a movie
    $('#addMovieBtn').on("click",function() {
        let formDataArray = $('#movieForm').serializeArray();
        let formData={};
        for(x in formDataArray) {
            formData[formDataArray[x].name]=formDataArray[x].value;
        }
        if( (formData.title.length<1) || (formData.releaseyear.length<1) ) {
            if(formData.title.length<1)
                this_alert=$(create_alert_string('The Title is not valid!','danger','add-alert'));
            else
                this_alert=$(create_alert_string('The Release Year is not valid!','danger','add-alert'));
            $('.errorBox').empty();
            $('.errorBox').append(this_alert);
            this_alert.css("height","48px");
            this_alert.fadeTo(3000, 0).slideUp(500,function(){
                $(this).remove();
            });
            return;
        }
        // change datatypes
        formData.releaseyear = parseInt(formData.releaseyear);
        formData.runtime = parseInt(formData.runtime);
        if ( isNaN(formData.runtime) ) {
            formData.runtime = 0;
        }
        formData.imdb_rating = parseFloat(formData.imdb_rating);
        formData.rotten_tomatoes_rating = parseInt(formData.rotten_tomatoes_rating);
        if($('input[name="seen"]').prop("checked")) {
            formData.seen=1;
        }
        else {
            formData.seen=0;
        }
        formDataJSON = JSON.stringify(formData);
        $.post("async/movies_async.php",{addMovie:encodeURIComponent(formDataJSON)}).done(function(result_json){
            let result=JSON.parse(result_json);
            if ( result === null ) {
                this_alert=$(create_alert_string('There was some SQL Error, Sorry!','primary','add-alert'));
                $('.errorBox').empty();
                $('.errorBox').append(this_alert);
                this_alert.css("height","48px");
                this_alert.fadeTo(3000, 0).slideUp(500,function(){
                    $(this).remove();
                });
            }
            else if ( result === false ) {
                this_alert=$(create_alert_string(formData.title + ' (' + formData.releaseyear + ')' + ' is already added!','warning','add-alert'));
                $('.errorBox').empty();
                $('.errorBox').append(this_alert);
                this_alert.css("height","48px");
                this_alert.fadeTo(3000, 0).slideUp(500,function(){
                    $(this).remove();
                });
            }
            else {
                window.location.replace(result);
            }
        });
    });

    // For Updating a Movie
    $('#editMovieBtn').on("click",function() {
        let formDataArray = $('#movieForm').serializeArray();
        let formData={};
        for(x in formDataArray) {
            formData[formDataArray[x].name]=formDataArray[x].value;
        }
        if( (formData.title.length<1) || (formData.releaseyear.length<1) ) {
            if(formData.title.length<1)
                this_alert=$(create_alert_string('The Title is not valid!','danger','edit-alert'));
            else
                this_alert=$(create_alert_string('The Release Year is not valid!','danger','edit-alert'));
            $('.errorBox').empty();
            $('.errorBox').append(this_alert);
            this_alert.css("height","48px");
            this_alert.fadeTo(3000, 0).slideUp(500,function(){
                $(this).remove();
            });
            return;
        }
        // change datatypes
        formData.releaseyear = parseInt(formData.releaseyear);
        formData.runtime = parseInt(formData.runtime);
        if ( isNaN(formData.runtime) ) {
            formData.runtime = 0;
        }
        formData.imdb_rating = parseFloat(formData.imdb_rating);
        formData.rotten_tomatoes_rating = parseInt(formData.rotten_tomatoes_rating);
        // add ID
        formData.id = parseInt($('#editID').val());
        if($('input[name="seen"]').prop("checked")) {
            formData.seen=1;
        }
        else {
            formData.seen=0;
        }
        formDataJSON = JSON.stringify(formData);
        $.post("async/movies_async.php",{editMovie:encodeURIComponent(formDataJSON)}).done(function(result_json){
            let result=JSON.parse(result_json);
            if ( result === null ) {
                this_alert=$(create_alert_string('There was some SQL Error, Sorry!','primary','add-alert'));
                $('.errorBox').empty();
                $('.errorBox').append(this_alert);
                this_alert.css("height","48px");
                this_alert.fadeTo(3000, 0).slideUp(500,function(){
                    $(this).remove();
                });
            }
            else if ( result === false ) {
                this_alert=$(create_alert_string('There is no record of this Movie to update!','warning','add-alert'));
                $('.errorBox').empty();
                $('.errorBox').append(this_alert);
                this_alert.css("height","48px");
                this_alert.fadeTo(3000, 0).slideUp(500,function(){
                    $(this).remove();
                });
            }
            else {
                window.location.replace(result);
            }
        });
    });


});
