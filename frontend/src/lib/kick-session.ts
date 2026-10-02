const STORAGE_KEY = "zk_kick_session";

/** Окно подсчёта шевелений: 10 движений за 2 часа. */
export const KICK_WINDOW_MS = 2 * 60 * 60 * 1000;
export const KICK_GOAL = 10;
const HISTORY_LIMIT = 40;

export type KickSession = {
  id: string;
  startedAt: number;
  kicks: number[];
};

type KickLog = {
  active: KickSession | null;
  history: KickSession[];
};

function readStore(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

function writeLog(log: KickLog): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

function newId(startedAt: number): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);
  return `k-${startedAt}-${rand}`;
}

function parseSession(value: unknown): KickSession | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as { id?: unknown; startedAt?: unknown; count?: unknown; kicks?: unknown };
  if (typeof raw.startedAt !== "number" || !Number.isFinite(raw.startedAt)) return null;

  let kicks: number[] = [];
  if (Array.isArray(raw.kicks)) {
    kicks = raw.kicks.filter((item): item is number => typeof item === "number" && Number.isFinite(item));
  } else if (typeof raw.count === "number" && raw.count >= 1) {
    const count = Math.min(Math.floor(raw.count), 200);
    kicks = Array.from({ length: count }, () => raw.startedAt as number);
  }
  if (kicks.length < 1) return null;

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : `k-${raw.startedAt}`,
    startedAt: raw.startedAt,
    kicks,
  };
}

function parseLog(raw: string | null): KickLog {
  if (!raw) return { active: null, history: [] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && ("active" in parsed || "history" in parsed)) {
      const log = parsed as { active?: unknown; history?: unknown };
      const history = Array.isArray(log.history)
        ? log.history.map(parseSession).filter((item): item is KickSession => item !== null)
        : [];
      return { active: parseSession(log.active), history: history.slice(0, HISTORY_LIMIT) };
    }
    const legacy = parseSession(parsed);
    return { active: legacy, history: [] };
  } catch {
    return { active: null, history: [] };
  }
}

function archiveIfExpired(log: KickLog, now: number): KickLog {
  if (!log.active) return log;
  if (now - log.active.startedAt < KICK_WINDOW_MS) return log;
  return {
    active: null,
    history: [log.active, ...log.history].slice(0, HISTORY_LIMIT),
  };
}

function settle(now = Date.now()): KickLog {
  const next = archiveIfExpired(parseLog(readStore()), now);
  writeLog(next);
  return next;
}

export function kickCount(session: KickSession | null | undefined): number {
  return session?.kicks.length ?? 0;
}

export function loadKickLog(now = Date.now()): KickLog {
  if (typeof window === "undefined") return { active: null, history: [] };
  return settle(now);
}

export function loadKickSession(now = Date.now()): KickSession | null {
  return loadKickLog(now).active;
}

export function recordKick(now = Date.now()): KickLog {
  const log = settle(now);
  if (log.active) {
    const next: KickLog = {
      ...log,
      active: { ...log.active, kicks: [...log.active.kicks, now] },
    };
    writeLog(next);
    return next;
  }
  const started: KickSession = { id: newId(now), startedAt: now, kicks: [now] };
  const next: KickLog = { active: started, history: log.history };
  writeLog(next);
  return next;
}

export function clearKickSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function kickWindowRemainingMs(session: KickSession, now = Date.now()): number {
  return Math.max(0, KICK_WINDOW_MS - (now - session.startedAt));
}

export function formatKickRemaining(ms: number): string {
  const totalMin = Math.max(1, Math.ceil(ms / 60_000));
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  if (hours > 0 && minutes > 0) return `${hours} ч ${minutes} мин`;
  if (hours > 0) return `${hours} ч`;
  return `${minutes} мин`;
}

export function kickClock(ts: number): string {
  return new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function kickDayLabel(ts: number, now = Date.now()): string {
  const day = new Date(ts);
  day.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Вчера";
  return new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function kickSpanLabel(session: KickSession): string {
  const start = kickClock(session.startedAt);
  const end = kickClock(session.kicks[session.kicks.length - 1] ?? session.startedAt);
  return start === end ? start : `${start}–${end}`;
}

/** Одинаковые метки времени — наследие старого счётчика без журнала. */
export function hasDistinctKickTimes(session: KickSession): boolean {
  return new Set(session.kicks).size > 1 || session.kicks.length === 1;
}
