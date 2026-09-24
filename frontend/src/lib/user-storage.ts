import type { UserStatus } from "@/lib/types";
import type {
  AttachedFileMeta,
  HealthProfile,
  LabTests,
  OnboardingData,
} from "@/lib/profile-types";

export type {
  AttachedFileMeta,
  HealthProfile,
  LabTests,
  OnboardingData,
} from "@/lib/profile-types";

export const LAB_TEST_ITEMS: { key: keyof LabTests; label: string }[] = [
  { key: "blood_general", label: "Общий анализ крови" },
  { key: "urine_general", label: "Общий анализ мочи" },
  { key: "biochemistry", label: "Биохимия" },
  { key: "iron_ferritin", label: "Железо / ферритин" },
  { key: "vitamin_d", label: "Витамин D" },
  { key: "hormones", label: "Гормоны" },
  { key: "pap_test", label: "ПАП-тест" },
  { key: "hpv", label: "ВПЧ" },
];

export function emptyLabTests(): LabTests {
  return {
    blood_general: false,
    urine_general: false,
    biochemistry: false,
    iron_ferritin: false,
    vitamin_d: false,
    hormones: false,
    pap_test: false,
    hpv: false,
  };
}

const ONBOARDING_KEY = "onboarding_data";
const PROFILE_KEY = "health_profile";
const USER_STATUS_KEY = "user_status";
const USER_NAME_KEY = "user_name";
const USER_SESSION_KEY = "user_session";

const PERSONAL_DATA_KEYS = [
  ONBOARDING_KEY,
  PROFILE_KEY,
  USER_STATUS_KEY,
] as const;

/** Сбрасывает анкету, профиль здоровья и связанные данные (без сессии). */
export function clearPersonalData(): void {
  if (typeof window === "undefined") return;
  for (const key of PERSONAL_DATA_KEYS) {
    localStorage.removeItem(key);
  }
}

export function clearHealthProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_KEY);
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function mergeProfile(saved: HealthProfile, onboarding: OnboardingData | null): HealthProfile {
  const base: HealthProfile = {
    dateOfBirth: saved.dateOfBirth || "",
    height: saved.height || onboarding?.height || "",
    weight: saved.weight || onboarding?.weight || "",
    chronic: saved.chronic || "",
    lastGynVisit: saved.lastGynVisit || onboarding?.lastGynVisit || "",
    neverGynVisit: saved.neverGynVisit ?? false,
    lastPelvicUltrasound: saved.lastPelvicUltrasound || onboarding?.lastUltrasound || "",
    neverPelvicUltrasound:
      saved.neverPelvicUltrasound ?? onboarding?.neverUltrasound ?? false,
    hadComplaints: saved.hadComplaints ?? null,
    hadTreatment: saved.hadTreatment ?? null,
    complaintsAndTreatment: saved.complaintsAndTreatment || "",
    lastTherapistVisit: saved.lastTherapistVisit || "",
    neverTherapistVisit: saved.neverTherapistVisit ?? false,
    therapistNotes: saved.therapistNotes || "",
    labTests: { ...emptyLabTests(), ...saved.labTests },
    attachedFiles: saved.attachedFiles ?? [],
  };
  return base;
}

export function loadOnboardingData(): OnboardingData | null {
  return readJson<OnboardingData>(ONBOARDING_KEY);
}

export function saveOnboardingData(
  data: OnboardingData,
  options?: { replace?: boolean; sync?: boolean }
): void {
  if (typeof window === "undefined") return;
  const payload = options?.replace
    ? data
    : { ...(loadOnboardingData() ?? {}), ...data };
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(payload));
  if (payload.status === "pregnant" || payload.status === "not_pregnant" || payload.status === "planning") {
    localStorage.setItem(USER_STATUS_KEY, payload.status);
  }
  if (options?.sync !== false) {
    void import("@/lib/profile-sync").then((m) => m.scheduleProfileSync());
  }
}

export function loadHealthProfile(): HealthProfile {
  const saved = readJson<HealthProfile>(PROFILE_KEY) ?? {};
  const onboarding = loadOnboardingData();
  return mergeProfile(saved, onboarding);
}

export function saveHealthProfile(
  profile: HealthProfile,
  options?: { sync?: boolean }
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  if (options?.sync !== false) {
    void import("@/lib/profile-sync").then((m) => m.scheduleProfileSync());
  }
}

export function saveUserName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_NAME_KEY, name.trim());
}

export function setUserStatus(status: UserStatus): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STATUS_KEY, status);
}

export function getUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USER_NAME_KEY)?.trim() || "";
}

export function getUserStatus(): UserStatus {
  if (typeof window === "undefined") return "not_pregnant";
  const onboarding = loadOnboardingData();
  const stored = localStorage.getItem(USER_STATUS_KEY);
  const status = onboarding?.status || stored;
  if (status === "pregnant" || status === "not_pregnant" || status === "planning") {
    return status;
  }
  return "not_pregnant";
}

export function getStatusTitle(status: UserStatus): string {
  const titles: Record<UserStatus, string> = {
    pregnant: "Беременна",
    not_pregnant: "Не беременна",
    planning: "Планирую беременность",
  };
  return titles[status];
}

export interface UserSession {
  loggedIn: boolean;
  email?: string;
}

export const AUTH_CHANGE_EVENT = "zk-auth-change";

export function notifyAuthChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function setUserLoggedIn(email?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    USER_SESSION_KEY,
    JSON.stringify({ loggedIn: true, email: email?.trim() || undefined })
  );
  notifyAuthChange();
}

export function isUserLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw) as UserSession;
      if (session.loggedIn) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function getSessionEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return "";
    const session = JSON.parse(raw) as UserSession;
    return session.email?.trim() || "";
  } catch {
    return "";
  }
}

/** Регистрация нового аккаунта: сбрасывает чужой локальный профиль, свой — оставляет. */
export function registerNewUser(name: string, email: string): void {
  if (typeof window === "undefined") return;
  const trimmedEmail = email.trim();
  const prevEmail = getSessionEmail();
  if (prevEmail && prevEmail.toLowerCase() !== trimmedEmail.toLowerCase()) {
    clearPersonalData();
    clearHealthProfile();
  }
  saveUserName(name);
  setUserLoggedIn(trimmedEmail);
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_SESSION_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  clearPersonalData();
  notifyAuthChange();
}

/** Только флаг сессии — анкету и профиль не трогаем (после неверного пароля). */
export function clearLoginFlag(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_SESSION_KEY);
  notifyAuthChange();
}
