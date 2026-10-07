export const AI_LIMITS = {
  healthAssessment: 1,
  ask: 5,
  trustChat: 5,
} as const;

/** Лимиты при активной подписке */
export const AI_PREMIUM_LIMITS = {
  healthAssessment: 30,
  ask: 100,
  trustChat: 100,
} as const;

export const AI_COOKIE = {
  healthUsed: "zk_health_used",
  askCount: "zk_ask_count",
  trustCount: "zk_trust_count",
} as const;

export function remainingFromCount(used: number, limit: number): number {
  return Math.max(0, limit - used);
}
