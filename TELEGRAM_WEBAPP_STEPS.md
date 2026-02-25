# План: Telegram-бот с Web App (на примере Cloudflare Pages)

Пошагово: от текущего состояния проекта до работающего бота в Telegram с Web App. В качестве хостинга — **Cloudflare Pages** (бесплатно, HTTPS, сервера не в РФ — удобно из-за блокировок Telegram).

---

## Этап 1. Подготовка проекта к веб-сборке

### Шаг 1.1 — Установить зависимости для web

В корне проекта выполни:

```bash
npx expo install react-dom react-native-web
```

(Expo подставит совместимые версии.)

### Шаг 1.2 — Проверить запуск в браузере

```bash
npx expo start --web
```

Откроется браузер с приложением. Проверь:
- открывается ли приложение;
- не падает ли на нативных модулях (например `expo-media-library` на web может не работать — такие места потом можно обернуть в проверку платформы или заглушку).

Если что-то ломается — исправь (часто достаточно `Platform.OS === 'web'` и альтернативное поведение).

### Шаг 1.3 — Собрать статическую веб-сборку

```bash
npx expo export --platform web
```

В корне появится папка **`dist/`** (или `web-build/` — смотри вывод команды) с готовым сайтом: `index.html`, JS, CSS, картинки. Эту папку мы будем выкладывать на хостинг.

---

## Этап 2. Деплой на Cloudflare Pages

Telegram открывает Web App только по **HTTPS**. Cloudflare Pages даёт бесплатный HTTPS и постоянный URL (сервера не в РФ).

### Шаг 2.1 — Зарегистрироваться в Cloudflare

1. Перейди на [dash.cloudflare.com](https://dash.cloudflare.com).
2. Зарегистрируйся или войди (можно через Google/GitHub).

### Шаг 2.2 — Выбор способа деплоя

У нашего проекта в `dist` больше **1000 файлов** (картинки образных кодов, учебника и т.д.). В веб-интерфейсе Cloudflare **Upload assets** ограничен **1000 файлами**, поэтому загрузить папку через браузер не получится. Используй **Wrangler CLI** (до 20 000 файлов) или **Git**.

---

### Шаг 2.3 — Вариант A: Wrangler CLI (рекомендуется для этого проекта)

Через терминал загружаешь всю папку `dist` без ограничения в 1000 файлов.

1. **Установи Wrangler и войди в аккаунт Cloudflare:**

   ```bash
   npm install -g wrangler
   wrangler login
   ```

   Откроется браузер — авторизуйся в Cloudflare.

   **Если `wrangler login` падает с ошибкой (ECONNRESET, fetch failed)** — используй API-токен:
   - Зайди на [dash.cloudflare.com](https://dash.cloudflare.com) → **My Profile** (иконка профиля справа вверху) → **API Tokens** → **Create Token** → **Create Custom Token**.
   - Укажи права:
     - **Account** → **Cloudflare Pages** → **Edit**
     - **User** → **User Details** → **Read** (нужно для работы Wrangler с API)
   - **Account resources:** Include → выбери свой аккаунт.
   - Создай токен и скопируй его (показывается один раз).
   - В терминале (перед деплоем) выполни один раз в этой сессии:
     ```bash
     set CLOUDFLARE_API_TOKEN=твой_токен_сюда
     ```
     (В PowerShell: `$env:CLOUDFLARE_API_TOKEN="твой_токен_сюда"`.)
   - Дальше вызывай только `npx wrangler pages deploy dist --project-name=memento-webapp` — без `wrangler login`.

2. **Создай проект Pages (один раз):**

   ```bash
   npx wrangler pages project create
   ```

   Введи имя проекта (например `memento-webapp`). Production branch можно оставить `main` или ввести `main`.

3. **Деплой из папки dist:**

   В корне проекта (где лежит папка `dist`) выполни:

   ```bash
   npx wrangler pages deploy dist --project-name=memento-webapp
   ```

   Вместо `memento-webapp` подставь имя, которое задал на шаге 2. После загрузки в терминале появится URL вида **`https://memento-webapp.pages.dev`**.

4. **Следующие обновления:** после новой сборки (`npx expo export --platform web`) снова выполни ту же команду — деплой обновится.

---

### Шаг 2.4 — Вариант B: загрузка через браузер (Upload assets)

Подходит только если в сборке **меньше 1000 файлов** (у нашего проекта больше — используй Вариант A или C).

1. В **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Имя проекта (например `memento-webapp`).
3. Перетащи в окно содержимое папки `dist` (не саму папку) и нажми **Deploy site**.

---

### Шаг 2.5 — Вариант C: деплой из Git (обновления одной командой)

1. Выбери **Connect to Git**.
2. Подключи GitHub (или GitLab) и выбери репозиторий с проектом (если репо ещё нет — создай и запушь проект).
3. Настройки сборки:
   - **Build command:** `npx expo export --platform web`
   - **Build output directory:** `dist` (или то, что выводит Expo — смотри в логах `expo export`, иногда `web-build`).
   - **Root directory:** оставь пустым или `/`.
4. Сохрани и запусти деплой. Cloudflare соберёт проект и покажет URL вида **`https://твой-проект.pages.dev`**.

При следующих обновлениях: пушишь код в Git — Cloudflare автоматически пересоберёт и обновит сайт.

---

### Шаг 2.6 — Проверка

Открой в браузере выданный Cloudflare URL (например `https://memento-webapp.pages.dev`). Должно открыться твоё приложение. Запомни этот **HTTPS-адрес** — он понадобится для бота.

---

## Этап 3. Создание и настройка бота в Telegram

### Шаг 3.1 — Создать бота

1. Открой Telegram, найди **@BotFather**.
2. Отправь команду: `/newbot`.
3. Введи имя бота (например: Memento).
4. Введи username бота (должен заканчиваться на `bot`, например: `memento_memory_bot`).
5. BotFather пришлёт **токен** вида `123456789:AAH...`. Сохрани его (нужен для возможной автоматизации; для простого Web App по шагам ниже можно не использовать в коде).

### Шаг 3.2 — Привязать Web App к боту

1. Напиши BotFather: **`/mybots`**.
2. Выбери своего бота.
3. **Bot Settings** → **Menu Button** (или **Configure menu button** / **Edit Bot** → **Menu Button**).
4. Укажи:
   - **URL:** твой HTTPS-адрес с Cloudflare Pages (например `https://memento-webapp.pages.dev`).
   - Текст кнопки (например: «Открыть приложение»).

Либо через **Web App** в настройках бота: укажи тот же URL как адрес Web App.

После этого в чате с ботом появится кнопка меню; по нажатию откроется твоё приложение во встроенном браузере Telegram.

### Шаг 3.3 — Проверка

1. Открой бота в Telegram и нажми кнопку меню (Web App).
2. Должно открыться твоё приложение внутри Telegram по адресу с Cloudflare Pages. Сервер может быть выключен — сайт уже в интернете.

---

## Этап 4. (По желанию) Интеграция с Telegram в коде

Чтобы приложение «чувствовало» Telegram (тема, во весь экран, кнопка «Назад» и т.д.):

1. В `app.json` в секции **web** можно добавить в **`head`** скрипт:
   - `https://telegram.org/js/telegram-web-app.js`
2. В коде при инициализации (только для web) проверять `window.Telegram?.WebApp` и вызывать, например:
   - `window.Telegram.WebApp.ready()`;
   - `window.Telegram.WebApp.expand()` — на весь экран;
   - при необходимости подставлять тему (цвета) из `window.Telegram.WebApp.themeParams`.

Это можно сделать позже; для первого запуска достаточно шагов 1–3.

---

## Краткий чеклист

| # | Действие |
|---|----------|
| 1 | `npx expo install react-dom react-native-web` |
| 2 | `npx expo start --web` — проверить, что приложение открывается в браузере |
| 3 | Исправить ошибки на web (если есть) |
| 4 | `npx expo export --platform web` |
| 5 | Зарегистрироваться на [dash.cloudflare.com](https://dash.cloudflare.com) |
| 6 | Установить Wrangler: `npm install -g wrangler`, затем `wrangler login` |
| 7 | Создать проект: `npx wrangler pages project create` (имя, например memento-webapp) |
| 8 | Деплой: `npx wrangler pages deploy dist --project-name=memento-webapp` → получить URL |
| 9 | Создать бота в @BotFather (`/newbot`) |
| 10 | В настройках бота указать Menu Button / Web App URL = HTTPS-адрес Cloudflare Pages |
| 11 | Открыть бота в Telegram и нажать кнопку — проверить Web App |

---

## Как обновлять приложение

- **Если деплой через Wrangler:** после изменений выполни `npx expo export --platform web`, затем снова `npx wrangler pages deploy dist --project-name=memento-webapp`. URL в боте не меняется.
- **Если деплой через Upload assets:** после сборки загрузи новое содержимое `dist` в веб-интерфейсе (при &lt; 1000 файлов).
- **Если деплой через Git:** сделай `git push` — Cloudflare сам пересоберёт и обновит сайт. URL остаётся тем же.

Один проект в Cursor — один билд — один URL в боте. Дорабатываешь здесь → пересобираешь и деплоишь → бот показывает обновлённую версию.

---

## Альтернатива: локальный сервер + ngrok

Если нужно временно показывать приложение с своего компьютера без хостинга:

1. После шагов 1.1–1.3 установи и запусти локальный сервер: `npm install -g serve`, затем `serve -s dist -l 3000`.
2. Установи [ngrok](https://ngrok.com), в другом терминале выполни `ngrok http 3000`.
3. В настройках бота укажи **URL** = HTTPS-адрес из вывода ngrok (например `https://xxxx.ngrok-free.app`).

Пока запущены serve и ngrok — приложение доступно по HTTPS. Выключил ПК или ngrok — ссылка не работает; на бесплатном ngrok URL при новом запуске может меняться.
