import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostContent } from "@/components/marketing/blog-post-content";
import { LegalPageLayout } from "@/components/marketing/legal-page-layout";
import {
  blogPostHasLocale,
  getAllBlogSlugs,
  getBlogCategoryKey,
  getBlogPostForLocale,
  listBlogPostsForLocale,
} from "@/lib/content/blog-posts";
import {
  buildBlogIndexMetadata,
  buildBlogPostMetadata,
} from "@/lib/i18n/blog-metadata";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function getLocaleBlogIndexMetadata(
  locale: Locale,
): Promise<Metadata> {
  const dict = await getDictionary(locale);
  return buildBlogIndexMetadata(locale, dict);
}

export async function renderLocaleBlogIndexPage(locale: Locale) {
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

export function getBlogPostStaticParams(locale: Locale) {
  return getAllBlogSlugs()
    .filter((slug) => blogPostHasLocale(slug, locale))
    .map((slug) => ({ slug }));
}

export async function getLocaleBlogPostMetadata(
  locale: Locale,
  slug: string,
): Promise<Metadata> {
  const post = getBlogPostForLocale(slug, locale);

  if (!post) {
    return { title: "Not Found" };
  }

  return buildBlogPostMetadata(locale, slug, post.title, post.summary);
}

export async function renderLocaleBlogPostPage(locale: Locale, slug: string) {
  const [dict, post] = await Promise.all([
    getDictionary(locale),
    Promise.resolve(getBlogPostForLocale(slug, locale)),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <LegalPageLayout dict={dict}>
      <BlogPostContent
        locale={locale}
        title={post.title}
        summary={post.summary}
        content={post.content}
        category={post.category}
        categoryLabels={dict.blog.categories}
        backToBlogLabel={dict.blog.backToBlog}
      />
    </LegalPageLayout>
  );
}
