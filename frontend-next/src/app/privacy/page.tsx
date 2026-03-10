import React from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="prose prose-invert prose-lg max-w-none">
          <h1>Privacy Policy</h1>
          <p className="lead">Last updated: March 2026</p>

          <p>
            At OpsFlow, we take your privacy seriously. This policy describes how we collect, use,
            and protect your data.
          </p>

          <h3>1. Data Collection</h3>
          <p>
            We collect information you provide directly to us, such as when you create an account,
            connect your email, or contact support. This includes:
          </p>
          <ul>
            <li>Contact information (name, email address)</li>
            <li>Support ticket data (email content, metadata)</li>
            <li>Usage data (how you interact with our agents)</li>
          </ul>

          <h3>2. AI & Data Usage</h3>
          <p>
            We use Artificial Intelligence to provide our services. Your data may be processed by
            our LLM providers (e.g., Google Gemini, OpenAI) strictly for the purpose of generating
            responses and classifications.
            <strong>We do not use your data to train public models.</strong>
          </p>

          <h3>3. Data Security</h3>
          <p>
            We implement enterprise-grade security measures, including encryption at rest and in
            transit, strict access controls, and regular security audits.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
