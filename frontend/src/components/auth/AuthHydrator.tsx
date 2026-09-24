"use client";

import { useEffect } from "react";
import { getAuthGeneration } from "@/lib/auth-client";
import { fetchAndHydrateProfile } from "@/lib/profile-sync";

/** При открытии сайта подтягивает имя и профиль с сервера в localStorage. */
export function AuthHydrator() {
  useEffect(() => {
    const gen = getAuthGeneration();
    void (async () => {
      await fetchAndHydrateProfile();
      // если за это время был логин/логаут — результат hydrate устарел
      if (gen !== getAuthGeneration()) return;
    })();
  }, []);

  return null;
}
