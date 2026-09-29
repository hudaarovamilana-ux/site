export function renderLine(line: string, key: string) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const isBullet =
    trimmed.startsWith("•") ||
    trimmed.startsWith("-") ||
    trimmed.startsWith("  -") ||
    /^\d+\.\s/.test(trimmed);

  if (isBullet) {
    return (
      <li key={key} className="text-sm text-ink-soft leading-relaxed pl-1">
        {trimmed.replace(/^(\d+\.\s|•\s*|[-–]\s*)/, "")}
      </li>
    );
  }

  return (
    <p key={key} className="text-sm text-ink-soft leading-relaxed">
      {trimmed}
    </p>
  );
}

export function SectionBody({ content }: { content: string }) {
  const blocks = content.split("\n\n");

  return (
    <div className="space-y-3">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const bullets = lines.filter((l) => {
          const t = l.trim();
          return (
            t.startsWith("•") ||
            t.startsWith("-") ||
            t.startsWith("  -") ||
            /^\d+\.\s/.test(t)
          );
        });
        const hasOnlyBullets =
          bullets.length > 0 && bullets.length === lines.filter((l) => l.trim()).length;

        if (hasOnlyBullets) {
          return (
            <ul key={bi} className="space-y-1.5 list-none">
              {lines.map((line, li) => renderLine(line, `${bi}-${li}`))}
            </ul>
          );
        }

        return (
          <div key={bi} className="space-y-2">
            {lines.map((line, li) => renderLine(line, `${bi}-${li}`))}
          </div>
        );
      })}
    </div>
  );
}

export interface ContentSection {
  title: string;
  content: string;
}

export function MarkdownSections({ sections }: { sections: ContentSection[] }) {
  return (
    <div className="space-y-5">
      {sections.map((section, index) => (
        <section
          key={`${section.title}-${index}`}
          className="rounded-2xl border border-beige-dark/40 bg-white/60 p-5"
        >
          <h2 className="text-sm font-medium text-ink mb-3">{section.title}</h2>
          <SectionBody content={section.content} />
        </section>
      ))}
    </div>
  );
}
