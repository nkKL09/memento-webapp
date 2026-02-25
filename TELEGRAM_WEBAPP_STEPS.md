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

### Шаг 2.5 — Вариант C: деплой через Git (без Wrangler с твоего ПК)

Заливка идёт **с серверов Cloudflare** (они клонируют репо и собирают проект). С твоего компьютера нужен только доступ к **GitHub** (часто он есть даже когда до Cloudflare API достучаться не получается).

---

#### Часть 1. Репозиторий на GitHub

1. **Аккаунт GitHub**  
   Если его нет — зарегистрируйся на [github.com](https://github.com).

2. **Создать новый репозиторий**  
   - На GitHub: **Create a new repository** (или плюс → New repository).  
   - **Repository name:** например `memento-webapp` или `mnemotechnika`.  
   - **Public.**  
   - **Не** ставь галочки "Add a README" / "Add .gitignore" — репо должен быть пустым.  
   - Нажми **Create repository**.

3. **Подключить локальный проект к репозиторию и отправить код**  
   В терминале (cmd или PowerShell), в папке проекта:

   ```bash
   cd c:\Users\oldos\mnemotechnika
   git remote add origin https://github.com/ТВОЙ_ЛОГИН/memento-webapp.git
   git branch -M main
   git push -u origin main
   ```

   Вместо `ТВОЙ_ЛОГИН` и `memento-webapp` подставь свой логин GitHub и имя репозитория.  
   При первом `git push` GitHub может попросить войти (логин и пароль или токен). Если просит пароль — используй **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens → Generate new token), права — хотя бы `repo`.

   Если репозиторий уже был подключён (`git remote -v` показывает `origin`), тогда достаточно:
   ```bash
   git push -u origin main
   ```

---

#### Часть 2. Cloudflare Pages + Git

1. Зайди на [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages**.

2. Выбери **Connect to Git** (не Upload assets).

3. **Подключить GitHub**  
   Нажми **Connect GitHub** (или **Connect Git provider** → GitHub).  
   Разреши доступ Cloudflare к GitHub (выбери аккаунт, при необходимости «Authorize Cloudflare»).  
   Если GitHub недоступен — Cloudflare поддерживает и GitLab.

4. **Выбрать репозиторий**  
   В списке репозиториев выбери тот, куда пушил проект (например `memento-webapp`).  
   Нажми **Begin setup**.

5. **Настройки сборки (Build configuration)**  
   - **Project name:** можно оставить как есть (например `memento-webapp`) или переименовать.  
   - **Production branch:** `main` (или та ветка, в которую ты пушишь).  
   - **Build command:**  
     ```bash
     npx expo export --platform web
     ```  
   - **Build output directory:**  
     ```bash
     dist
     ```  
   - **Root directory:** оставь пустым (сборка из корня репо).  
   - **Environment variables** (по желанию): если нужно зафиксировать версию Node, добавь переменную `NODE_VERSION` = `20` (или `18`). Для Expo 54 обычно подходит дефолтная Node у Cloudflare.

   Папку **dist** в репозиторий пушить не нужно (она в `.gitignore`) — Cloudflare создаёт её у себя при выполнении команды сборки.

6. Нажми **Save and Deploy**.

7. Cloudflare запустит сборку: клонирует репо, ставит зависимости (`npm install`), выполняет `npx expo export --platform web` и публикует содержимое папки `dist`.  
   Статус смотри на странице проекта в **Deployments**. Первый деплой может занять несколько минут.  
   После успешного деплоя будет URL вида **`https://memento-webapp.pages.dev`**.

---

#### Часть 3. Обновления

- Вносишь изменения в код локально.  
- Делаешь коммит и пуш в ту же ветку (например `main`):
  ```bash
  git add .
  git commit -m "описание изменений"
  git push origin main
  ```
- Cloudflare сам подхватит новый коммит, заново выполнит сборку и обновит сайт.  
- URL сайта не меняется; в настройках бота в Telegram ничего менять не нужно.

---

### Шаг 2.6 — Проверка

Открой в браузере выданный Cloudflare URL (например `https://memento-webapp.pages.dev`). Должно открыться твоё приложение. Запомни этот **HTTPS-адрес** — он понадобится для бота.

---

### Шаг 2.6.1 — Проверить веб-сборку локально перед деплоем

Чтобы не деплоить каждую правку «вслепую», можно один в один собрать и открыть то, что уедет на хостинг:

1. **Сборка как для продакшена и запуск локального сервера:**
   ```bash
   npm run web:preview
   ```
   Команда сделает `expo export --platform web` и поднимет раздачу папки `dist` на **http://localhost:3000**.

2. Открой в браузере **http://localhost:3000** и проверь приложение. Это та же сборка, что попадёт на Cloudflare.

3. Когда всё ок — делай деплой (пуш в Git или Wrangler).

**Быстрая проверка без сборки:** `npm run web` — запускает dev-сервер для web (hot reload). Удобно для разработки, но поведение может чуть отличаться от финальной сборки.

---

### Шаг 2.7 — Свой домен (Custom domain) и ошибка SSL

Если подключил свой домен (например **memento-app.online**) и при открытии сайта появляется ошибка **«Этот сайт не может обеспечить безопасное соединение»** или **ERR_SSL_VERSION_OR_CIPHER_MISMATCH**, проверь по шагам ниже.

#### 1. Запись DNS должна быть через Cloudflare (Proxied)

- Зайди в **Cloudflare Dashboard** → выбери зону **memento-app.online** (или свой домен).
- Открой **DNS** → **Records**.
- Найди запись для твоего домена (типа `CNAME` на `memento-webapp.pages.dev` или `A`/`AAAA`).
- У записи должен быть **оранжевый облак (Proxied)**. Если облако **серое (DNS only)** — нажми на него, чтобы включить **Proxied**.
- Без Proxied Cloudflare не выдаёт свой SSL-сертификат, и браузер может показать ERR_SSL_VERSION_OR_CIPHER_MISMATCH.

#### 2. Статус SSL-сертификата — Active

- В той же зоне: **SSL/TLS** → **Edge Certificates**.
- В блоке **Edge Certificates** найди сертификат типа **Universal**.
- **Status** должен быть **Active**. Если **Pending** или **Initializing** — сертификат ещё выпускается (от 15 минут до 24 часов).
- Если статус не Active: подожди до 24 часов. При необходимости можно временно **Pause Cloudflare** (Overview → кнопка **Pause**), подождать пока сертификат станет Active, затем снять паузу.

#### 3. Custom domain в проекте Pages

- **Workers & Pages** → выбери проект (например **memento-webapp**) → **Custom domains**.
- Домен **memento-app.online** должен быть в списке и в статусе **Active**. Если домен только что добавлен, подожди несколько минут.

#### 4. Где добавлен домен: зона Cloudflare или только в Pages

- Если домен **полностью на Cloudflare** (ты менял NS у регистратора на Cloudflare) — пункты 1 и 2 делаются в зоне этого домена в Cloudflare.
- Если DNS домена у регистратора (NS не Cloudflare), а в Pages ты только добавил Custom domain — тогда запись CNAME для домена должна быть у регистратора и вести на `memento-webapp.pages.dev`; в этом случае HTTPS для домена будет от регистратора или CDN, и ошибка может быть из-за их настроек. Надёжный вариант — перенести домен в Cloudflare (Add site → поменять NS у регистратора).

После исправления подожди 1–5 минут и открой сайт снова (лучше в режиме инкогнито или с очисткой кэша).

#### 5. Если ошибка везде (ПК, телефон, Telegram) — пошагово

Когда **ERR_SSL_VERSION_OR_CIPHER_MISMATCH** появляется во всех клиентах, причина почти всегда в том, что для домена **нет активного Edge-сертификата** у Cloudflare. Сделай по порядку:

**Шаг A. Статус сертификата**  
- Зона **memento-app.online** → **SSL/TLS** → **Edge Certificates**.  
- Найди **Universal SSL**. Если **Status** не **Active** (например Pending, Initializing, или ошибка) — переходи к шагу B.  
- Если Active, проверь **SSL/TLS** → **Overview**: режим должен быть **Automatic** или **Full (Strict)** (не Full и не Off). Нажми **Save**, если менял.

**Шаг B. Total TLS** — платная опция; если нет — пропусти.

**Шаг C. Перевыпуск Universal SSL (бесплатно)**  
- В той же зоне: **SSL/TLS** → **Edge Certificates**.  
- Если есть кнопка или опция **Disable Universal SSL** — выключи, подожди 1–2 минуты, затем снова **Enable Universal SSL**. Так можно форсировать новую выдачу сертификата.  
- Либо **Overview** → кнопка **Pause Cloudflare** (все трафик перестаёт идти через Cloudflare). Подожди 30–60 минут, зайди снова в **Edge Certificates** и проверь статус Universal. Если стал **Active** — нажми **Unpause**. Если всё ещё Pending — можно подождать до 24 часов с момента первого добавления домена.

**Шаг E. Минимальная версия TLS**  
- **SSL/TLS** → **Edge Certificates** → **Minimum TLS Version**.  
- Поставь **TLS 1.2** (не 1.3), сохрани. Через пару минут проверь сайт снова.

**Шаг F. Перевыпуск привязки домена к Pages**  
- **Workers & Pages** → проект **memento-webapp** → **Custom domains**.  
- Удали домен **memento-app.online** из списка. Подожди 2–3 минуты.  
- Снова нажми **Set up a custom domain** и добавь **memento-app.online**. Дождись статуса **Active** и **SSL enabled**.  
- В зоне **memento-app.online** в **DNS** убедись, что запись для корня (CNAME на `memento-webapp.pages.dev`) есть и с **Proxied** (оранжевое облако).  
- Подожди 5–10 минут и открой https://memento-app.online.

**Вариант через www (бесплатно):** Universal SSL надёжно покрывает поддомен **www**. В **DNS** измени запись для **www**: вместо A на 95.163.244.138 сделай **CNAME** → **memento-webapp.pages.dev** с **Proxied**. В **Pages** → **Custom domains** добавь **www.memento-app.online**. В боте укажи URL **https://www.memento-app.online** — часто этот адрес начинает работать, когда apex «висит» в Pending.

**Временный обходной путь:** пока свой домен не открывается, в настройках бота в BotFather укажи URL **https://memento-webapp.pages.dev** — приложение будет работать без ошибки SSL. Когда memento-app.online (или www) заработает, смени URL обратно.

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
