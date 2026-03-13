'use client';
import React from 'react';
import { Nav, Hero, LogoBar, Features, Stats, Pricing, Testimonials, CTABanner, Footer } from '@/components/landing/LandingComponents';

export default function MarketingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#040404' }}>
      <Nav />
      <Hero />
      <LogoBar />
      <Features />
      <Stats />
      <Pricing />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
}
