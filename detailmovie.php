<!DOCTYPE html>

<?php
    require_once('classes/DataBase.php');
    require_once('classes/variables.php');
    require_once('classes/MovieClass.php');
    require_once('classes/Nav.php');

    $current_movie = new Movie($_GET['id']);
?>

<html lang="en" dir="ltr">
    <head>
        <meta charset="utf-8">
        <title>MyMDb | Movies</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <?php echo Fonts::insertFonts(); ?>
        <link rel="stylesheet" href="static/css/master.css">
        <link rel="stylesheet" href="static/css/detailmovie_master.css">
    </head>
    <body>

        <!-- Navbar Begins-->
        <?php echo Nav::insertNavbar('Movies'); ?>
        <!-- Navbar Ends-->

        <p></p>

        <div class="container movieCard">
            <div class="namePlate">
                <span class="Title"><?php echo $current_movie->getTitle(); ?></span>
                <span class="Subtitle"><?php echo $current_movie->getSubtitle(); ?></span>
            </div>
            <hr>
            <div class="container-fluid">
                <div class="row">
                    <div class="col-lg-9">
                        <div class="container-fluid">

                            <div class="row">
                                <div class="col-lg-5">
                                    <p class="movieInfo">Year of Release </p>
                                </div>
                                <div class="col-lg">
                                    <p><?php echo $current_movie->getReleaseYear(); ?></p>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-5">
                                    <p class="movieInfo">Directed By </p>
                                </div>
                                <div class="col-lg">
                                    <p><?php echo $current_movie->getDirector(); ?></p>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-5">
                                    <p class="movieInfo">Runtime </p>
                                </div>
                                <div class="col-lg">
                                    <p><?php echo $current_movie->getRuntime()." Minutes"; ?></p>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-5">
                                    <p class="movieInfo">Starring </p>
                                </div>
                                <div class="col-lg">
                                    <p><?php echo $current_movie->getCast(); ?></p>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-5">
                                    <p class="movieInfo">Genre </p>
                                </div>
                                <div class="col-lg">
                                    <p><?php echo $current_movie->getGenre(); ?></p>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-5">
                                    <p class="movieInfo">IMDb Rating </p>
                                </div>
                                <div class="col-lg">
                                    <p><?php echo $current_movie->getIMDbRating(); ?></p>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-5">
                                    <p class="movieInfo">IMDb Link </p>
                                </div>
                                <div class="col-lg">
                                    <p><?php echo $current_movie->getIMDbLink(); ?></p>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-5">
                                    <p class="movieInfo">Rotten Tomatoes Rating </p>
                                </div>
                                <div class="col-lg">
                                    <p><?php echo $current_movie->getRottenTomatoesRating(); ?></p>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-5">
                                    <p class="movieInfo">Seen </p>
                                </div>
                                <div class="col-lg">
                                    <p><?php echo $current_movie->watched(); ?></p>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div class="col-3-lg">

                    </div>
                </div>
            </div>
        </div>

        <script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
        <script type="text/javascript" src="static/js/movies_script.js"></script>
    </body>
</html>
