import type { OnboardingData } from "@/lib/user-storage";
import { formatDDMMYYYY } from "@/lib/date-format";

export interface PregnancyTerm {
  week: number;
  day: number;
  dueDate?: string;
  dueDateLabel?: string;
  source?: string;
}

export function getPregnancyTerm(data: OnboardingData | null): PregnancyTerm | null {
  if (!data?.pregnancyWeek) return null;

  const week = Number(data.pregnancyWeek);
  const day = Number(data.pregnancyDay ?? 0);
  if (Number.isNaN(week)) return null;

  let dueDateLabel: string | undefined;
  if (data.dueDate) {
    const [y, m, d] = data.dueDate.split("-").map(Number);
    if (y && m && d) {
      dueDateLabel = formatDDMMYYYY(new Date(y, m - 1, d));
    }
  }

  return {
    week,
    day: Number.isNaN(day) ? 0 : day,
    dueDate: data.dueDate,
    dueDateLabel,
    source: data.pregnancySource,
  };
}

export function formatPregnancyTermLabel(week: number, day: number): string {
  return `${week} неделя ${day} день`;
}
