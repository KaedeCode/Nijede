<?php

namespace App\Controllers;

use App\Json;

class CalendarController
{
    private const MONTHS = [
        1 => 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    public static function month(): void
    {
        $tzOffset = isset($_GET['tz']) ? (int)$_GET['tz'] : 0;
        $now = time() - $tzOffset * 60;

        $year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y', $now);
        $month = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('n', $now);

        if ($month < 1 || $month > 12) {
            $month = (int)date('n', $now);
        }
        if ($year < 1970 || $year > 2100) {
            $year = (int)date('Y', $now);
        }

        $daysInMonth = (int)date('t', mktime(0, 0, 0, $month, 1, $year));
        $firstWeekday = (int)date('N', mktime(0, 0, 0, $month, 1, $year)) - 1;

        $isCurrentMonth = (int)date('Y', $now) === $year && (int)date('n', $now) === $month;
        $today = (int)date('j', $now);

        $days = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $days[] = [
                'dayOfMonth' => $d,
                'isToday' => $isCurrentMonth && $d === $today,
            ];
        }

        Json::send([
            'year' => $year,
            'month' => $month,
            'monthName' => self::MONTHS[$month],
            'firstWeekday' => $firstWeekday,
            'daysInMonth' => $daysInMonth,
            'today' => $isCurrentMonth ? $today : null,
            'days' => $days,
        ]);
    }
}