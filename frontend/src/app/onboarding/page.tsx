"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { STATUS_OPTIONS, type UserStatus } from "@/lib/types";
import { clearPersonalData } from "@/lib/user-storage";
import { FlowerDecor } from "@/components/landing/FlowerDecor";

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<UserStatus | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    if (typeof window !== "undefined") {
      clearPersonalData();
      localStorage.setItem("user_status", selected);
    }
    router.push(`/onboarding/${selected}`);
  };

  return (
    <div className="hero-gradient min-h-[80vh] relative overflow-hidden">
      <div className="absolute right-10 top-20 opacity-30 hidden lg:block">
        <FlowerDecor className="w-28 h-36" />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.25em] text-ink-muted mb-4 text-center">
          Шаг 1 из 2
        </p>
        <h1 className="text-3xl md:text-4xl font-medium text-ink text-center mb-4 text-balance">
          Выберите свой статус
        </h1>
        <p className="text-center text-ink-soft mb-12 max-w-lg mx-auto">
          Мы настроим интерфейс, напоминания и чеклисты под вашу ситуацию
        </p>

        <div className="space-y-4">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              className={`w-full text-left rounded-2xl border p-6 transition-all ${
                selected === option.id
                  ? "border-ink bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                  : "border-beige-dark/60 bg-white/60 hover:border-rose/40 hover:bg-white/80"
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{option.emoji}</span>
                <div>
                  <h3 className="font-medium text-ink">{option.title}</h3>
                  <p className="text-sm text-ink-muted mt-1">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-medium text-cream transition hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Продолжить
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-beige-dark px-8 py-4 text-sm text-ink-soft hover:bg-white/60 transition"
          >
            У меня уже есть аккаунт
          </Link>
        </div>
      </div>
    </div>
  );
}
