'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface MarkdownViewerProps {
  content: string;
  onTocGenerated?: (items: TocItem[]) => void;
  className?: string;
}

function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    items.push({ id, text, level });
  }

  return items;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  onTocGenerated,
  className = '',
}) => {
  React.useEffect(() => {
    if (onTocGenerated) {
      const toc = extractToc(content);
      onTocGenerated(toc);
    }
  }, [content, onTocGenerated]);

  return (
    <article
      className={`prose prose-sm dark:prose-invert prose-headings:scroll-mt-20 prose-headings:font-semibold prose-h1:text-2xl prose-h1:border-b prose-h1:border-border prose-h1:pb-2 prose-h1:mb-4 prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:leading-relaxed prose-p:text-foreground/90 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-table:border-collapse prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:border prose-th:border-border prose-th:font-medium prose-th:text-sm prose-td:px-3 prose-td:py-2 prose-td:border prose-td:border-border prose-td:text-sm prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r prose-li:text-foreground/90 prose-strong:text-foreground prose-img:rounded-lg prose-img:shadow-md max-w-none ${className} `}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          rehypeHighlight,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};
