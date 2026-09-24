"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, Shield } from "lucide-react";
import { calculateContraceptionMethod } from "@/lib/contraception-engine";
import {
  CONTRACEPTION_QUESTIONS,
  EMPTY_CONTRACEPTION_ANSWERS,
  type QuizAnswerKey,
} from "@/lib/contraception-quiz";
import type { ContraceptionInput, ContraceptionResult } from "@/lib/contraception-engine";

const DRAFT_KEY = "contraception_ask_draft";

function buildAskDraft(result: ContraceptionResult): string {
  const condomNote = result.condom_required
    ? " Также рекомендован презерватив для защиты от инфекций."
    : "";

  return (
    `Прошла тест на подбор контрацепции. Рекомендовали: ${result.primary_method} ` +
    `(альтернатива: ${result.secondary_method}).${condomNote} ` +
    "Хочу уточнить у гинеколога: "
  );
}

export function ContraceptionQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ContraceptionInput>(
    EMPTY_CONTRACEPTION_ANSWERS
  );
  const [finished, setFinished] = useState(false);

  const total = CONTRACEPTION_QUESTIONS.length;
  const question = CONTRACEPTION_QUESTIONS[step];
  const progress = finished ? 100 : ((step + 1) / total) * 100;

  const handleAnswer = (key: QuizAnswerKey, value: ContraceptionInput[QuizAnswerKey]) => {
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);

    if (step < total - 1) {
      setStep(step + 1);
      return;
    }

    setFinished(true);

    if (typeof window !== "undefined") {
      const finalResult = calculateContraceptionMethod(nextAnswers);
      sessionStorage.setItem(DRAFT_KEY, buildAskDraft(finalResult));
    }
  };

  const handleBack = () => {
    if (finished) {
      setFinished(false);
      setStep(total - 1);
      return;
    }
    if (step > 0) setStep(step - 1);
  };

  const handleRestart = () => {
    setAnswers(EMPTY_CONTRACEPTION_ANSWERS);
    setStep(0);
    setFinished(false);
  };

  const result = finished ? calculateContraceptionMethod(answers) : null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="h-1.5 rounded-full bg-beige overflow-hidden">
          <div
            className="h-full rounded-full bg-rose-muted transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink-muted">
          {finished ? "Результат" : `Вопрос ${step + 1} из ${total}`}
        </p>
      </div>

      {finished && result ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-rose/30 bg-rose-pale/40 p-8">
            <div className="inline-flex rounded-2xl bg-white/70 p-3 text-rose-muted mb-5">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-medium text-ink mb-6">
              Ваши рекомендации
            </h2>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white/80 border border-beige-dark/40 p-5">
                <p className="text-xs uppercase tracking-wider text-ink-muted mb-1">
                  Основной метод
                </p>
                <p className="text-lg font-medium text-ink">
                  {result.primary_method}
                </p>
              </div>

              <div className="rounded-2xl bg-white/80 border border-beige-dark/40 p-5">
                <p className="text-xs uppercase tracking-wider text-ink-muted mb-1">
                  Альтернативный метод
                </p>
                <p className="text-lg font-medium text-ink">
                  {result.secondary_method}
                </p>
              </div>

              <div
                className={`rounded-2xl border p-5 ${
                  result.condom_required
                    ? "border-rose/40 bg-blush/50"
                    : "border-beige-dark/40 bg-white/60"
                }`}
              >
                <p className="text-sm text-ink-soft leading-relaxed">
                  {result.condom_required
                    ? "Рекомендуется дополнительно использовать презерватив для защиты от инфекций."
                    : "Дополнительная защита от инфекций не обязательна при стабильном партнёре и наличии тестов."}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            Это ориентир, а не назначение. Окончательный метод контрацепции
            выбирает гинеколог с учётом анамнеза, анализов и ваших
            предпочтений.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-beige-dark px-6 py-3 text-sm text-ink-soft hover:bg-white/70 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Пройти снова
            </button>
            <Link
              href="/ask"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-ink/90 transition"
            >
              Задать вопрос гинекологу
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl md:text-3xl font-medium text-ink mb-8 text-balance">
            {question.text}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={option.label}
                type="button"
                onClick={() => handleAnswer(question.id, option.value as ContraceptionInput[QuizAnswerKey])}
                className="w-full text-left rounded-2xl border border-beige-dark/60 bg-white/70 p-5 transition hover:border-rose/40 hover:bg-white hover:shadow-[0_8px_30px_rgba(232,196,203,0.12)]"
              >
                <span className="text-xs uppercase tracking-wider text-ink-muted mr-3">
                  {index === 0 ? "A" : "Б"}
                </span>
                <span className="text-sm font-medium text-ink">{option.label}</span>
              </button>
            ))}
          </div>

          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="mt-8 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </button>
          )}
        </div>
      )}
    </div>
  );
}
