/** Клиентский сброс серверной + локальной сессии. */

import { clearLoginFlag, logoutUser } from "@/lib/user-storage";

let hydrateGeneration = 0;

/** Сделать устаревшими все in-flight hydrate (гонка с логином/логаутом). */
export function bumpAuthGeneration(): number {
  hydrateGeneration += 1;
  return hydrateGeneration;
}

export function getAuthGeneration(): number {
  return hydrateGeneration;
}

/** Сбросить cookie сессии на сервере. */
export async function clearServerSession(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    /* сеть — локальный сброс всё равно нужен */
  }
}

/**
 * Полный выход перед попыткой войти другим email.
 * Иначе старый zk_session cookie продолжает открывать прежний аккаунт.
 */
export async function destroySession(options?: { wipeProfile?: boolean }): Promise<void> {
  bumpAuthGeneration();
  await clearServerSession();
  if (options?.wipeProfile) {
    logoutUser();
  } else {
    clearLoginFlag();
  }
}
