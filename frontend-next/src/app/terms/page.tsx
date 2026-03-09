import React from 'react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl text-slate-300">
      <h1 className="text-4xl font-bold text-slate-100 mb-8">Terms of Service</h1>
      <p className="text-sm text-slate-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using the OpsFlowAI platform (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). 
            If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            OpsFlowAI provides an AI-powered support automation platform. We grant you a limited, non-exclusive, non-transferable, revocable license to use the Service 
            for your internal business purposes, subject to these Terms and your subscription plan.
          </p>
          <p>
            We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">3. Customer Obligations</h2>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Use the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
            <li>Violate, or encourage others to violate, any right of a third party, including by infringing or misappropriating any third-party intellectual property right.</li>
            <li>Interfere with security-related features of the Service.</li>
            <li>Reverse engineer or attempt to discover the source code of the Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">4. Fees and Payment</h2>
          <p className="mb-4">
            You agree to pay all fees associated with your subscription plan. Fees are non-refundable except as required by law. 
            We reserve the right to change our fees upon notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">5. Service Level Agreement (SLA) & Support</h2>
          <p className="mb-4">
            We aim to maintain 99.9% uptime. Support is provided according to your subscription tier. 
            While we strive to resolve all issues promptly, we do not guarantee specific resolution times unless explicitly stated in a separate enterprise agreement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">6. Data Protection & Security</h2>
          <p className="mb-4">
            We implement industry-standard security measures, including encryption in transit and at rest, to protect your data. 
            However, no method of transmission over the Internet is 100% secure.
          </p>
          <p className="mb-4">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">7. Intellectual Property Rights</h2>
          <p className="mb-4">
            You retain all rights to your data. OpsFlowAI retains all rights to the Service, including all intellectual property rights therein. 
            We act as a data processor for the content you process through our AI models.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">8. Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by law, OpsFlowAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
            or any loss of profits or revenues.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">9. Termination</h2>
          <p className="mb-4">
            You may terminate your account at any time. We may terminate or suspend your access to the Service immediately, without prior notice or liability, 
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">10. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at legal@opsflow.ai.
          </p>
        </section>
      </div>
    </div>
  );
}
