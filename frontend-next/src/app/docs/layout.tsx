'use client';
import React from "react";
import { Nav } from "@/components/landing/Nav";
import { DocsSidebar } from "@/components/ui/DocsSidebar";
import { AnchorLinks } from "@/components/docs/AnchorLinks";
import { CommandPalette } from "@/components/ui/CommandPalette";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <Nav />
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
      
      <div className="max-w-[1440px] mx-auto flex h-full pt-16">
        {/* Left Sidebar */}
        <DocsSidebar />
        
        {/* Center Content */}
        <main className="flex-1 lg:pl-64 xl:pr-64 min-h-[calc(100vh-4rem)]">
          <div className="mx-auto max-w-4xl px-8 py-12 lg:px-12">
            <div className="prose prose-invert max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight 
              prose-h2:text-white prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-4 prose-h2:mt-16
              prose-h3:text-white prose-h3:mt-8
              prose-p:text-zinc-400 prose-p:leading-relaxed
              prose-strong:text-white prose-code:text-accent prose-code:bg-accent/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-ul:list-disc prose-ul:marker:text-accent
            ">
              {children}
            </div>
          </div>
        </main>

        {/* Right Sidebar (Anchor Links) */}
        <AnchorLinks />
      </div>
    </div>
  );
}
