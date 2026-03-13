'use client';
import React from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { MDXComponents } from './MDXComponents';
import { motion, AnimatePresence } from 'framer-motion';

interface DocContentProps {
  source: MDXRemoteSerializeResult;
}

export function DocContent({ source }: DocContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={source.compiledSource}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <MDXRemote {...source} components={MDXComponents} />
      </motion.div>
    </AnimatePresence>
  );
}
