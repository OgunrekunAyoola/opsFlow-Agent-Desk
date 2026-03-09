import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl text-slate-300">
      <h1 className="text-4xl font-bold text-slate-100 mb-8">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">1. Introduction</h2>
          <p className="mb-4">
            OpsFlowAI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy and is committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, and share information about you when you use our website and services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Account Information:</strong> Name, email address, password, and billing details.</li>
            <li><strong>Usage Data:</strong> Information about how you use our service, including log data, device information, and analytics.</li>
            <li><strong>Customer Data:</strong> Content you upload or process through our service (e.g., support tickets, emails), which we process on your behalf.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Provide, maintain, and improve our Service.</li>
            <li>Process transactions and send related information.</li>
            <li>Send you technical notices, updates, security alerts, and support messages.</li>
            <li>Respond to your comments, questions, and requests.</li>
            <li>Analyze trends, usage, and activities in connection with our Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">4. Sharing of Information</h2>
          <p className="mb-4">
            We do not share your personal information with third parties except as described in this policy:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Service Providers:</strong> We may share data with third-party vendors (e.g., cloud hosting, payment processors, AI model providers) who need access to such information to perform work on our behalf.</li>
            <li><strong>Legal Compliance:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities.</li>
            <li><strong>Business Transfers:</strong> We may share information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">5. Data Retention</h2>
          <p className="mb-4">
            We store your personal data only for as long as necessary to provide the Service and for legitimate business purposes, or as required by law. 
            Customer Data is retained according to your instructions or deleted upon account termination.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">6. Your Rights (GDPR & CCPA)</h2>
          <p className="mb-4">
            Depending on your location, you may have rights regarding your personal data, including the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Access certain personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Object to our processing of your data.</li>
            <li>Request portability of your data.</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, please contact us at privacy@opsflow.ai.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">7. Security</h2>
          <p className="mb-4">
            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">8. Cookies</h2>
          <p className="mb-4">
            We use cookies to improve your experience. You can manage your cookie preferences through our Cookie Consent manager or your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">9. Changes to this Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, provide you with additional notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">10. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at privacy@opsflow.ai.
          </p>
        </section>
      </div>
    </div>
  );
}
