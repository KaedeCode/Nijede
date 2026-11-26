<?php

namespace App\Controllers;

use App\Auth;
use App\Json;
use App\Models\User;
use App\Validator;

class AuthController
{
    public static function register(): void
    {
        $body = Json::body();
        $username = Validator::text($body['username'] ?? null);
        $password = is_string($body['password'] ?? null) ? $body['password'] : '';

        if (mb_strlen($username) < 3) {
            Json::send(['error' => 'Имя должно быть не менее 3 символов'], 400);
            return;
        }
        if (strlen($password) < 6) {
            Json::send(['error' => 'Пароль не менее 6 символов'], 400);
            return;
        }
        if (User::findByUsername($username) !== null) {
            Json::send(['error' => 'Пользователь с таким именем уже существует'], 400);
            return;
        }

        $user = User::create($username, $password);
        $_SESSION['userId'] = (int)$user['id'];
        Json::send(['id' => (int)$user['id'], 'username' => $user['username']], 201);
    }

    public static function login(): void
    {
        $body = Json::body();
        $username = Validator::text($body['username'] ?? null);
        $password = is_string($body['password'] ?? null) ? $body['password'] : '';

        if ($username === '' || $password === '') {
            Json::send(['error' => 'Имя и пароль обязательны'], 400);
            return;
        }

        $user = User::findByUsername($username);
        if ($user === null || !password_verify($password, $user['password_hash'])) {
            Json::send(['error' => 'Неверное имя пользователя или пароль'], 401);
            return;
        }

        $_SESSION['userId'] = (int)$user['id'];
        Json::send(['id' => (int)$user['id'], 'username' => $user['username']]);
    }

    public static function logout(): void
    {
        $_SESSION = [];
        session_destroy();
        setcookie(session_name(), '', ['expires' => 1, 'path' => '/', 'httponly' => true]);
        Json::send(['message' => 'Выход выполнен']);
    }

    public static function getProfile(): void
    {
        $userId = Auth::id();
        if ($userId === null) {
            Json::send(['error' => 'Не авторизован'], 401);
            return;
        }
        $user = User::findById($userId);
        if ($user === null) {
            Json::send(['error' => 'Пользователь не найден'], 404);
            return;
        }
        Json::send(User::publicData($user));
    }
}