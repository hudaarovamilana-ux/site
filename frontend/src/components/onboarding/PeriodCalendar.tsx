"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

interface PeriodCalendarProps {
  selectedDays: string[];
  onChange: (days: string[]) => void;
}

export function PeriodCalendar({ selectedDays, onChange }: PeriodCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const { daysInMonth, firstWeekday, monthLabel } = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("ru-RU", {
      month: "long",
      year: "numeric",
    });
    return { daysInMonth, firstWeekday, monthLabel };
  }, [viewYear, viewMonth]);

  const toggleDay = (day: number) => {
    const key = toKey(viewYear, viewMonth, day);
    if (selectedDays.includes(key)) {
      onChange(selectedDays.filter((d) => d !== key));
    } else {
      onChange([...selectedDays, key].sort());
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const sorted = [...selectedDays].sort();
  const rangeLabel =
    sorted.length > 0
      ? `${sorted[0].split("-").reverse().join(".")} — ${sorted[sorted.length - 1].split("-").reverse().join(".")}`
      : null;

  return (
    <div className="rounded-2xl border border-beige-dark/60 bg-white/80 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-full p-2 hover:bg-beige/60 transition"
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-full p-2 hover:bg-beige/60 transition"
          aria-label="Следующий месяц"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-ink-muted py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = toKey(viewYear, viewMonth, day);
          const selected = selectedDays.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleDay(day)}
              className={`aspect-square rounded-full text-sm transition flex items-center justify-center ${
                selected
                  ? "bg-rose text-cream font-medium scale-105"
                  : "hover:bg-rose-pale text-ink-soft"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-ink-muted mt-4 text-center">
        Нажмите на дни, когда шли месячные
      </p>
      {rangeLabel && (
        <p className="text-xs text-ink-soft mt-2 text-center">
          Выбрано: {rangeLabel} ({selectedDays.length}{" "}
          {selectedDays.length === 1 ? "день" : selectedDays.length < 5 ? "дня" : "дней"})
        </p>
      )}
    </div>
  );
}
