"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WeekContent } from "@/components/pregnancy/WeekContent";
import { getUserStatus, loadOnboardingData } from "@/lib/user-storage";
import {
  clampWeek,
  getWeekInfo,
  MAX_PREGNANCY_WEEK,
  MIN_PREGNANCY_WEEK,
} from "@/lib/weeks-data";
import {
  formatPregnancyTermLabel,
  getPregnancyTerm,
  type PregnancyTerm,
} from "@/lib/pregnancy-term";

export default function PregnancyWeekPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [term, setTerm] = useState<PregnancyTerm | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    setAllowed(getUserStatus() === "pregnant");
    const t = getPregnancyTerm(loadOnboardingData());
    setTerm(t);
    if (t) setSelectedWeek(clampWeek(t.week));
  }, []);

  const weekInfo = useMemo(() => getWeekInfo(selectedWeek), [selectedWeek]);
  const isCurrentWeek = term ? selectedWeek === term.week : false;

  if (allowed === null) return null;

  if (!allowed) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-medium text-ink mb-4">Моя неделя</h1>
        <p className="text-sm text-ink-soft mb-4">
          Этот раздел доступен при статусе «Беременна».
        </p>
        <Link href="/dashboard" className="text-sm underline text-ink">
          Вернуться в кабинет
        </Link>
      </div>
    );
  }

  if (!term) {
    return (
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-muted mb-1">Ваша неделя</p>
        <h1 className="text-2xl font-medium text-ink mb-6">Беременность</h1>

        <div className="glass-card rounded-2xl p-6 mb-6 space-y-6">
          <p className="text-sm text-ink-muted">
            Укажите срок беременности, чтобы видеть информацию по неделям.
          </p>
          <Link
            href="/onboarding/pregnant"
            className="inline-block rounded-full bg-ink px-6 py-3 text-sm text-cream"
          >
            Указать срок
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-ink-muted mb-1">Ваша неделя</p>
      <h1 className="text-2xl font-medium text-ink mb-2">
        {formatPregnancyTermLabel(term.week, term.day)}
      </h1>
      {term.dueDateLabel && (
        <p className="text-sm text-ink-muted mb-6">
          Предполагаемая дата родов: {term.dueDateLabel}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          disabled={selectedWeek <= MIN_PREGNANCY_WEEK}
          onClick={() => setSelectedWeek((w) => clampWeek(w - 1))}
          className="inline-flex items-center gap-1 rounded-xl border border-beige-dark/50 bg-white/70 px-3 py-2 text-sm text-ink-soft hover:bg-white disabled:opacity-40 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Назад
        </button>

        <div className="text-center min-w-0">
          <p className="text-lg font-medium text-ink">
            {selectedWeek} неделя
            {isCurrentWeek && (
              <span className="ml-2 text-xs font-normal text-rose-muted">сейчас</span>
            )}
          </p>
          {term.week !== selectedWeek && (
            <button
              type="button"
              onClick={() => setSelectedWeek(term.week)}
              className="text-xs text-ink-muted underline mt-0.5"
            >
              К моей неделе ({term.week})
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={selectedWeek >= MAX_PREGNANCY_WEEK}
          onClick={() => setSelectedWeek((w) => clampWeek(w + 1))}
          className="inline-flex items-center gap-1 rounded-xl border border-beige-dark/50 bg-white/70 px-3 py-2 text-sm text-ink-soft hover:bg-white disabled:opacity-40 transition"
        >
          Вперёд
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {weekInfo ? (
        <WeekContent weekInfo={weekInfo} />
      ) : (
        <p className="text-sm text-ink-muted">Нет данных для этой недели.</p>
      )}

      <div className="mt-8 pt-6 border-t border-beige-dark/40">
        <Link href="/onboarding/pregnant" className="text-sm underline text-ink-muted">
          Изменить срок беременности
        </Link>
      </div>
    </div>
  );
}
