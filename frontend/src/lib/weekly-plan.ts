import { evaluateHealthProfile } from "@/lib/health-evaluation";
import { isPlanTaskDone } from "@/lib/checklist-progress";
import {
  isScreening1Window,
  isScreening2Window,
  isScreening3Window,
} from "@/lib/checklist-items";
import { PREVENTIVE_CHECKLIST, PLANNING_CHECKLIST } from "@/lib/preventive-checklist";
import { PLANNING_CHECKLIST_SECTIONS } from "@/lib/planning-checklist";
import { formatPregnancyTermLabel, getPregnancyTerm } from "@/lib/pregnancy-term";
import { getWeekInfo } from "@/lib/weeks-data";
import {
  type HealthProfile,
  type OnboardingData,
  getUserStatus,
  loadHealthProfile,
  loadOnboardingData,
} from "@/lib/user-storage";
import type { UserStatus } from "@/lib/types";

export type PlanTaskKind = "visit" | "test" | "info" | "profile" | "habit";

export interface PlanTask {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  priority: "today" | "week";
  kind: PlanTaskKind;
  done: boolean;
}

export interface WeeklyPlan {
  greeting: string;
  contextLine: string;
  focusLine?: string;
  today: PlanTask[];
  week: PlanTask[];
  checklistHref: string;
  progress: { done: number; total: number };
}

function trimesterLabel(week: number): string {
  if (week <= 13) return "1 триместр";
  if (week <= 27) return "2 триместр";
  return "3 триместр";
}

function withDone(tasks: Omit<PlanTask, "done">[]): PlanTask[] {
  return tasks.map((task) => ({ ...task, done: isPlanTaskDone(task.id) }));
}

function uniqueTasks(tasks: Omit<PlanTask, "done">[]): Omit<PlanTask, "done">[] {
  const seen = new Set<string>();
  return tasks.filter((task) => {
    if (seen.has(task.id)) return false;
    seen.add(task.id);
    return true;
  });
}

function isProfileIncomplete(profile: HealthProfile): boolean {
  const hasBasics = Boolean(profile.height && profile.weight && profile.dateOfBirth);
  const hasGyn = profile.neverGynVisit === true || Boolean(profile.lastGynVisit);
  return !hasBasics || !hasGyn;
}

function profileUrgentTasks(profile: HealthProfile): Omit<PlanTask, "done">[] {
  const items: Omit<PlanTask, "done">[] = [];
  const evaluation = evaluateHealthProfile(profile);

  if (isProfileIncomplete(profile)) {
    items.push({
      id: "plan:profile-fill",
      title: "Заполнить профиль здоровья",
      subtitle: "Рост, вес, визиты и анализы — для точного плана",
      href: "/dashboard/profile",
      priority: "today",
      kind: "profile",
    });
  }

  for (const message of evaluation.messages) {
    if (message.includes("гинеколог")) {
      items.push({
        id: "plan:visit-gyn",
        title: "Записаться к акушеру-гинекологу",
        subtitle: "Прошло больше года с последнего осмотра",
        href: "/dashboard/profile",
        priority: "today",
        kind: "visit",
      });
    }
  }

  for (const rec of evaluation.recommendations) {
    if (rec.includes("терапевт")) {
      items.push({
        id: "plan:visit-therapist",
        title: "Профилактический осмотр у терапевта",
        subtitle: "Рекомендуем раз в год",
        href: "/dashboard/preventive",
        priority: "week",
        kind: "visit",
      });
    }
    if (rec.includes("рекомендуем проверить:")) {
      const labs = rec.replace("рекомендуем проверить: ", "");
      items.push({
        id: "plan:labs-missing",
        title: "Сдать недостающие анализы",
        subtitle: labs,
        href: "/dashboard/profile",
        priority: "week",
        kind: "test",
      });
    }
  }

  if (profile.neverPelvicUltrasound || !profile.lastPelvicUltrasound) {
    items.push({
      id: "plan:visit-pelvic-us",
      title: "УЗИ органов малого таза",
      subtitle: "Не отмечено в профиле",
      href: "/dashboard/profile",
      priority: "week",
      kind: "test",
    });
  }

  return items;
}

function pregnantTrimesterTasks(week: number): Omit<PlanTask, "done">[] {
  const items: Omit<PlanTask, "done">[] = [
    {
      id: "preg:obgyn",
      title: "Визит к акушеру-гинекологу",
      subtitle: trimesterLabel(week),
      href: "/dashboard/checklist",
      priority: "week",
      kind: "visit",
    },
  ];

  if (isScreening1Window(week)) {
    items.push({
      id: "preg:screening_1",
      title: "Скрининг 1 триместра",
      subtitle: "11–13 неделя",
      href: "/dashboard/checklist",
      priority: "week",
      kind: "test",
    });
  }

  if (isScreening2Window(week)) {
    items.push({
      id: "preg:screening_2",
      title: "Скрининг 2 триместра",
      subtitle: "18–21 неделя",
      href: "/dashboard/checklist",
      priority: "week",
      kind: "test",
    });
  }

  if (isScreening3Window(week)) {
    items.push({
      id: "preg:screening_3",
      title: "Скрининг 3 триместра (по показаниям)",
      subtitle: "30–34 неделя",
      href: "/dashboard/checklist",
      priority: "week",
      kind: "test",
    });
  }

  if (week <= 13) {
    items.push(
      {
        id: "preg:blood",
        title: "Общий анализ крови",
        href: "/dashboard/checklist",
        priority: "week",
        kind: "test",
      },
      {
        id: "preg:urine",
        title: "Общий анализ мочи",
        href: "/dashboard/checklist",
        priority: "week",
        kind: "test",
      }
    );
  } else if (week <= 27) {
    if (week >= 24 && week <= 28) {
      items.push({
        id: "preg:gtt",
        title: "Глюкозотолерантный тест",
        subtitle: "Обычно на 24–28 неделе",
        href: "/dashboard/checklist",
        priority: "week",
        kind: "test",
      });
    }
    items.push(
      {
        id: "preg:blood",
        title: "Общий анализ крови",
        href: "/dashboard/checklist",
        priority: "week",
        kind: "test",
      },
      {
        id: "preg:urine",
        title: "Общий анализ мочи",
        href: "/dashboard/checklist",
        priority: "week",
        kind: "test",
      }
    );
  } else {
    items.push(
      {
        id: "preg:blood",
        title: "Контроль анализа крови",
        href: "/dashboard/checklist",
        priority: "week",
        kind: "test",
      },
      {
        id: "preg:urine",
        title: "Контроль анализа мочи",
        href: "/dashboard/checklist",
        priority: "week",
        kind: "test",
      },
      {
        id: "preg:ctg",
        title: "КТГ плода",
        subtitle: "По назначению врача",
        href: "/dashboard/checklist",
        priority: "week",
        kind: "test",
      }
    );
  }

  return items;
}

function buildPregnantPlan(
  name: string,
  profile: HealthProfile,
  onboarding: OnboardingData | null
): WeeklyPlan {
  const term = getPregnancyTerm(onboarding);
  const greeting = name ? `Привет, ${name}` : "Ваш план";

  if (!term) {
    const raw = uniqueTasks([
      {
      id: "plan:preg-set-term",
        title: "Указать срок беременности",
        subtitle: "Чтобы показать визиты и анализы по неделе",
        href: "/onboarding/pregnant",
        priority: "today" as const,
        kind: "profile" as const,
      },
      ...profileUrgentTasks(profile),
    ]);
    const today = raw.filter((t) => t.priority === "today");
    const week = raw.filter((t) => t.priority === "week");
    const all = withDone([...today, ...week]);
    return {
      greeting,
      contextLine: "Сначала укажите срок — тогда план станет точным",
      today: all.filter((t) => t.priority === "today"),
      week: all.filter((t) => t.priority === "week"),
      checklistHref: "/dashboard/checklist",
      progress: {
        done: all.filter((t) => t.done).length,
        total: all.length,
      },
    };
  }

  const weekInfo = getWeekInfo(term.week);
  const focusSection = weekInfo?.sections[0];

  const todayRaw: Omit<PlanTask, "done">[] = [
    {
      id: "plan:preg-read-week",
      title: `Прочитать про ${term.week} неделю`,
      subtitle: focusSection?.title ?? "Развитие малыша и ваше самочувствие",
      href: "/dashboard/pregnancy",
      priority: "today",
      kind: "info",
    },
  ];

  if (term.week >= 28) {
    todayRaw.unshift({
      id: "plan:preg-kicks-today",
      title: "Отметить шевеления плода",
      subtitle: "Рекомендуется ежедневно с 28 недели",
      href: "/dashboard/kicks",
      priority: "today",
      kind: "habit",
    });
  }

  const profileTasks = profileUrgentTasks(profile);
  const trimesterTasks = pregnantTrimesterTasks(term.week);

  const merged = uniqueTasks([
    ...profileTasks.filter((t) => t.priority === "today"),
    ...todayRaw,
    ...profileTasks.filter((t) => t.priority === "week"),
    ...trimesterTasks,
  ]);

  const today = withDone(merged.filter((t) => t.priority === "today"));
  const week = withDone(merged.filter((t) => t.priority === "week"));
  const all = [...today, ...week];

  return {
    greeting,
    contextLine: `${formatPregnancyTermLabel(term.week, term.day)} · ${trimesterLabel(term.week)}`,
    focusLine: term.dueDateLabel ? `ПДР ${term.dueDateLabel}` : undefined,
    today,
    week,
    checklistHref: "/dashboard/checklist",
    progress: {
      done: all.filter((t) => t.done).length,
      total: all.length,
    },
  };
}

function buildPlanningPlan(name: string, profile: HealthProfile): WeeklyPlan {
  const greeting = name ? `Привет, ${name}` : "Ваш план";
  const required = PLANNING_CHECKLIST_SECTIONS.find((s) => s.id === "doctors_required");

  const doctorTasks: Omit<PlanTask, "done">[] =
    required?.items.map((item, i) => ({
      id: `planning:${item.id}`,
      title: item.title.split(" — ")[0] ?? item.title,
      subtitle: i === 0 ? "Начните с этого врача" : undefined,
      href: "/dashboard/checklist",
      priority: i === 0 ? ("today" as const) : ("week" as const),
      kind: "visit" as const,
    })) ?? [];

  const examTasks: Omit<PlanTask, "done">[] = PLANNING_CHECKLIST.slice(0, 3).map((item) => ({
    id: `planning:${item.id}`,
    title: item.title,
    subtitle: item.description,
    href: "/dashboard/checklist",
    priority: "week" as const,
    kind: "test" as const,
  }));

  const merged = uniqueTasks([
    ...profileUrgentTasks(profile),
    ...doctorTasks,
    ...examTasks,
  ]);

  const today = withDone(merged.filter((t) => t.priority === "today"));
  const week = withDone(merged.filter((t) => t.priority === "week"));
  const all = [...today, ...week];

  return {
    greeting,
    contextLine: "Подготовка к беременности — ваш план на неделю",
    today,
    week,
    checklistHref: "/dashboard/checklist",
    progress: {
      done: all.filter((t) => t.done).length,
      total: all.length,
    },
  };
}

function buildPreventivePlan(name: string, profile: HealthProfile): WeeklyPlan {
  const greeting = name ? `Привет, ${name}` : "Ваш план";
  const evaluation = evaluateHealthProfile(profile);

  const preventiveTasks: Omit<PlanTask, "done">[] = PREVENTIVE_CHECKLIST.slice(0, 5).map(
    (item, i) => ({
      id: `preventive:${item.id}`,
      title: item.title,
      subtitle: item.description,
      href: "/dashboard/preventive",
      priority: i < 1 ? ("today" as const) : ("week" as const),
      kind: item.category === "doctor" ? ("visit" as const) : ("test" as const),
    })
  );

  const merged = uniqueTasks([...profileUrgentTasks(profile), ...preventiveTasks]);

  const today = withDone(merged.filter((t) => t.priority === "today"));
  const week = withDone(merged.filter((t) => t.priority === "week"));
  const all = [...today, ...week];

  const contextLine =
    evaluation.allExcellent
      ? "Вы следите за здоровьем — продолжайте по плану"
      : "Профилактика по возрасту — вот что важно сейчас";

  return {
    greeting,
    contextLine,
    today,
    week,
    checklistHref: "/dashboard/preventive",
    progress: {
      done: all.filter((t) => t.done).length,
      total: all.length,
    },
  };
}

export function buildWeeklyPlan(
  status?: UserStatus,
  profile?: HealthProfile,
  onboarding?: OnboardingData | null,
  name?: string
): WeeklyPlan {
  const s = status ?? getUserStatus();
  const p = profile ?? loadHealthProfile();
  const o = onboarding ?? loadOnboardingData();
  const n = name ?? "";

  if (s === "pregnant") return buildPregnantPlan(n, p, o);
  if (s === "planning") return buildPlanningPlan(n, p);
  return buildPreventivePlan(n, p);
}
