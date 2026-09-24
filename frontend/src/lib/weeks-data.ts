import weeksJson from "./weeks-data.json";

export interface WeekSection {
  id: string;
  title: string;
  content: string;
}

export interface WeekInfo {
  week: number;
  sections: WeekSection[];
}

const WEEKS = weeksJson as WeekInfo[];

const weekMap = new Map(WEEKS.map((w) => [w.week, w]));

export const MIN_PREGNANCY_WEEK = 1;
export const MAX_PREGNANCY_WEEK = 41;

export function getWeekInfo(week: number): WeekInfo | null {
  return weekMap.get(week) ?? null;
}

export function getAllWeeks(): WeekInfo[] {
  return WEEKS;
}

export function clampWeek(week: number): number {
  return Math.min(MAX_PREGNANCY_WEEK, Math.max(MIN_PREGNANCY_WEEK, week));
}
