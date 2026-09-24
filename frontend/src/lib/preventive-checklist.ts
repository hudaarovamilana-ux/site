export interface PreventiveItem {
  id: string;
  title: string;
  description: string;
  intervalMonths: number;
  category: "doctor" | "test" | "screening";
}

export const PREVENTIVE_CHECKLIST: PreventiveItem[] = [
  {
    id: "gynecologist",
    title: "Акушер-гинеколог",
    description: "Осмотр, мазок на флору, цитология шейки матки",
    intervalMonths: 12,
    category: "doctor",
  },
  {
    id: "breast_exam",
    title: "Маммография / УЗИ молочных желёз",
    description: "Скрининг рака груди (с 40 лет — ежегодно, ранее — по показаниям)",
    intervalMonths: 12,
    category: "screening",
  },
  {
    id: "pelvic_ultrasound",
    title: "УЗИ органов малого таза",
    description: "Оценка матки, яичников, эндометрия",
    intervalMonths: 12,
    category: "screening",
  },
  {
    id: "thyroid",
    title: "ТТГ, Т4 свободный",
    description: "Функция щитовидной железы",
    intervalMonths: 12,
    category: "test",
  },
  {
    id: "blood_general",
    title: "Общий анализ крови",
    description: "Гемоглобин, лейкоциты, тромбоциты",
    intervalMonths: 12,
    category: "test",
  },
  {
    id: "blood_biochem",
    title: "Биохимия крови",
    description: "Глюкоза, холестерин, печёночные пробы",
    intervalMonths: 12,
    category: "test",
  },
  {
    id: "dentist",
    title: "Стоматолог",
    description: "Профилактический осмотр и гигиена",
    intervalMonths: 6,
    category: "doctor",
  },
  {
    id: "therapist",
    title: "Терапевт",
    description: "Общий осмотр, давление, ЭКГ по показаниям",
    intervalMonths: 12,
    category: "doctor",
  },
  {
    id: "ophthalmologist",
    title: "Офтальмолог",
    description: "Проверка зрения, осмотр глазного дна",
    intervalMonths: 24,
    category: "doctor",
  },
  {
    id: "fluorography",
    title: "Флюорография / рентген грудной клетки",
    description: "Скрининг туберкулёза (по направлению терапевта)",
    intervalMonths: 12,
    category: "screening",
  },
];

export const PLANNING_CHECKLIST: PreventiveItem[] = [
  {
    id: "preconception_visit",
    title: "Консультация гинеколога",
    description: "Предгравидарная подготовка, обследование",
    intervalMonths: 0,
    category: "doctor",
  },
  {
    id: "rubella_immunity",
    title: "Антитела к краснухе",
    description: "Иммунитет к краснухе (IgG)",
    intervalMonths: 0,
    category: "test",
  },
  {
    id: "torch",
    title: "TORCH-инфекции",
    description: "Токсоплазмоз, краснуха, ЦМВ, герпес",
    intervalMonths: 0,
    category: "test",
  },
  {
    id: "partner_exam",
    title: "Обследование партнёра",
    description: "Спермограмма, уролог по показаниям",
    intervalMonths: 0,
    category: "doctor",
  },
];

export function intervalLabel(months: number): string {
  if (months === 0) return "перед зачатием";
  if (months === 6) return "раз в 6 месяцев";
  if (months === 12) return "раз в год";
  if (months === 24) return "раз в 2 года";
  return `раз в ${months} мес.`;
}
