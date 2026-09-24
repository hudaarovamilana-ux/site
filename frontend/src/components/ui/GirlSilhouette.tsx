export const BODY_POINTS = {
  thyroid: { cx: 100, cy: 52, label: "Щитовидная железа" },
  heart: { cx: 108, cy: 88, label: "Сердце" },
  lungs: { cx: 92, cy: 90, label: "Лёгкие" },
  liver: { cx: 118, cy: 112, label: "Печень" },
  stomach: { cx: 100, cy: 118, label: "Желудок" },
  kidneys: { cx: 82, cy: 122, label: "Почки" },
  reproductive: { cx: 100, cy: 158, label: "Репродуктивная система" },
  pelvis: { cx: 100, cy: 175, label: "Малый таз" },
} as const;

export type BodyPointKey = keyof typeof BODY_POINTS;

interface GirlSilhouetteProps {
  /** Какие точки подсветить. Если не указано — показываются все */
  highlights?: BodyPointKey[];
  className?: string;
  showLabels?: boolean;
}

export function GirlSilhouette({
  highlights,
  className = "max-w-[220px]",
  showLabels = false,
}: GirlSilhouetteProps) {
  const activeKeys = highlights ?? (Object.keys(BODY_POINTS) as BodyPointKey[]);

  return (
    <svg
      viewBox="0 0 200 300"
      className={`w-full mx-auto ${className}`}
      aria-hidden
    >
      {/* голова */}
      <ellipse cx="100" cy="32" rx="20" ry="22" fill="#e8dfd6" />
      {/* шея */}
      <rect x="94" y="52" width="12" height="14" rx="4" fill="#ebe4dc" />
      {/* волосы / контур головы */}
      <ellipse cx="100" cy="28" rx="22" ry="20" fill="none" stroke="#e8c4cb" strokeWidth="1" opacity="0.5" />

      {/* тело — женский силуэт с талией */}
      <path
        d="M68 68
           Q62 95 64 130
           Q66 155 72 185
           Q78 215 85 245
           Q92 268 100 275
           Q108 268 115 245
           Q122 215 128 185
           Q134 155 136 130
           Q138 95 132 68
           Q125 58 100 58
           Q75 58 68 68 Z"
        fill="#f0ebe4"
        stroke="#e8c4cb"
        strokeWidth="1.2"
      />

      {/* руки */}
      <path
        d="M68 72 Q48 100 44 140 Q42 160 46 175"
        fill="none"
        stroke="#e8dfd6"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M132 72 Q152 100 156 140 Q158 160 154 175"
        fill="none"
        stroke="#e8dfd6"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* точки здоровья */}
      {activeKeys.map((key) => {
        const p = BODY_POINTS[key];
        if (!p) return null;
        return (
          <g key={key}>
            <circle cx={p.cx} cy={p.cy} r="11" fill="#f5e6e8" opacity="0.7">
              <animate
                attributeName="r"
                values="11;13;11"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={p.cx} cy={p.cy} r="5" fill="#d4a5ae" />
            <circle cx={p.cx} cy={p.cy} r="2" fill="#fff" opacity="0.8" />
            {showLabels && (
              <text
                x={p.cx + 14}
                y={p.cy + 4}
                className="fill-ink-muted text-[8px]"
              >
                {p.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
