export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  date: string;
}

export const ARTICLES: Article[] = [
  {
    id: "folic-acid",
    title: "Фолиевая кислота: зачем и когда начинать",
    excerpt:
      "Витамин B9 критически важен для формирования нервной системы плода. Разбираем дозировки и сроки приёма.",
    category: "Планирование",
    readMinutes: 5,
    date: "2026-03-15",
  },
  {
    id: "first-trimester-screening",
    title: "Скрининг первого триместра: что это и зачем",
    excerpt:
      "УЗИ 11–13 недель и биохимический скрининг помогают оценить риски хромосомных аномалий.",
    category: "Беременность",
    readMinutes: 7,
    date: "2026-03-10",
  },
  {
    id: "nutrition-pregnancy",
    title: "Питание во время беременности",
    excerpt:
      "Что добавить в рацион, чего избегать и какие микроэлементы особенно важны по триместрам.",
    category: "Беременность",
    readMinutes: 8,
    date: "2026-02-28",
  },
  {
    id: "cycle-tracking",
    title: "Как отслеживать цикл и зачем это нужно",
    excerpt:
      "Регулярный цикл — маркер репродуктивного здоровья. Простые способы вести календарь.",
    category: "Здоровье",
    readMinutes: 6,
    date: "2026-02-20",
  },
  {
    id: "kick-counting",
    title: "Подсчёт шевелений плода: пошаговая инструкция",
    excerpt:
      "С 28 недели ежедневный подсчёт помогает вовремя заметить изменения активности малыша.",
    category: "Беременность",
    readMinutes: 4,
    date: "2026-02-15",
  },
  {
    id: "preconception-checkup",
    title: "Обследования перед беременностью",
    excerpt:
      "Полный чеклист анализов и визитов, которые рекомендуются при планировании зачатия.",
    category: "Планирование",
    readMinutes: 9,
    date: "2026-02-01",
  },
];
