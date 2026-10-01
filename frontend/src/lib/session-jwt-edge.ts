import { getAuthSecret } from "@/lib/auth-secret";

function base64UrlToBytes(input: string): Uint8Array | null {
  try {
    const padded = input + "=".repeat((4 - (input.length % 4)) % 4);
    const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** Проверка HS256 JWT в Edge middleware, без jose. */
export async function hasValidSessionJwt(token: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [header, payload, signature] = parts;
  const signed = new TextEncoder().encode(`${header}.${payload}`);
  const sig = base64UrlToBytes(signature);
  const body = base64UrlToBytes(payload);
  if (!sig || !body) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sig.buffer.slice(sig.byteOffset, sig.byteOffset + sig.byteLength) as ArrayBuffer,
    signed.buffer.slice(signed.byteOffset, signed.byteOffset + signed.byteLength) as ArrayBuffer
  );
  if (!valid) return false;

  try {
    const data = JSON.parse(new TextDecoder().decode(body)) as {
      sub?: unknown;
      email?: unknown;
      exp?: unknown;
    };
    if (typeof data.sub !== "string" || !data.sub) return false;
    if (typeof data.email !== "string" || !data.email) return false;
    if (typeof data.exp === "number" && data.exp * 1000 <= Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}
