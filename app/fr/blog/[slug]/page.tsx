import {
  getBlogPostStaticParams,
  getLocaleBlogPostMetadata,
  renderLocaleBlogPostPage,
} from "@/lib/i18n/blog-locale-page";
import type { Locale } from "@/lib/i18n/config";

const locale = "fr" as const satisfies Locale;

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogPostStaticParams(locale);
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  return getLocaleBlogPostMetadata(locale, slug);
}

export default async function FrenchBlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  return renderLocaleBlogPostPage(locale, slug);
}
