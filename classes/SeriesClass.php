<?php
require_once('DataBase.php');

class Series
{
    private $exists;
    private $id;
    private $title;
    private $start_year;
    private $end_year;
    private $creators;
    private $cast;
    private $genre;
    private $total_seasons;
    private $total_episodes;
    private $avg_runtime;
    private $imdb_rating;
    private $imdb_link;
    private $rotten_tomatoes_rating;
    private $poster;
    private $seen_episodes;

    public function __construct($id) {
        $id = (int)$id;
        $result = DataBase::query('SELECT *'.
                                  ' FROM '.DataBase::$series_table_name.
                                  ' WHERE id=:id',
                                    array(':id'=>$id) ) ['data'];

        if ( count($result)===0 ) {
            $this->exists = false;
            $this->id = NULL;
            $this->title = NULL;
            $this->start_year = NULL;
            $this->end_year = NULL;
            $this->creators = NULL;
            $this->cast = NULL;
            $this->genre = NULL;
            $this->total_seasons = NULL;
            $this->total_episodes = NULL;
            $this->avg_runtime = NULL;
            $this->imdb_rating = NULL;
            $this->imdb_link = NULL;
            $this->rotten_tomatoes_rating = NULL;
            $this->poster = NULL;
            $this->seen_episodes = NULL;
            return;
        }
        $thisseries=$result[0];

        $this->exists = true;
        $this->id = $thisseries['id'];
        $this->title = $thisseries['title'];
        $this->start_year = $thisseries['start_year'];
        $this->end_year = $thisseries['end_year'];
        $this->creators = $thisseries['creators'];
        $this->cast = $thisseries['cast'];
        $this->genre = $thisseries['genre'];
        $this->total_seasons = $thisseries['total_seasons'];
        $this->total_episodes = $thisseries['total_episodes'];
        $this->avg_runtime = $thisseries['avg_runtime'];
        $this->imdb_rating = $thisseries['imdb_rating'];
        $this->imdb_link = $thisseries['imdb_link'];
        $this->rotten_tomatoes_rating = $thisseries['rotten_tomatoes_rating'];
        $this->poster = $thisseries['poster'];
        $this->seen_episodes = $thisseries['seen_episodes'];
    }

    // CREATE TABLE Series(
    //     `id` int(10) NOT NULL AUTO_INCREMENT,
    //     `title` varchar(100) NOT NULL,
    //     `start_year` int(10) NOT NULL,
    //     `end_year` int(10) DEFAULT NULL,
    //     `creators` varchar(200) DEFAULT NULL,
    //     `cast` varchar(256) DEFAULT NULL,
    //     `genre` varchar(256) DEFAULT NULL,
    //     `total_seasons` int(10) NOT NULL DEFAULT 0,
    //     `total_episodes` int(10) NOT NULL DEFAULT 0,
    //     `avg_runtime` int(10) NOT NULL DEFAULT 0,
    //     `imdb_rating` DECIMAL(3,1) DEFAULT NULL,
    //     `imdb_link` varchar(256) DEFAULT NULL,
    //     `rotten_tomatoes_rating` int(10) DEFAULT NULL,
    //     `seen_episodes` int(10) NOT NULL DEFAULT 0,
    //     `poster` varchar(256) DEFAULT NULL,
    //     PRIMARY KEY (`title`,`start_year`),
    //     UNIQUE KEY `id` (`id`)
    // );

    public function isReal() {
        return $this->exists;
    }

    public function getId() {return $this->id;}
    public function getTitle() {return $this->title;}
    public function getStartYear() {return $this->start_year;}
    public function getEndYear() {return $this->end_year;}
    public function getCreators() {return $this->creators;}
    public function getCast() {return $this->cast;}
    public function getGenre() {return $this->genre;}
    public function getTotalSeasons() {return $this->total_seasons;}
    public function getTotalEpisodes() {return $this->total_episodes;}
    public function getAvgRuntime() {return $this->avg_runtime;}
    public function getIMDbRating() {return $this->imdb_rating;}
    public function getIMDbLink() {return $this->imdb_link;}
    public function getRottenTomatoesRating() {return $this->rotten_tomatoes_rating;}
    public function getPoster() {return $this->poster;}
    public function getSeenEpisodes() {return $this->seen_episodes;}
    public function watched() {
        if ( $this->end_year === NULL ) {
            return false;
        }
        if ( $this->seen_episodes === $this->total_episodes ) {
            return true;
        }
        return false;
    }

    public function getPeriod() {
        if ( $this->end_year === NULL ) {
            if ( $this->start_year === NULL ) {
                return NULL;
            }
            return 'Since '.$this->start_year;
        }
        return $this->start_year.' - '.$this->end_year;
    }

    public static function getCount() {
        $result = DataBase::query('SELECT COUNT(*) AS seriescount'.
                                 ' FROM '.DataBase::$series_table_name);
        if ($result['executed']===false)
        {
            // echo "ERROR: Could not able to execute SQL<br>";
            // print_r($result['errorInfo']);
            return NULL;
        }
        return $result['data'][0]['seriescount'];
    }

    public static function checkExistingPK($title,$start_year) {
        if( ( strlen($title) < 1 ) || ( $start_year === NULL ) ) {
            return NULL;
        }
        $result = DataBase::query('SELECT count(*) AS seriescount'.
                                  ' FROM '.DataBase::$series_table_name.
                                  ' WHERE title=:title'.
                                    ' AND start_year=:year',
                                    array(':title'=>$title,':year'=>$start_year)
                                );
        if(!$result['executed']){
            // echo "ERROR: Could not able to execute SQL<br>";
            // print_r($result['errorInfo']);
            return NULL;
        }
        if($result['data'][0]['seriescount']==='1'){
            return true;
        }
        return false;
    }

    public static function checkExistingID($id) {
        if ( $id === NULL ) {
            return false;
        }
        $result = DataBase::query('SELECT count(*) AS seriescount'.
                                  ' FROM '.DataBase::$series_table_name.
                                  ' WHERE id=:id',
                                  array(':id'=>$id)
                                );
        if(!$result['executed']){
            // echo "ERROR: Could not able to execute SQL<br>";
            // print_r($result['errorInfo']);
            return NULL;
        }
        if($result['data'][0]['seriescount']==='1'){
            return true;
        }
        return false;
    }

    // public static function addSeriesToDB ($data) {
    //     $result = Series::checkExistingPK($data['title'],$data['start_year']);
    //     if ( $result === NULL ) {
    //         return NULL;
    //     } else if ( $result ) {
    //         return false;
    //     }
    //     if ( !is_numeric($data['start_year'])) {
    //         return NULL;
    //     }
    //     if ( !is_numeric($data['runtime'])) {
    //         $data['runtime'] = 0;
    //     }
    //     $result = DataBase::query('INSERT INTO '.DataBase::$series_table_name.
    //                               ' VALUES ('.
    //                                   ' NULL, '.
    //                                   ' :title,'.
    //                                   ' :subtitle,'.
    //                                   ' :release_year,'.
    //                                   ' :director,'.
    //                                   ' :cast,'.
    //                                   ' :genre,'.
    //                                   ' :imdb_rating,'.
    //                                   ' :imdb_link,'.
    //                                   ' :rotten_tomatoes_rating,'.
    //                                   ' :runtime,'.
    //                                   ' :seen,'.
    //                                   ' :poster'.
    //                               ' )',
    //                               array(':title'=>$data['title'],
    //                                     ':subtitle'=>$data['subtitle'],
    //                                     ':release_year'=>$data['releaseyear'],
    //                                     ':director'=>$data['director'],
    //                                     ':cast'=>$data['cast'],
    //                                     ':genre'=>$data['genre'],
    //                                     ':imdb_rating'=>$data['imdb_rating'],
    //                                     ':imdb_link'=>$data['imdb_link'],
    //                                     ':rotten_tomatoes_rating'=>$data['rotten_tomatoes_rating'],
    //                                     ':runtime'=>$data['runtime'],
    //                                     ':seen'=>$data['seen'],
    //                                     ':poster'=>$data['poster']
    //                                 )
    //                             );
    //     if(!$result['executed']){
    //         // echo "ERROR: Not able to execute SQL<br>";
    //         // print_r($result['errorInfo']);
    //         return NULL;
    //     }
    //     return $result['lastID'];
    // }

    // public static function updateMovieInDB ($data) {
    //     $result = Series::checkExistingID($data['id']);
    //     if ( $result === NULL ) {
    //         return NULL;
    //     } else if ( !$result ) {
    //         return false;
    //     }
    //     if ( !is_numeric($data['runtime'])) {
    //         $data['runtime'] = 0;
    //     }
    //     $result = DataBase::query('UPDATE '.DataBase::$series_table_name.
    //                               ' SET'.
    //                                 ' subtitle = :subtitle,'.
    //                                 ' director = :director,'.
    //                                 ' cast = :cast,'.
    //                                 ' genre = :genre,'.
    //                                 ' imdb_rating = :imdb_rating,'.
    //                                 ' imdb_link = :imdb_link,'.
    //                                 ' rotten_tomatoes_rating = :rotten_tomatoes_rating,'.
    //                                 ' runtime = :runtime,'.
    //                                 ' seen = :seen,'.
    //                                 ' poster = :poster'.
    //                               ' WHERE id=:id',
    //                               array(':subtitle'=>$data['subtitle'],
    //                                     ':director'=>$data['director'],
    //                                     ':cast'=>$data['cast'],
    //                                     ':genre'=>$data['genre'],
    //                                     ':imdb_rating'=>$data['imdb_rating'],
    //                                     ':imdb_link'=>$data['imdb_link'],
    //                                     ':rotten_tomatoes_rating'=>$data['rotten_tomatoes_rating'],
    //                                     ':runtime'=>$data['runtime'],
    //                                     ':seen'=>$data['seen'],
    //                                     ':poster'=>$data['poster'],
    //                                     ':id'=>$data['id']
    //                                 )
    //                             );
    //     if(!$result['executed']){
    //         // echo "ERROR: Not able to execute SQL<br>";
    //         // print_r($result['errorInfo']);
    //         return NULL;
    //     }
    //     return $data['id'];
    // }

    public static function deleteSeries ($id) {
        $result = Series::checkExistingID($id);
        if ( $result === NULL ) {
            return NULL;
        } else if ( !$result ) {
            return false;
        }
        $result = DataBase::query('DELETE FROM '.DataBase::$series_table_name.
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

    // public static function getUnwatchedMoviesID_Poster ($limit) {
    //     $result = DataBase::query('SELECT id,poster '.
    //                               ' FROM '.DataBase::$series_table_name.
    //                               ' WHERE seen=FALSE'.
    //                               ' ORDER BY rotten_tomatoes_rating DESC'.
    //                               ' LIMIT '.(int)$limit
    //                             );
    //     if(!$result['executed']){
    //         // echo "ERROR: Not able to execute SQL<br>";
    //         // print_r($result['errorInfo']);
    //         return NULL;
    //     }
    //     return $result['data'];
    // }

    public static function getWatchedSeriesStats () {
        $result = DataBase::query('SELECT SUM(avg_runtime*seen_episodes) AS totaltime,COUNT(*) AS watchcount'.
                                 ' FROM '.DataBase::$series_table_name.
                                 ' WHERE seen_episodes > 0');
        if ($result['executed']===false)
        {
            // echo "ERROR: Could not able to execute SQL<br>";
            // print_r($result['errorInfo']);
            return NULL;
        }
        else
        {
            return $result['data'][0];
        }
    }

}
?>
