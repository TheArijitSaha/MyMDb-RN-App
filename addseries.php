<!DOCTYPE html>

<?php
    require_once('classes/DataBase.php');
    require_once('classes/variables.php');
    require_once('classes/Nav.php');
    require_once('classes/SeriesClass.php');

    $editMode = false;

    if ( isset($_GET['edit']) ) {
        $edit_series = new Series($_GET['edit']);
        if ( !$edit_series->isReal() ) {
            header("Location: ".NetworkVariables::$home_path."Error");
        }
        $editMode = true;
    }

?>

<html lang="en" dir="ltr">
    <head>
        <meta charset="utf-8">
        <title>MyMDb | Series</title>
        <link rel="icon" href="/MyMDb/MyMDbIcon.png">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <?php echo Fonts::insertFonts(); ?>
        <link rel="stylesheet" href="static/css/master.css">
        <link rel="stylesheet" href="static/css/addseries_master.css">
    </head>
    <body>

        <!-- Navbar Begins-->
        <?php echo Nav::insertNavbar('Series'); ?>
        <!-- Navbar Ends-->

        <p></p>

        <div class="container formCard">
            <div class="container">
                <div class="row">
                    <div class="col-lg-5">
                        <?php if ( isset($_GET['edit']) ) { ?>
                            <p class="formHeader">Make it Better!</p>
                        <?php } else { ?>
                            <span class="formHeader">Series </span>
                            <span class="formHeaderCount">#<?php echo Series::getCount()+1; ?> </span>
                        <?php } ?>
                    </div>
                    <div class="col-lg-6 errorBox">

                    </div>
                    <div class="col-lg-1 form-group">
                        <?php if ($editMode) { ?>
                            <button type="button" class="btn btn-outline-warning" name="editSeries" id="editSeriesBtn">Update</button>
                        <?php } else { ?>
                            <button type="button" class="btn btn-outline-success" name="addSeries" id="addSeriesBtn">Add</button>
                        <?php } ?>
                    </div>
                </div>
            </div>
            <form id="seriesForm">
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="titleInput"><strong>Title</strong></label>
                    <div class="col">
                        <input class="form-control<?php if ($editMode) { echo '-plaintext'; }  ?>" type="text" name="title" id="titleInput" placeholder="e.g., Friends" <?php if ($editMode) { echo 'value="'.$edit_series->getTitle().'"'; }  ?> autocomplete="off" <?php if ($editMode) { echo 'readonly'; }  ?> >
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel'><strong>Period</strong></label>
                    <div class="col-lg-2">
                        <input class='form-control<?php if ($editMode) { echo '-plaintext'; }  ?>' type="number" name="start_year" placeholder="e.g., 1994" <?php if ($editMode) { echo 'value="'.$edit_series->getStartYear().'"'; }  ?> autocomplete="off"  <?php if ($editMode) { echo 'readonly'; }  ?> >
                    </div>
                    <label class='col-form-label col-lg-1 flexCenterRow formLabel'><strong>to</strong></label>
                    <div class="col-lg-2">
                        <input class='form-control' type="number" name="end_year" placeholder="Skip, if ongoing" <?php if ($editMode) { echo 'value="'.$edit_series->getEndYear().'"'; }  ?> autocomplete="off">
                    </div>
                    <label class='col-form-label col-lg-3 flexRightRow formLabel'><strong>Total Seasons</strong></label>
                    <div class="col-lg-2">
                        <input class='form-control' type="number" name="total_seasons" placeholder="e.g., 10" <?php if ($editMode) { echo 'value="'.$edit_series->getTotalSeasons().'"'; }  ?> autocomplete="off">
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel'><strong>Episodes</strong></label>
                    <div class="col-lg-2">
                        <input class='form-control' type="number" name="seen_episodes" placeholder="Seen" <?php if ($editMode) { echo 'value="'.$edit_series->getSeenEpisodes().'"'; }  ?> autocomplete="off">
                    </div>
                    <label class='col-form-label col-lg-1 flexCenterRow formLabel'><strong>out of</strong></label>
                    <div class="col-lg-2">
                        <input class='form-control' type="number" name="total_episodes" placeholder="Total" <?php if ($editMode) { echo 'value="'.$edit_series->getTotalEpisodes().'"'; }  ?> autocomplete="off">
                    </div>
                    <label class='col-form-label col-lg-3 flexRightRow formLabel'><strong>Avg. Episode Length</strong></label>
                    <div class="col-lg-2">
                        <input class='form-control' type="number" name="avg_length" placeholder="in minutes" <?php if ($editMode) { echo 'value="'.$edit_series->getAvgRuntime().'"'; }  ?> autocomplete="off">
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="creatorsInput"><strong>Created By</strong></label>
                    <div class="col">
                        <input class='form-control' type="text" name="creators" id="creatorsInput" placeholder="Comma-space separated, e.g., David Crane, Marta Kauffman" <?php if ($editMode) { echo 'value="'.$edit_series->getCreators().'"'; }  ?> autocomplete="off">
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="castInput"><strong>Cast</strong></label>
                    <div class="col">
                        <input class='form-control' type="text" name="cast" id="castInput" placeholder="Comma-space separated, e.g., Jennifer Aniston, Matthew Perry, David Schwimmer" <?php if ($editMode) { echo 'value="'.$edit_series->getCast().'"'; }  ?> autocomplete="off">
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="genreInput"><strong>Genre</strong></label>
                    <div class="col">
                        <input class='form-control' type="text" name="genre" id="genreInput" placeholder="Comma-space separated, e.g., Comedy, Romance" <?php if ($editMode) { echo 'value="'.$edit_series->getGenre().'"'; }  ?> autocomplete="off">
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="imdb_ratingInput"><strong>IMDb Rating</strong></label>
                    <div class="col-lg-2">
                        <input class='form-control' type="number" name="imdb_rating" id="imdb_ratingInput" placeholder="e.g., 8.9" <?php if ($editMode) { echo 'value="'.$edit_series->getIMDbRating().'"'; }  ?> autocomplete="off">
                    </div>
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="imdb_linkInput"><strong>IMDb Link</strong></label>
                    <div class="col-lg">
                        <input class='form-control' type="text" name="imdb_link" id="imdb_linkInput" placeholder="e.g., https://www.imdb.com/title/tt0108778/" <?php if ($editMode) { echo 'value="'.$edit_series->getIMDbLink().'"'; }  ?> autocomplete="off">
                    </div>
                </div>
                <div class="form-group row">
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="rotten_tomatoes_ratingInput"><strong>Tomatometer</strong></label>
                    <div class="col-lg-2">
                        <input class='form-control' type="number" name="rotten_tomatoes_rating" id="rotten_tomatoes_ratingInput" placeholder="e.g., 89" <?php if ($editMode) { echo 'value="'.$edit_series->getRottenTomatoesRating().'"'; }  ?> autocomplete="off">
                    </div>
                    <label class='col-form-label col-lg-2 flexRightRow formLabel' for="posterInput"><strong>Poster Link</strong></label>
                    <div class="col-lg">
                        <input class='form-control' type="text" name="poster" id="posterInput" placeholder="e.g., https://i.pinimg.com/564x/24/0f/2d/240f2d92b067adac48fa11f7b5d2e53d.jpg" <?php if ($editMode) { echo 'value="'.$edit_series->getPoster().'"'; }  ?> autocomplete="off">
                    </div>
                </div>

            </form>
        </div>
        <?php if ($editMode) { ?>
            <input type="number" id="editID" value="<?php echo $edit_series->getId(); ?>" hidden>
        <?php } ?>

        <script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
        <script type="text/javascript" src="static/js/addseries_script.js"></script>
    </body>
</html>
