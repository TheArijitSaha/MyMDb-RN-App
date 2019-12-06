//Helper Functions:
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
            '<span class="movie-dir">' + movie.director + '</span>' +
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
    $.post("async/movies_async.php",{showAllMovies:listCount}).done(showMovies);

    // For toggling SeenFilter Switch
    $('.toggleGroup').on("click",function() {
        if($('input[name="seenfilter"]').prop("checked")) {
            // All movies
            listCount = 0;
            $('input[name="seenfilter"]').prop("checked",false);
            $('.toggleSwitch').addClass('Off');
            $.post("async/movies_async.php",{showAllMovies:listCount}).done(showMovies);
            $('.stats').prop('hidden',false);
        }
        else {
            // Unseen movies
            listCount = 0;
            $('input[name="seenfilter"]').prop("checked",true);
            $('.toggleSwitch').removeClass('Off');
            $.post("async/movies_async.php",{showUnseenMovies:listCount}).done(showMovies);
            $('.stats').prop('hidden',true);
        }
    });

    // For Infinite Scrolling
    $(window).scroll(function() {
        if ($(this).scrollTop() + 30 >= $('body').height() - $(window).height()) {
            if (working == false) {
                working = true;
                if($('input[name="seenfilter"]').prop("checked")) {
                    // Unseen movies
                    $.post("async/movies_async.php",{showUnseenMovies:listCount}).done(appendMovies);
                }
                else {
                    // All movies
                    $.post("async/movies_async.php",{showAllMovies:listCount}).done(appendMovies);
                }
                setTimeout(function() {
                    working = false;
                }, 1500);
            }
        }
    });

});
