"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GentleReminder } from "@/components/ui/GentleReminder";
import { SoftPinkLogo } from "@/components/ui/Logo";
import { HIPPOCRATES_QUOTE } from "@/lib/health-evaluation";
import { AI_LIMITS } from "@/lib/ai-limits";
import { postJson } from "@/lib/api-client";
import {
  getUserStatus,
  loadHealthProfile,
  loadOnboardingData,
} from "@/lib/user-storage";

export default function HealthAssessmentPage() {
  const [assessment, setAssessment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/ai-usage")
      .then((r) => r.json())
      .then((data) => setRemaining(data.health?.remaining ?? null))
      .catch(() => setRemaining(null));
  }, []);

  const runAssessment = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await postJson<{ assessment: string; remaining: number }>(
        "/api/health-assessment",
        {
          status: getUserStatus(),
          profile: loadHealthProfile(),
          onboarding: loadOnboardingData(),
        }
      );
      setAssessment(data.assessment);
      setRemaining(data.remaining);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось получить оценку";
      setError(message);
      if (message.includes("использована") || message.includes("лимит")) {
        setRemaining(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const limitReached = remaining === 0;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-medium text-ink mb-2">Оценка здоровья</h1>
      <p className="text-sm text-ink-muted mb-2">
        Персональная оценка на основе вашего профиля с помощью ИИ
      </p>
      {remaining !== null && (
        <p className="text-xs text-ink-muted mb-8">
          Бесплатно: {remaining} из {AI_LIMITS.healthAssessment} оценок
        </p>
      )}
      {remaining === null && <div className="mb-8" />}

      {!assessment ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <SoftPinkLogo size="lg" className="mx-auto mb-6" />
          <p className="text-sm text-ink-soft mb-6">
            Заполните профиль здоровья — так рекомендации будут точнее.
          </p>
          {error && (
            <p className="text-sm text-rose-700 mb-4">{error}</p>
          )}
          <button
            type="button"
            onClick={runAssessment}
            disabled={loading || limitReached}
            className="rounded-full bg-ink px-8 py-4 text-sm font-medium text-cream hover:bg-ink/90 disabled:opacity-50 transition"
          >
            {loading ? "Анализируем..." : limitReached ? "Лимит исчерпан" : "Получить оценку"}
          </button>
          {limitReached && (
            <p className="text-sm text-ink-soft mt-4">
              <Link href="/pricing" className="underline font-medium text-ink">
                Оформите подписку
              </Link>{" "}
              для повторной оценки
            </p>
          )}
          <Link
            href="/dashboard/profile"
            className="block mt-4 text-sm text-ink-muted underline"
          >
            Перейти в профиль
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <SoftPinkLogo size="md" className="shrink-0" />
            <div className="flex-1 text-left">
              <h2 className="text-sm font-medium text-ink mb-2">Ваша оценка</h2>
              <p className="text-xs text-ink-muted italic">{HIPPOCRATES_QUOTE}</p>
            </div>
          </div>

          <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
            {assessment}
          </p>

          {!limitReached && (
            <button
              type="button"
              onClick={runAssessment}
              disabled={loading}
              className="text-sm text-ink-muted underline disabled:opacity-50"
            >
              {loading ? "Обновляем..." : "Обновить оценку"}
            </button>
          )}
        </div>
      )}

      <GentleReminder className="mt-8" />
    </div>
  );
}
