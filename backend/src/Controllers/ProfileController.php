<?php

namespace App\Controllers;

use App\Auth;
use App\Json;
use App\Models\User;
use App\Validator;

class ProfileController
{
    private const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    private const LIMIT = 20 * 1024 * 1024;

    public static function update(): void
    {
        $userId = Auth::id();
        if ($userId === null) {
            Json::send(['error' => 'Не авторизован'], 401);
            return;
        }

        $data = [];

        if (isset($_POST['username'])) {
            $username = Validator::text($_POST['username']);
            if (mb_strlen($username) < 3) {
                Json::send(['error' => 'Имя должно содержать минимум 3 символа'], 400);
                return;
            }
            $data['username'] = $username;
        }

        if (isset($_POST['pronouns'])) {
            $data['pronouns'] = Validator::text($_POST['pronouns']) ?: null;
        }

        if (isset($_POST['bio'])) {
            $data['bio'] = Validator::text($_POST['bio']) ?: null;
        }

        if (isset($_POST['birthdate'])) {
            $birthdate = Validator::text($_POST['birthdate']);
            if ($birthdate !== '' && !Validator::date($birthdate)) {
                Json::send(['error' => 'Некорректная дата рождения'], 400);
                return;
            }
            $data['birthdate'] = $birthdate === '' ? null : $birthdate;
        }

        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] !== UPLOAD_ERR_NO_FILE) {
            try {
                $data['avatar_url'] = self::avatar($_FILES['avatar']);
            } catch (\RuntimeException $e) {
                Json::send(['error' => $e->getMessage()], 400);
                return;
            }
        }

        if ($data === []) {
            Json::send(['error' => 'Нет данных для обновления'], 400);
            return;
        }

        User::update($userId, $data);
        Json::send(User::publicData(User::findById($userId)));
    }

    private static function avatar(array $file): string
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \RuntimeException('Не удалось загрузить файл');
        }
        if ($file['size'] > self::LIMIT) {
            throw new \RuntimeException('Файл больше 20 МБ');
        }
        if (!in_array(mime_content_type($file['tmp_name']), self::TYPES, true)) {
            throw new \RuntimeException('Недопустимый формат файла');
        }

        $source = @imagecreatefromstring((string)file_get_contents($file['tmp_name']));
        if ($source === false) {
            throw new \RuntimeException('Не удалось обработать изображение');
        }

        $side = min(imagesx($source), imagesy($source));
        $canvas = imagecreatetruecolor(300, 300);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagefill($canvas, 0, 0, imagecolorallocatealpha($canvas, 0, 0, 0, 127));
        imagecopyresampled(
            $canvas,
            $source,
            0,
            0,
            (int)((imagesx($source) - $side) / 2),
            (int)((imagesy($source) - $side) / 2),
            300,
            300,
            $side,
            $side
        );

        $name = time() . '-' . random_int(100000000, 999999999) . '.webp';
        if (!imagewebp($canvas, ROOT . '/storage/avatars/' . $name, 90)) {
            throw new \RuntimeException('Не удалось обработать изображение');
        }

        return '/uploads/avatars/' . $name;
    }
}