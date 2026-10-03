/**
 * Публичные реквизиты самозанятого для /legal/requisites
 * и проверки платёжных провайдеров. Можно переопределить через NEXT_PUBLIC_*.
 */
export type LegalOperator = {
  fullName: string;
  inn: string;
  email: string;
  phone: string;
  siteUrl: string;
};

const DEFAULTS: LegalOperator = {
  fullName: "Худаярова Милана Арифджоновна",
  inn: "860412760635",
  email: "womenshealthtech@mail.ru",
  phone: "+7 996 688-18-65",
  siteUrl: "https://www.womenshealth.tech",
};

export function getLegalOperator(): LegalOperator {
  return {
    fullName: (process.env.NEXT_PUBLIC_LEGAL_NAME ?? DEFAULTS.fullName).trim(),
    inn: (process.env.NEXT_PUBLIC_LEGAL_INN ?? DEFAULTS.inn).trim(),
    email: (process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? DEFAULTS.email).trim(),
    phone: (process.env.NEXT_PUBLIC_LEGAL_PHONE ?? DEFAULTS.phone).trim(),
    siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULTS.siteUrl).trim(),
  };
}

export function hasLegalOperator(op: LegalOperator): boolean {
  return Boolean(op.fullName && op.inn && op.email);
}
