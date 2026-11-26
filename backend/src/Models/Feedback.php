<?php

namespace App\Models;

class Feedback
{
    public static function create(?int $userId, ?string $email, string $message, string $type): array
    {
        $stmt = db()->prepare('INSERT INTO feedback (user_id, email, message, type) VALUES (?, ?, ?, ?)');
        $stmt->execute([$userId, $email, $message, $type]);
        return self::findById((int)db()->lastInsertId());
    }

    public static function findById(int $id): ?array
    {
        $stmt = db()->prepare('SELECT * FROM feedback WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function getAll(int $limit = 100): array
    {
        $stmt = db()->prepare('SELECT * FROM feedback ORDER BY created_at DESC LIMIT ?');
        $stmt->bindValue(1, $limit, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}