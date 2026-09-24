"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { GentleReminder } from "@/components/ui/GentleReminder";
import { PeriodCalendar } from "@/components/onboarding/PeriodCalendar";
import {
  clearHealthProfile,
  isUserLoggedIn,
  loadOnboardingData,
  saveOnboardingData,
} from "@/lib/user-storage";
import {
  formatDateInput,
  formatDDMMYYYY,
  isValidDateDDMMYYYY,
  parseDDMMYYYY,
  toISODate,
} from "@/lib/date-format";
import {
  approximateDueFromTotalDays,
  fromConception,
  fromDueDate,
  fromLmp,
  fromManualWeekDay,
  PREGNANCY_DATE_LABELS,
  type PregnancyResult,
  type PregnancySource,
} from "@/lib/pregnancy-math";

const STATUS_LABELS: Record<string, string> = {
  pregnant: "Беременна",
  not_pregnant: "Не беременна",
  planning: "Планирую беременность",
};

const FLOW_OPTIONS = [
  {
    id: "scanty",
    label: "Скудные",
    desc: "Хватает 1–2 прокладок в день",
  },
  {
    id: "moderate",
    label: "Умеренные",
    desc: "Меняю каждые 3–4 часа",
  },
  {
    id: "heavy",
    label: "Обильные",
    desc: "Меняю каждые 1–2 часа",
  },
  {
    id: "very_heavy",
    label: "Очень обильные",
    desc: "Протекает, есть сгустки, ночные замены",
  },
] as const;

const inputClass =
  "w-full rounded-xl border border-beige-dark bg-white px-4 py-3 text-sm";

export default function OnboardingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const status = params.status as string;

  // pregnant
  const [calcMethod, setCalcMethod] = useState<PregnancySource>("lmp");
  const [anchorDate, setAnchorDate] = useState("");
  const [pregWeek, setPregWeek] = useState("");
  const [pregDay, setPregDay] = useState("0");
  const [pregPreview, setPregPreview] = useState<PregnancyResult | null>(null);
  const [pregError, setPregError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isUserLoggedIn());

    const saved = loadOnboardingData();
    if (!saved || saved.status !== status) return;

    if (status === "pregnant") {
      if (saved.pregnancySource) {
        setCalcMethod(saved.pregnancySource as PregnancySource);
      }
      if (saved.anchorDate) setAnchorDate(saved.anchorDate);
      if (saved.pregnancyWeek) setPregWeek(saved.pregnancyWeek);
      if (saved.pregnancyDay != null) setPregDay(saved.pregnancyDay);
      if (saved.pregnancyWeek) {
        const week = Number(saved.pregnancyWeek);
        const day = Number(saved.pregnancyDay ?? 0);
        if (!Number.isNaN(week)) {
          setPregPreview(fromManualWeekDay(week, day));
        }
      }
    } else if (status === "not_pregnant" || status === "planning") {
      if (saved.age) setAge(saved.age);
      if (saved.height) setHeight(saved.height);
      if (saved.weight) setWeight(saved.weight);
      if (saved.hadPregnancy != null) setHadPregnancy(saved.hadPregnancy);
      if (saved.pregnancyCount) setPregnancyCount(saved.pregnancyCount);
      if (saved.hadBirths != null) setHadBirths(saved.hadBirths);
      if (saved.birthsCount) setBirthsCount(saved.birthsCount);
      if (saved.hadAbortions != null) setHadAbortions(saved.hadAbortions);
      if (saved.abortionsCount) setAbortionsCount(saved.abortionsCount);
      if (saved.periodDays?.length) setPeriodDays(saved.periodDays);
      if (saved.regularCycle != null) setRegularCycle(saved.regularCycle);
      if (saved.painLevel != null) setPainLevel(saved.painLevel);
      if (saved.flowType) setFlowType(saved.flowType);
    }
  }, [status]);

  // not_pregnant / planning
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [hadPregnancy, setHadPregnancy] = useState<boolean | null>(null);
  const [pregnancyCount, setPregnancyCount] = useState("");
  const [hadBirths, setHadBirths] = useState<boolean | null>(null);
  const [birthsCount, setBirthsCount] = useState("");
  const [hadAbortions, setHadAbortions] = useState<boolean | null>(null);
  const [abortionsCount, setAbortionsCount] = useState("");
  const [periodDays, setPeriodDays] = useState<string[]>([]);
  const [regularCycle, setRegularCycle] = useState<boolean | null>(null);
  const [painLevel, setPainLevel] = useState(0);
  const [flowType, setFlowType] = useState<string>("");

  const label = STATUS_LABELS[status] || status;

  const computePregnancy = (): PregnancyResult | null => {
    if (calcMethod === "manual") {
      const week = Number(pregWeek);
      const day = Number(pregDay);
      if (!pregWeek || Number.isNaN(week) || week < 1 || week > 41) {
        setPregError("Укажите неделю беременности от 1 до 41");
        return null;
      }
      if (Number.isNaN(day) || day < 0 || day > 6) {
        setPregError("Укажите день недели от 0 до 6");
        return null;
      }
      return fromManualWeekDay(week, day);
    }

    const maxYear =
      calcMethod === "due_date" ? new Date().getFullYear() + 1 : new Date().getFullYear();

    if (!isValidDateDDMMYYYY(anchorDate, maxYear)) {
      setPregError("Введите дату в формате ДД.ММ.ГГГГ");
      return null;
    }

    const parsed = parseDDMMYYYY(anchorDate, maxYear);
    if (!parsed) {
      setPregError("Проверьте правильность даты");
      return null;
    }

    if (calcMethod === "lmp") return fromLmp(parsed);
    if (calcMethod === "conception") return fromConception(parsed);
    return fromDueDate(parsed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPregError("");

    if (typeof window !== "undefined") {
      let data;

      if (status === "not_pregnant" || status === "planning") {
        data = {
          status,
          age,
          height,
          weight,
          hadPregnancy,
          pregnancyCount: hadPregnancy ? pregnancyCount : null,
          hadBirths,
          birthsCount: hadBirths ? birthsCount : null,
          hadAbortions,
          abortionsCount: hadAbortions ? abortionsCount : null,
          periodDays,
          regularCycle,
          painLevel,
          flowType,
        };
      } else if (status === "pregnant") {
        const result = computePregnancy();
        if (!result) return;
        if (result.error) {
          setPregError(result.error);
          return;
        }

        const due = approximateDueFromTotalDays(result.totalDays);
        data = {
          status,
          pregnancySource: calcMethod,
          anchorDate: calcMethod === "manual" ? "" : anchorDate,
          pregnancyWeek: String(result.week),
          pregnancyDay: String(result.day),
          dueDate: toISODate(due),
        };
      }

      if (!data) return;

      clearHealthProfile();
      saveOnboardingData(data, { replace: true });
      localStorage.setItem("user_status", status);
    }
    router.push(isUserLoggedIn() ? "/dashboard" : "/register");
  };

  const handlePreview = () => {
    setPregError("");
    const result = computePregnancy();
    if (!result) return;
    if (result.error) {
      setPregError(result.error);
      setPregPreview(null);
      return;
    }
    setPregPreview(result);

    if (typeof window !== "undefined") {
      const due = approximateDueFromTotalDays(result.totalDays);
      clearHealthProfile();
      saveOnboardingData(
        {
          status: "pregnant",
          pregnancySource: calcMethod,
          anchorDate: calcMethod === "manual" ? "" : anchorDate,
          pregnancyWeek: String(result.week),
          pregnancyDay: String(result.day),
          dueDate: toISODate(due),
        },
        { replace: true }
      );
      localStorage.setItem("user_status", "pregnant");
    }
  };

  if (!STATUS_LABELS[status]) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p>Неизвестный статус</p>
        <Link href="/onboarding" className="text-rose-muted underline mt-4 inline-block">
          Вернуться к выбору
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-muted mb-4">
        Шаг 2 из 2 · {label}
      </p>
      <h1 className="text-3xl font-medium text-ink mb-8">Расскажите немного о себе</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {status === "pregnant" && (
          <>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Как рассчитать срок?
              </label>
              <select
                className={inputClass}
                value={calcMethod}
                onChange={(e) => {
                  setCalcMethod(e.target.value as PregnancySource);
                  setAnchorDate("");
                  setPregWeek("");
                  setPregDay("0");
                  setPregPreview(null);
                  setPregError("");
                }}
              >
                <option value="lmp">По дате последней менструации</option>
                <option value="conception">По дате зачатия</option>
                <option value="due_date">По предполагаемой дате родов</option>
                <option value="manual">Знаю неделю и день</option>
              </select>
            </div>

            {calcMethod === "manual" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Неделя беременности
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={41}
                    required
                    value={pregWeek}
                    onChange={(e) => {
                      setPregWeek(e.target.value);
                      setPregPreview(null);
                    }}
                    placeholder="Например, 12"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    День недели (0–6)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={6}
                    required
                    value={pregDay}
                    onChange={(e) => {
                      setPregDay(e.target.value);
                      setPregPreview(null);
                    }}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  {PREGNANCY_DATE_LABELS[calcMethod]}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={anchorDate}
                  onChange={(e) => {
                    setAnchorDate(formatDateInput(e.target.value));
                    setPregPreview(null);
                  }}
                  placeholder="ДД.ММ.ГГГГ"
                  className={inputClass}
                />
                <p className="text-xs text-ink-muted mt-1">Формат: день.месяц.год</p>
              </div>
            )}

            <button
              type="button"
              onClick={handlePreview}
              className="w-full rounded-xl border border-beige-dark bg-white px-4 py-3 text-sm text-ink hover:bg-beige/40 transition"
            >
              Рассчитать срок
            </button>

            {pregError && (
              <p className="text-sm text-rose-muted">{pregError}</p>
            )}

            {pregPreview && !pregPreview.error && (
              <div className="rounded-2xl border border-rose/30 bg-rose-pale/40 p-5 space-y-2">
                <p className="text-sm font-medium text-ink">
                  {pregPreview.week} неделя {pregPreview.day} день
                </p>
                <p className="text-sm text-ink-soft">
                  Предполагаемая дата родов:{" "}
                  {formatDDMMYYYY(approximateDueFromTotalDays(pregPreview.totalDays))}
                </p>
                {pregPreview.warnOver42 && (
                  <p className="text-xs text-rose-muted">
                    Срок больше 42 недель — проверьте введённые данные.
                  </p>
                )}
                {pregPreview.warnOver40 && !pregPreview.warnOver42 && (
                  <p className="text-xs text-ink-muted">
                    Срок больше 40 недель — при сомнениях уточните у врача.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {(status === "not_pregnant" || status === "planning") && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Возраст</label>
                <input
                  type="number"
                  min={12}
                  max={60}
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="лет"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Рост, см</label>
                <input
                  type="number"
                  min={100}
                  max={220}
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Вес, кг</label>
                <input
                  type="number"
                  min={30}
                  max={200}
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-ink mb-3">
                Беременность в прошлом?
              </legend>
              <div className="flex gap-3 mb-3">
                {[
                  { val: true, label: "Да" },
                  { val: false, label: "Нет" },
                ].map(({ val, label: l }) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setHadPregnancy(val)}
                    className={`flex-1 rounded-xl border py-3 text-sm transition ${
                      hadPregnancy === val
                        ? "border-ink bg-ink text-cream"
                        : "border-beige-dark bg-white hover:bg-beige/40"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {hadPregnancy && (
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={pregnancyCount}
                  onChange={(e) => setPregnancyCount(e.target.value)}
                  placeholder="Сколько раз?"
                  className={inputClass}
                />
              )}
            </fieldset>

            <fieldset>
              <legend className="block text-sm font-medium text-ink mb-3">Были роды?</legend>
              <div className="flex gap-3 mb-3">
                {[
                  { val: true, label: "Да" },
                  { val: false, label: "Нет" },
                ].map(({ val, label: l }) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setHadBirths(val)}
                    className={`flex-1 rounded-xl border py-3 text-sm transition ${
                      hadBirths === val
                        ? "border-ink bg-ink text-cream"
                        : "border-beige-dark bg-white hover:bg-beige/40"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {hadBirths && (
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={birthsCount}
                  onChange={(e) => setBirthsCount(e.target.value)}
                  placeholder="Сколько?"
                  className={inputClass}
                />
              )}
            </fieldset>

            <fieldset>
              <legend className="block text-sm font-medium text-ink mb-3">Были аборты?</legend>
              <div className="flex gap-3 mb-3">
                {[
                  { val: true, label: "Да" },
                  { val: false, label: "Нет" },
                ].map(({ val, label: l }) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setHadAbortions(val)}
                    className={`flex-1 rounded-xl border py-3 text-sm transition ${
                      hadAbortions === val
                        ? "border-ink bg-ink text-cream"
                        : "border-beige-dark bg-white hover:bg-beige/40"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {hadAbortions && (
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={abortionsCount}
                  onChange={(e) => setAbortionsCount(e.target.value)}
                  placeholder="Сколько?"
                  className={inputClass}
                />
              )}
            </fieldset>

            <div>
              <label className="block text-sm font-medium text-ink mb-3">
                Когда были последние месячные?
              </label>
              <PeriodCalendar selectedDays={periodDays} onChange={setPeriodDays} />
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-ink mb-3">
                Цикл регулярный?
              </legend>
              <div className="flex gap-3">
                {[
                  { val: true, label: "Да" },
                  { val: false, label: "Нет" },
                ].map(({ val, label: l }) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setRegularCycle(val)}
                    className={`flex-1 rounded-xl border py-3 text-sm transition ${
                      regularCycle === val
                        ? "border-ink bg-ink text-cream"
                        : "border-beige-dark bg-white hover:bg-beige/40"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Болезненность месячных: {painLevel}
              </label>
              <input
                type="range"
                min={0}
                max={10}
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="w-full accent-rose"
              />
              <div className="flex justify-between text-xs text-ink-muted mt-1">
                <span>0 — не больно</span>
                <span>10 — очень больно</span>
              </div>
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-ink mb-3">
                Как проходят месячные?
              </legend>
              <div className="space-y-2">
                {FLOW_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFlowType(opt.id)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                      flowType === opt.id
                        ? "border-ink bg-rose-pale/60"
                        : "border-beige-dark bg-white hover:bg-beige/30"
                    }`}
                  >
                    <span className="text-sm font-medium text-ink">{opt.label}</span>
                    <span className="block text-xs text-ink-muted mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-medium text-cream transition hover:bg-ink/90"
        >
          {loggedIn ? "Сохранить" : "Создать аккаунт"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {status === "pregnant" && <GentleReminder className="mt-10" />}
    </div>
  );
}
