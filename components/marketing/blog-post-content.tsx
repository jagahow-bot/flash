import Link from "next/link";
import { SimpleMarkdown } from "@/components/marketing/simple-markdown";
import {
  getBlogCategoryKey,
  type BlogCategoryLabels,
} from "@/lib/content/blog-posts";
import { localePath, type Locale } from "@/lib/i18n/config";

export function BlogPostContent({
  locale,
  title,
  summary,
  content,
  category,
  categoryLabels,
  backToBlogLabel,
}: {
  locale: Locale;
  title: string;
  summary: string;
  content: string;
  category: string;
  categoryLabels: BlogCategoryLabels;
  backToBlogLabel: string;
}) {
  const categoryKey = getBlogCategoryKey(category);
  const categoryLabel = categoryKey
    ? categoryLabels[categoryKey]
    : category;
  const registerHref = localePath(locale, "/register");

  return (
    <article>
      <nav aria-label={backToBlogLabel} className="mb-8">
        <Link
          href={localePath(locale, "/blog")}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {backToBlogLabel}
        </Link>
      </nav>

      <header className="mb-10 space-y-4">
        <p className="text-sm font-medium text-muted-foreground">
          {categoryLabel}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground">{summary}</p>
      </header>

      <SimpleMarkdown content={content} registerHref={registerHref} />
    </article>
  );
}
