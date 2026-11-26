<?php
// Заявки с alymp.ru (spec §7, T54). Порядок по 152-ФЗ (ч. 5 ст. 18): сначала запись на хостинге в РФ,
// потом пересылка в Telegram-бот и на почту. Секреты — в api/config.php на сервере (в git не хранится,
// при выкладке не перезаписывается: rsync_exclude в publish.json). Шаблон — api/config.example.php.
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

function out(int $code, array $body): void { http_response_code($code); echo json_encode($body, JSON_UNESCAPED_UNICODE); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok' => false, 'error' => 'method']);
$cfgFile = __DIR__ . '/config.php';
if (!is_file($cfgFile)) out(503, ['ok' => false, 'error' => 'not_configured']);
$cfg = require $cfgFile;

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && !in_array($origin, $cfg['allowed_origins'] ?? ['https://alymp.ru'], true)) out(403, ['ok' => false, 'error' => 'origin']);

$raw = file_get_contents('php://input', false, null, 0, 20000) ?: '';
$d = json_decode($raw, true);
if (!is_array($d)) $d = $_POST;

$clean = static fn($v, int $max = 300): string => mb_substr(trim(strip_tags((string)($v ?? ''))), 0, $max);
$lead = [
  'at'           => date('c'),
  'product'      => $clean($d['product'] ?? '', 200),
  'variant'      => $clean($d['variant'] ?? '', 100),
  'items'        => $clean($d['items'] ?? '', 2000),
  'name'         => $clean($d['name'] ?? '', 100),
  'contact'      => $clean($d['contact'] ?? '', 100),
  'company'      => $clean($d['company'] ?? '', 200),
  'organization' => !empty($d['organization']),
  'comment'      => $clean($d['comment'] ?? '', 2000),
  'via'          => $clean($d['via'] ?? 'site', 30),
  'page'         => $clean($_SERVER['HTTP_REFERER'] ?? '', 300),
  'ip'           => $_SERVER['REMOTE_ADDR'] ?? '',
];

if (!empty($d['website'])) out(200, ['ok' => true]); // ловушка для ботов (скрытое поле)
if (empty($d['consent'])) out(422, ['ok' => false, 'error' => 'consent']); // согласие 152-ФЗ обязательно
if ($lead['name'] === '' || $lead['contact'] === '') out(422, ['ok' => false, 'error' => 'fields']);

// Простое ограничение: не больше 5 заявок с одного IP за 10 минут
$dir = __DIR__ . '/leads';
if (!is_dir($dir)) { mkdir($dir, 0750, true); file_put_contents("$dir/.htaccess", "Require all denied\n"); }
$rl = "$dir/.rate-" . md5($lead['ip']);
$hits = array_filter(array_map('intval', is_file($rl) ? file($rl, FILE_IGNORE_NEW_LINES) : []), fn($t) => $t > time() - 600);
if (count($hits) >= 5) out(429, ['ok' => false, 'error' => 'rate']);
$hits[] = time(); file_put_contents($rl, implode("\n", $hits));

// 1. Запись на хостинге (РФ)
$ok = file_put_contents("$dir/" . date('Y-m') . '.jsonl', json_encode($lead, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
if ($ok === false) out(500, ['ok' => false, 'error' => 'storage']);

// 2. Telegram и почта — после записи
$text = "Заявка alymp.ru\n"
  . ($lead['product'] ? "Товар: {$lead['product']}" . ($lead['variant'] ? " · {$lead['variant']}" : '') . "\n" : '')
  . ($lead['items'] ? "Корзина: {$lead['items']}\n" : '')
  . "Имя: {$lead['name']}\nКонтакт: {$lead['contact']}\n"
  . ($lead['organization'] ? "Организация: " . ($lead['company'] ?: '—') . "\n" : '')
  . ($lead['comment'] ? "Комментарий: {$lead['comment']}\n" : '')
  . "Страница: {$lead['page']}";

if (!empty($cfg['telegram_token']) && !empty($cfg['telegram_chat_id'])) {
  $ctx = stream_context_create(['http' => ['method' => 'POST', 'timeout' => 8, 'header' => "Content-Type: application/json\r\n",
    'content' => json_encode(['chat_id' => $cfg['telegram_chat_id'], 'text' => $text, 'disable_web_page_preview' => true])]]);
  @file_get_contents("https://api.telegram.org/bot{$cfg['telegram_token']}/sendMessage", false, $ctx);
}
if (!empty($cfg['email'])) {
  @mail($cfg['email'], '=?UTF-8?B?' . base64_encode('Заявка alymp.ru: ' . ($lead['product'] ?: 'корзина')) . '?=', $text,
    "Content-Type: text/plain; charset=utf-8\r\nFrom: " . ($cfg['email_from'] ?? 'noreply@alymp.ru'));
}

out(200, ['ok' => true]);
