import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownSections } from "@/components/content/MarkdownSections";
import { ARTICLES } from "@/lib/articles";
import { ARTICLE_BODIES } from "@/lib/article-bodies";
import { GentleReminder } from "@/components/ui/GentleReminder";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = ARTICLES.find((a) => a.id === id);
  if (!article) notFound();
  const sections = ARTICLE_BODIES[id];

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs uppercase tracking-wider text-ink-muted mb-4">
        {article.category} · {article.readMinutes} мин чтения
      </p>
      <h1 className="text-3xl font-medium text-ink mb-6">{article.title}</h1>
      <p className="text-sm text-ink-soft leading-relaxed mb-8">{article.excerpt}</p>
      {sections ? (
        <MarkdownSections sections={sections} />
      ) : (
        <p className="text-sm text-ink-soft leading-relaxed">
          Материал готовится. Пока можно задать вопрос в разделе «Спросить» или обсудить тему с
          врачом на приёме.
        </p>
      )}
      <GentleReminder className="mt-10" />
      <Link
        href="/articles"
        className="inline-block mt-8 text-sm text-ink-muted hover:text-ink transition"
      >
        ← Все статьи
      </Link>
    </article>
  );
}
