'use client';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Anchor {
  id: string;
  title: string;
}

export function AnchorLinks() {
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3'));
    const anchorData = headings.map((h) => ({
      id: h.id || h.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
      title: h.textContent || '',
    })).filter(a => a.id);
    
    setAnchors(anchorData);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0% -80% 0%' }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  if (anchors.length === 0) return null;

  return (
    <aside className="hidden xl:block fixed top-16 right-0 bottom-0 w-64 py-12 px-8 overflow-y-auto z-10">
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
          On this page
        </h4>
        <ul className="space-y-4">
          {anchors.map((anchor) => (
            <li key={anchor.id}>
              <a
                href={`#${anchor.id}`}
                className={cn(
                  "text-xs block transition-all hover:text-white",
                  activeId === anchor.id 
                    ? "text-accent font-bold pl-2 border-l border-accent" 
                    : "text-zinc-500 pl-2 border-l border-white/5"
                )}
              >
                {anchor.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
