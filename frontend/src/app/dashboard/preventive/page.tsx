"use client";

import { useEffect, useState } from "react";
import { GentleReminder } from "@/components/ui/GentleReminder";
import { ChecklistItemList } from "@/components/checklist/ChecklistItemList";
import { PREVENTIVE_ITEMS } from "@/lib/checklist-items";
import {
  loadAllChecklistProgress,
} from "@/lib/checklist-progress";
import { intervalLabel, PREVENTIVE_CHECKLIST } from "@/lib/preventive-checklist";

export default function PreventivePage() {
  const [overdueCount, setOverdueCount] = useState(PREVENTIVE_ITEMS.length);

  const refresh = () => {
    const store = loadAllChecklistProgress();
    const overdue = PREVENTIVE_ITEMS.filter((item) => store[item.id] !== "done");
    setOverdueCount(overdue.length);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-medium text-ink mb-2">Профилактика</h1>
      <p className="text-sm text-ink-muted mb-6">
        Чеклисты обследований для женщин, которые не беременны. Отметки синхронизируются с
        разделом «Сегодня».
      </p>

      {overdueCount > 0 && (
        <div className="rounded-2xl border border-rose/30 bg-rose-pale/40 p-5 mb-6">
          <p className="text-sm font-medium text-ink mb-1">Рекомендуем записаться</p>
          <p className="text-xs text-ink-muted">
            {overdueCount} обследований требуют внимания
          </p>
        </div>
      )}

      <ChecklistItemList
        items={PREVENTIVE_ITEMS.map((item, i) => ({
          ...item,
          description: `${PREVENTIVE_CHECKLIST[i]?.description ?? ""} · ${intervalLabel(PREVENTIVE_CHECKLIST[i]?.intervalMonths ?? 12)}`,
        }))}
        onChange={refresh}
      />

      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-medium text-ink mb-3">Куда записаться?</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            className="rounded-xl border border-beige-dark px-4 py-3 text-sm text-left hover:bg-beige/40 transition"
          >
            <span className="font-medium block">Госполиклиника</span>
            <span className="text-xs text-ink-muted">По ОМС</span>
          </button>
          <button
            type="button"
            className="rounded-xl border border-rose/30 bg-rose-pale/30 px-4 py-3 text-sm text-left hover:bg-rose-pale/50 transition"
          >
            <span className="font-medium block">Частная клиника</span>
            <span className="text-xs text-ink-muted">Партнёрская запись</span>
          </button>
        </div>
      </div>

      <GentleReminder />
    </div>
  );
}
