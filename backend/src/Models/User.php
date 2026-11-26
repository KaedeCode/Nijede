<?php

namespace App\Models;

class User
{
    private const FIELDS = ['username', 'avatar_url', 'pronouns', 'bio', 'birthdate'];

    public static function create(string $username, string $password): array
    {
        $stmt = db()->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        $stmt->execute([$username, password_hash($password, PASSWORD_BCRYPT)]);
        return self::findById((int)db()->lastInsertId());
    }

    public static function findByUsername(string $username): ?array
    {
        $stmt = db()->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([$username]);
        return $stmt->fetch() ?: null;
    }

    public static function findById(int $id): ?array
    {
        $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function update(int $id, array $data): void
    {
        $data = array_intersect_key($data, array_flip(self::FIELDS));
        if ($data === []) {
            return;
        }
        $set = implode(', ', array_map(fn($field) => "`$field` = ?", array_keys($data)));
        $stmt = db()->prepare("UPDATE users SET $set WHERE id = ?");
        $stmt->execute([...array_values($data), $id]);
    }

    public static function publicData(array $user): array
    {
        return [
            'id' => (int)$user['id'],
            'username' => $user['username'],
            'avatar_url' => $user['avatar_url'],
            'pronouns' => $user['pronouns'],
            'bio' => $user['bio'],
            'birthdate' => $user['birthdate'],
            'created_at' => $user['created_at'],
        ];
    }
}