/** Общий секрет сессии. Без jose — файл можно тянуть из middleware. */
export function getAuthSecret(): string {
  const raw = process.env.AUTH_SECRET?.trim();
  if (!raw || raw.length < 16) {
    if (process.env.NODE_ENV === "production") {
      return "zk-missing-auth-secret!!";
    }
    return "zk-dev-auth-secret-change-me";
  }
  return raw;
}
