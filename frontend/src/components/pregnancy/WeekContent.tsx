import type { WeekInfo } from "@/lib/weeks-data";
import { MarkdownSections } from "@/components/content/MarkdownSections";

export function WeekContent({ weekInfo }: { weekInfo: WeekInfo }) {
  return (
    <MarkdownSections
      sections={weekInfo.sections.map((section) => ({
        title: section.title,
        content: section.content,
      }))}
    />
  );
}
