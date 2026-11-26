<?php

namespace App;

class Auth
{
    public static function id(): ?int
    {
        return isset($_SESSION['userId']) ? (int)$_SESSION['userId'] : null;
    }
}