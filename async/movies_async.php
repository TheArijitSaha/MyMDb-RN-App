<?php
    // PHP File for asynchronous requests of movies
    require_once('../classes/DataBase.php');
    require_once('../classes/MovieClass.php');
    require_once('../classes/variables.php');


    // To show Movies
    if ( isset( $_POST['filterOption'] ) ) {

        $filter_string = '';
        $filter_array = array();

        // No Filter
        if ( $_POST['filterOption'] === "No Filter" ) {
        }
        // Empty Filter String
        else if ( $_POST['filterString'] === "" ) {
        }
        // By Name
        else if ( $_POST['filterOption'] === "Name" ) {
            $filter_string = ' WHERE ((title LIKE :filter1) or (title like :filter2))';
            $filter_array = array(':filter1' => $_POST['filterString'].'%',
                                  ':filter2' => '% '.$_POST['filterString'].'%'
                                );
        }
        // By Director
        else if ( $_POST['filterOption'] === "Director" ) {
            $filter_string = ' WHERE ((director LIKE :filter1) or (director like :filter2))';
            $filter_array = array(':filter1' => $_POST['filterString'].'%',
                                  ':filter2' => '% '.$_POST['filterString'].'%'
                                );
        }
        // By Release Year
        else if ( $_POST['filterOption'] === "Release Year" ) {
            $filter_string = ' WHERE (release_year = :filteryear)';
            $filter_array = array(':filteryear' => $_POST['filterString'].'%');
        }
        // By Genre
        else if ( $_POST['filterOption'] === "Genre" ) {
            $filter_string = ' WHERE ((genre LIKE :filter1) or (genre like :filter2))';
            $filter_array = array(':filter1' => $_POST['filterString'].'%',
                                  ':filter2' => '% '.$_POST['filterString'].'%'
                                );
        }
        // Invalid Filter
        else {
            echo json_encode(NULL);
            exit();
        }

        $watchFilter = '';
        // Check if seen or unseen:
        if ($_POST['unseen'] == 1) {
            if ($filter_string === '') {
                $watchFilter = ' WHERE seen = FALSE';
            }
            else {
                $watchFilter = ' AND seen = FALSE';
            }
        }

        $result = DataBase::query('SELECT *'.
                                 ' FROM '.DataBase::$movies_table_name.
                                 $filter_string.
                                 $watchFilter.
                                 ' LIMIT '.((int)$_POST['listCount']).',25',
                                 $filter_array
                                );
        if ($result['executed']===false)
        {
            echo "ERROR: Could not able to execute SQL<br>";
            print_r($result['errorInfo']);
        }
        else
        {
            $result_json=json_encode($result);
            echo $result_json;
        }
    }


    // To show all Movies
    // if ( isset( $_POST['showAllMovies'] ) ) {
    //     $result = DataBase::query('SELECT *'.
    //                              ' FROM '.DataBase::$movies_table_name.
    //                              ' LIMIT '.((int)$_POST['showAllMovies']).',25'
    //                             );
    //     if ($result['executed']===false)
    //     {
    //         echo "ERROR: Could not able to execute SQL<br>";
    //         print_r($result['errorInfo']);
    //     }
    //     else
    //     {
    //         $result_json=json_encode($result);
    //         echo $result_json;
    //     }
    // }

    // To show all Unseen Movies
    // if ( isset( $_POST['showUnseenMovies'] ) ) {
    //     $result = DataBase::query('SELECT *'.
    //                              ' FROM '.DataBase::$movies_table_name.
    //                              ' WHERE seen=0'.
    //                              ' LIMIT '.((int)$_POST['showUnseenMovies']).',25'
    //                             );
    //     if ($result['executed']===false)
    //     {
    //         echo "ERROR: Could not able to execute SQL<br>";
    //         print_r($result['errorInfo']);
    //     }
    //     else
    //     {
    //         $result_json=json_encode($result);
    //         echo $result_json;
    //     }
    // }

    // To give stats of watched movies
    if ( isset( $_POST['getWatchedMovieStats'] ) ) {
        $result = DataBase::query('SELECT SUM(runtime) AS totaltime,COUNT(*) AS watchcount'.
                                 ' FROM '.DataBase::$movies_table_name.
                                 ' WHERE seen=1');
        if ($result['executed']===false)
        {
            echo "ERROR: Could not able to execute SQL<br>";
            print_r($result['errorInfo']);
        }
        else
        {
            $result_json=json_encode($result['data'][0]);
            echo $result_json;
        }
    }

    // To add a new movie
    if ( isset( $_POST['addMovie'] ) ) {
        $formData = json_decode(urldecode($_POST['addMovie']),True);
        $result = Movie::addMovieToDB($formData);
        if ( ($result!==NULL) && ($result!==false) ) {
            $result=NetworkVariables::$home_path.'Movies/'.$result;
        }
        echo json_encode($result);
    }

    // To edit a movie
    if ( isset( $_POST['editMovie'] ) ) {
        $formData = json_decode(urldecode($_POST['editMovie']),True);
        $result = Movie::updateMovieInDB($formData);
        if ( ($result!==NULL) && ($result!==false) ) {
            $result=NetworkVariables::$home_path.'Movies/'.$result;
        }
        echo json_encode($result);
    }

    // To delete a movie
    if ( isset( $_POST['deleteMovie'] ) ) {
        $result = Movie::deleteMovie($_POST['deleteMovie']);
        if ( ($result!==NULL) && ($result!==false) ) {
            $result=NetworkVariables::$home_path.'Movies';
        }
        echo json_encode($result);
    }

?>
