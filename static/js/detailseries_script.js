$(document).ready(function(){

    // Bring out Delete Box
    $('.deleteBtn').on('click',function(){
        protect_layer = $('<div class="protectLayer"></div>')
        $('body').append(protect_layer);
        delete_box = $('<div class="deleteBox flexCenterCol">' +
                        '<div class="deleteMessage flexCenterRow">' +
                            'Are you sure you want to delete ' + $('.Title').text() + '?' +
                        '</div>' +
                        '<div class="btnbox flexCenterRow">' +
                            '<p class="marBtn">' +
                                '<button class="btn btn-danger" type="button" id="deleteSureButton">Delete</button>' +
                            '</p>' +
                            '<p class="marBtn">' +
                                '<button class="btn btn-success" type="button" id="cancelDeleteButton">Cancel</button>' +
                            '</p>' +
                        '</div>' +
                       '</div>');
        $('body').append(delete_box);
        $(delete_box).css('opacity',1);
    });

    // Page opacity reversal when not deleted
    $(document).on('click','.protectLayer',function(){
        $('.protectLayer').remove();
        $('.deleteBox').remove();
    });
    $(document).on('click','#cancelDeleteButton',function(){
        $('.protectLayer').remove();
        $('.deleteBox').remove();
    });

    // Deletion
    $(document).on('click','#deleteSureButton',function(){
        id=parseInt($('#currentID').val());
        $.post('async/series_async.php',{deleteSeries:id}).done(function(result_json){
            result=JSON.parse(result_json);
            if ( result === null ) {
                alert('There was some SQL Error, Sorry!');
            }
            else if ( result === false ) {
                alert('This series is non-existant!');
            }
            else {
                window.location.replace(result);
            }
        });
    });

});
