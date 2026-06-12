import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/marketing/legal-page-layout";
import {
  getBlogCategoryKey,
  listBlogPostsForLocale,
} from "@/lib/content/blog-posts";
import { buildBlogIndexMetadata } from "@/lib/i18n/blog-metadata";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = await getDictionary(locale);
  return buildBlogIndexMetadata(locale, dict);
}

export default async function BlogIndexPage() {
  const locale = await getRequestLocale();
  const dict = await getDictionary(locale);
  const posts = listBlogPostsForLocale(locale);

  return (
    <LegalPageLayout dict={dict}>
      <div className="space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {dict.blog.title}
          </h1>
          <p className="text-lg text-muted-foreground">{dict.blog.description}</p>
        </header>

        <ul className="divide-y divide-border">
          {posts.map((post) => {
            const categoryKey = getBlogCategoryKey(post.category);
            const categoryLabel = categoryKey
              ? dict.blog.categories[categoryKey]
              : post.category;

            return (
              <li key={post.slug} className="py-8 first:pt-0">
                <article className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {categoryLabel}
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    <Link
                      href={localePath(locale, `/blog/${post.slug}`)}
                      className="transition-colors hover:text-foreground/80"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground">{post.summary}</p>
                  <Link
                    href={localePath(locale, `/blog/${post.slug}`)}
                    className="inline-block text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
                  >
                    {dict.blog.readMore}
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </LegalPageLayout>
  );
}
