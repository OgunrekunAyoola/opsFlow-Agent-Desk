export type DocsCategoryId =
  | 'getting-started'
  | 'setup'
  | 'features'
  | 'integrations'
  | 'use-cases'
  | 'troubleshooting';

export type DocsCategory = {
  id: DocsCategoryId;
  slug: string;
  label: string;
  order: number;
};

export type Doc = {
  id: string;
  categoryId: DocsCategoryId;
  categoryLabel: string;
  slug: string;
  title: string;
  summary?: string;
  readTime?: string;
  updatedAt?: string;
  content: string;
};

type RawFrontmatter = {
  title?: string;
  categoryId?: DocsCategoryId;
  categoryLabel?: string;
  readTime?: string;
  updatedAt?: string;
  summary?: string;
};

const DOC_CATEGORIES: DocsCategory[] = [
  { id: 'getting-started', slug: 'getting-started', label: 'Getting Started', order: 1 },
  { id: 'setup', slug: 'setup', label: 'Setup', order: 2 },
  { id: 'features', slug: 'features', label: 'Features', order: 3 },
  { id: 'integrations', slug: 'integrations', label: 'Integrations', order: 4 },
  { id: 'use-cases', slug: 'use-cases', label: 'Use Cases', order: 5 },
  { id: 'troubleshooting', slug: 'troubleshooting', label: 'Troubleshooting', order: 6 },
];

function parseFrontmatter(source: string): { frontmatter: RawFrontmatter; content: string } {
  if (!source.startsWith('---')) {
    return { frontmatter: {}, content: source };
  }

  const end = source.indexOf('\n---', 3);
  if (end === -1) {
    return { frontmatter: {}, content: source };
  }

  const raw = source.slice(3, end).trim();
  const body = source.slice(end + 4).replace(/^\s*\n/, '');
  const frontmatter: RawFrontmatter = {};

  raw.split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line
      .slice(idx + 1)
      .trim()
      .replace(/^"|"$/g, '');
    if (key === 'title') frontmatter.title = value;
    else if (key === 'categoryId') frontmatter.categoryId = value as DocsCategoryId;
    else if (key === 'categoryLabel') frontmatter.categoryLabel = value;
    else if (key === 'readTime') frontmatter.readTime = value;
    else if (key === 'updatedAt') frontmatter.updatedAt = value;
    else if (key === 'summary') frontmatter.summary = value;
  });

  return { frontmatter, content: body };
}

const modules = import.meta.glob('../content/docs/**/*.md', {
  as: 'raw',
  eager: true,
}) as Record<string, string>;

const allDocs: Doc[] = Object.entries(modules)
  .map(([path, source]) => {
    const cleanedPath = path.replace('../content/docs/', '');
    const [categorySlug, fileName] = cleanedPath.split('/');
    const slug = fileName.replace(/\.md$/, '');
    const { frontmatter, content } = parseFrontmatter(source);

    const categoryConfig = DOC_CATEGORIES.find((c) => c.slug === categorySlug);
    if (!categoryConfig) {
      return null;
    }

    const categoryId = frontmatter.categoryId || categoryConfig.id;
    const categoryLabel = frontmatter.categoryLabel || categoryConfig.label;

    const id = `${categorySlug}/${slug}`;

    return {
      id,
      categoryId,
      categoryLabel,
      slug,
      title: frontmatter.title || slug,
      summary: frontmatter.summary,
      readTime: frontmatter.readTime,
      updatedAt: frontmatter.updatedAt,
      content,
    } as Doc;
  })
  .filter(Boolean) as Doc[];

allDocs.sort((a, b) => {
  const aCat = DOC_CATEGORIES.find((c) => c.id === a.categoryId)?.order ?? 99;
  const bCat = DOC_CATEGORIES.find((c) => c.id === b.categoryId)?.order ?? 99;
  if (aCat !== bCat) return aCat - bCat;
  return a.title.localeCompare(b.title);
});

export function getDocsCategories(): DocsCategory[] {
  return DOC_CATEGORIES;
}

export function getAllDocs(): Doc[] {
  return allDocs;
}

export function getDocByCategoryAndSlug(categorySlug: string, slug: string): Doc | null {
  const category = DOC_CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) return null;
  return allDocs.find((doc) => doc.categoryId === category.id && doc.slug === slug) || null;
}

export function getDocsForCategory(categoryId: DocsCategoryId): Doc[] {
  return allDocs.filter((doc) => doc.categoryId === categoryId);
}

export function useDocsSearch(query: string): Doc[] {
  const normalized = query.trim().toLowerCase();
  const docs = getAllDocs();
  if (!normalized) return docs;
  return docs.filter((doc) => {
    const text = `${doc.title} ${doc.summary || ''} ${doc.content}`.toLowerCase();
    return text.includes(normalized);
  });
}
