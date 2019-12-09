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
    private $poster;
    private $seen;

    public function __construct($id) {
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
            $this->poster = NULL;
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
        $this->poster = $thismovie['poster'];
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
    //     `poster` varchar(256) DEFAULT NULL,
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
    public function getPoster() {return $this->poster;}
    public function watched() {
        if($this->seen == 0) return false;
        return true;
    }

    public static function getCount() {
        $result = DataBase::query('SELECT COUNT(*) AS filmcount'.
                                 ' FROM '.DataBase::$movies_table_name);
        if ($result['executed']===false)
        {
            // echo "ERROR: Could not able to execute SQL<br>";
            // print_r($result['errorInfo']);
            return NULL;
        }
        return $result['data'][0]['filmcount'];
    }

    public static function checkExistingPK($title,$year) {
        if( ( strlen($title) < 1 ) || ( $year === NULL ) ) {
            return NULL;
        }
        $result = DataBase::query('SELECT count(*) AS filmcount'.
                                  ' FROM '.DataBase::$movies_table_name.
                                  ' WHERE title=:title'.
                                    ' AND release_year=:year',
                                    array(':title'=>$title,':year'=>$year)
                                );
        if(!$result['executed']){
            // echo "ERROR: Could not able to execute SQL<br>";
            // print_r($result['errorInfo']);
            return NULL;
        }
        if($result['data'][0]['filmcount']==='1'){
            return true;
        }
        return false;
    }

    public static function checkExistingID($id) {
        if ( $id === NULL ) {
            return false;
        }
        $result = DataBase::query('SELECT count(*) AS filmcount'.
                                  ' FROM '.DataBase::$movies_table_name.
                                  ' WHERE id=:id',
                                  array(':id'=>$id)
                                );
        if(!$result['executed']){
            // echo "ERROR: Could not able to execute SQL<br>";
            // print_r($result['errorInfo']);
            return NULL;
        }
        if($result['data'][0]['filmcount']==='1'){
            return true;
        }
        return false;
    }

    public static function addMovieToDB ($data) {
        $result = Movie::checkExistingPK($data['title'],$data['releaseyear']);
        if ( $result === NULL ) {
            return NULL;
        } else if ( $result ) {
            return false;
        }
        if ( !is_numeric($data['releaseyear'])) {
            return NULL;
        }
        if ( !is_numeric($data['runtime'])) {
            $data['runtime'] = 0;
        }
        $result = DataBase::query('INSERT INTO '.DataBase::$movies_table_name.
                                  ' VALUES ('.
                                      ' NULL, '.
                                      ' :title,'.
                                      ' :subtitle,'.
                                      ' :release_year,'.
                                      ' :director,'.
                                      ' :cast,'.
                                      ' :genre,'.
                                      ' :imdb_rating,'.
                                      ' :imdb_link,'.
                                      ' :rotten_tomatoes_rating,'.
                                      ' :runtime,'.
                                      ' :seen,'.
                                      ' :poster'.
                                  ' )',
                                  array(':title'=>$data['title'],
                                        ':subtitle'=>$data['subtitle'],
                                        ':release_year'=>$data['releaseyear'],
                                        ':director'=>$data['director'],
                                        ':cast'=>$data['cast'],
                                        ':genre'=>$data['genre'],
                                        ':imdb_rating'=>$data['imdb_rating'],
                                        ':imdb_link'=>$data['imdb_link'],
                                        ':rotten_tomatoes_rating'=>$data['rotten_tomatoes_rating'],
                                        ':runtime'=>$data['runtime'],
                                        ':seen'=>$data['seen'],
                                        ':poster'=>$data['poster']
                                    )
                                );
        if(!$result['executed']){
            // echo "ERROR: Not able to execute SQL<br>";
            // print_r($result['errorInfo']);
            return NULL;
        }
        return $result['lastID'];
    }

    public static function updateMovieInDB ($data) {
        $result = Movie::checkExistingID($data['id']);
        if ( $result === NULL ) {
            return NULL;
        } else if ( !$result ) {
            return false;
        }
        if ( !is_numeric($data['runtime'])) {
            $data['runtime'] = 0;
        }
        $result = DataBase::query('UPDATE '.DataBase::$movies_table_name.
                                  ' SET'.
                                    ' subtitle = :subtitle,'.
                                    ' director = :director,'.
                                    ' cast = :cast,'.
                                    ' genre = :genre,'.
                                    ' imdb_rating = :imdb_rating,'.
                                    ' imdb_link = :imdb_link,'.
                                    ' rotten_tomatoes_rating = :rotten_tomatoes_rating,'.
                                    ' runtime = :runtime,'.
                                    ' seen = :seen,'.
                                    ' poster = :poster'.
                                  ' WHERE id=:id',
                                  array(':subtitle'=>$data['subtitle'],
                                        ':director'=>$data['director'],
                                        ':cast'=>$data['cast'],
                                        ':genre'=>$data['genre'],
                                        ':imdb_rating'=>$data['imdb_rating'],
                                        ':imdb_link'=>$data['imdb_link'],
                                        ':rotten_tomatoes_rating'=>$data['rotten_tomatoes_rating'],
                                        ':runtime'=>$data['runtime'],
                                        ':seen'=>$data['seen'],
                                        ':poster'=>$data['poster'],
                                        ':id'=>$data['id']
                                    )
                                );
        if(!$result['executed']){
            // echo "ERROR: Not able to execute SQL<br>";
            // print_r($result['errorInfo']);
            return NULL;
        }
        return $data['id'];
    }

    public static function deleteMovie ($id) {
        $result = Movie::checkExistingID($id);
        if ( $result === NULL ) {
            return NULL;
        } else if ( !$result ) {
            return false;
        }
        $result = DataBase::query('DELETE FROM '.DataBase::$movies_table_name.
                                  ' WHERE id=:id',
                                  array(':id'=>$id)
                                );
        if(!$result['executed']){
            // echo "ERROR: Not able to execute SQL<br>";
            // print_r($result['errorInfo']);
            return NULL;
        }
        return true;
    }

    public static function getUnwatchedMoviesID_Poster ($limit) {
        $result = DataBase::query('SELECT id,poster '.
                                  ' FROM '.DataBase::$movies_table_name.
                                  ' WHERE seen=FALSE'.
                                  ' ORDER BY rotten_tomatoes_rating DESC'.
                                  ' LIMIT '.(int)$limit
                                );
        if(!$result['executed']){
            // echo "ERROR: Not able to execute SQL<br>";
            // print_r($result['errorInfo']);
            return NULL;
        }
        return $result['data'];
    }

}
?>
