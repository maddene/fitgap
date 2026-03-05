import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-icce-gray py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-icce-teal hover:text-icce-teal-dark font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="bg-white rounded-2xl shadow-medium p-8">
          <h1 className="text-4xl font-bold text-icce-dark mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-icce-dark mb-3">1. Introduction</h2>
              <p>
                The FITGAP Assessment Tool ("we," "our," or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, and safeguard your information when you use our assessment platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-icce-dark mb-3">2. Information We Collect</h2>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Account Information</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Email address (required for authentication)</li>
                <li>Full name (optional)</li>
                <li>Authentication credentials (managed securely by Netlify Identity)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Assessment Data</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Organization name and assessment details</li>
                <li>Assessment responses and scores</li>
                <li>Assessor name and assessment dates</li>
                <li>Assessment status and completion information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-icce-dark mb-3">3. How We Use Your Information</h2>
              <p className="mb-2">We use the collected information to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide and maintain the FITGAP Assessment Tool</li>
                <li>Authenticate users and manage accounts</li>
                <li>Store and display assessment results</li>
                <li>Enable comparison of assessments over time</li>
                <li>Generate PDF reports of assessment results</li>
                <li>Improve our service and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-icce-dark mb-3">4. Data Storage and Security</h2>
              <p className="mb-2">
                Your data is stored securely using Netlify's infrastructure:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Authentication is handled by Netlify Identity with industry-standard security</li>
                <li>Assessment data is stored in Netlify Blobs with encryption</li>
                <li>All data transmission occurs over secure HTTPS connections</li>
                <li>Access to your data is restricted to your authenticated account only</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-icce-dark mb-3">5. Data Retention</h2>
              <p>
                We retain your assessment data for as long as your account is active.
                You can delete individual assessments at any time from your dashboard.
                If you wish to delete your account and all associated data, please contact us at{' '}
                <a href="mailto:info@centerforclinicalexcellence.com" className="text-icce-teal hover:text-icce-teal-dark font-semibold">
                  info@centerforclinicalexcellence.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-icce-dark mb-3">6. Your Rights (GDPR)</h2>
              <p className="mb-2">If you are located in the European Economic Area (EEA), you have the following rights:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
                <li><strong>Right to Data Portability:</strong> Request export of your data</li>
                <li><strong>Right to Object:</strong> Object to processing of your data</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact{' '}
                <a href="mailto:info@centerforclinicalexcellence.com" className="text-icce-teal hover:text-icce-teal-dark font-semibold">
                  info@centerforclinicalexcellence.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-icce-dark mb-3">7. Cookies</h2>
              <p>
                We use essential cookies for authentication and session management through Netlify Identity.
                These cookies are necessary for the platform to function and cannot be disabled.
                We do not use third-party analytics or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-icce-dark mb-3">8. Third-Party Services</h2>
              <p className="mb-2">We use the following third-party services:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Netlify:</strong> Hosting, authentication, and data storage</li>
              </ul>
              <p className="mt-3">
                These services have their own privacy policies governing the use of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-icce-dark mb-3">9. Data Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties.
                Your assessment data is private and only accessible to you through your authenticated account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-icce-dark mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-icce-dark mb-3">11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="mt-3">
                <strong>Email:</strong>{' '}
                <a href="mailto:info@centerforclinicalexcellence.com" className="text-icce-teal hover:text-icce-teal-dark font-semibold">
                  info@centerforclinicalexcellence.com
                </a>
              </p>
              <p className="mt-2">
                <strong>Organization:</strong> The International Center for Clinical Excellence
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Built for <span className="font-semibold text-icce-teal">The International Center for Clinical Excellence</span> by{' '}
              <a
                href="https://openfit.care"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-icce-teal hover:text-icce-teal-dark transition-colors"
              >
                OpenFIT.care
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
