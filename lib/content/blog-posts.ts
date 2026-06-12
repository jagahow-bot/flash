import { blogPostsData } from "@/lib/content/blog-posts-data";
import type { Locale } from "@/lib/i18n/config";
import { locales } from "@/lib/i18n/config";

export type BlogPostLocaleContent = {
  title: string;
  summary: string;
  content: string;
};

export type BlogPostRecord = {
  slug: string;
  category: string;
  locales: Partial<Record<Locale, BlogPostLocaleContent>>;
};

const posts = blogPostsData as unknown as BlogPostRecord[];

const categoryKeys: Record<string, keyof BlogCategoryLabels> = {
  "IP Protection": "ipProtection",
  "Legal Safeguards": "legalSafeguards",
  "Global Marketing": "globalMarketing",
};

export type BlogCategoryLabels = {
  ipProtection: string;
  legalSafeguards: string;
  globalMarketing: string;
};

export function getBlogCategoryKey(
  category: string,
): keyof BlogCategoryLabels | null {
  return categoryKeys[category] ?? null;
}

export function getAllBlogSlugs(): string[] {
  return posts.map((post) => post.slug);
}

export function getBlogPost(slug: string): BlogPostRecord | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getBlogPostForLocale(
  slug: string,
  locale: Locale,
): (BlogPostLocaleContent & { slug: string; category: string }) | null {
  const post = getBlogPost(slug);
  if (!post) return null;

  const localized = post.locales[locale];
  if (!localized) return null;

  return {
    slug: post.slug,
    category: post.category,
    ...localized,
  };
}

export function listBlogPostsForLocale(locale: Locale) {
  return posts
    .map((post) => {
      const localized = post.locales[locale];
      if (!localized) return null;
      return {
        slug: post.slug,
        category: post.category,
        title: localized.title,
        summary: localized.summary,
      };
    })
    .filter((post): post is NonNullable<typeof post> => post !== null);
}

export function blogPostHasLocale(slug: string, locale: Locale): boolean {
  const post = getBlogPost(slug);
  return Boolean(post?.locales[locale]);
}

export function getBlogPostLocales(slug: string): Locale[] {
  const post = getBlogPost(slug);
  if (!post) return [];
  return locales.filter((locale) => Boolean(post.locales[locale]));
}
