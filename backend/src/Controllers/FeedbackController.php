<?php

namespace App\Controllers;

use App\Auth;
use App\Json;
use App\Models\Feedback;
use App\Validator;

class FeedbackController
{
    private const TYPES = ['general', 'bug', 'suggestion'];

    public static function submit(): void
    {
        $body = Json::body();
        $message = Validator::text($body['message'] ?? null);
        $type = Validator::text($body['type'] ?? null) ?: 'general';
        $email = Validator::text($body['email'] ?? null);

        if (mb_strlen($message) < 5) {
            Json::send(['error' => 'Сообщение должно содержать минимум 5 символов'], 400);
            return;
        }
        if (!in_array($type, self::TYPES, true)) {
            Json::send(['error' => 'Недопустимый тип'], 400);
            return;
        }
        if ($email !== '' && !Validator::email($email)) {
            Json::send(['error' => 'Некорректный email'], 400);
            return;
        }

        $feedback = Feedback::create(Auth::id(), $email === '' ? null : $email, $message, $type);
        Json::send(['success' => true, 'feedback' => $feedback], 201);
    }
}