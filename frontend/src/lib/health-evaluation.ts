import type { HealthProfile, LabTests } from "@/lib/user-storage";
import { emptyLabTests } from "@/lib/user-storage";

export interface HealthEvaluation {
  allExcellent: boolean;
  messages: string[];
  recommendations: string[];
}

const MONTHS_OVERDUE = 12;

function monthsSince(isoDate: string): number | null {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  return (
    (now.getFullYear() - d.getFullYear()) * 12 +
    (now.getMonth() - d.getMonth())
  );
}

function isVisitOverdue(isoDate: string | undefined, never: boolean | undefined): boolean {
  if (never) return true;
  if (!isoDate) return true;
  const months = monthsSince(isoDate);
  return months === null || months >= MONTHS_OVERDUE;
}

const LAB_RECOMMENDATIONS: { key: keyof LabTests; text: string }[] = [
  { key: "blood_general", text: "общий анализ крови" },
  { key: "urine_general", text: "общий анализ мочи" },
  { key: "biochemistry", text: "биохимию крови" },
  { key: "iron_ferritin", text: "ферритин и железо" },
  { key: "vitamin_d", text: "витамин D" },
  { key: "hormones", text: "гормоны" },
  { key: "pap_test", text: "ПАП-тест" },
  { key: "hpv", text: "ВПЧ" },
];

export function evaluateHealthProfile(profile: HealthProfile): HealthEvaluation {
  const messages: string[] = [];
  const recommendations: string[] = [];

  const gynOverdue = isVisitOverdue(profile.lastGynVisit, profile.neverGynVisit);
  if (gynOverdue) {
    messages.push("Вы давно не проходили осмотр у гинеколога!");
  }

  const therapistOverdue = isVisitOverdue(
    profile.lastTherapistVisit,
    profile.neverTherapistVisit
  );
  if (therapistOverdue) {
    recommendations.push("рекомендуем записаться к терапевту для профилактического осмотра");
  }

  const labTests: LabTests = profile.labTests ?? emptyLabTests();
  const missingLabs = LAB_RECOMMENDATIONS.filter(({ key }) => !labTests[key]);

  if (missingLabs.length > 0) {
    const labList = missingLabs.map(({ text }) => text).join(", ");
    recommendations.push(`рекомендуем проверить: ${labList}`);
  }

  const allExcellent =
    !gynOverdue &&
    !therapistOverdue &&
    missingLabs.length === 0;

  if (allExcellent) {
    messages.unshift("Вы следите за здоровьем — всё отлично.");
  }

  return { allExcellent, messages, recommendations };
}

export const HIPPOCRATES_QUOTE =
  "Болезнь легче предупредить, чем лечить.";
