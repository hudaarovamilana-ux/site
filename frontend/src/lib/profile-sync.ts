import type { ChecklistItemStatus } from "@/lib/checklist-progress";
import type { HealthProfile, OnboardingData } from "@/lib/profile-types";
import type { UserStatus } from "@/lib/types";
import {
  applyServerChecklist,
  loadAllChecklistProgress,
} from "@/lib/checklist-progress";
import {
  getUserName,
  getUserStatus,
  loadHealthProfile,
  loadOnboardingData,
  notifyAuthChange,
  saveHealthProfile,
  saveOnboardingData,
  saveUserName,
  setUserLoggedIn,
  setUserStatus,
} from "@/lib/user-storage";

export interface ServerProfile {
  name: string;
  email: string;
  status: UserStatus | null;
  onboarding: OnboardingData | null;
  healthProfile: HealthProfile | null;
  checklist: Record<string, string> | null;
}

/** Кладёт данные с сервера в localStorage (имя, статус, неделя, чеклист). */
export function applyServerProfile(profile: ServerProfile | null | undefined): void {
  if (typeof window === "undefined" || !profile) return;

  if (profile.name?.trim()) {
    saveUserName(profile.name);
  }
  if (profile.email) {
    setUserLoggedIn(profile.email);
  } else {
    notifyAuthChange();
  }

  if (profile.status) {
    setUserStatus(profile.status);
  }

  if (profile.onboarding) {
    const withStatus = profile.status
      ? { ...profile.onboarding, status: profile.status }
      : profile.onboarding;
    saveOnboardingData(withStatus, { replace: true, sync: false });
  }

  if (profile.healthProfile) {
    saveHealthProfile(profile.healthProfile, { sync: false });
  }

  if (profile.checklist) {
    const cleaned: Record<string, ChecklistItemStatus> = {};
    for (const [id, status] of Object.entries(profile.checklist)) {
      if (status === "none" || status === "planned" || status === "done") {
        cleaned[id] = status;
      }
    }
    applyServerChecklist(cleaned);
  }

  notifyAuthChange();
}

/** Отправляет текущие локальные данные на сервер. */
export async function pushLocalProfileToServer(): Promise<void> {
  if (typeof window === "undefined") return;

  const name = getUserName();
  const status = getUserStatus();
  const onboarding = loadOnboardingData();
  const healthProfile = loadHealthProfile();
  const checklist = loadAllChecklistProgress();

  try {
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: name || undefined,
        status,
        onboarding,
        healthProfile,
        checklist,
      }),
    });
  } catch {
    /* offline — локальные данные останутся */
  }
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

/** Отложенная синхронизация после правок профиля/чеклиста. */
export function scheduleProfileSync(): void {
  if (typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void pushLocalProfileToServer();
  }, 400);
}

/** Загружает профиль с сервера и применяет (после логина / при открытии сайта). */
export async function fetchAndHydrateProfile(): Promise<ServerProfile | null> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (res.status === 401) {
      // Нет серверной сессии — убираем «фейковый» вход из localStorage
      const { isUserLoggedIn, logoutUser } = await import("@/lib/user-storage");
      if (isUserLoggedIn()) {
        logoutUser();
      }
      return null;
    }
    if (!res.ok) return null;
    const data = (await res.json()) as {
      authenticated?: boolean;
      user?: { name?: string; email?: string };
      profile?: ServerProfile | null;
    };
    if (!data.authenticated) {
      const { isUserLoggedIn, logoutUser } = await import("@/lib/user-storage");
      if (isUserLoggedIn()) logoutUser();
      return null;
    }

    if (data.profile) {
      applyServerProfile({
        ...data.profile,
        name: data.profile.name || data.user?.name || "",
        email: data.profile.email || data.user?.email || "",
      });
      return data.profile;
    }

    if (data.user?.name) saveUserName(data.user.name);
    if (data.user?.email) setUserLoggedIn(data.user.email);
    else notifyAuthChange();
    return null;
  } catch {
    return null;
  }
}
