# Деплой на Railway

## Быстрый старт (папка `zhenskaya-site` на рабочем столе)

1. Загрузите **содержимое этой папки** на GitHub (корень репозитория).
2. Railway → **New Project** → **Deploy from GitHub**.
3. **Root Directory** — оставьте **пустым**.
4. Добавьте в проект Railway сервис **PostgreSQL** и подключите его к сервису сайта.
5. **Variables** сайта — проверьте и добавьте:
   - `DATABASE_URL` — ссылка на переменную PostgreSQL (обязательно для регистрации и входа)
   - `DEEPSEEK_API_KEY` — ключ API DeepSeek (обязательно для ИИ-функций)
   - `DEEPSEEK_MODEL` — необязательно, по умолчанию `deepseek-chat`
   - `RESEND_API_KEY` — для отправки кода на почту при регистрации ([resend.com](https://resend.com))
   - `RESEND_FROM` — необязательно, например `Женская консультация <onboarding@resend.dev>`
   - `VERIFICATION_SECRET` — случайная длинная строка (безопасность кодов)
6. **Networking → Generate Domain**.

При каждом запуске автоматически выполняется `prisma migrate deploy`, поэтому таблицы
базы данных создаются до старта сайта.

---

## Что внутри

| Файл | Назначение |
|------|------------|
| `Dockerfile` | Production-сборка |
| `railway.toml` | Healthcheck `/api/health` |
| `src/` | Код сайта |
| `package.json` | Зависимости |

**Не загружайте:** `node_modules`, `.next`, `.env.local`

---

## GitHub (PowerShell)

```powershell
cd C:\Users\User\Desktop\zhenskaya-site
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/ИМЯ_РЕПО.git
git push -u origin main
```

Через сайт GitHub: **Add file → Upload files** → перетащите все файлы из `zhenskaya-site`.

---

## Обновить папку после правок в проекте

```powershell
cd C:\Users\User\Desktop\сайт\scripts
powershell -ExecutionPolicy Bypass -File .\pack-for-deploy.ps1
```

Папка `Desktop\zhenskaya-site` пересоберётся автоматически.

---

## Проверка после деплоя

- [ ] Главная открывается
- [ ] `/api/health` → `{"status":"ok"}`
- [ ] Онбординг и кабинет работают
- [ ] Оценка здоровья / «Спросить» / чат доверия отвечают (нужен `DEEPSEEK_API_KEY`)

---

## Ошибка «railpack process exited with an error»

Railway пытается собрать через **Railpack**, а не через Dockerfile. Сделайте так:

1. **Settings → Build → Builder** → выберите **Dockerfile** (не Railpack).
2. Убедитесь, что в **корне репозитория** лежат `Dockerfile`, `railway.toml`, `railway.json`.
3. **Root Directory** — пусто (если загружали папку `zhenskaya-site`). Если весь проект `сайт` — укажите `frontend`.
4. Перезапустите деплой: **Deploy → Redeploy**.

В логах сборки должно быть: `Using Dockerfile` — не `Railpack`.

Если ошибка остаётся — откройте лог и найдите строку **перед** «railpack exited» (там будет реальная причина: `npm ci`, `npm run build` и т.д.).

---

## Если репозиторий = вся папка `сайт` (не только сайт)

Тогда на Railway укажите **Root Directory:** `frontend`
