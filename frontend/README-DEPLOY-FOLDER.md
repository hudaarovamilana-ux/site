# Женская консультация — сайт

Готовая папка для загрузки на **GitHub** и деплоя на **Railway**.

## Что делать

1. Загрузите **все файлы из этой папки** в GitHub-репозиторий (корень репо).
2. На [railway.com](https://railway.com): New Project → GitHub → ваш репозиторий.
3. Root Directory — **пусто**.
4. Variables — **не нужны**.
5. Generate Domain — получите ссылку на сайт.

Подробная инструкция: **DEPLOY.md**

## Обновить эту папку

После правок в основном проекте:

```powershell
cd C:\Users\User\Desktop\сайт\scripts
powershell -ExecutionPolicy Bypass -File .\pack-for-deploy.ps1
```

## Локальный запуск

```powershell
npm install
npm run dev
```

Откройте http://localhost:3000
