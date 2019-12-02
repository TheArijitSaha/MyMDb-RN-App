<?php

require_once('DataBase.php');
require_once('variables.php');

class Nav
{
    public static function insertNavbar($pagename)
    {
        $retString='<nav class="navbar navbar-expand-sm navbar-dark bg-dark">
                        <a class="navbar-brand" href="'.NetworkVariables::$home_path.'">MyMDb</a>
                        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>

                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul class="navbar-nav mr-auto">
                                <li class="nav-item '.($pagename==='Movies'?'active':'').'">
                                    <a class="nav-link" href="'.NetworkVariables::$home_path.'Movies">Movies</a>
                                </li>
                                <li class="nav-item '.($pagename==='Series'?'active':'').'">
                                    <a class="nav-link" href="'.NetworkVariables::$home_path.'Series">Series</a>
                                </li>
                            </ul>
                        </div>
                    </nav>';
        return $retString;
    }
}

class Fonts{
    public static function insertFonts()
    {
        $retString='<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Strait|Aladin|Merriweather|Special+Elite|Fredericka+the+Great|Odibee+Sans|Tomorrow&display=swap">';
        return $retString;
    }
}

?>
