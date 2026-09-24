import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContraceptionQuiz } from "@/components/contraception/ContraceptionQuiz";
import { FlowerDecor } from "@/components/landing/FlowerDecor";

export default function ContraceptionTestPage() {
  return (
    <div className="hero-gradient min-h-[85vh] relative overflow-hidden">
      <div className="absolute left-6 bottom-16 hidden lg:block opacity-25">
        <FlowerDecor className="w-24 h-32" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </Link>

        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-ink-muted mb-3">
            Тест · 2 минуты
          </p>
          <h1 className="text-3xl md:text-4xl font-medium text-ink mb-4 text-balance">
            Какой метод контрацепции подходит именно тебе?
          </h1>
          <p className="text-ink-soft leading-relaxed">
            Подберём метод контрацепции за 2 минуты — ответьте на 8 вопросов,
            и мы предложим основной и альтернативный вариант с учётом вашей
            ситуации.
          </p>
        </div>

        <ContraceptionQuiz />
      </div>
    </div>
  );
}
