<?php
    // PHP File for asynchronous requests of movies
    require_once('../classes/DataBase.php');
    require_once('../classes/MovieClass.php');
    require_once('../classes/variables.php');

    // To show all Movies
    if ( isset( $_POST['showAllMovies'] ) ) {
        $result = DataBase::query('SELECT *'.
                                 ' FROM '.DataBase::$movies_table_name);
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
