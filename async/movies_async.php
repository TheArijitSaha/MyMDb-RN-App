<?php
    // PHP File for asynchronous requests of movies

    require_once('../classes/DataBase.php');
    require_once('../classes/MovieClass.php');
    require_once('../classes/variables.php');


    // To create a new post
    // if(isset($_POST['createpost']))
    // {
    //     $postbody = $_POST['postbody'];
    //     if (strlen($postbody) < 1)
    //     {
    //         die('Incorrect length!');
    //     }
    //
    //     $result=DataBase::query('INSERT INTO '.DataBase::$posts_table_name.
    //                             ' VALUES (DEFAULT, :postbody, NOW(), :userid, 0)',
    //                             array(':postbody'=>$postbody,
    //                                     ':userid'=>$current_user->getId()
    //                                 )
    //                         );
    //
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


    // To show all Movies
    if ( isset( $_POST['showAllMovies'] ) )
    {
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
    if ( isset( $_POST['getWatchedMovieStats'] ) )
    {
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


    // // To show posts of people who the current user follows ordered by time desc
    // if(isset($_POST['showFollowingPost']))
    // {
    //     $result = DataBase::query('SELECT '.DataBase::$posts_table_name.'.id as postid,body,posted_at,name AS username,user_id AS userid,likes,profilepic'.
    //                                 ' FROM '.DataBase::$posts_table_name.','.DataBase::$user_table_name.
    //                                 ' WHERE user_id='.DataBase::$user_table_name.'.id'.
    //                                     ' AND user_id IN (SELECT userid'.
    //                                                     ' FROM '.DataBase::$follow_table_name.
    //                                                     ' WHERE followerid = :currentuserid )'.
    //                                 ' ORDER BY '.DataBase::$posts_table_name.'.id DESC',
    //                                 array(':currentuserid'=>$current_user->getID())
    //                             );
    //     if ($result['executed']===false)
    //     {
    //         echo "ERROR: Not able to execute SQL<br>";
    //         print_r($result['errorInfo']);
    //     }
    //     else
    //     {
    //         $result_json=json_encode($result);
    //         echo $result_json;
    //     }
    // }



?>
