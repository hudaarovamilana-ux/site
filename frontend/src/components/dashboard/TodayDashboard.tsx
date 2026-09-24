"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Baby,
  Calendar,
  Check,
  Circle,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  MessageCircle,
  User,
} from "lucide-react";
import { toggleChecklistDone } from "@/lib/checklist-progress";
import { buildWeeklyPlan, type PlanTask, type PlanTaskKind } from "@/lib/weekly-plan";
import { getUserName, getUserStatus } from "@/lib/user-storage";

const KIND_META: Record<
  PlanTaskKind,
  { icon: typeof Calendar; label: string }
> = {
  visit: { icon: HeartPulse, label: "Визит" },
  test: { icon: FlaskConical, label: "Анализ" },
  info: { icon: Baby, label: "Неделя" },
  profile: { icon: User, label: "Профиль" },
  habit: { icon: Calendar, label: "Привычка" },
};

function TaskRow({
  task,
  onToggle,
}: {
  task: PlanTask;
  onToggle: (id: string) => void;
}) {
  const meta = KIND_META[task.kind];
  const Icon = meta.icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-4 transition ${
        task.done
          ? "border-emerald-200/60 bg-emerald-50/40"
          : "border-beige-dark/40 bg-white/70 hover:bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? "Отметить как не сделано" : "Отметить как сделано"}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
          task.done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-beige-dark bg-white text-transparent hover:border-rose/50"
        }`}
      >
        <Check className="h-3.5 w-3.5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-muted">
            <Icon className="h-3 w-3" />
            {meta.label}
          </span>
        </div>
        <p
          className={`text-sm font-medium leading-snug ${
            task.done ? "text-ink-muted line-through" : "text-ink"
          }`}
        >
          {task.title}
        </p>
        {task.subtitle && (
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{task.subtitle}</p>
        )}
        {!task.done && (
          <Link
            href={task.href}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-rose-muted hover:text-ink"
          >
            Перейти
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

function TaskSection({
  title,
  hint,
  tasks,
  onToggle,
  emptyText,
}: {
  title: string;
  hint: string;
  tasks: PlanTask[];
  onToggle: (id: string) => void;
  emptyText: string;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-base font-medium text-ink">{title}</h2>
        <p className="text-xs text-ink-muted mt-0.5">{hint}</p>
      </div>
      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-beige-dark/50 bg-cream/50 px-5 py-6 text-center">
          <p className="text-sm text-ink-soft">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={onToggle} />
          ))}
        </div>
      )}
    </section>
  );
}

export function TodayDashboard() {
  const [plan, setPlan] = useState<ReturnType<typeof buildWeeklyPlan> | null>(null);

  const refresh = useCallback(() => {
    setPlan(
      buildWeeklyPlan(getUserStatus(), undefined, undefined, getUserName())
    );
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("zk-checklist-progress", onChange);
    window.addEventListener("focus", onChange);
    return () => {
      window.removeEventListener("zk-checklist-progress", onChange);
      window.removeEventListener("focus", onChange);
    };
  }, [refresh]);

  const handleToggle = (id: string) => {
    toggleChecklistDone(id);
    refresh();
  };

  if (!plan) {
    return (
      <div className="max-w-2xl animate-pulse space-y-6">
        <div className="h-8 w-48 rounded-lg bg-beige" />
        <div className="h-24 rounded-2xl bg-beige/80" />
        <div className="space-y-3">
          <div className="h-20 rounded-2xl bg-beige/60" />
          <div className="h-20 rounded-2xl bg-beige/60" />
        </div>
      </div>
    );
  }

  const progressPct =
    plan.progress.total > 0
      ? Math.round((plan.progress.done / plan.progress.total) * 100)
      : 0;

  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-muted mb-2">
          Сегодня · Эта неделя
        </p>
        <h1 className="text-2xl md:text-3xl font-medium text-ink mb-2">{plan.greeting}</h1>
        <p className="text-sm text-ink-soft">{plan.contextLine}</p>
        {plan.focusLine && (
          <p className="text-sm text-ink-muted mt-1">{plan.focusLine}</p>
        )}
      </header>

      <div className="glass-card rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <p className="text-sm font-medium text-ink">Прогресс на неделе</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {plan.progress.done} из {plan.progress.total} выполнено
            </p>
          </div>
          <span className="text-lg font-medium text-rose-muted">{progressPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-beige overflow-hidden">
          <div
            className="h-full rounded-full bg-rose-muted transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <Link
          href={plan.checklistHref}
          className="mt-4 inline-flex items-center gap-2 text-xs text-ink-muted hover:text-ink"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Открыть полный чеклист
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-10">
        <TaskSection
          title="Сегодня"
          hint="Самое важное — сделайте в первую очередь"
          tasks={plan.today}
          onToggle={handleToggle}
          emptyText="На сегодня всё сделано — отлично!"
        />

        <TaskSection
          title="На этой неделе"
          hint="Запланируйте и отметьте по мере прохождения"
          tasks={plan.week}
          onToggle={handleToggle}
          emptyText="На этой неделе дополнительных задач нет."
        />
      </div>

      <div className="mt-10 pt-8 border-t border-beige-dark/40">
        <p className="text-xs uppercase tracking-wider text-ink-muted mb-3">Ещё</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/ask"
            className="inline-flex items-center gap-2 rounded-full border border-beige-dark/50 bg-white/60 px-4 py-2 text-xs text-ink-soft hover:bg-white transition"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Задать вопрос
          </Link>
          <Link
            href="/dashboard/trust-chat"
            className="inline-flex items-center gap-2 rounded-full border border-beige-dark/50 bg-white/60 px-4 py-2 text-xs text-ink-soft hover:bg-white transition"
          >
            <Circle className="h-3.5 w-3.5" />
            Чат доверия
          </Link>
        </div>
      </div>
    </div>
  );
}
