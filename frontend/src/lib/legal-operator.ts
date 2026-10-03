/**
 * Публичные реквизиты самозанятого для страницы /legal/requisites
 * и проверки платёжных провайдеров. Задаются через NEXT_PUBLIC_* на Railway.
 */
export type LegalOperator = {
  fullName: string;
  inn: string;
  email: string;
  phone: string;
  siteUrl: string;
};

export function getLegalOperator(): LegalOperator {
  return {
    fullName: (process.env.NEXT_PUBLIC_LEGAL_NAME ?? "").trim(),
    inn: (process.env.NEXT_PUBLIC_LEGAL_INN ?? "").trim(),
    email: (process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? "").trim(),
    phone: (process.env.NEXT_PUBLIC_LEGAL_PHONE ?? "").trim(),
    siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.womenshealth.tech").trim(),
  };
}

export function hasLegalOperator(op: LegalOperator): boolean {
  return Boolean(op.fullName && op.inn && op.email);
}
