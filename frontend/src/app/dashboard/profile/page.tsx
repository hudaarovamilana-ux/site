"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Paperclip, X } from "lucide-react";
import {
  emptyLabTests,
  LAB_TEST_ITEMS,
  loadHealthProfile,
  saveHealthProfile,
  type AttachedFileMeta,
  type LabTests,
} from "@/lib/user-storage";
import { formatDateInput, isValidDateDDMMYYYY } from "@/lib/date-format";
import { evaluateHealthProfile } from "@/lib/health-evaluation";
import { SoftPinkLogo } from "@/components/ui/Logo";
import { HealthEvaluationCard } from "@/components/profile/HealthEvaluationCard";

const inputClass =
  "w-full rounded-xl border border-beige-dark bg-white px-4 py-3 text-sm";

function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <fieldset>
      <legend className="block text-sm text-ink-muted mb-3">{label}</legend>
      <div className="flex gap-3">
        {[
          { val: true, label: "Да" },
          { val: false, label: "Нет" },
        ].map(({ val, label: l }) => (
          <button
            key={l}
            type="button"
            onClick={() => onChange(val)}
            className={`flex-1 rounded-xl border py-3 text-sm transition ${
              value === val
                ? "border-ink bg-ink text-cream"
                : "border-beige-dark bg-white hover:bg-beige/40"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function ProfilePage() {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [chronic, setChronic] = useState("");
  const [lastGynVisit, setLastGynVisit] = useState("");
  const [neverGynVisit, setNeverGynVisit] = useState(false);
  const [lastPelvicUltrasound, setLastPelvicUltrasound] = useState("");
  const [neverPelvicUltrasound, setNeverPelvicUltrasound] = useState(false);
  const [hadComplaints, setHadComplaints] = useState<boolean | null>(null);
  const [hadTreatment, setHadTreatment] = useState<boolean | null>(null);
  const [complaintsAndTreatment, setComplaintsAndTreatment] = useState("");
  const [lastTherapistVisit, setLastTherapistVisit] = useState("");
  const [neverTherapistVisit, setNeverTherapistVisit] = useState(false);
  const [therapistNotes, setTherapistNotes] = useState("");
  const [labTests, setLabTests] = useState<LabTests>(emptyLabTests());
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileMeta[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const profile = loadHealthProfile();
    setDateOfBirth(profile.dateOfBirth ?? "");
    setHeight(profile.height ?? "");
    setWeight(profile.weight ?? "");
    setChronic(profile.chronic ?? "");
    setLastGynVisit(profile.lastGynVisit ?? "");
    setNeverGynVisit(profile.neverGynVisit ?? false);
    setLastPelvicUltrasound(profile.lastPelvicUltrasound ?? "");
    setNeverPelvicUltrasound(profile.neverPelvicUltrasound ?? false);
    setHadComplaints(profile.hadComplaints ?? null);
    setHadTreatment(profile.hadTreatment ?? null);
    setComplaintsAndTreatment(profile.complaintsAndTreatment ?? "");
    setLastTherapistVisit(profile.lastTherapistVisit ?? "");
    setNeverTherapistVisit(profile.neverTherapistVisit ?? false);
    setTherapistNotes(profile.therapistNotes ?? "");
    setLabTests(profile.labTests ?? emptyLabTests());
    setAttachedFiles(profile.attachedFiles ?? []);
  }, []);

  const currentProfile = useMemo(
    () => ({
      dateOfBirth,
      height,
      weight,
      chronic,
      lastGynVisit: neverGynVisit ? "" : lastGynVisit,
      neverGynVisit,
      lastPelvicUltrasound: neverPelvicUltrasound ? "" : lastPelvicUltrasound,
      neverPelvicUltrasound,
      hadComplaints,
      hadTreatment,
      complaintsAndTreatment,
      lastTherapistVisit: neverTherapistVisit ? "" : lastTherapistVisit,
      neverTherapistVisit,
      therapistNotes,
      labTests,
      attachedFiles,
    }),
    [
      dateOfBirth,
      height,
      weight,
      chronic,
      lastGynVisit,
      neverGynVisit,
      lastPelvicUltrasound,
      neverPelvicUltrasound,
      hadComplaints,
      hadTreatment,
      complaintsAndTreatment,
      lastTherapistVisit,
      neverTherapistVisit,
      therapistNotes,
      labTests,
      attachedFiles,
    ]
  );

  const evaluation = useMemo(
    () => evaluateHealthProfile(currentProfile),
    [currentProfile]
  );

  const toggleLab = (key: keyof LabTests) => {
    setLabTests((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const newFiles: AttachedFileMeta[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`Файл «${file.name}» слишком большой (макс. 5 МБ)`);
        continue;
      }
      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        addedAt: new Date().toISOString(),
      });
    }
    if (newFiles.length) {
      setAttachedFiles((prev) => [...prev, ...newFiles]);
      setError("");
    }
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (dateOfBirth && !isValidDateDDMMYYYY(dateOfBirth)) {
      setError("Введите дату рождения в формате ДД.ММ.ГГГГ");
      return;
    }
    setError("");
    saveHealthProfile(currentProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <h1 className="text-2xl font-medium text-ink mb-6">Профиль</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <h2 className="text-sm font-medium text-ink">Информация о здоровье</h2>

          <div>
            <label className="block text-sm text-ink-muted mb-1">Укажите дату рождения</label>
            <input
              type="text"
              inputMode="numeric"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(formatDateInput(e.target.value))}
              placeholder="ДД.ММ.ГГГГ"
              maxLength={10}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-muted mb-1">Рост, см</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-ink-muted mb-1">Вес, кг</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-1">Хронические заболевания</label>
            <textarea
              value={chronic}
              onChange={(e) => setChronic(e.target.value)}
              rows={3}
              placeholder="Диабет, гипертония, заболевания щитовидной железы..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="pt-2 border-t border-beige-dark/40">
            <h3 className="text-sm font-medium text-ink mb-4">Визиты и обследования</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-ink-muted mb-2">
                  Когда последний раз были у гинеколога?
                </label>
                <input
                  type="date"
                  value={lastGynVisit}
                  onChange={(e) => setLastGynVisit(e.target.value)}
                  disabled={neverGynVisit}
                  className={`${inputClass} disabled:opacity-50`}
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={neverGynVisit}
                    onChange={(e) => {
                      setNeverGynVisit(e.target.checked);
                      if (e.target.checked) setLastGynVisit("");
                    }}
                  />
                  Никогда не была
                </label>
              </div>

              <div>
                <label className="block text-sm text-ink-muted mb-2">
                  Когда делали УЗИ органов малого таза?
                </label>
                <input
                  type="date"
                  value={lastPelvicUltrasound}
                  onChange={(e) => setLastPelvicUltrasound(e.target.value)}
                  disabled={neverPelvicUltrasound}
                  className={`${inputClass} disabled:opacity-50`}
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={neverPelvicUltrasound}
                    onChange={(e) => {
                      setNeverPelvicUltrasound(e.target.checked);
                      if (e.target.checked) setLastPelvicUltrasound("");
                    }}
                  />
                  Никогда не делала
                </label>
              </div>

              <YesNoField
                label="Были ли жалобы на последнем приёме?"
                value={hadComplaints}
                onChange={setHadComplaints}
              />

              <YesNoField
                label="Назначили ли лечение?"
                value={hadTreatment}
                onChange={setHadTreatment}
              />

              <div>
                <label className="block text-sm text-ink-muted mb-2">
                  Опишите какие были жалобы и какое лечение было назначено
                </label>
                <p className="text-xs text-ink-muted mb-2 leading-relaxed">
                  Это поможет точнее подобрать рекомендации в оценке здоровья
                </p>
                <textarea
                  value={complaintsAndTreatment}
                  onChange={(e) => setComplaintsAndTreatment(e.target.value)}
                  rows={4}
                  placeholder="Например: тянущие боли внизу живота, назначили..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-beige-dark/40">
            <h3 className="text-sm font-medium text-ink mb-4">Общее здоровье</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-ink-muted mb-2">
                  Когда последний раз были у терапевта?
                </label>
                <input
                  type="date"
                  value={lastTherapistVisit}
                  onChange={(e) => setLastTherapistVisit(e.target.value)}
                  disabled={neverTherapistVisit}
                  className={`${inputClass} disabled:opacity-50`}
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={neverTherapistVisit}
                    onChange={(e) => {
                      setNeverTherapistVisit(e.target.checked);
                      if (e.target.checked) setLastTherapistVisit("");
                    }}
                  />
                  Никогда не была
                </label>
              </div>

              <div>
                <label className="block text-sm text-ink-muted mb-2">
                  Какие были жалобы и какое было лечение
                </label>
                <textarea
                  value={therapistNotes}
                  onChange={(e) => setTherapistNotes(e.target.value)}
                  rows={3}
                  placeholder="Опишите жалобы и назначения терапевта..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <fieldset>
                <legend className="block text-sm text-ink-muted mb-3">
                  Отметьте какие из этих анализов вы сдавали за последний год
                </legend>
                <div className="space-y-2">
                  {LAB_TEST_ITEMS.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 rounded-xl border border-beige-dark/40 bg-white/60 px-4 py-3 text-sm cursor-pointer hover:bg-white transition"
                    >
                      <input
                        type="checkbox"
                        checked={labTests[key]}
                        onChange={() => toggleLab(key)}
                        className="rounded"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className="block text-sm text-ink-muted mb-2">
                  Прикрепить файл с анализами
                </label>
                <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-beige-dark bg-white/40 px-4 py-6 text-sm text-ink-muted cursor-pointer hover:bg-white/70 transition">
                  <Paperclip className="w-4 h-4" />
                  Выберите файл (PDF, JPG, PNG — до 5 МБ)
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    multiple
                    onChange={handleFiles}
                    className="hidden"
                  />
                </label>
                {attachedFiles.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {attachedFiles.map((file, i) => (
                      <li
                        key={`${file.name}-${file.addedAt}`}
                        className="flex items-center justify-between rounded-lg bg-beige/40 px-3 py-2 text-xs text-ink-soft"
                      >
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-ink-muted hover:text-ink ml-2 shrink-0"
                          aria-label="Удалить файл"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <HealthEvaluationCard evaluation={evaluation} />

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-ink/90 transition"
            >
              Сохранить
            </button>
            {saved && <span className="text-sm text-emerald-700">Сохранено</span>}
          </div>

          {error && (
            <p className="text-sm text-rose-muted bg-rose-pale/50 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </form>

        <div className="glass-card rounded-2xl p-6 text-center lg:sticky lg:top-24 h-fit">
          <SoftPinkLogo size="md" className="mx-auto" />
          <h3 className="text-sm font-medium text-ink mt-2 mb-2">Оценка здоровья</h3>
          <p className="text-xs text-ink-muted mb-4">
            Попробуйте бесплатно, получите персональные рекомендации
          </p>
          <Link
            href="/dashboard/health-assessment"
            className="inline-block rounded-full border border-ink px-6 py-2.5 text-sm hover:bg-ink hover:text-cream transition"
          >
            Оценить здоровье
          </Link>
        </div>
      </div>
    </div>
  );
}
