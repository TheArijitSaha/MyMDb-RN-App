<?php
    // PHP File for asynchronous requests of series
    require_once('../classes/DataBase.php');
    require_once('../classes/SeriesClass.php');
    require_once('../classes/variables.php');


    // To show Series
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
        // By Creator
        else if ( $_POST['filterOption'] === "Creator" ) {
            $filter_string = ' WHERE ((creators LIKE :filter1) or (creators like :filter2))';
            $filter_array = array(':filter1' => $_POST['filterString'].'%',
                                  ':filter2' => '% '.$_POST['filterString'].'%'
                                );
        }
        // By Year
        else if ( $_POST['filterOption'] === "Year" ) {
            $filter_string = ' WHERE ( (start_year <= :year) AND (end_year >= :year) )';
            $filter_array = array(':year' => $_POST['filterString'].'%');
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

        $ongoingFilter = '';
        // Check if done or ongoing:
        if ($_POST['ongoing'] == 1) {
            if ($filter_string === '') {
                $watchFilter = ' WHERE (';
            }
            else {
                $watchFilter = ' AND (';
            }
            $watchFilter = $watchFilter.
                                    ' (seen_episodes < total_episodes)'.
                                    ' OR ( end_year IS NULL )'.
                                ' )';
        }

        $result = DataBase::query('SELECT *'.
                                 ' FROM '.DataBase::$series_table_name.
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

    // // To add a new movie
    // if ( isset( $_POST['addMovie'] ) ) {
    //     $formData = json_decode(urldecode($_POST['addMovie']),True);
    //     $result = Movie::addMovieToDB($formData);
    //     if ( ($result!==NULL) && ($result!==false) ) {
    //         $result=NetworkVariables::$home_path.'Movies/'.$result;
    //     }
    //     echo json_encode($result);
    // }
    //
    // // To edit a movie
    // if ( isset( $_POST['editMovie'] ) ) {
    //     $formData = json_decode(urldecode($_POST['editMovie']),True);
    //     $result = Movie::updateMovieInDB($formData);
    //     if ( ($result!==NULL) && ($result!==false) ) {
    //         $result=NetworkVariables::$home_path.'Movies/'.$result;
    //     }
    //     echo json_encode($result);
    // }
    //
    // // To delete a movie
    // if ( isset( $_POST['deleteMovie'] ) ) {
    //     $result = Movie::deleteMovie($_POST['deleteMovie']);
    //     if ( ($result!==NULL) && ($result!==false) ) {
    //         $result=NetworkVariables::$home_path.'Movies';
    //     }
    //     echo json_encode($result);
    // }

?>
