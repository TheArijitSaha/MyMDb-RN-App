//Helper Functions:

function construct_creators_string(creators) {
    creators_array = creators.split(', ');
    f = "";
    for (let x in creators_array) {
        f+='<a href="/MyMDb/Series/Creator/' + encodeURIComponent(creators_array[x]) + '">' + creators_array[x] + '</a>';
        if (x < creators_array.length-1) {
            f+=', ';
        }
    }
    return f;
}

function construct_genre_string(genres) {
    genre_array = genres.split(', ');
    f = "";
    for (let x in genre_array) {
        f+='<a href="/MyMDb/Series/Genre/' + encodeURIComponent(genre_array[x]) + '">' + genre_array[x] + '</a>';
        if (x < genre_array.length-1) {
            f+=', ';
        }
    }
    return f;
}

function construct_year_string(start_year,end_year) {
    if (end_year === null) {
        return 'Since ' + parseInt(start_year);
    }
    return parseInt(start_year) + '-' + parseInt(end_year);
}

function perc_progress(series) {
    console.log(series);
    return Math.round((parseInt(series.seen_episodes)/parseInt(series.total_episodes))*100);
}

function construct_series_string(series) {
    f='<div class="series-node">';
    f+= '<div class="series-first-line">' +
            '<span class="series-id" hidden>' + series.id + '</span>' +
            '<a href="/MyMDb/Series/' + series.id + '">' +
                '<span class="series-name">' + series.title + '</span>' +
            '</a>' +
            '<span class="series-year">(' + construct_year_string(series.start_year,series.end_year) + ')</span>' +
            '<span class="series-imdb-rating">[' + series.imdb_rating + ']</span>' +
            '<span class="series-creators">' + construct_creators_string(series.creators) + '</span>' +
        '</div>' +

        '<div class="series-second-line">' +
            '<span class="series-cast">' + series.cast + '</span>' +
            '<span class="series-genre">' + construct_genre_string(series.genre) + '</span>' +
        '</div>' +
        '<div class="series-progress">' +
        '</div>' +
      '</div>';
    return f;
}

$(document).ready(function(){
    listCount = 0;
    working = false;
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

        for (let x in series_list.data ) {
            let series_node = $(construct_series_string(series_list.data[x]));
            $('.seriesList').append(series_node);
            let perc = perc_progress(series_list.data[x]);
            if (perc > 0) {
                series_node.children('.series-progress').css('border-top-left-radius','0');
                series_node.children('.series-progress').css('border-bottom-left-radius','0');
            }
            series_node.children('.series-progress').css('left',perc_progress(series_list.data[x])+'%');
        }
        listCount += series_list.data.length;
    }
    function appendSeries(series_list_json) {
        showSeries(series_list_json,false);
    }
    function loadSeries(clearList=false) {
        listFunction = appendSeries;
        if(clearList) {
            listFunction = showSeries;
            listCount = 0;
        }
        filter_string = '';
        if ($('#seriesFilter').val() === 'No Filter') {
            filter_string = '';
        }
        else {
            filter_string = $('#filterString').val();
        }
        $.post("async/series_async.php",{
                                            filterOption:$('#seriesFilter').val(),
                                            filterString:filter_string,
                                            listCount:listCount,
                                            ongoing:ongoing
                                        }).done(listFunction);
    }
    loadSeries(true);

    // For Switching Filter Options
    $('#seriesFilter').on('change',function(){
        $('#filterActual').empty();
        if ($('#seriesFilter').val() === "No Filter") {
            loadSeries(true);
        }
        else if ($('#seriesFilter').val() === "Name") {
            $('#filterActual').append('<input class="form-control" type="text" id="filterString" name="titleFilter" placeholder="Enter Name" autocomplete="off">');
        }
        else if ($('#seriesFilter').val() === "Creator") {
            $('#filterActual').append('<input class="form-control" type="text" id="filterString" name="creatorFilter" placeholder="Enter Creator" autocomplete="off">');
        }
        else if ($('#seriesFilter').val() === "Year") {
            $('#filterActual').append('<input class="form-control" type="number" id="filterString" name="yearFilter" placeholder="Enter Year" autocomplete="off">');
        }
        else if ($('#seriesFilter').val() === "Genre") {
            $('#filterActual').append('<input class="form-control" type="text" id="filterString" name="genreFilter" placeholder="Enter Genre" autocomplete="off">');
        }
    });

    // For applying filter
    $(document).on('keyup','#filterString',function(){
        loadSeries(true);
    });

    // For toggling OngoingFilter Switch
    $('.toggleGroup').on("click",function() {
        if($('input[name="ongoingfilter"]').prop("checked")) {
            // All Series
            $('input[name="ongoingfilter"]').prop("checked",false);
            $('.toggleSwitch').addClass('Off');
            ongoing = 0;
        }
        else {
            // Ongoing Series
            $('input[name="ongoingfilter"]').prop("checked",true);
            $('.toggleSwitch').removeClass('Off');
            ongoing = 1;
        }
        loadSeries(true);
    });

    // For Infinite Scrolling
    $(window).scroll(function() {
        if ($(this).scrollTop() + 30 >= $('body').height() - $(window).height()) {
            if (working == false) {
                working = true;
                loadSeries();
                setTimeout(function() {
                    working = false;
                }, 1500);
            }
        }
    });

});
