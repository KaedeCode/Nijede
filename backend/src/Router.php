<?php

namespace App;

class Router
{
    private array $routes = [];

    private function add(string $method, string $path, callable $handler): void 
    { 
        $this->routes[$method][$path] = $handler; 
    }

    public function get(string $path, callable $handler): void { $this->add('GET', $path, $handler); }
    public function post(string $path, callable $handler): void { $this->add('POST', $path, $handler); }
    public function put(string $path, callable $handler): void { $this->add('PUT', $path, $handler); }
    public function patch(string $path, callable $handler): void { $this->add('PATCH', $path, $handler); }
    public function delete(string $path, callable $handler): void { $this->add('DELETE', $path, $handler); }
    //public function head(string $path, callable $handler): void { $this->add('HEAD', $path, $handler); }
    //public function options(string $path, callable $handler): void { $this->add('OPTIONS', $path, $handler); }


    public function dispatch(string $method, string $path): void
    {
        if (isset($this->routes[$method][$path]))
        {
            try {
                ($this->routes[$method][$path])();
            } catch (\Throwable $e) {
                error_log($e->getMessage() . " in " . $e->getFile() . ": " . $e->getLine());
                Json::send(['error'=>'Ошибка сервера'], 500);
            }
        }
        else
        {
            Json::send(['error'=>'Not found'], 404);
        }
    }
}