<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

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

$months = [
    1 => 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

$daysInMonth = (int)date('t', mktime(0, 0, 0, $month, 1, $year));
$firstWeekday = (int)date('N', mktime(0, 0, 0, $month, 1, $year)) - 1;

$currentYear = (int)date('Y', $now);
$currentMonth = (int)date('n', $now);
$today = (int)date('j', $now);

$isCurrentMonth = ($currentMonth === $month && $currentYear === $year);

$days = [];
for ($d = 1; $d <= $daysInMonth; $d++) {
    $days[] = [
        'dayOfMonth' => $d,
        'isToday'    => $isCurrentMonth && $d === $today,
    ];
}

echo json_encode([
    'year'         => $year,
    'month'        => $month,
    'monthName'    => $months[$month],
    'firstWeekday' => $firstWeekday,
    'daysInMonth'  => $daysInMonth,
    'today'        => $isCurrentMonth ? $today : null,
    'days'         => $days,
], JSON_UNESCAPED_UNICODE);