<?php
// Шаблон настроек формы заявок. Скопируйте на сервере в api/config.php (рядом с lead.php) и заполните.
// config.php в git не хранится и при выкладке не перезаписывается (publish.json → rsync_exclude).
// После этого включите site.features.leadApi = true в src/content/site.ts.
return [
  'telegram_token'   => '',                       // токен бота от @BotFather
  'telegram_chat_id' => '',                       // id чата или канала, куда приходят заявки
  'email'            => 'nikitaalimpiev@mail.ru', // куда дублировать заявки; '' — не отправлять
  'email_from'       => 'noreply@alymp.ru',
  'allowed_origins'  => ['https://alymp.ru'],
];
