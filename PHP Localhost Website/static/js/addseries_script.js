// Helper Functions:

// To create an alert div with message provided
function create_alert_string(message, alertClass, id){
    f='<div class="alert alert-'+ alertClass + '" role="alert" id="' + id + '">' +
        message +
    '</div>';
    return f;
}

$(document).ready(function(){

    // For adding a Series
    $('#addSeriesBtn').on("click",function() {
        let formDataArray = $('#seriesForm').serializeArray();
        let formData={};
        for(x in formDataArray) {
            formData[formDataArray[x].name]=formDataArray[x].value;
        }
        if( (formData.title.length<1) || (formData.start_year.length<1) ) {
            if(formData.title.length<1)
                this_alert=$(create_alert_string('The Title is not valid!','danger','edit-alert'));
            else
                this_alert=$(create_alert_string('The Start Year is not valid!','danger','edit-alert'));
            $('.errorBox').empty();
            $('.errorBox').append(this_alert);
            this_alert.css("height","48px");
            this_alert.fadeTo(3000, 0).slideUp(500,function(){
                $(this).remove();
            });
            return;
        }
        // change datatypes
        formData.start_year = parseInt(formData.start_year);
        formData.end_year = parseInt(formData.end_year);
        formData.avg_length = parseInt(formData.avg_length);
        formData.total_seasons = parseInt(formData.total_seasons);
        formData.seen_episodes = parseInt(formData.seen_episodes);
        formData.total_episodes = parseInt(formData.total_episodes);
        formData.imdb_rating = parseFloat(formData.imdb_rating);
        formData.rotten_tomatoes_rating = parseInt(formData.rotten_tomatoes_rating);
        if ( isNaN(formData.avg_length) ) {
            formData.avg_length = 0;
        }
        if ( isNaN(formData.total_episodes) ) {
            formData.total_episodes = 0;
        }
        if ( isNaN(formData.seen_episodes) ) {
            formData.seen_episodes = 0;
        }
        formDataJSON = JSON.stringify(formData);
        $.post("async/series_async.php",{addSeries:encodeURIComponent(formDataJSON)}).done(function(result_json){
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
                this_alert=$(create_alert_string(formData.title + ' (' + formData.start_year + ')' + ' is already added!','warning','add-alert'));
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

    // For Updating a Series
    $('#editSeriesBtn').on("click",function() {
        let formDataArray = $('#seriesForm').serializeArray();
        let formData={};
        for(x in formDataArray) {
            formData[formDataArray[x].name]=formDataArray[x].value;
        }
        if( (formData.title.length<1) || (formData.start_year.length<1) ) {
            if(formData.title.length<1)
                this_alert=$(create_alert_string('The Title is not valid!','danger','edit-alert'));
            else
                this_alert=$(create_alert_string('The Start Year is not valid!','danger','edit-alert'));
            $('.errorBox').empty();
            $('.errorBox').append(this_alert);
            this_alert.css("height","48px");
            this_alert.fadeTo(3000, 0).slideUp(500,function(){
                $(this).remove();
            });
            return;
        }
        // change datatypes
        formData.end_year = parseInt(formData.end_year);
        formData.avg_length = parseInt(formData.avg_length);
        formData.total_seasons = parseInt(formData.total_seasons);
        formData.seen_episodes = parseInt(formData.seen_episodes);
        formData.total_episodes = parseInt(formData.total_episodes);
        formData.imdb_rating = parseFloat(formData.imdb_rating);
        formData.rotten_tomatoes_rating = parseInt(formData.rotten_tomatoes_rating);
        if ( isNaN(formData.avg_length) ) {
            formData.avg_length = 0;
        }
        if ( isNaN(formData.total_episodes) ) {
            formData.total_episodes = 0;
        }
        if ( isNaN(formData.seen_episodes) ) {
            formData.seen_episodes = 0;
        }
        // add ID
        formData.id = parseInt($('#editID').val());
        formDataJSON = JSON.stringify(formData);
        $.post("async/series_async.php",{editSeries:encodeURIComponent(formDataJSON)}).done(function(result_json){
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
                this_alert=$(create_alert_string('There is no record of this Series to update!','warning','add-alert'));
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
