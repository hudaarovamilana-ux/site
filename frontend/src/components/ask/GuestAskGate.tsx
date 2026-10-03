import Link from "next/link";

const HEALTH_QUOTE =
  "Помните: не бывает глупых вопросов о здоровье. Бывают ситуации, которых можно было бы избежать, если бы вопрос был задан вовремя.";

export function GuestAskGate() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-medium text-ink mb-2">Спросить ИИ</h1>
      <p className="text-sm text-ink-muted mb-6">
        Вопросы к информационной системе доступны после входа. Это не консультация врача.
      </p>
      <div className="glass-card rounded-2xl p-6 mb-6 space-y-4">
        <p className="text-sm text-ink-soft leading-relaxed">
          Зарегистрируйтесь или войдите, чтобы задавать вопросы.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login?next=/ask"
            className="rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream hover:bg-ink/90 transition"
          >
            Войти
          </Link>
          <Link
            href="/onboarding"
            className="rounded-full border border-beige-dark px-8 py-3 text-sm font-medium text-ink hover:bg-white/80 transition"
          >
            Создать аккаунт
          </Link>
        </div>
      </div>
      <blockquote className="rounded-2xl border border-rose/20 bg-rose-pale/50 px-5 py-4">
        <p className="text-sm text-ink-soft leading-relaxed italic">{HEALTH_QUOTE}</p>
      </blockquote>
    </div>
  );
}
