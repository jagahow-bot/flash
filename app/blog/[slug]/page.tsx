import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostContent } from "@/components/marketing/blog-post-content";
import { LegalPageLayout } from "@/components/marketing/legal-page-layout";
import {
  getAllBlogSlugs,
  getBlogPostForLocale,
} from "@/lib/content/blog-posts";
import { buildBlogPostMetadata } from "@/lib/i18n/blog-metadata";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const post = getBlogPostForLocale(slug, locale);

  if (!post) {
    return { title: "Not Found" };
  }

  return buildBlogPostMetadata(locale, slug, post.title, post.summary);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
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
