<?php

namespace App;

class Router
{
    private array $routes = [];
    public function get(string $path, callable $handler): void
    {
        $this->routes['GET'][$path] = $handler;
    }
    public function dispatch(string $method, string $path): void
    {
        if (isset($this->routes[$method][$path]))
        {
            ($this->routes[$method][$path])();
        }
        else
        {
            \App\Json::send(['errors'=>'Not found'], 404);
        }
    }
}