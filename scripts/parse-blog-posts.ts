/**
 * Generates lib/content/blog-posts-data.ts from one or more markdown sources.
 *
 * Supports two formats:
 * - Legal bundle: ## ARTICLE ID: … / ### >>> LANGUAGE: … / **Body Content:**
 * - Direction3 bundle: ## >>> 語言：… <<< / **標題|**Title:** / **摘要|**Summary:**
 *
 * Usage:
 *   npx tsx scripts/parse-blog-posts.ts
 *   npx tsx scripts/parse-blog-posts.ts path/to/a.md path/to/b.md
 *   npx tsx scripts/parse-blog-posts.ts content/blog
 *
 * Default (no args): content/blog/*.md + ~/Downloads/flash_blog_legal_posts.md
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, resolve } from "node:path";

/** Strip cold-email launch promo (9/30 free) — not for public blog. */
function sanitizeBlogContent(content: string): string {
  let text = content;

  const patterns: RegExp[] = [
    /\*\*🔥[^\n]*\*\*\n?/g,
    /即日起至今年\s*\*\*9\s*月\s*30\s*日前[^*]*\*\*！?/g,
    /Flash 即日起至今年\s*\*\*9\s*月\s*30\s*日前[^*]*\*\*！?/g,
    /Flash is \*\*100% FREE[^*]*\*\*[^[\n]*(?=\[)/gi,
    /Flashは\*\*今年の9月30日まで[^*]*\*\*[^[\n]*(?=\[)/g,
    /Flashは\*\*今年の9月30日まで[^*]*\*\*[^。]*。/g,
    /Flash는 \*\*올해 9월 30일까지[^*]*\*\*[^[\n]*(?=\[)/g,
    /Flash는 \*\*올해 9월 30일까지[^*]*\*\*[^.]*\.\s*/g,
    /Flash es \*\*100% GRATUIT[^*]*\*\*[^[\n]*(?=\[)/gi,
    /Todas las funciones de Flash son \*\*100% GRATUITAS[^*]*\*\*[^[\n]*(?=\[)/gi,
    /o Flash está \*\*100% GRATUITO[^*]*\*\*[^[\n]*(?=\[)/gi,
    /ist Flash \*\*bis zum 30\. September[^*]*\*\*[^[\n]*(?=\[)/gi,
    /Flash ist \*\*bis zum 30\. September[^*]*\*\*[^[\n]*(?=\[)/gi,
    /Flash est \*\*100% GRATUIT[^*]*\*\*[^[\n]*(?=\[)/gi,
    /L'accès à Flash est \*\*100% GRATUIT[^*]*\*\*[^[\n]*(?=\[)/gi,
    /Flash เปิดให้ใช้งาน[^[\n]*30 กันยายน[^[\n]*(?=\[)/g,
    /Protect your hustle and secure your studio today\.\s*/gi,
    /To empower artists to reclaim their creative rights,\s*/gi,
    /為協助獨立刺青師打造安全的創作環境，/g,
    /保護你的工作室，從今天開始。/g,
    /アーティストの創作権を守るため、/g,
    /リスクからスタジオを守り、プロとしてのビジネスを確立しましょう。/g,
    /아티스트의 창작 권리를 보장하기 위해,\s*/g,
    /스튜디오의 안전 자산을 지금 구축하세요\.\s*/g,
    /Para apoyar a los artistas independientes,\s*/gi,
    /Protege tu negocio y asegura tu estudio desde hoy\.\s*/gi,
    /Para fortalecer os artistas independentes,\s*/gi,
    /Proteja o seu ganha-pão[^.]*\.\s*/gi,
    /Um die Rechte von Tattoo-Künstlern zu stärken,\s*/gi,
    /Schütze deine Existenz und professionalisiere dein Studio noch heute\.\s*/gi,
    /Pour soutenir la communauté des tatoueurs indépendants,\s*/gi,
    /Sécurisez votre gagne-pain[^.]*\.\s*/gi,
    /เพื่อสนับสนุนสิทธิ์ในการสร้างสรรค์ของช่างสักอิสระ\s*/g,
    /ปกป้องร้านและธุรกิจของคุณตั้งแต่วันนี้\s*/g,
  ];

  for (const pattern of patterns) {
    text = text.replace(pattern, "");
  }

  return text.replace(/\n{3,}/g, "\n\n").trim();
}

const localeMap: Record<string, string> = {
  "zh-TW": "zh-Hant",
  en: "en",
  ja: "ja",
  ko: "ko",
  es: "es",
  pt: "pt-BR",
  de: "de",
  fr: "fr",
  th: "th",
};

type PostLocaleContent = {
  title: string;
  summary: string;
  content: string;
};

type BlogPost = {
  slug: string;
  category: string;
  locales: Record<string, PostLocaleContent>;
};

function resolveInputPaths(argv: string[]): string[] {
  if (argv.length > 0) {
    return argv.flatMap(expandPath);
  }

  const paths: string[] = [];
  const blogDir = resolve(process.cwd(), "content/blog");
  if (existsSync(blogDir)) {
    paths.push(...expandPath(blogDir));
  }

  const legalDefault = resolve(
    process.env.USERPROFILE ?? "",
    "Downloads",
    "flash_blog_legal_posts.md",
  );
  if (existsSync(legalDefault)) {
    paths.push(legalDefault);
  }

  return paths;
}

function expandPath(inputPath: string): string[] {
  const absolute = resolve(inputPath);
  if (!existsSync(absolute)) {
    console.warn(`Skipping missing path: ${absolute}`);
    return [];
  }

  if (statSync(absolute).isDirectory()) {
    return readdirSync(absolute)
      .filter((name) => name.endsWith(".md"))
      .map((name) => resolve(absolute, name))
      .sort();
  }

  return [absolute];
}

function isDirection3Format(md: string): boolean {
  return /## >>> (?:語言|语言)：/.test(md);
}

function readMetadata(
  md: string,
  filePath: string,
): { slug: string; category: string } {
  const slugFromMd = md.match(/^#\s*SLUG:\s*(.+)$/m)?.[1]?.trim();
  const categoryFromMd = md.match(/^#\s*CATEGORY:\s*(.+)$/m)?.[1]?.trim();
  const slugFromFile = basename(filePath, ".md");

  return {
    slug: slugFromMd ?? slugFromFile,
    category: categoryFromMd ?? "Blog",
  };
}

function parseLegalBundle(md: string): BlogPost[] {
  const posts: BlogPost[] = [];
  const articleBlocks = md.split(/## =+\n## ARTICLE ID: /).slice(1);

  for (const block of articleBlocks) {
    const idMatch = block.match(/^([^\n]+)/);
    if (!idMatch) continue;
    const slug = idMatch[1].trim();

    const categoryMatch = block.match(/## (?:DEFAULT )?CATEGORY: ([^\n]+)/);
    const category = categoryMatch?.[1]?.trim() ?? "Blog";

    const locales: Record<string, PostLocaleContent> = {};

    const langSections = block.split(/### >>> LANGUAGE: /).slice(1);
    for (const section of langSections) {
      const langMatch = section.match(/^([^\s]+) <<<\n/);
      if (!langMatch) continue;
      const rawLang = langMatch[1].trim();
      const locale = localeMap[rawLang];
      if (!locale) {
        console.warn(`Unknown language tag: ${rawLang}`);
        continue;
      }

      const titleMatch = section.match(/\*\*Title:\*\* (.+)/);
      const summaryMatch = section.match(/\*\*Summary:\*\* (.+)/);
      const bodyMatch = section.match(
        /\*\*Body Content:\*\*\n\n([\s\S]*?)(?=\n---\s*\n\n(?:### >>> LANGUAGE:|## =+)|$)/,
      );

      if (!titleMatch || !summaryMatch || !bodyMatch) {
        console.warn(`Missing fields for ${slug} / ${rawLang}`);
        continue;
      }

      locales[locale] = {
        title: titleMatch[1].trim(),
        summary: summaryMatch[1].trim(),
        content: sanitizeBlogContent(bodyMatch[1].trim()),
      };
    }

    posts.push({ slug, category, locales });
  }

  return posts;
}

function parseDirection3Bundle(md: string, filePath: string): BlogPost[] {
  const { slug, category } = readMetadata(md, filePath);
  const locales: Record<string, PostLocaleContent> = {};

  const langSections = md.split(/## >>> (?:語言|语言)：/).slice(1);
  for (const section of langSections) {
    const langMatch = section.match(/^(\S+)/);
    if (!langMatch) continue;
    const rawLang = langMatch[1].trim();
    const locale = localeMap[rawLang];
    if (!locale) {
      console.warn(`Unknown language tag: ${rawLang}`);
      continue;
    }

    const titleMatch = section.match(/\*\*(?:標題|Title)[：:]\*\* (.+)/);
    const summaryMatch = section.match(/\*\*(?:摘要|Summary)[：:]\*\* (.+)/);
    const headerEnd = section.match(
      /\*\*(?:標題|Title)[：:]\*\* .+\n\*\*(?:摘要|Summary)[：:]\*\* .+\n+/,
    );
    const body = headerEnd
      ? section
          .slice(headerEnd.index! + headerEnd[0].length)
          .replace(/\n---\s*$/, "")
          .trim()
      : "";

    if (!titleMatch || !summaryMatch || !body) {
      console.warn(`Missing fields for ${slug} / ${rawLang}`);
      continue;
    }

    locales[locale] = {
      title: titleMatch[1].trim(),
      summary: summaryMatch[1].trim(),
      content: sanitizeBlogContent(body),
    };
  }

  return [{ slug, category, locales }];
}

function parseMarkdownFile(filePath: string): BlogPost[] {
  const md = readFileSync(filePath, "utf-8");
  if (isDirection3Format(md)) {
    return parseDirection3Bundle(md, filePath);
  }
  return parseLegalBundle(md);
}

const inputPaths = resolveInputPaths(process.argv.slice(2));
if (inputPaths.length === 0) {
  console.error(
    "No input markdown files found. Pass paths or add content/blog/*.md",
  );
  process.exit(1);
}

const posts: BlogPost[] = [];
const seenSlugs = new Set<string>();

for (const filePath of inputPaths) {
  const parsed = parseMarkdownFile(filePath);
  for (const post of parsed) {
    if (seenSlugs.has(post.slug)) {
      console.warn(`Duplicate slug skipped: ${post.slug} (${filePath})`);
      continue;
    }
    seenSlugs.add(post.slug);
    posts.push(post);
    console.log(
      `Parsed ${post.slug} (${Object.keys(post.locales).length} locales) from ${filePath}`,
    );
  }
}

const outPath = resolve(process.cwd(), "lib/content/blog-posts-data.ts");
const output = `// AUTO-GENERATED by scripts/parse-blog-posts.ts — do not edit by hand.

export const blogPostsData = ${JSON.stringify(posts, null, 2)} as const;
`;

writeFileSync(outPath, output, "utf-8");
console.log(`Wrote ${posts.length} posts to ${outPath}`);
