<?php

namespace App;

class Validator
{
    public static function text(mixed $value): string
    {
        return is_string($value) ? trim($value) : '';
    }

    public static function email(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function date(mixed $value): bool
    {
        $date = \DateTime::createFromFormat('Y-m-d', (string)$value);
        return $date !== false && $date->format('Y-m-d') === $value;
    }
}