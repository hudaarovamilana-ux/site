import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES } from "@/lib/articles";
import { GentleReminder } from "@/components/ui/GentleReminder";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = ARTICLES.find((a) => a.id === id);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs uppercase tracking-wider text-ink-muted mb-4">
        {article.category} · {article.readMinutes} мин чтения
      </p>
      <h1 className="text-3xl font-medium text-ink mb-6">{article.title}</h1>
      <div className="prose prose-sm text-ink-soft leading-relaxed space-y-4">
        <p>{article.excerpt}</p>
        <p>
          Полный текст статьи будет загружен из базы контента бота и клинических рекомендаций.
          Здесь появится развёрнутый материал с разделами, списками и практическими советами.
        </p>
      </div>
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
