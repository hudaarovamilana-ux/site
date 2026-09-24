"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, Circle } from "lucide-react";
import {
  getGuestCabinetPreview,
  type CabinetPreview,
} from "@/lib/cabinet-preview";
import { buildWeeklyPlan, type PlanTask } from "@/lib/weekly-plan";
import { getStatusTitle, getUserName, getUserStatus, isUserLoggedIn } from "@/lib/user-storage";
import type { UserStatus } from "@/lib/types";

function encouragementMessage(pct: number, done: number): string {
  if (done === 0) return "Начните с первого пункта — вы справитесь!";
  if (pct >= 100) return "Неделя закрыта — вы молодец!";
  if (pct >= 67) return "Почти всё — финишная прямая!";
  if (pct >= 34) return "Так держать!";
  return "Хорошее начало — продолжайте!";
}

function PreviewActionList({
  actions,
  loggedIn,
}: {
  actions: CabinetPreview["actions"];
  loggedIn: boolean;
}) {
  const visible = actions.slice(0, 4);
  const rest = actions.length - visible.length;

  return (
    <ul className="space-y-2.5">
      {visible.map((action) => (
        <li key={action.label}>
          {loggedIn ? (
            <Link
              href={action.href}
              className="group flex items-start gap-2.5 text-sm text-ink-soft leading-snug transition hover:text-ink"
            >
              <Circle className="mt-1.5 h-2 w-2 shrink-0 fill-rose/40 text-rose/40" />
              <span>{action.label}</span>
            </Link>
          ) : (
            <span className="flex items-start gap-2.5 text-sm text-ink-soft leading-snug">
              <Circle className="mt-1.5 h-2 w-2 shrink-0 fill-rose/40 text-rose/40" />
              <span>{action.label}</span>
            </span>
          )}
        </li>
      ))}
      {rest > 0 && loggedIn && (
        <li>
          <Link
            href={actions[0]?.href ?? "/dashboard"}
            className="text-xs text-ink-muted underline-offset-2 hover:text-ink hover:underline"
          >
            + ещё {rest} в чеклисте
          </Link>
        </li>
      )}
    </ul>
  );
}

function PlanTaskRow({ task }: { task: PlanTask }) {
  return (
    <li
      className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition ${
        task.done ? "bg-emerald-50/60" : "hover:bg-white/60"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          task.done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-beige-dark bg-white"
        }`}
      >
        {task.done ? (
          <Check className="h-3 w-3" />
        ) : (
          <Circle className="h-2 w-2 fill-rose/30 text-rose/30" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-snug ${
            task.done ? "font-medium text-ink-muted line-through" : "text-ink"
          }`}
        >
          {task.title}
        </p>
        {task.subtitle && !task.done && (
          <p className="mt-0.5 text-xs text-ink-muted leading-relaxed">{task.subtitle}</p>
        )}
      </div>
    </li>
  );
}

function PlanSection({
  title,
  tasks,
  emptyText,
}: {
  title: string;
  tasks: PlanTask[];
  emptyText: string;
}) {
  if (tasks.length === 0) {
    return (
      <div>
        <h3 className="mb-3 text-xs uppercase tracking-[0.15em] text-ink-muted">{title}</h3>
        <p className="rounded-xl border border-dashed border-beige-dark/40 px-4 py-5 text-center text-sm text-ink-muted">
          {emptyText}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-xs uppercase tracking-[0.15em] text-ink-muted">{title}</h3>
      <ul className="space-y-1">
        {tasks.map((task) => (
          <PlanTaskRow key={task.id} task={task} />
        ))}
      </ul>
    </div>
  );
}

function WeeklyPlanCard({
  name,
  status,
}: {
  name: string;
  status: UserStatus;
}) {
  const pathname = usePathname();
  const [plan, setPlan] = useState<ReturnType<typeof buildWeeklyPlan> | null>(null);

  const refresh = useCallback(() => {
    setPlan(buildWeeklyPlan(getUserStatus(), undefined, undefined, getUserName()));
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener("zk-checklist-progress", onChange);
    window.addEventListener("focus", onChange);
    return () => {
      window.removeEventListener("zk-checklist-progress", onChange);
      window.removeEventListener("focus", onChange);
    };
  }, [refresh]);

  if (!plan) {
    return (
      <div className="glass-card animate-pulse rounded-[2rem] p-8 md:p-10">
        <div className="mb-6 h-6 w-48 rounded bg-beige" />
        <div className="mb-4 h-3 w-full rounded-full bg-beige/80" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-32 rounded-xl bg-beige/60" />
          <div className="h-32 rounded-xl bg-beige/60" />
        </div>
      </div>
    );
  }

  const pct =
    plan.progress.total > 0
      ? Math.round((plan.progress.done / plan.progress.total) * 100)
      : 0;
  const cheer = encouragementMessage(pct, plan.progress.done);
  const statusTitle = getStatusTitle(status);
  const greeting = name || "Ваш профиль";

  return (
    <div className="relative glass-card rounded-[2rem] p-8 md:p-10 lg:p-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-muted mb-2">
            Ваш план на неделю
          </p>
          <h2 className="text-2xl font-medium text-ink md:text-3xl">{greeting}</h2>
          <p className="mt-1 text-sm text-ink-soft">{plan.contextLine}</p>
        </div>
        <span className="shrink-0 self-start rounded-full bg-rose-pale px-4 py-1.5 text-xs font-medium text-rose-muted">
          {statusTitle}
        </span>
      </div>

      <div className="mb-8 rounded-2xl border border-beige-dark/30 bg-cream/80 p-5 md:p-6">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">Прогресс на неделе</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {plan.progress.done} из {plan.progress.total} выполнено
            </p>
          </div>
          <p className="text-3xl font-semibold tabular-nums text-rose-muted">{pct}%</p>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-beige-dark/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose/70 to-rose-muted transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-4 text-sm font-medium text-ink">{cheer}</p>
      </div>

      <div className="mb-8 grid gap-8 md:grid-cols-2">
        <PlanSection
          title="Сегодня"
          tasks={plan.today}
          emptyText="На сегодня всё сделано — отлично!"
        />
        <PlanSection
          title="На этой неделе"
          tasks={plan.week}
          emptyText="На этой неделе всё выполнено!"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={plan.checklistHref}
          className="text-sm text-ink-muted underline-offset-2 transition hover:text-ink hover:underline"
        >
          Открыть полный чеклист
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-3.5 text-sm font-medium text-cream transition hover:bg-ink/90"
        >
          Перейти в кабинет
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function ProfilePreviewCard() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<UserStatus>("not_pregnant");
  const [preview, setPreview] = useState<CabinetPreview>(getGuestCabinetPreview());

  const refreshPreview = useCallback(() => {
    const in_ = isUserLoggedIn();
    setLoggedIn(in_);
    if (!in_) {
      setPreview(getGuestCabinetPreview());
      return;
    }
    setStatus(getUserStatus());
    setName(getUserName());
  }, []);

  useEffect(() => {
    refreshPreview();
  }, [pathname, refreshPreview]);

  useEffect(() => {
    const onFocus = () => refreshPreview();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshPreview]);

  if (loggedIn) {
    return <WeeklyPlanCard name={name} status={status} />;
  }

  return (
    <div className="relative glass-card rounded-[2rem] p-8 md:p-10 lg:p-12">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.15em] text-ink-muted">
          Персональный кабинет
        </span>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-beige-dark/30 bg-cream/80 p-5 md:p-6">
          <p className="mb-1 text-xs uppercase tracking-wider text-ink-muted">
            {preview.headline}
          </p>
          {preview.subline && (
            <p className="mb-4 text-sm text-ink-soft leading-relaxed">{preview.subline}</p>
          )}
          <PreviewActionList actions={preview.actions} loggedIn={false} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-beige-dark/20 bg-white/60 p-4">
            <p className="mb-1 text-xs text-ink-muted">{preview.statPrimary.label}</p>
            <p className="text-sm font-medium">{preview.statPrimary.value}</p>
          </div>
          <Link
            href="/onboarding"
            className="rounded-2xl border border-beige-dark/20 bg-white/60 p-4 transition hover:bg-white"
          >
            <p className="mb-1 text-xs text-ink-muted">{preview.statSecondary.label}</p>
            <p className="text-sm font-medium">{preview.statSecondary.value}</p>
          </Link>
        </div>

        <Link
          href="/onboarding"
          className="flex items-center justify-between rounded-2xl border border-rose/20 bg-blush/40 p-4 text-sm text-ink-soft transition hover:bg-blush/60"
        >
          Выбрать статус и получить свой план
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
