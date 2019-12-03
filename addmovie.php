<!DOCTYPE html>

<?php
    require_once('classes/DataBase.php');
    require_once('classes/variables.php');
    require_once('classes/Nav.php');

?>

<html lang="en" dir="ltr">
    <head>
        <meta charset="utf-8">
        <title>MyMDb | Movies</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <?php echo Fonts::insertFonts(); ?>
        <link rel="stylesheet" href="static/css/master.css">
        <link rel="stylesheet" href="static/css/addmovie_master.css">
        <link href="https://gitcdn.github.io/bootstrap-toggle/2.2.2/css/bootstrap-toggle.min.css" rel="stylesheet">
    </head>
    <body>

        <!-- Navbar Begins-->
        <?php echo Nav::insertNavbar('Movies'); ?>
        <!-- Navbar Ends-->

        <p></p>

        <div class="container formCard">
            <div class="container">
                <div class="row">
                    <div class="col-lg-5">
                        <p class="formHeader">Another One!</p>
                    </div>
                    <div class="col-lg-6 errorBox">

                    </div>
                    <div class="col-lg-1 form-group">
                        <button type="button" class="btn btn-outline-success" name="addMovie" id="addMovieBtn">Add</button>
                    </div>
                </div>
            </div>
            <form id="addMovieForm">
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="titleInput"><strong>Title</strong></label>
                    <div class="col">
                        <input class='form-control' type="text" name="title" id="titleInput" placeholder="e.g., Birdman" autocomplete="off">
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="subtitleInput"><strong>Subtitle</strong></label>
                    <div class="col">
                        <input class='form-control' type="text" name="subtitle" id="subtitleInput" placeholder="Leave empty if not there, e.g., or (The Unexpected Virtue of Ignorance)" autocomplete="off">
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="releaseyearInput"><strong>Year of Release</strong></label>
                    <div class="col-lg-2">
                        <input class='form-control' type="number" name="releaseyear" id="releaseyearInput" placeholder="e.g., 2014" autocomplete="off">
                    </div>
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="runtimeInput"><strong>Runtime</strong></label>
                    <div class="col-lg-2">
                        <input class='form-control' type="number" name="runtime" id="runtimeInput" placeholder="mins e.g., 119" autocomplete="off">
                    </div>
                    <div class="col-lg-2">
                    </div>
                    <div class="col-lg-2">
                        <div class="toggle btn btn-light on seenDiv" data-toggle="toggle">
                            <input type="checkbox" name="seen" checked="" data-toggle="toggle">
                            <div class="toggle-group">
                                <label class="btn btn-success toggle-on seenbutton toggleLabel">Seen</label>
                                <label class="btn btn-danger active toggle-off unseenbutton toggleLabel">Unseen</label>
                                <span class="toggle-handle btn btn-light middlebutton"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="directorInput"><strong>Directed By</strong></label>
                    <div class="col">
                        <input class='form-control' type="text" name="director" id="directorInput" placeholder="e.g., Alejandro González Iñárritu" autocomplete="off">
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="castInput"><strong>Cast</strong></label>
                    <div class="col">
                        <input class='form-control' type="text" name="cast" id="castInput" placeholder="Comma-space separated, e.g., Michael Keaton, Zach Galifianakis, Edward Norton" autocomplete="off">
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="genreInput"><strong>Genre</strong></label>
                    <div class="col">
                        <input class='form-control' type="text" name="genre" id="genreInput" placeholder="Comma-space separated, e.g., Comedy, Drama" autocomplete="off">
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="imdb_ratingInput"><strong>IMDb Rating</strong></label>
                    <div class="col-lg-2">
                        <input class='form-control' type="number" name="imdb_rating" id="imdb_ratingInput" placeholder="e.g., 7.7" autocomplete="off">
                    </div>
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="imdb_linkInput"><strong>IMDb Link</strong></label>
                    <div class="col-lg">
                        <input class='form-control' type="text" name="imdb_link" id="imdb_linkInput" placeholder="e.g., https://www.imdb.com/title/tt2562232/" autocomplete="off">
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="rotten_tomatoes_ratingInput"><strong>Tomatometer</strong></label>
                    <div class="col-lg-2">
                        <input class='form-control' type="number" name="rotten_tomatoes_rating" id="rotten_tomatoes_ratingInput" placeholder="e.g., 91" autocomplete="off">
                    </div>
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="posterInput"><strong>Poster Link</strong></label>
                    <div class="col-lg">
                        <input class='form-control' type="text" name="poster" id="posterInput" placeholder="e.g., https://upload.wikimedia.org/wikipedia/en/6/63/Birdman_poster.png" autocomplete="off">
                    </div>
                </div>

            </form>
        </div>

        <script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
        <script type="text/javascript" src="static/js/addmovie_script.js"></script>
    </body>
</html>
