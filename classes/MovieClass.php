<?php
require_once('DataBase.php');

class Movie
{
    private $exists;
    private $id;
    private $title;
    private $subtitle;
    private $release_year;
    private $director;
    private $cast;
    private $genre;
    private $imdb_rating;
    private $rotten_tomatoes_rating;
    private $runtime;
    private $seen;

    public function __construct($id)
    {
        $id = (int)$id;
        $result = DataBase::query('SELECT *'.
                                  ' FROM '.DataBase::$movies_table_name.
                                  ' WHERE id=:id',
                                    array(':id'=>$id) ) ['data'];

        if ( count($result)===0 ) {
            $this->exists = false;
            $this->id = NULL;
            $this->title = NULL;
            $this->subtitle = NULL;
            $this->release_year = NULL;
            $this->director = NULL;
            $this->cast = NULL;
            $this->genre = NULL;
            $this->imdb_rating = NULL;
            $this->imdb_link = NULL;
            $this->rotten_tomatoes_rating = NULL;
            $this->runtime = NULL;
            $this->seen = NULL;
            return;
        }
        $thismovie=$result[0];

        $this->exists = true;
        $this->id = $thismovie['id'];
        $this->title = $thismovie['title'];
        $this->subtitle = $thismovie['subtitle'];
        $this->release_year = $thismovie['release_year'];
        $this->director = $thismovie['director'];
        $this->genre = $thismovie['genre'];
        $this->cast = $thismovie['cast'];
        $this->imdb_rating = $thismovie['imdb_rating'];
        $this->imdb_link = $thismovie['imdb_link'];
        $this->rotten_tomatoes_rating = $thismovie['rotten_tomatoes_rating'];
        $this->runtime = $thismovie['runtime'];
        $this->seen = $thismovie['seen'];
    }

    // CREATE TABLE Movies(
    //     `id` int(10) NOT NULL AUTO_INCREMENT,
    //     `title` varchar(100) NOT NULL,
    //     `subtitle` varchar(100) DEFAULT NULL,
    //     `release_year` int(10) NOT NULL,
    //     `director` varchar(100) DEFAULT NULL,
    //     `cast` varchar(256) DEFAULT NULL,
    //     `genre` varchar(256) DEFAULT NULL,
    //     `imdb_rating` DECIMAL(3,1) DEFAULT NULL,
    //     `imdb_link` varchar(256) DEFAULT NULL,
    //     `rotten_tomatoes_rating` int(10) DEFAULT NULL,
    //     `runtime` int(10) DEFAULT NULL,
    //     `seen` BOOLEAN DEFAULT FALSE,
    //     PRIMARY KEY (`title`,`release_year`),
    //     UNIQUE KEY `id` (`id`)
    // );

    public function isReal() {
        return $this->exists;
    }

    public function getId() {return $this->id;}
    public function getTitle() {return $this->title;}
    public function getSubtitle() {return $this->subtitle;}
    public function getReleaseYear() {return $this->release_year;}
    public function getDirector() {return $this->director;}
    public function getCast() {return $this->cast;}
    public function getGenre() {return $this->genre;}
    public function getIMDbRating() {return $this->imdb_rating;}
    public function getIMDbLink() {return $this->imdb_link;}
    public function getRottenTomatoesRating() {return $this->rotten_tomatoes_rating;}
    public function getRuntime() {return $this->runtime;}
    public function watched() {return $this->seen;}

    // public function getProfilePicPath() {
    //     return $this->profilePicPath;
    // }
    //
    // public function follows($following_id){
    //     $following_user = new User($following_id);
    //     if(! $following_user->isReal()){
    //         return false;
    //     }
    //     if(! $this->exists){
    //         return false;
    //     }
    //     $result = DataBase::query('SELECT * FROM '.DataBase::$follow_table_name.
    //                               ' WHERE userid = :userid'.
    //                                 ' AND followerid = :followerid',
    //                               array(':userid'=>$following_id,
    //                                     ':followerid'=>$this->id)
    //                             );
    //
    //     if(!$result[executed]){
    //         echo "ERROR: Could not able to execute SQL<br>";
    //         print_r($result['errorInfo']);
    //     }
    //     if(count($result[data])===1){
    //         return true;
    //     }
    //     return false;
    // }
    //
    // public function noOfFollowers(){
    //     if(! $this->exists){
    //         return 0;
    //     }
    //     $result = DataBase::query('SELECT COUNT(*) AS count FROM '.DataBase::$follow_table_name.
    //                               ' WHERE userid = :userid'.
    //                                 ' AND NOT followerid = :userid',
    //                               array(':userid'=>$this->id)
    //                             );
    //
    //     if(!$result[executed]){
    //         echo "ERROR: Could not able to execute SQL<br>";
    //         print_r($result['errorInfo']);
    //     }
    //     return $result[data][0][count];
    // }
    //
    // public function noOfFollowing(){
    //     if(! $this->exists){
    //         return 0;
    //     }
    //     $result = DataBase::query('SELECT COUNT(*) AS count FROM '.DataBase::$follow_table_name.
    //                               ' WHERE followerid = :userid'.
    //                                 ' AND NOT userid = :userid',
    //                               array(':userid'=>$this->id)
    //                             );
    //
    //     if(!$result[executed]){
    //         echo "ERROR: Could not able to execute SQL<br>";
    //         print_r($result['errorInfo']);
    //     }
    //     return $result[data][0][count];
    // }


}
?>
