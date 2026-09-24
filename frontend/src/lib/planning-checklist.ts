export type PlanningChecklistPart = "doctors" | "exams" | "supplements";

export interface PlanningChecklistItem {
  id: string;
  title: string;
  bullets?: string[];
  note?: string;
}

export interface PlanningChecklistSection {
  id: string;
  part: PlanningChecklistPart;
  title: string;
  subtitle?: string;
  items: PlanningChecklistItem[];
}

export const PLANNING_CHECKLIST_PARTS: {
  id: PlanningChecklistPart;
  label: string;
}[] = [
  { id: "doctors", label: "Врачи" },
  { id: "exams", label: "Обследования" },
  { id: "supplements", label: "До беременности" },
];

export const PLANNING_CHECKLIST_SECTIONS: PlanningChecklistSection[] = [
  // ——— ВРАЧИ ———
  {
    id: "doctors_required",
    part: "doctors",
    title: "Обязательные врачи (для всех)",
    items: [
      {
        id: "doc_obgyn",
        title: "Акушер-гинеколог — главный специалист",
        bullets: [
          "ведёт прегравидарную подготовку",
          "назначает все анализы",
          "осмотр + мазки + УЗИ",
        ],
        note: "Это базовый врач №1",
      },
      {
        id: "doc_therapist",
        title: "Терапевт",
        bullets: ["оценивает общее состояние здоровья"],
      },
      {
        id: "doc_dentist",
        title: "Стоматолог",
        bullets: ["лечение кариеса и очагов инфекции"],
        note: "Тоже входит в обязательный минимум",
      },
    ],
  },
  {
    id: "doctors_common",
    part: "doctors",
    title: "Часто необходимые специалисты",
    subtitle: "Назначаются большинству женщин (даже без явных проблем)",
    items: [
      {
        id: "doc_endocrinologist",
        title: "Эндокринолог",
        bullets: ["лишний вес / дефицит веса", "СПКЯ"],
      },
      {
        id: "doc_ophthalmologist",
        title: "Офтальмолог",
        bullets: ["при миопии, астигматизме", "оценка риска для родов"],
      },
      {
        id: "doc_hematologist",
        title: "Гематолог",
        bullets: ["анемия", "повышенная свёртываемость", "тромбозы в анамнезе"],
      },
    ],
  },
  {
    id: "doctors_indicated",
    part: "doctors",
    title: "По показаниям (не всем)",
    items: [
      {
        id: "doc_geneticist",
        title: "Генетик",
        bullets: ["возраст 35+", "выкидыши", "бесплодие", "наследственные болезни"],
      },
      {
        id: "doc_infectious",
        title: "Инфекционист",
      },
      {
        id: "doc_neurologist",
        title: "Невролог",
      },
      {
        id: "doc_cardiologist",
        title: "Кардиолог",
      },
      {
        id: "doc_dietitian",
        title: "Диетолог / нутрициолог",
        bullets: ["ожирение или дефициты", "подготовка питания"],
      },
    ],
  },
  {
    id: "doctors_partner",
    part: "doctors",
    title: "Для мужчины",
    items: [
      {
        id: "doc_partner_urologist",
        title: "Уролог / андролог",
        bullets: [
          "при проблемах со спермограммой",
          "при бесплодии",
        ],
      },
    ],
  },

  // ——— ОБСЛЕДОВАНИЯ ———
  {
    id: "exams_required",
    part: "exams",
    title: "Обязательные анализы (рекомендованы всем)",
    items: [
      {
        id: "exam_blood_general",
        title: "Общий анализ крови",
      },
      {
        id: "exam_urine_general",
        title: "Общий анализ мочи",
      },
      {
        id: "exam_biochem",
        title: "Биохимический анализ крови",
        bullets: ["глюкоза", "АЛТ, АСТ", "билирубин", "креатинин", "общий белок"],
      },
      {
        id: "exam_hiv",
        title: "ВИЧ",
      },
      {
        id: "exam_syphilis",
        title: "Сифилис (RW или RPR)",
      },
      {
        id: "exam_hepatitis",
        title: "Гепатиты B и C (HBsAg, Anti-HCV)",
      },
      {
        id: "exam_blood_group",
        title: "Группа крови и резус-фактор",
        bullets: ["женщине обязательно", "мужчине — если у женщины Rh(−)"],
      },
      {
        id: "exam_smear",
        title: "Мазок на флору",
      },
      {
        id: "exam_pcr_chlamydia",
        title: "ПЦР: хламидии",
      },
      {
        id: "exam_pcr_gonorrhea",
        title: "ПЦР: гонорея",
      },
      {
        id: "exam_pcr_mycoplasma",
        title: "ПЦР: микоплазма",
      },
      {
        id: "exam_pcr_ureaplasma",
        title: "ПЦР: уреаплазма",
      },
      {
        id: "exam_pap",
        title: "ПАП-тест (цитология шейки матки)",
      },
      {
        id: "exam_fluorography",
        title: "Флюорография",
        note: "Если не делалась за последний год",
      },
      {
        id: "exam_ecg",
        title: "ЭКГ",
      },
    ],
  },
  {
    id: "exams_torch",
    part: "exams",
    title: "TORCH-инфекции",
    subtitle:
      "Особенно важно! Оценивается иммунитет (IgG), а не просто наличие инфекции.",
    items: [
      { id: "exam_rubella", title: "Краснуха (IgG, IgM)" },
      { id: "exam_toxoplasma", title: "Токсоплазмоз (IgG, IgM)" },
      { id: "exam_cmv", title: "Цитомегаловирус (IgG, IgM)" },
      { id: "exam_herpes", title: "Вирус простого герпеса (IgG, IgM)" },
    ],
  },
  {
    id: "exams_hormones",
    part: "exams",
    title: "Гормональное обследование",
    subtitle:
      "Не всем подряд, но чаще назначают. Особенно важно при нерегулярном цикле, бесплодии, выкидышах в анамнезе.",
    items: [
      { id: "exam_tsh", title: "ТТГ", note: "Обязательно!" },
      { id: "exam_t4", title: "Свободный Т4" },
      { id: "exam_prolactin", title: "Пролактин" },
      { id: "exam_fsh", title: "ФСГ" },
      { id: "exam_lh", title: "ЛГ" },
      { id: "exam_estradiol", title: "Эстрадиол" },
      { id: "exam_progesterone", title: "Прогестерон" },
    ],
  },
  {
    id: "exams_deficiencies",
    part: "exams",
    title: "Дефициты и витамины",
    subtitle: "Очень важный блок (часто недооценивают)",
    items: [
      { id: "exam_ferritin", title: "Ферритин (запасы железа)" },
      { id: "exam_vitamin_d", title: "Витамин D (25-OH)" },
      { id: "exam_b12_folate", title: "В12 и фолиевая кислота" },
    ],
  },
  {
    id: "exams_genetic",
    part: "exams",
    title: "Генетические обследования",
    subtitle:
      "По показаниям. Обязательно при привычном невынашивании, бесплодии, возрасте 35+.",
    items: [
      { id: "exam_karyotype", title: "Кариотип обоих партнёров" },
      {
        id: "exam_hereditary_screen",
        title: "Скрининг на наследственные заболевания",
        bullets: ["например, муковисцидоз"],
      },
    ],
  },
  {
    id: "exams_imaging",
    part: "exams",
    title: "УЗИ и инструментальные исследования",
    items: [
      { id: "exam_us_pelvic", title: "УЗИ органов малого таза" },
      {
        id: "exam_us_breast",
        title: "УЗИ молочных желёз",
        note: "Или маммография по возрасту",
      },
      {
        id: "exam_us_thyroid",
        title: "УЗИ щитовидной железы",
        note: "По показаниям",
      },
    ],
  },
  {
    id: "exams_partner",
    part: "exams",
    title: "Обследование партнёра (мужчины)",
    subtitle: "Минимум",
    items: [
      { id: "exam_partner_sperm", title: "Спермограмма" },
      { id: "exam_partner_infections", title: "ВИЧ, сифилис, гепатиты" },
      { id: "exam_partner_pcr", title: "ПЦР на ИППП" },
    ],
  },

  // ——— ДО БЕРЕМЕННОСТИ ———
  {
    id: "supplements_main",
    part: "supplements",
    title: "Что важно начать пить до беременности",
    items: [
      {
        id: "supp_folic_acid",
        title: "Фолиевая кислота",
        note: "400–800 мкг в сутки",
      },
      {
        id: "supp_iodine",
        title: "Йод",
        note: "Если нет противопоказаний",
      },
      {
        id: "supp_deficiency",
        title: "Коррекция дефицитов",
        bullets: ["железо", "витамин D и другие — по результатам анализов"],
      },
    ],
  },
];

export function getPlanningSections(part: PlanningChecklistPart): PlanningChecklistSection[] {
  return PLANNING_CHECKLIST_SECTIONS.filter((s) => s.part === part);
}

export function getAllPlanningItemIds(): string[] {
  return PLANNING_CHECKLIST_SECTIONS.flatMap((s) => s.items.map((i) => i.id));
}
