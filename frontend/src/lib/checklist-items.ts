import { PLANNING_CHECKLIST, PREVENTIVE_CHECKLIST } from "@/lib/preventive-checklist";
import { PLANNING_CHECKLIST_SECTIONS } from "@/lib/planning-checklist";

export interface ChecklistItemDef {
  id: string;
  label: string;
  description?: string;
}

export const PREVENTIVE_ITEMS: ChecklistItemDef[] = PREVENTIVE_CHECKLIST.map((item) => ({
  id: `preventive:${item.id}`,
  label: item.title,
  description: item.description,
}));

export const PLANNING_DOCTOR_ITEMS: ChecklistItemDef[] =
  PLANNING_CHECKLIST_SECTIONS.find((s) => s.id === "doctors_required")?.items.map((item) => ({
    id: `planning:${item.id}`,
    label: item.title.split(" — ")[0] ?? item.title,
  })) ?? [];

export const PLANNING_EXAM_ITEMS: ChecklistItemDef[] = PLANNING_CHECKLIST.map((item) => ({
  id: `planning:${item.id}`,
  label: item.title,
  description: item.description,
}));

/** Скрининг 1 триместра: 11–13 неделя */
export function isScreening1Window(week: number): boolean {
  return week >= 11 && week <= 13;
}

/** Скрининг 2 триместра: 18–21 неделя */
export function isScreening2Window(week: number): boolean {
  return week >= 18 && week <= 21;
}

/** Скрининг 3 триместра: 30–34 неделя (по показаниям) */
export function isScreening3Window(week: number): boolean {
  return week >= 30 && week <= 34;
}

export function getPregnantChecklistItems(week: number): ChecklistItemDef[] {
  const items: ChecklistItemDef[] = [{ id: "preg:obgyn", label: "Акушер-гинеколог" }];

  if (isScreening1Window(week)) {
    items.push({ id: "preg:screening_1", label: "Скрининг 1 триместра" });
  }

  if (isScreening2Window(week)) {
    items.push({ id: "preg:screening_2", label: "Скрининг 2 триместра" });
  }

  if (isScreening3Window(week)) {
    items.push({
      id: "preg:screening_3",
      label: "Скрининг 3 триместра (по показаниям)",
    });
  }

  if (week <= 13) {
    items.push(
      { id: "preg:blood", label: "Общий анализ крови" },
      { id: "preg:urine", label: "Общий анализ мочи" }
    );
  } else if (week <= 27) {
    if (week >= 24 && week <= 28) {
      items.push({
        id: "preg:gtt",
        label: "Глюкозотолерантный тест",
        description: "Обычно на 24–28 неделе",
      });
    }
    items.push(
      { id: "preg:blood", label: "Общий анализ крови" },
      { id: "preg:urine", label: "Общий анализ мочи" }
    );
  } else {
    items.push(
      { id: "preg:blood", label: "Контроль анализа крови" },
      { id: "preg:urine", label: "Контроль анализа мочи" },
      { id: "preg:ctg", label: "КТГ плода", description: "По назначению врача" }
    );
  }

  return items;
}

export function trimesterTitle(week: number): string {
  if (week <= 13) return "Чеклист 1 триместра";
  if (week <= 27) return "Чеклист 2 триместра";
  return "Чеклист 3 триместра";
}
