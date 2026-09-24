type BlurZone = "start" | "mid" | "end";

function SoftBlurWord({ text, zones }: { text: string; zones: BlurZone[] }) {
  const zoneClass: Record<BlurZone, string> = {
    start: "blur-text-soft-start",
    mid: "blur-text-soft-mid",
    end: "blur-text-soft-end",
  };

  return (
    <span className="relative inline-block">
      <span className="relative z-10">{text}</span>
      {zones.map((zone) => (
        <span
          key={zone}
          aria-hidden
          className={`absolute inset-0 blur-text-soft ${zoneClass[zone]} pointer-events-none`}
        >
          {text}
        </span>
      ))}
    </span>
  );
}

function CrispLetters({ text }: { text: string }) {
  return <span className="relative z-10">{text}</span>;
}

export function BlurTitle() {
  return (
    <div className="relative z-10 w-full select-none">
      <h1 className="font-display text-[clamp(3.25rem,11vw,7.5rem)] font-semibold leading-[0.92] tracking-[-0.03em] text-rose-muted">
        <span className="block whitespace-nowrap">
          <SoftBlurWord text="Женская" zones={["mid", "end"]} />
        </span>
        <span className="mt-2 block whitespace-nowrap sm:mt-3">
          <SoftBlurWord text="консульта" zones={["start", "mid"]} />
          <CrispLetters text="ция" />
        </span>
      </h1>
    </div>
  );
}
