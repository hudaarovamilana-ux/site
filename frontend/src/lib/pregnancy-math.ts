export type PregnancySource = "lmp" | "conception" | "due_date" | "manual";

export interface PregnancyResult {
  week: number;
  day: number;
  totalDays: number;
  error?: string;
  warnOver40?: boolean;
  warnOver42?: boolean;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function applyWarnings(week: number, day: number, totalDays: number): PregnancyResult {
  const warnOver42 = week > 42 || (week === 42 && day > 0);
  const warnOver40 = week > 40 || (week === 40 && day > 0);
  return { week, day, totalDays, warnOver40, warnOver42 };
}

function fromDaysSinceAnchor(days: number): PregnancyResult {
  if (days < 0) {
    return {
      week: 0,
      day: 0,
      totalDays: days,
      error: "Дата не может быть в будущем. Проверьте введённые данные.",
    };
  }
  return applyWarnings(Math.floor(days / 7), days % 7, days);
}

export function fromLmp(lmp: Date, today = new Date()): PregnancyResult {
  return fromDaysSinceAnchor(daysBetween(lmp, today));
}

export function fromConception(conception: Date, today = new Date()): PregnancyResult {
  const embryonicDays = daysBetween(conception, today);
  if (embryonicDays < 0) {
    return {
      week: 0,
      day: 0,
      totalDays: embryonicDays,
      error: "Дата не может быть в будущем. Проверьте введённые данные.",
    };
  }
  return fromDaysSinceAnchor(embryonicDays + 14);
}

export function fromDueDate(edd: Date, today = new Date()): PregnancyResult {
  const daysToBirth = daysBetween(today, edd);
  const passedDays = 280 - daysToBirth;
  if (passedDays < 0) {
    return {
      week: 0,
      day: 0,
      totalDays: passedDays,
      error: "По этой дате родов беременность ещё не наступила (проверьте дату).",
    };
  }
  return applyWarnings(Math.floor(passedDays / 7), passedDays % 7, passedDays);
}

export function fromManualWeekDay(week: number, day: number): PregnancyResult {
  const d = Math.max(0, Math.min(6, day));
  const w = Math.max(0, Math.min(41, week));
  const totalDays = w * 7 + d;
  return applyWarnings(w, d, totalDays);
}

export function approximateDueFromTotalDays(totalDays: number, today = new Date()): Date {
  const edd = new Date(today);
  edd.setDate(edd.getDate() + (280 - totalDays));
  return edd;
}

export const PREGNANCY_SOURCE_LABELS: Record<PregnancySource, string> = {
  lmp: "По дате последней менструации",
  conception: "По дате зачатия",
  due_date: "По предполагаемой дате родов",
  manual: "Знаю неделю и день",
};

export const PREGNANCY_DATE_LABELS: Record<Exclude<PregnancySource, "manual">, string> = {
  lmp: "Дата последней менструации",
  conception: "Дата зачатия",
  due_date: "Предполагаемая дата родов",
};
