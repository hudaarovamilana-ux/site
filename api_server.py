"""
REST API для сайта «Женская консультация».
Переиспользует логику и данные Telegram-бота.
"""

from __future__ import annotations

import os
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from pregnancy_math import from_due_date, from_lmp, parse_dd_mm_yyyy
from trimester_checklist import FIRST_TRIMESTER_ITEMS, FIRST_TRIMESTER_LAB_TESTS

app = FastAPI(title="Женская консультация API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PregnancyCalcRequest(BaseModel):
    source: str  # lmp | conception | due_date | manual
    date: str | None = None
    week: int | None = None
    day: int | None = None


class QuestionRequest(BaseModel):
    user_id: int | None = None
    question: str
    premium: bool = False


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/weeks/{week}")
def get_week_info(week: int):
    try:
        from weeks_data import WEEKS_INFO
    except ImportError:
        raise HTTPException(503, "Данные недель недоступны")

    info = WEEKS_INFO.get(week)
    if not info:
        raise HTTPException(404, f"Неделя {week} не найдена")
    return {"week": week, **info}


@app.post("/api/pregnancy/calculate")
def calculate_pregnancy(body: PregnancyCalcRequest):
    if body.source == "manual":
        if body.week is None:
            raise HTTPException(400, "Укажите неделю")
        return {
            "week": body.week,
            "day": body.day or 0,
            "source": "manual",
        }

    if not body.date:
        raise HTTPException(400, "Укажите дату")

    d = parse_dd_mm_yyyy(body.date)
    if d is None:
        try:
            d = datetime.strptime(body.date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(400, "Неверный формат даты")

    if body.source == "lmp":
        result = from_lmp(d)
    elif body.source == "due_date":
        result = from_due_date(d)
    else:
        from pregnancy_math import from_conception
        result = from_conception(d)

    if result.error:
        raise HTTPException(400, result.error)

    return {
        "week": result.week,
        "day": result.day,
        "total_days": result.total_days,
        "warn_over_40": result.warn_over_40,
        "warn_over_42": result.warn_over_42,
        "source": body.source,
    }


@app.get("/api/checklist/trimester/{trimester}")
def get_trimester_checklist(trimester: int):
    if trimester == 1:
        return {
            "trimester": 1,
            "items": FIRST_TRIMESTER_ITEMS,
            "lab_tests": FIRST_TRIMESTER_LAB_TESTS,
        }
    # TODO: 2 и 3 триместр из бота
    return {"trimester": trimester, "items": [], "lab_tests": []}


@app.post("/api/questions")
async def ask_question(body: QuestionRequest):
    """Бесплатно — ИИ, премиум — очередь к гинекологу."""
    try:
        from ai_assistant import get_ai_answer
    except ImportError:
        raise HTTPException(503, "ИИ-ассистент недоступен")

    ai_answer = await get_ai_answer(body.question, pregnancy_week=None)
    return {
        "answer": ai_answer,
        "source": "expert_queue" if body.premium else "ai",
    }


# --- Auth stubs (реализация в следующей итерации) ---

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@app.post("/api/auth/register")
def register(body: RegisterRequest):
    # TODO: PostgreSQL + bcrypt + JWT
    return {"message": "Регистрация будет подключена к PostgreSQL", "email": body.email}


@app.post("/api/auth/login")
def login(body: LoginRequest):
    # TODO: JWT session
    return {"message": "Авторизация будет подключена", "email": body.email}


@app.post("/api/auth/telegram/link")
def link_telegram():
    # TODO: Telegram Login Widget verification + sync with bot user_id
    return {"message": "Синхронизация с ботом в разработке"}
