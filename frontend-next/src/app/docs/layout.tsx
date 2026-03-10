import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { DocsSidebar } from "@/components/ui/DocsSidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <Navbar />
      <div className="max-w-8xl mx-auto pt-16">
        <DocsSidebar />
        <main className="lg:pl-64 min-h-[calc(100vh-4rem)]">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-blue-400 prose-code:text-blue-300 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
