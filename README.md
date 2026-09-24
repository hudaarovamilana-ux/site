# Женская консультация — сайт

Полноценный веб-сервис на базе Telegram-бота.

## Структура

```
сайт/
├── frontend/          # Next.js 15 — сайт
├── api_server.py      # FastAPI — REST API
├── main.py            # Telegram-бот (Railway)
├── weeks_data.py      # Контент по неделям
├── trimester_checklist.py
└── database.py        # SQLite бота (миграция на PostgreSQL — в процессе)
```

## Локальный запуск

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Откройте http://localhost:3000

### API
```bash
pip install -r requirements.txt
uvicorn api_server:app --reload --port 8000
```

### Бот
```bash
# .env: BOT_TOKEN, DEEPSEEK_API_KEY
python main.py
```

## Railway (сайт)

Подробная инструкция: **[frontend/DEPLOY.md](frontend/DEPLOY.md)**

Кратко:
1. GitHub → Railway → **Root Directory: `frontend`**
2. Variables: не требуются
3. **Generate Domain** → готово

Сборка через `Dockerfile` + healthcheck `/api/health`.

### Все сервисы (опционально)

| # | Сервис | Root Directory | Команда |
|---|--------|----------------|---------|
| 1 | **Сайт** | `frontend` | Dockerfile (авто) |
| 2 | API | `/` (корень) | `uvicorn api_server:app --host 0.0.0.0 --port $PORT` |
| 3 | Бот | `/` (корень) | `python main.py` |

Переменные окружения (API/бот):
- `DATABASE_URL` — PostgreSQL
- `BOT_TOKEN`, `DEEPSEEK_API_KEY`
- `CORS_ORIGINS` — URL фронтенда (например `https://ваш-сайт.up.railway.app`)
- `JWT_SECRET` — для авторизации

## Что уже есть на сайте

- Лендинг с эффектом размытия «Женская консультация»
- Выбор статуса: беременна / не беременна / планирую
- Личный кабинет: неделя, чеклисты, шевеления, профилактика
- Профиль + силуэт + оценка здоровья ИИ
- FAQ, статьи, тарифы
- Вопросы (ИИ / гинеколог)

## Следующие шаги

- [ ] PostgreSQL + авторизация email/пароль
- [ ] Синхронизация с Telegram-ботом
- [ ] Stripe/ЮKassa для подписки $5/мес
- [x] Контент недель на сайте (`/dashboard/pregnancy`, 1–41 неделя, без дублей заголовков)
- [ ] 2 и 3 триместр в чеклистах
