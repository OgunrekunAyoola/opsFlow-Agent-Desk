import React from 'react';
import { serialize } from 'next-mdx-remote/serialize';
import { DocContent } from '@/components/docs/DocContent';
import fs from 'fs';
import path from 'path';

export default async function DocPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  
  // Map slugs to MDX files
  const slugMap: Record<string, string> = {
    'introduction': 'intro.mdx',
    'installation': 'intro.mdx', // Reusing for now
    'environment-variables': 'deployment.mdx',
    'pipeline': 'pipeline.mdx',
    'context': 'pipeline.mdx',
    'triage': 'pipeline.mdx',
    'agents': 'agents.mdx',
    'api': 'api.mdx',
    'integrations': 'integrations.mdx',
    'deployment': 'deployment.mdx',
  };

  const fileName = slugMap[slug] || 'intro.mdx';
  const filePath = path.join(process.cwd(), 'src/app/docs', fileName);
  
  let source = '';
  try {
    source = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    source = '# 404 - Not Found\n\nThe requested documentation page could not be found.';
  }

  const mdxSource = await serialize(source);

  return <DocContent source={mdxSource} />;
}
