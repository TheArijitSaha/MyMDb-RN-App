//Helper Functions:

// function construct_director_string(directors) {
//     director_array = directors.split(', ');
//     f = "";
//     for (x in director_array) {
//         f+='<a href="/MyMDb/Movies/Director/' + encodeURIComponent(director_array[x]) + '">' + director_array[x] + '</a>';
//         if (x < director_array.length-1) {
//             f+=', ';
//         }
//     }
//     return f;
// }
//
// function construct_genre_string(genres) {
//     genre_array = genres.split(', ');
//     f = "";
//     for (x in genre_array) {
//         f+='<a href="/MyMDb/Movies/Genre/' + encodeURIComponent(genre_array[x]) + '">' + genre_array[x] + '</a>';
//         if (x < genre_array.length-1) {
//             f+=', ';
//         }
//     }
//     return f;
// }
//
// function construct_releaseyear_string(year) {
//     f = '<a href="/MyMDb/Movies/Year/' + parseInt(year) + '">' + parseInt(year) + '</a>';
//     return f;
// }

function construct_series_string(series){
    f='<span>' + series.title + '</span>';
    return f;
    // f="";
    // if(series.seen == 1) {
    //     f='<div class="series-node seen-node">';
    // }
    // else {
    //     f='<div class="series-node unseen-node">';
    // }
    //
    // f+= '<div class="series-first-line">' +
    //         '<span class="series-id" hidden>' + series.id + '</span>' +
    //         '<a href="/MyMDb/Movies/' + series.id + '"><span class="series-name">' + series.title + '</span></a>' +
    //         '<span class="series-year">(' + construct_releaseyear_string(series.release_year) + ')</span>' +
    //         '<span class="series-imdb-rating">[' + series.imdb_rating + ']</span>' +
    //         '<span class="series-dir">' + construct_director_string(series.director) + '</span>' +
    //     '</div>' +
    //
    //     '<div class="series-second-line">' +
    //         '<span class="series-cast">' + series.cast + '</span>' +
    //         '<span class="series-genre">' + construct_genre_string(series.genre) + '</span>' +
    //     '</div>' +
    //   '</div>';
    // return f;
}


$(document).ready(function(){
    listCount = 0;
    // working = false;
    ongoing = 0;

    //for loading series
    function showSeries(series_list_json, clearList=true){
        if (clearList) {
            $('.seriesList').empty();
        }
        series_list = JSON.parse(series_list_json);
        if(series_list.data.length < 1)
        {
            // If there are no posts
        }

        for ( x in series_list.data ) {
            series_node = $(construct_series_string(series_list.data[x]));
            $('.seriesList').append(series_node);
        }
        listCount += series_list.data.length;
    }
    function appendSeries(series_list_json){
        showSeries(series_list_json,false);
    }
    function loadSeries(clearList=false) {
        listFunction = appendSeries;
        if(clearList) {
            listFunction = showSeries;
            listCount = 0;
        }
        filter_string = '';
        // if ($('#movieFilter').val() === 'No Filter') {
        //     filter_string = '';
        // }
        // else {
        //     filter_string = $('#filterString').val();
        // }
        $.post("async/series_async.php",{
                                            // filterOption:$('#movieFilter').val(),
                                            filterOption:'No Filter',
                                            filterString:filter_string,
                                            listCount:listCount,
                                            ongoing:ongoing
                                        }).done(listFunction);
    }
    loadSeries(true);

    // // For Switching Filter Options
    // $('#movieFilter').on('change',function(){
    //     $('#filterActual').empty();
    //     if ($('#movieFilter').val() === "No Filter") {
    //         loadSeries(true);
    //     }
    //     else if ($('#movieFilter').val() === "Name") {
    //         $('#filterActual').append('<input class="form-control" type="text" id="filterString" name="titleFilter" placeholder="Enter Name" autocomplete="off">');
    //     }
    //     else if ($('#movieFilter').val() === "Director") {
    //         $('#filterActual').append('<input class="form-control" type="text" id="filterString" name="directorFilter" placeholder="Enter Director" autocomplete="off">');
    //     }
    //     else if ($('#movieFilter').val() === "Release Year") {
    //         $('#filterActual').append('<input class="form-control" type="number" id="filterString" name="yearFilter" placeholder="Enter Year" autocomplete="off">');
    //     }
    //     else if ($('#movieFilter').val() === "Genre") {
    //         $('#filterActual').append('<input class="form-control" type="text" id="filterString" name="genreFilter" placeholder="Enter Genre" autocomplete="off">');
    //     }
    // });
    //
    // // For applying filter
    // $(document).on('keyup','#filterString',function(){
    //     loadSeries(true);
    // });
    //
    // // For toggling SeenFilter Switch
    // $('.toggleGroup').on("click",function() {
    //     if($('input[name="seenfilter"]').prop("checked")) {
    //         // All movies
    //         $('input[name="seenfilter"]').prop("checked",false);
    //         $('.toggleSwitch').addClass('Off');
    //         unseen = 0;
    //     }
    //     else {
    //         // Unseen movies
    //         $('input[name="seenfilter"]').prop("checked",true);
    //         $('.toggleSwitch').removeClass('Off');
    //         unseen = 1;
    //     }
    //     loadSeries(true);
    // });
    //
    // // For Infinite Scrolling
    // $(window).scroll(function() {
    //     if ($(this).scrollTop() + 30 >= $('body').height() - $(window).height()) {
    //         if (working == false) {
    //             working = true;
    //             loadSeries();
    //             setTimeout(function() {
    //                 working = false;
    //             }, 1500);
    //         }
    //     }
    // });

});
