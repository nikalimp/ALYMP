<?php
@ini_set('display_errors', '0');
// Заявки с alymp.ru (OrderForm и CartDrawer), единый стандарт NikitOS.
// 1) копия каждой заявки — в /var/www/u3672757/data/leads/leads.jsonl (вне папки сайта: rsync --delete не трогает);
// 2) сообщение в Telegram через общий конфиг /var/www/u3672757/data/leads/config.php:
//      <?php return array('bot_token' => '123:ABC', 'chat_id' => '123456');
// 3) дубль на почту $MAIL_TO — работает и без конфига.
// Совместимо с PHP 5.4+ / 7 / 8.

$MAIL_TO = 'nikitaalimpiev@mail.ru';
define('PER_HOUR', 5);

function v(&$x, $d = '') { return isset($x) ? $x : $d; }

function finish($code, $data) {
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  header('X-Robots-Tag: noindex');
  http_response_code($code);
  echo json_encode($data, defined('JSON_UNESCAPED_UNICODE') ? JSON_UNESCAPED_UNICODE : 0);
  exit;
}

if (v($_SERVER['REQUEST_METHOD']) !== 'POST') {
  finish(405, array('ok' => false, 'error' => 'Метод не поддерживается'));
}

$origin = v($_SERVER['HTTP_ORIGIN']);
if ($origin && !preg_match('~^https?://(www\.)?alymp\.ru$|^http://localhost(:\d+)?$~', $origin)) {
  finish(403, array('ok' => false, 'error' => 'Запрещено'));
}

$raw = file_get_contents('php://input');
$in = $raw !== '' ? json_decode($raw, true) : null;
if (!is_array($in)) $in = $_POST;
if (!is_array($in) || empty($in)) {
  finish(400, array('ok' => false, 'error' => 'Пустая заявка'));
}

function clean($s, $max) {
  $s = trim(preg_replace('/\s+/u', ' ', strip_tags((string)$s)));
  return function_exists('mb_substr') ? mb_substr($s, 0, $max, 'UTF-8') : substr($s, 0, $max);
}

// Honeypot: бот заполнил скрытое поле website — отвечаем успешно, но заявку не сохраняем
if (trim((string)v($in['website'])) !== '') {
  finish(200, array('ok' => true));
}

$name = clean(v($in['name']), 80);
$contact = clean(v($in['contact']), 120);
if ($name === '' || $contact === '') {
  finish(400, array('ok' => false, 'error' => 'Укажите имя и контакт'));
}

// Согласие 152-ФЗ обязательно
$consent = v($in['consent']);
$hasConsent = ($consent === true || $consent === 1 || $consent === '1' || $consent === 'true' || $consent === 'yes' || $consent === 'on');
if (!$hasConsent) {
  finish(400, array('ok' => false, 'error' => 'Нужно согласие на обработку данных'));
}

// Формируем offer (slug товара или "cart") и task (товар/версия или корзина + организация + комментарий)
$via = clean(v($in['via'], 'site'), 20);
$product = clean(v($in['product']), 160);
$variant = clean(v($in['variant']), 100);
$company = clean(v($in['company']), 160);
$isOrg = !empty($in['organization']);
$comment = clean(v($in['comment']), 600);
$estimatedTotal = (int)v($in['estimatedTotal'], 0);

$offerRaw = v($in['offer']);
if ($offerRaw === '' && $via === 'cart') $offerRaw = 'cart';
$offer = preg_replace('/[^a-z0-9_-]/', '', strtolower((string)$offerRaw));

$taskParts = array();
if ($product !== '') {
  $taskParts[] = 'Товар: ' . $product . ($variant !== '' ? ' (' . $variant . ')' : '');
}

$cartLines = array();
if (isset($in['items']) && is_array($in['items'])) {
  foreach ($in['items'] as $it) {
    if (!is_array($it)) continue;
    $itName = clean(v($it['name'], v($it['slug'])), 120);
    $itQty = max(1, (int)v($it['qty'], 1));
    $itPrice = (int)v($it['priceEstimate'], 0);
    if ($itName !== '') {
      $line = $itName . ' x ' . $itQty;
      if ($itPrice > 0) $line .= ' (от ' . number_format($itPrice * $itQty, 0, '.', ' ') . ' ₽)';
      $cartLines[] = $line;
    }
  }
  if (!empty($cartLines)) {
    $cartSummary = 'Корзина: ' . implode('; ', $cartLines);
    if ($estimatedTotal > 0) {
      $cartSummary .= ' | Итого от ' . number_format($estimatedTotal, 0, '.', ' ') . ' ₽';
    }
    $taskParts[] = $cartSummary;
  }
} elseif (isset($in['items']) && is_string($in['items']) && trim($in['items']) !== '') {
  $taskParts[] = 'Корзина: ' . clean($in['items'], 800);
}

if ($isOrg || $company !== '') {
  $taskParts[] = 'Организация: ' . ($company !== '' ? $company : 'да');
}
if ($comment !== '') {
  $taskParts[] = 'Комментарий: ' . $comment;
}
$task = clean(implode(' | ', $taskParts), 1200);

$pageRaw = v($in['page']);
if ($pageRaw === '') {
  $pageRaw = parse_url(v($_SERVER['HTTP_REFERER']), PHP_URL_PATH);
}
$page = clean($pageRaw, 300);
if ($page === '') $page = '/';

$lead = array(
  'time'    => date('c'),
  'name'    => $name,
  'contact' => $contact,
  'site'    => 'alymp.ru',
  'task'    => $task,
  'offer'   => $offer,
  'page'    => $page,
  'ip'      => v($_SERVER['HTTP_X_REAL_IP'], v($_SERVER['REMOTE_ADDR'])),
);

$DIR = dirname(dirname(dirname(__DIR__))) . '/leads';
@mkdir($DIR, 0700, true);

// Rate-limit: не больше PER_HOUR заявок с одного IP за час
$limFile = $DIR . '/limits.json';
$lim = @json_decode(@file_get_contents($limFile), true);
if (!is_array($lim)) $lim = array();
$now = time();
foreach ($lim as $k => $ts) {
  $lim[$k] = array_values(array_filter((array)$ts, function ($t) use ($now) { return $t > $now - 3600; }));
  if (!$lim[$k]) unset($lim[$k]);
}
$key = md5($lead['ip']);
if (isset($lim[$key]) && count($lim[$key]) >= PER_HOUR) {
  finish(429, array('ok' => false, 'error' => 'Слишком много заявок подряд'));
}
$lim[$key][] = $now;
@file_put_contents($limFile, json_encode($lim), LOCK_EX);

// 1. Запись в общий leads.jsonl (РФ-хостинг, 152-ФЗ)
$jsonFlags = defined('JSON_UNESCAPED_UNICODE') ? JSON_UNESCAPED_UNICODE : 0;
$saved = @file_put_contents($DIR . '/leads.jsonl', json_encode($lead, $jsonFlags) . "\n", FILE_APPEND | LOCK_EX) !== false;

// 2. Текст уведомления для Telegram и почты
$textLines = array('Заявка с alymp.ru');
if ($lead['offer'] !== '') $textLines[] = 'Оффер: ' . $lead['offer'];
$textLines[] = 'Страница: https://alymp.ru' . $lead['page'];
$textLines[] = '';
$textLines[] = 'Имя: ' . $lead['name'];
$textLines[] = 'Контакт: ' . $lead['contact'];
if ($product !== '') $textLines[] = 'Товар: ' . $product . ($variant !== '' ? ' · ' . $variant : '');
if (!empty($cartLines)) {
  $textLines[] = "Корзина:\n• " . implode("\n• ", $cartLines);
  if ($estimatedTotal > 0) $textLines[] = 'Ориентировочно: от ' . number_format($estimatedTotal, 0, '.', ' ') . ' ₽';
}
if ($isOrg || $company !== '') $textLines[] = 'Организация: ' . ($company !== '' ? $company : 'да');
if ($comment !== '') $textLines[] = 'Комментарий: ' . $comment;
$text = implode("\n", $textLines) . "\n";

// 3. Отправка в Telegram через общий конфиг NikitOS
$sent = false;
$cfgFile = $DIR . '/config.php';
if (is_file($cfgFile)) {
  $cfg = include $cfgFile;
  if (is_array($cfg) && !empty($cfg['bot_token']) && !empty($cfg['chat_id']) && function_exists('curl_init')) {
    $ch = curl_init('https://api.telegram.org/bot' . $cfg['bot_token'] . '/sendMessage');
    curl_setopt_array($ch, array(
      CURLOPT_POST => true,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 10,
      CURLOPT_POSTFIELDS => array(
        'chat_id' => $cfg['chat_id'],
        'text' => $text,
        'disable_web_page_preview' => 'true',
      ),
    ));
    $res = json_decode((string)curl_exec($ch), true);
    curl_close($ch);
    $sent = is_array($res) && !empty($res['ok']);
  }
}

// 4. Дубль на почту
$subject = '=?UTF-8?B?' . base64_encode('Заявка с alymp.ru: ' . $lead['name']) . '?=';
$mailed = @mail($MAIL_TO, $subject, $text, "From: alymp.ru <noreply@alymp.ru>\r\nContent-Type: text/plain; charset=utf-8\r\n");

if (!$saved && !$sent && !$mailed) {
  finish(500, array('ok' => false, 'error' => 'Не получилось сохранить заявку'));
}
finish(200, array('ok' => true));
