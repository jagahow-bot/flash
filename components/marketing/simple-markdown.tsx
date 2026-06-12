import Link from "next/link";
import { Fragment, type ReactNode } from "react";

const proseClassName =
  "space-y-6 text-base leading-relaxed text-muted-foreground [&_h3]:mt-10 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_p+p]:!mt-2 [&_p+p+p]:!mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_strong]:font-medium [&_strong]:text-foreground [&_hr]:my-10 [&_hr]:border-border [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-foreground/80";

function parseInline(
  text: string,
  registerHref: string,
  keyPrefix: string,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${index}`}>
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const label = token.slice(1, -1);
      nodes.push(
        <Link key={`${keyPrefix}-a-${index}`} href={registerHref}>
          {label}
        </Link>,
      );
    }

    lastIndex = match.index + token.length;
    index += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

function renderInline(
  text: string,
  registerHref: string,
  keyPrefix: string,
): ReactNode {
  return parseInline(text, registerHref, keyPrefix).map((node, i) => (
    <Fragment key={`${keyPrefix}-f-${i}`}>{node}</Fragment>
  ));
}

function isBlockStarter(line: string): boolean {
  return (
    line === "---" || line.startsWith("### ") || line.startsWith("* ")
  );
}

export function SimpleMarkdown({
  content,
  registerHref,
}: {
  content: string;
  registerHref: string;
}) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let lineIndex = 0;
  let blockIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex].trim();

    if (!line) {
      lineIndex += 1;
      continue;
    }

    const blockKey = `b-${blockIndex}`;
    blockIndex += 1;

    if (line === "---") {
      elements.push(<hr key={`${blockKey}-hr`} />);
      lineIndex += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`${blockKey}-h3`}>
          {renderInline(line.slice(4).trim(), registerHref, `${blockKey}-h3`)}
        </h3>,
      );
      lineIndex += 1;
      continue;
    }

    if (line.startsWith("* ")) {
      const listItems: string[] = [];
      while (lineIndex < lines.length) {
        const listLine = lines[lineIndex].trim();
        if (!listLine.startsWith("* ")) break;
        listItems.push(listLine.slice(2).trim());
        lineIndex += 1;
      }

      elements.push(
        <ul key={`${blockKey}-ul`}>
          {listItems.map((item, itemIndex) => (
            <li key={`${blockKey}-li-${itemIndex}`}>
              {renderInline(
                item,
                registerHref,
                `${blockKey}-li-${itemIndex}`,
              )}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (lineIndex < lines.length) {
      const paragraphLine = lines[lineIndex].trim();
      if (!paragraphLine || isBlockStarter(paragraphLine)) break;
      paragraphLines.push(paragraphLine);
      lineIndex += 1;
    }

    elements.push(
      <p key={`${blockKey}-p`}>
        {renderInline(
          paragraphLines.join(" "),
          registerHref,
          `${blockKey}-p`,
        )}
      </p>,
    );
  }

  return <div className={proseClassName}>{elements}</div>;
}
