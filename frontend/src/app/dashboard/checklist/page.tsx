"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GentleReminder } from "@/components/ui/GentleReminder";
import { ChecklistItemList } from "@/components/checklist/ChecklistItemList";
import { PlanningChecklistView } from "@/components/checklist/PlanningChecklistView";
import { getPregnantChecklistItems, trimesterTitle } from "@/lib/checklist-items";
import { getPregnancyTerm } from "@/lib/pregnancy-term";
import { getUserStatus, loadOnboardingData } from "@/lib/user-storage";
import type { UserStatus } from "@/lib/types";

function BookingBlock() {
  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      <h2 className="text-sm font-medium text-ink mb-3">Записаться на обследование</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          className="rounded-xl border border-beige-dark px-4 py-3 text-sm text-left hover:bg-beige/40 transition"
        >
          <span className="font-medium block">Государственная поликлиника</span>
          <span className="text-xs text-ink-muted">По полису ОМС</span>
        </button>
        <button
          type="button"
          className="rounded-xl border border-rose/30 bg-rose-pale/30 px-4 py-3 text-sm text-left hover:bg-rose-pale/50 transition"
        >
          <span className="font-medium block">Партнёрская клиника</span>
          <span className="text-xs text-ink-muted">Запись онлайн со скидкой</span>
        </button>
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  const [status, setStatus] = useState<UserStatus>("pregnant");
  const [pregnantWeek, setPregnantWeek] = useState<number | null>(null);

  useEffect(() => {
    setStatus(getUserStatus());
    const term = getPregnancyTerm(loadOnboardingData());
    if (term) setPregnantWeek(term.week);
  }, []);

  if (status === "not_pregnant") {
    return (
      <div>
        <h1 className="text-2xl font-medium text-ink mb-2">Чеклисты</h1>
        <p className="text-sm text-ink-muted">
          Этот раздел доступен при статусе «Беременна» или «Планирую беременность».
        </p>
      </div>
    );
  }

  if (status === "planning") {
    return (
      <div>
        <h1 className="text-2xl font-medium text-ink mb-2">Подготовка к беременности</h1>
        <p className="text-sm text-ink-muted mb-6">
          Врачи, обследования и витамины до зачатия. Отметки синхронизируются с разделом
          «Сегодня».
        </p>
        <PlanningChecklistView />
        <BookingBlock />
        <GentleReminder />
      </div>
    );
  }

  const items = pregnantWeek ? getPregnantChecklistItems(pregnantWeek) : [];
  const title = pregnantWeek ? trimesterTitle(pregnantWeek) : "Чеклист беременности";

  return (
    <div>
      <h1 className="text-2xl font-medium text-ink mb-2">{title}</h1>
      <p className="text-sm text-ink-muted mb-6">
        {pregnantWeek
          ? "Нажмите на пункт, чтобы отметить статус. Синхронизируется с разделом «Сегодня»."
          : "Укажите срок беременности в профиле, чтобы увидеть чеклист по триместру."}
      </p>

      {pregnantWeek ? (
        <ChecklistItemList items={items} />
      ) : (
        <p className="text-sm text-ink-soft mb-6">
          <Link href="/onboarding/pregnant" className="underline">
            Указать срок беременности
          </Link>
        </p>
      )}

      <BookingBlock />
      <GentleReminder />
    </div>
  );
}
