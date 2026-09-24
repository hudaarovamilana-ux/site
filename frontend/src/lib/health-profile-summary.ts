import type { OnboardingData, HealthProfile } from "@/lib/user-storage";
import { LAB_TEST_ITEMS, emptyLabTests, getStatusTitle } from "@/lib/user-storage";
import type { UserStatus } from "@/lib/types";

function fmt(value: string | undefined | null, fallback = "не указано"): string {
  const v = value?.trim();
  return v || fallback;
}

function fmtBool(
  value: boolean | null | undefined,
  yes: string,
  no: string,
  unknown = "не указано"
): string {
  if (value === true) return yes;
  if (value === false) return no;
  return unknown;
}

function fmtVisit(date: string | undefined, never: boolean | undefined): string {
  if (never) return "никогда / давно не было";
  return fmt(date, "не указано");
}

export function buildHealthProfileSummary(input: {
  status: UserStatus;
  profile: HealthProfile;
  onboarding: OnboardingData | null;
}): string {
  const { status, profile, onboarding } = input;
  const labs = profile.labTests ?? emptyLabTests();
  const doneLabs = LAB_TEST_ITEMS.filter(({ key }) => labs[key]).map(({ label }) => label);
  const missingLabs = LAB_TEST_ITEMS.filter(({ key }) => !labs[key]).map(({ label }) => label);

  const lines = [
    `Статус: ${getStatusTitle(status)}`,
    `Дата рождения: ${fmt(profile.dateOfBirth)}`,
    `Рост: ${fmt(profile.height, "—")} см`,
    `Вес: ${fmt(profile.weight, "—")} кг`,
    `Хронические заболевания: ${fmt(profile.chronic, "нет данных")}`,
    "",
    "Визиты и обследования:",
    `- Последний визит к гинекологу: ${fmtVisit(profile.lastGynVisit, profile.neverGynVisit)}`,
    `- Последнее УЗИ малого таза: ${fmtVisit(profile.lastPelvicUltrasound, profile.neverPelvicUltrasound)}`,
    `- Последний визит к терапевту: ${fmtVisit(profile.lastTherapistVisit, profile.neverTherapistVisit)}`,
    "",
    `Сданные анализы: ${doneLabs.length ? doneLabs.join(", ") : "не отмечены"}`,
    `Не отмечены: ${missingLabs.length ? missingLabs.join(", ") : "все отмечены"}`,
  ];

  if (onboarding) {
    lines.push(
      "",
      "Данные онбординга:",
      `- Возраст: ${fmt(onboarding.age)}`,
      `- Беременности: ${fmtBool(onboarding.hadPregnancy, "были", "не было")}`,
      `- Регулярность цикла: ${fmtBool(onboarding.regularCycle, "регулярный", "нерегулярный")}`,
      `- Боль при менструации (0–10): ${onboarding.painLevel ?? "—"}`
    );
  }

  return lines.join("\n");
}
