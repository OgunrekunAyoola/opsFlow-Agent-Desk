'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSearch, IconCommand, IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/design-tokens';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearch('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onClose(); // This would normally toggle
    }
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const results = [
    { title: 'Getting Started', category: 'Documentation' },
    { title: 'API Reference', category: 'Documentation' },
    { title: 'Integrations', category: 'Features' },
    { title: 'SLA Configuration', category: 'Settings' },
  ].filter(item => item.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-surface border border-border shadow-2xl rounded-large overflow-hidden"
          >
            <div className="flex items-center px-4 py-4 border-b border-border">
              <IconSearch className="w-5 h-5 text-textMuted mr-3" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search docs or ask a question..."
                className="flex-1 bg-transparent border-none outline-none text-textPrimary placeholder:text-textSubtle text-lg"
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-surfaceHover border border-border rounded text-xs text-textMuted">
                <IconCommand className="w-3 h-3" /> K
              </div>
            </div>

            <div className="max-height-[60vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                results.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-between px-3 py-3 rounded-default cursor-pointer transition-colors",
                      i === activeIndex ? "bg-accentDim border-accent/20 border" : "hover:bg-surfaceHover"
                    )}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <span className="text-textPrimary">{item.title}</span>
                    <span className="text-xs text-textMuted bg-border/50 px-2 py-1 rounded">{item.category}</span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-textMuted">
                  No results found for "{search}"
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 bg-surfaceHover/50 border-t border-border flex items-center justify-between text-xs text-textMuted">
              <div className="flex gap-4">
                <span><kbd className="bg-border px-1 rounded">↑↓</kbd> to navigate</span>
                <span><kbd className="bg-border px-1 rounded">Enter</kbd> to select</span>
              </div>
              <span><kbd className="bg-border px-1 rounded">Esc</kbd> to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
