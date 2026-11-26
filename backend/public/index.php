<?php

require __DIR__ . '/../config.php';

use App\Controllers\AuthController;
use App\Controllers\CalendarController;
use App\Controllers\FeedbackController;
use App\Controllers\ProfileController;
use App\Json;
use App\Router;

if (env('APP_ENV') === 'dev' && env('FRONTEND_URL') !== null) {
    header('Access-Control-Allow-Origin: ' . env('FRONTEND_URL'));
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'secure' => env('APP_ENV') === 'production',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

$router = new Router();

$router->get('/api/health', fn() => Json::send(['ok' => true, 'php' => PHP_VERSION, 'env' => env('APP_ENV')]));
$router->get('/api/calendar', fn() => CalendarController::month());
$router->post('/api/register', fn() => AuthController::register());
$router->post('/api/login', fn() => AuthController::login());
$router->post('/api/logout', fn() => AuthController::logout());
$router->get('/api/profile', fn() => AuthController::getProfile());
$router->post('/api/profile', fn() => ProfileController::update());
$router->post('/api/feedback', fn() => FeedbackController::submit());

$router->dispatch($_SERVER['REQUEST_METHOD'], parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));