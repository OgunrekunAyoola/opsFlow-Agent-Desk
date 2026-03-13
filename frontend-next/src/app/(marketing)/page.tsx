'use client';
import React from 'react';
import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { Logos } from '@/components/landing/Logos';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { Metrics } from '@/components/landing/Metrics';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { NoiseOverlay } from '@/components/ui/NoiseOverlay';

export default function MarketingPage() {
  return (
    <main className="relative min-h-screen bg-black selection:bg-accent/30 selection:text-accent">
      <ScrollProgress />
      <NoiseOverlay />
      
      <Nav />
      <Hero />
      
      <div className="space-y-0">
        <Logos />
        <ProblemSolution />
        <HowItWorks />
        <FeaturesGrid />
        <Metrics />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </div>

      <Footer />
    </main>
  );
}
