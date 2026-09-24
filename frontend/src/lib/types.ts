export type UserStatus = "pregnant" | "not_pregnant" | "planning";

export interface StatusOption {
  id: UserStatus;
  title: string;
  description: string;
  emoji: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
  {
    id: "pregnant",
    title: "Беременна",
    description: "Неделя за неделей, ПДР, анализы по триместрам, шевеления плода",
    emoji: "🤰",
  },
  {
    id: "not_pregnant",
    title: "Не беременна",
    description: "Рекомендации для комфорта в любой день цикла, чекапы",
    emoji: "🌸",
  },
  {
    id: "planning",
    title: "Планирую беременность",
    description: "Подготовка к зачатию, обследования перед беременностью",
    emoji: "✨",
  },
];
