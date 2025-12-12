import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { generateMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
  title: 'Terms of Service - Sivi Academy',
  description: 'Read Sivi Academy\'s terms of service. Understand the rules and guidelines for using our platform.',
  path: '/terms',
  keywords: ['terms of service', 'terms and conditions', 'user agreement'],
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last Updated:</strong> December 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Sivi Academy&apos;s website and services at siviacademy.in, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Services</h2>
              <p className="text-gray-700 mb-4">
                Sivi Academy provides online educational services including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Online courses for Rajasthan government exam preparation (RAS, REET, Patwar, Police, RPSC)</li>
                <li>Mock tests and practice tests</li>
                <li>Study materials and resources</li>
                <li>Performance analytics and progress tracking</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                For paid courses and test series:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>All prices are in Indian Rupees (INR) and include applicable taxes</li>
                <li>Payment must be made in full before accessing paid content</li>
                <li>We accept various payment methods including UPI, cards, and net banking</li>
                <li>Prices may change without prior notice for new purchases</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Course Access and Validity</h2>
              <p className="text-gray-700 mb-4">
                Upon successful payment:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Access to courses/test series is granted for the specified validity period</li>
                <li>Content access expires at the end of the validity period</li>
                <li>Course content is for personal use only and cannot be shared or redistributed</li>
                <li>We reserve the right to update course content without prior notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content on Sivi Academy, including but not limited to courses, videos, questions, study materials, graphics, and logos, is the intellectual property of Sivi Academy. You may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Copy, reproduce, or distribute any content without written permission</li>
                <li>Record, download, or capture video content</li>
                <li>Share login credentials with others</li>
                <li>Use content for commercial purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Use the platform for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to any part of the platform</li>
                <li>Interfere with or disrupt the platform&apos;s functionality</li>
                <li>Upload malicious code or viruses</li>
                <li>Impersonate another person or entity</li>
                <li>Use automated systems to access the platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                Sivi Academy provides educational content to assist in exam preparation. However:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>We do not guarantee selection or success in any examination</li>
                <li>Results depend on individual effort and other factors beyond our control</li>
                <li>Our content is based on our understanding of exam patterns and may not reflect exact exam questions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Sivi Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform or services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Modifications to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Jaipur, Rajasthan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions regarding these terms, please contact us:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li><strong>Email:</strong> info@siviacademy.in</li>
                <li><strong>Phone:</strong> +91 70734 31114</li>
                <li><strong>Address:</strong> Jaipur, Rajasthan, India</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
