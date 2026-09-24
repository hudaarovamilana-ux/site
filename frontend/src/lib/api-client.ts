export async function postJson<T extends Record<string, unknown>>(
  url: string,
  body: unknown
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Нет связи с сервером. Проверьте интернет и попробуйте снова.");
  }

  const raw = await response.text();
  let data: T & { error?: string; remaining?: number };

  try {
    data = JSON.parse(raw) as T & { error?: string; remaining?: number };
  } catch {
    throw new Error(`Ошибка сервера (${response.status}). Попробуйте позже.`);
  }

  if (!response.ok) {
    const err = new Error(data.error ?? `Ошибка ${response.status}`) as Error & {
      retryAfterSec?: number;
    };
    const retry = (data as { retryAfterSec?: number }).retryAfterSec;
    if (retry) err.retryAfterSec = retry;
    throw err;
  }

  return data;
}
