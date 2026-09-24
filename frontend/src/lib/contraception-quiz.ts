import type {
  ContraceptionInput,
  PartnersCount,
  PregnancyPlan,
  SexFrequency,
} from "@/lib/contraception-engine";

export type QuizAnswerKey = keyof ContraceptionInput;

export interface QuizOption {
  label: string;
  value: boolean | PregnancyPlan | SexFrequency | PartnersCount;
}

export interface QuizQuestion {
  id: QuizAnswerKey;
  number: number;
  text: string;
  options: [QuizOption, QuizOption];
}

export const CONTRACEPTION_QUESTIONS: QuizQuestion[] = [
  {
    id: "estrogen_contraindications",
    number: 1,
    text: "Есть ли противопоказания к эстрогенам?",
    options: [
      { label: "Да", value: true },
      { label: "Нет", value: false },
    ],
  },
  {
    id: "gave_birth",
    number: 2,
    text: "Были ли роды?",
    options: [
      { label: "Нет", value: false },
      { label: "Да", value: true },
    ],
  },
  {
    id: "pregnancy_plan",
    number: 3,
    text: "План беременности",
    options: [
      { label: "В течение 1 года", value: "soon" },
      { label: "Не планируется в ближайшие 1–3 года", value: "later" },
    ],
  },
  {
    id: "sex_frequency",
    number: 4,
    text: "Регулярность половой жизни",
    options: [
      { label: "Нерегулярная", value: "rare" },
      { label: "Регулярная", value: "regular" },
    ],
  },
  {
    id: "long_term_ready",
    number: 5,
    text: "Готовность к долгосрочным методам (спираль / имплант)",
    options: [
      { label: "Нет", value: false },
      { label: "Да", value: true },
    ],
  },
  {
    id: "symptoms",
    number: 6,
    text: "Есть ли выраженные симптомы (ПМС, боль, акне)?",
    options: [
      { label: "Да", value: true },
      { label: "Нет", value: false },
    ],
  },
  {
    id: "partners",
    number: 7,
    text: "Количество партнёров",
    options: [
      { label: "Один постоянный", value: "one" },
      { label: "Более одного / меняются", value: "multiple" },
    ],
  },
  {
    id: "sti_test",
    number: 8,
    text: "Есть ли у партнёра актуальный отрицательный тест на ИППП?",
    options: [
      { label: "Да", value: true },
      { label: "Нет / неизвестно", value: false },
    ],
  },
];

export const EMPTY_CONTRACEPTION_ANSWERS: ContraceptionInput = {
  estrogen_contraindications: false,
  gave_birth: false,
  pregnancy_plan: "later",
  sex_frequency: "regular",
  long_term_ready: false,
  symptoms: false,
  partners: "one",
  sti_test: true,
};
