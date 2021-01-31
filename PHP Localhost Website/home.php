<!DOCTYPE html>
<html lang="en" dir="ltr">
    <?php
        require_once('classes/Nav.php');
        require_once('classes/MovieClass.php');
        $suggestion_times = 3;
        $suggestion_no = 5;
        $suggestion_array = Movie::getUnwatchedMoviesID_Poster($suggestion_no * $suggestion_times);
        while (count($suggestion_array) < $suggestion_no * $suggestion_times) {
            array_push($suggestion_array, $suggestion_array[0]);
        }
    ?>

    <head>
        <meta charset="utf-8">
        <title>MyMDb | Home</title>
        <link rel="icon" href="/MyMDb/MyMDbIcon.png">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <?php echo Fonts::insertFonts(); ?>
        <link rel="stylesheet" href="static/css/master.css">
        <link rel="stylesheet" href="static/css/home_master.css">
    </head>
    <body>
        <!-- Navbar Begins-->
        <?php echo Nav::insertNavbar(); ?>
        <!-- Navbar Ends-->

        <p></p>

        <div class="container">
            <div class="row">
                <div class="nextPreviousButtonDiv">
                  <button type="button" name="previousButton">&#8249;</button>
                </div>

                <?php for ($i=0; $i < $suggestion_no; $i++) { ?>
                    <div class="col-lg">
                        <div class="envelope3d">
                            <div class="flexCenterRow inner3d">
                                <a class="flexCenterRow suggetLink sug0" href="<?php echo '/MyMDb/Movies/'.$suggestion_array[$i]['id'] ?>" title = "<?php echo $suggestion_array[$i]['title'] ?>">
                                    <img class="suggestImg" src="<?php echo $suggestion_array[$i]['poster']; ?>">
                                </a>
                                <a class="flexCenterRow suggetLink sug1" href="<?php echo '/MyMDb/Movies/'.$suggestion_array[$i+5]['id'] ?>" title = "<?php echo $suggestion_array[$i+5]['title'] ?>">
                                    <img class="suggestImg" src="<?php echo $suggestion_array[$i+5]['poster']; ?>">
                                </a>
                                <a class="flexCenterRow suggetLink sug2" href="<?php echo '/MyMDb/Movies/'.$suggestion_array[$i+10]['id'] ?>" title = "<?php echo $suggestion_array[$i+10]['title'] ?>">
                                    <img class="suggestImg" src="<?php echo $suggestion_array[$i+10]['poster']; ?>">
                                </a>
                            </div>
                        </div>
                    </div>
                <?php } ?>

                <div class="nextPreviousButtonDiv">
                  <button type="button" name="nextButton">&#8250;</button>
                </div>
            </div>

            <div class="row">
                <div class="col unseenBanner">
                    <span class="unseenCount"><?php echo (Movie::getUnwatchedMovieCount())['unseencount']; ?></span>
                    <span class="unseenText">movies left to watch</span>
                </div>
            </div>
        </div>

        <script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
        <script type="text/javascript" src="static/js/home_script.js"></script>
    </body>
</html>
