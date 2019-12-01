<?php

class DataBase
{

    //////////////////////////////My Home DB////////////////////////////////////
    private static $host_name='localhost';
    private static $database_name='MyMDb';
    private static $database_username='PPLab';
    private static $database_password='PPRox';
    ////////////////////////////////////////////////////////////////////////////

    // Table Names:
    public static $movies_table_name        = "Movies";
    // public static $skill_table_name         = "ASARGSkills";
    // public static $skill_reg_table_name     = "ASARGSkillReg";

    private static function connect()
    {
        $link=new PDO('mysql:host='.self::$host_name.';dbname='.self::$database_name.';charset=utf8',self::$database_username,self::$database_password);
        $link->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $link;
    }



    public static function query($query, $params = array())
    {
        $conn=self::connect();
        $statement=$conn->prepare($query);
        if(!($statement->execute($params)))
        {
            return array("executed"=>False,"errorInfo"=>$statement->errorInfo(),"data"=>NULL);
        }
        if(explode(' ', $query)[0]=='SELECT') //checks if the first word of the query is select
        {
            $data=$statement->fetchAll();
            return array("executed"=>True,"errorInfo"=>$statement->errorInfo(),"data"=>$data);
        }
        if(explode(' ', $query)[0]=='INSERT') //checks if the first word of the query is insert
        {
            $statement=$conn->prepare('SELECT LAST_INSERT_ID()');
            if(!($statement->execute(array()))){
                return array("executed"=>False,"errorInfo"=>$statement->errorInfo(),"data"=>NULL);
            }
            $lastid=$statement->fetchAll()[0][0];
            return array("executed"=>True,"errorInfo"=>NULL,"data"=>NULL,"lastID"=>$lastid);
        }
        // For rest of the queries
        return array("executed"=>True,"errorInfo"=>NULL,"data"=>NULL);
    }

}
?>
