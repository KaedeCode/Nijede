<?php

namespace App;

class Json
{
    public static function send(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type:application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}