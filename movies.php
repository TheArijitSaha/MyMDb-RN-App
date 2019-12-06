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
        <link rel="stylesheet" href="static/css/movies_master.css">
    </head>
    <body>

        <!-- Navbar Begins-->
        <?php echo Nav::insertNavbar('Movies'); ?>
        <!-- Navbar Ends-->

        <p></p>

        <div class="container">
            <div class="row">
                <div class="col-8 info">
                    <div class="stats">
                        <span class="watchBanner">WatchCounter:</span>
                        <div class="filmStat">
                            <span class="statValue">-</span>
                            <span class="statPoint">Films</span>
                        </div>
                        <div class="timeStat">
                            <span class="statValue">-</span>
                            <span class="statPoint">Hrs</span>
                        </div>
                    </div>
                </div>
                <div class="col-2">
                    <div class="toggleSwitch Off btn btn-light seenFilter">
                        <input type="checkbox" name="seenfilter">
                        <div class="toggleGroup">
                            <label class="btn btn-danger toggleOn toggleLabel">Unseen</label>
                            <label class="btn btn-success toggleOff toggleLabel">All</label>
                            <span class="btn btn-light toggleHandle"></span>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <a href="Movies/Add" class="btn btn-outline-danger addButton">Add</a>
                </div>
            </div>
        </div>

        <div class="container movieList">
        </div>

        <script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
        <script type="text/javascript" src="static/js/movies_script.js"></script>
    </body>
</html>
