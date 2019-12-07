//Helper Functions:

function construct_director_string(directors) {
    director_array = directors.split(', ');
    f = "";
    for (x in director_array) {
        f+='<a href="/MyMDb/Movies/Director/' + encodeURIComponent(director_array[x]) + '">' + director_array[x] + '</a>';
        if (x < director_array.length-1) {
            f+=', ';
        }
    }
    return f;
}

function construct_movie_string(movie){
    f="";
    if(movie.seen == 1) {
        f='<div class="movie-node seen-node">';
    }
    else {
        f='<div class="movie-node unseen-node">';
    }

    f+= '<div class="movie-first-line">' +
            '<span class="movie-id" hidden>' + movie.id + '</span>' +
            '<a href="Movies/' + movie.id + '"><span class="movie-name">' + movie.title + '</span></a>' +
            '<span class="movie-year">(' + movie.release_year + ')</span>' +
            '<span class="movie-imdb-rating">[' + movie.imdb_rating + ']</span>' +
            '<span class="movie-dir">' + construct_director_string(movie.director) + '</span>' +
        '</div>' +

        '<div class="movie-second-line">' +
            '<span class="movie-cast">' + movie.cast + '</span>' +
            '<span class="movie-genre">' + movie.genre + '</span>' +
        '</div>' +
      '</div>';
    return f;
}


$(document).ready(function(){
    listCount = 0;
    working = false;
    unseen = 0;

    // Load stats
    function loadStats() {
        $.post("async/movies_async.php",{getWatchedMovieStats:true}).done(function(stat_json){
            stat=JSON.parse(stat_json);
            $('.timeStat .statValue').text(Math.round(stat.totaltime/60));
            $('.filmStat .statValue').text(stat.watchcount);
        });
    }
    loadStats();

    //for loading movies
    function showMovies(movies_list_json, clearList=true){
        if (clearList) {
            $('.movieList').empty();
        }
        movie_list=JSON.parse(movies_list_json);
        if(movie_list.data.length < 1)
        {
            // If there are no posts
        }

        for ( x in movie_list.data ) {
            movie_node = $(construct_movie_string(movie_list.data[x]));
            $('.movieList').append(movie_node);
        }
        listCount += movie_list.data.length;
    }
    function appendMovies(movies_list_json){
        showMovies(movies_list_json,false);
    }
    function loadMovies(clearList=false) {
        listFunction = appendMovies;
        if(clearList) {
            listFunction = showMovies;
            listCount = 0;
        }
        filter_string = '';
        if ($('#movieFilter').val() === 'No Filter') {
            filter_string = '';
        }
        else {
            filter_string = $('#filterString').val();
        }
        $.post("async/movies_async.php",{
                                            filterOption:$('#movieFilter').val(),
                                            filterString:filter_string,
                                            listCount:listCount,
                                            unseen:unseen
                                        }).done(listFunction);
    }
    loadMovies(true);

    // For Switching Filter Options
    $('#movieFilter').on('change',function(){
        $('#filterActual').empty();
        if ($('#movieFilter').val() === "No Filter") {
            loadMovies(true);
        }
        else if ($('#movieFilter').val() === "Name") {
            $('#filterActual').append('<input class="form-control" type="text" id="filterString" name="titleFilter" placeholder="Enter Name" autocomplete="off">');
        }
        else if ($('#movieFilter').val() === "Director") {
            $('#filterActual').append('<input class="form-control" type="text" id="filterString" name="directorFilter" placeholder="Enter Director" autocomplete="off">');
        }
        else if ($('#movieFilter').val() === "Release Year") {
            $('#filterActual').append('<input class="form-control" type="number" id="filterString" name="yearFilter" placeholder="Enter Year" autocomplete="off">');
        }
        else if ($('#movieFilter').val() === "Genre") {
            $('#filterActual').append('<input class="form-control" type="text" id="filterString" name="genreFilter" placeholder="Enter Genre" autocomplete="off">');
        }
    });

    // For applying filter
    $(document).on('keyup','#filterString',function(){
        loadMovies(true);
    });

    // For toggling SeenFilter Switch
    $('.toggleGroup').on("click",function() {
        if($('input[name="seenfilter"]').prop("checked")) {
            // All movies
            $('input[name="seenfilter"]').prop("checked",false);
            $('.toggleSwitch').addClass('Off');
            unseen = 0;
        }
        else {
            // Unseen movies
            $('input[name="seenfilter"]').prop("checked",true);
            $('.toggleSwitch').removeClass('Off');
            unseen = 1;
        }
        loadMovies(true);
    });

    // For Infinite Scrolling
    $(window).scroll(function() {
        if ($(this).scrollTop() + 30 >= $('body').height() - $(window).height()) {
            if (working == false) {
                working = true;
                loadMovies();
                setTimeout(function() {
                    working = false;
                }, 1500);
            }
        }
    });

});
