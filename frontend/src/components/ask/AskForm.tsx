"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AI_LIMITS } from "@/lib/ai-limits";
import { postJson } from "@/lib/api-client";

const HEALTH_QUOTE =
  "Помните: не бывает глупых вопросов о здоровье. Бывают ситуации, которых можно было бы избежать, если бы вопрос был задан вовремя.";

interface AskFormProps {
  initialQuestion?: string;
}

export function AskForm({ initialQuestion = "" }: AskFormProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (initialQuestion) setQuestion(initialQuestion);
  }, [initialQuestion]);

  useEffect(() => {
    fetch("/api/ai-usage")
      .then((r) => r.json())
      .then((data) => setRemaining(data.ask?.remaining ?? null))
      .catch(() => setRemaining(null));
  }, []);

  const limitReached = remaining === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await postJson<{ answer: string; remaining: number }>("/api/ask", {
        question: question.trim(),
      });
      setAnswer(data.answer);
      setRemaining(data.remaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось получить ответ");
      if (err instanceof Error && err.message.includes("лимит")) {
        setRemaining(0);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-medium text-ink mb-2">Задать вопрос</h1>
      <p className="text-sm text-ink-muted mb-2">
        Задайте вопрос — ИИ даст ориентир, при необходимости направит к врачу
      </p>
      {remaining !== null && (
        <p className="text-xs text-ink-muted mb-6">
          Бесплатно: {remaining} из {AI_LIMITS.ask} вопросов
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          rows={4}
          placeholder="Опишите ваш вопрос..."
          disabled={limitReached}
          className="w-full rounded-xl border border-beige-dark bg-white px-4 py-3 text-sm resize-none disabled:opacity-60"
        />
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button
          type="submit"
          disabled={loading || !question.trim() || limitReached}
          className="rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream hover:bg-ink/90 disabled:opacity-50 transition"
        >
          {loading ? "Отправляем..." : limitReached ? "Лимит исчерпан" : "Отправить"}
        </button>

        {limitReached && (
          <p className="text-sm text-ink-soft pt-2">
            Нужно больше вопросов?{" "}
            <Link href="/pricing" className="underline font-medium text-ink">
              Подключите премиум
            </Link>
          </p>
        )}
      </form>

      {answer && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <p className="text-xs uppercase tracking-wider text-ink-muted mb-2">Ответ</p>
          <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
            {answer}
          </p>
        </div>
      )}

      <blockquote className="rounded-2xl border border-rose/20 bg-rose-pale/50 px-5 py-4">
        <p className="text-sm text-ink-soft leading-relaxed italic">{HEALTH_QUOTE}</p>
      </blockquote>
    </div>
  );
}
