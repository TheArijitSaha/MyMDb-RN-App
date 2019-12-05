//Helper Functions:
function construct_movie_string(movie){
    console.log(movie);
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
    function showMovies(movies_list_json){
        $('.movieList').empty();
        movie_list=JSON.parse(movies_list_json);
        if(movie_list.data.length)
        {
            // If there are no posts
        }

        for ( x in movie_list.data ) {
            movie_node = $(construct_movie_string(movie_list.data[x]));
            $('.movieList').append(movie_node);
        }
    }
    $.post("async/movies_async.php",{showAllMovies:true}).done(showMovies);


});
