import Link from "next/link";
import { ARTICLES } from "@/lib/articles";

export default function ArticlesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-medium text-ink mb-2">Интересные статьи</h1>
      <p className="text-ink-muted text-sm mb-10">
        Полезные материалы о здоровье, беременности и планировании
      </p>

      <div className="grid gap-6">
        {ARTICLES.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.id}`}
            className="group block rounded-2xl border border-beige-dark/40 bg-white/60 p-6 hover:border-rose/30 hover:shadow-[0_8px_30px_rgba(232,196,203,0.12)] transition"
          >
            <div className="flex items-center gap-3 text-xs text-ink-muted mb-2">
              <span className="uppercase tracking-wider">{article.category}</span>
              <span>·</span>
              <span>{article.readMinutes} мин</span>
            </div>
            <h2 className="text-lg font-medium text-ink group-hover:text-ink/80 transition">
              {article.title}
            </h2>
            <p className="text-sm text-ink-soft mt-2 leading-relaxed">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
