"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  formatKickRemaining,
  hasDistinctKickTimes,
  KICK_GOAL,
  kickCount,
  kickDayLabel,
  kickSpanLabel,
  kickWindowRemainingMs,
  loadKickLog,
  recordKick,
  type KickSession,
} from "@/lib/kick-session";
import { getUserStatus } from "@/lib/user-storage";

const RING_R = 86;
const RING_C = 2 * Math.PI * RING_R;

function KickMeter({ count, reached }: { count: number; reached: boolean }) {
  const progress = Math.min(count / KICK_GOAL, 1);
  return (
    <div className="relative mx-auto h-52 w-52">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="100" cy="100" r={RING_R} fill="none" stroke="currentColor" strokeWidth="8" className="text-beige-dark" />
        <circle
          cx="100"
          cy="100"
          r={RING_R}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${RING_C} ${RING_C}`}
          strokeDashoffset={RING_C * (1 - progress)}
          className={reached ? "text-emerald-600 transition-[stroke-dashoffset] duration-500" : "text-ink transition-[stroke-dashoffset] duration-500"}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-light tabular-nums text-ink">{count}</span>
        <span className="mt-1 text-xs text-ink-muted">из {KICK_GOAL} за 2 часа</span>
      </div>
    </div>
  );
}

function kickNoun(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "шевеление";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "шевеления";
  return "шевелений";
}

function KickPips({ count }: { count: number }) {
  return (
    <div className="mt-3 flex gap-1" aria-hidden>
      {Array.from({ length: KICK_GOAL }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 flex-1 rounded-full ${index < count ? "bg-ink" : "bg-beige-dark/80"}`}
        />
      ))}
    </div>
  );
}

function SessionCard({
  session,
  now,
  current,
}: {
  session: KickSession;
  now: number;
  current?: boolean;
}) {
  const count = kickCount(session);
  const reached = count >= KICK_GOAL;
  const showTimes = hasDistinctKickTimes(session);
  const times = showTimes ? session.kicks.slice(-8) : [];

  return (
    <article className="rounded-2xl border border-beige-dark/50 bg-white/80 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink">{kickSpanLabel(session)}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {current
              ? `осталось ${formatKickRemaining(kickWindowRemainingMs(session, now))}`
              : `${count} ${kickNoun(count)}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-light tabular-nums text-ink">
            {count}
            <span className="text-xs text-ink-muted">/{KICK_GOAL}</span>
          </p>
          <p className={`text-[11px] uppercase tracking-wider ${reached ? "text-emerald-700" : "text-ink-muted"}`}>
            {current ? "сейчас" : reached ? "цель" : "окно закрыто"}
          </p>
        </div>
      </div>
      <KickPips count={Math.min(count, KICK_GOAL)} />
      {times.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {session.kicks.length > times.length && (
            <li className="rounded-full bg-beige/80 px-2.5 py-1 text-[11px] text-ink-muted">
              +{session.kicks.length - times.length}
            </li>
          )}
          {times.map((ts, index) => (
            <li key={`${session.id}-${ts}-${index}`} className="rounded-full bg-beige/80 px-2.5 py-1 text-[11px] tabular-nums text-ink-soft">
              {new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function KicksPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [active, setActive] = useState<KickSession | null>(null);
  const [history, setHistory] = useState<KickSession[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setAllowed(getUserStatus() === "pregnant");
    const log = loadKickLog();
    setActive(log.active);
    setHistory(log.history);
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      const nextNow = Date.now();
      setNow(nextNow);
      if (kickWindowRemainingMs(active, nextNow) === 0) {
        const log = loadKickLog(nextNow);
        setActive(log.active);
        setHistory(log.history);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const groups = useMemo(() => {
    const rows = history;
    const map = new Map<string, KickSession[]>();
    for (const session of rows) {
      const label = kickDayLabel(session.startedAt, now);
      const bucket = map.get(label) ?? [];
      bucket.push(session);
      map.set(label, bucket);
    }
    return Array.from(map, ([label, sessions]) => ({ label, sessions }));
  }, [history, now]);

  if (allowed === null) return null;

  if (!allowed) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-medium text-ink mb-4">Шевеления плода</h1>
        <p className="text-sm text-ink-soft mb-4">
          Подсчёт шевелений доступен при статусе «Беременна».
        </p>
        <Link href="/dashboard" className="text-sm underline text-ink">
          Вернуться в кабинет
        </Link>
      </div>
    );
  }

  const count = kickCount(active);
  const reached = count >= KICK_GOAL;

  return (
    <div className="mx-auto max-w-lg">
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-ink-muted mb-1">С 28 недели</p>
        <h1 className="text-2xl font-medium text-ink mb-2">Шевеления плода</h1>
        <p className="text-sm text-ink-muted mb-8">Цель — 10 движений за 2 часа. Каждое окно сохраняется в истории.</p>

        <KickMeter count={count} reached={reached} />

        <button
          type="button"
          onClick={() => {
            const log = recordKick();
            setActive(log.active);
            setHistory(log.history);
            setNow(Date.now());
          }}
          className="mt-8 rounded-full bg-ink px-12 py-5 text-sm font-medium text-cream hover:bg-ink/90 transition"
        >
          + Шевеление
        </button>

        <p className="mt-4 text-sm text-ink-muted">
          {active
            ? `До конца окна ${formatKickRemaining(kickWindowRemainingMs(active, now))}`
            : "Нажмите, чтобы начать новое окно"}
        </p>

        {reached && (
          <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
            Отлично! 10 шевелений зафиксировано 🤍
          </p>
        )}
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-ink">История</h2>
          <p className="text-xs text-ink-muted">на этом устройстве</p>
        </div>

        {!active && history.length === 0 ? (
          <div className="rounded-2xl border border-beige-dark/50 bg-white/60 px-5 py-8 text-center">
            <p className="text-sm text-ink-soft">Здесь появятся окна подсчёта и время каждой отметки.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {active && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-ink-muted">Сейчас</p>
                <SessionCard session={active} now={now} current />
              </div>
            )}
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-xs uppercase tracking-wider text-ink-muted">{group.label}</p>
                <div className="space-y-3">
                  {group.sessions.map((session) => (
                    <SessionCard key={session.id} session={session} now={now} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
