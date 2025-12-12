import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { generateMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
  title: 'Privacy Policy - Sivi Academy',
  description: 'Sivi Academy\'s privacy policy. Learn how we collect, use, and protect your personal information.',
  path: '/privacy',
  keywords: ['privacy policy', 'data protection', 'user privacy'],
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last Updated:</strong> December 2024
            </p>

            <p className="text-gray-700 mb-6">
              At Sivi Academy, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Personal Information</h3>
              <p className="text-gray-700 mb-4">
                When you register or use our services, we may collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Name and contact information (email, phone number)</li>
                <li>Account credentials</li>
                <li>Payment information (processed securely through payment gateways)</li>
                <li>Educational background and exam preferences</li>
                <li>Profile information you choose to provide</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Usage Information</h3>
              <p className="text-gray-700 mb-4">
                We automatically collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and location data</li>
                <li>Pages visited and features used</li>
                <li>Test performance and learning analytics</li>
                <li>Time spent on platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the collected information to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide and maintain our educational services</li>
                <li>Process payments and manage subscriptions</li>
                <li>Personalize your learning experience</li>
                <li>Generate performance analytics and recommendations</li>
                <li>Send important updates about courses and exams</li>
                <li>Respond to your inquiries and provide support</li>
                <li>Improve our platform and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell your personal information. We may share information with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Service Providers:</strong> Third parties who assist in operating our platform (payment processors, hosting services, analytics providers)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure payment processing through trusted gateways</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
              </ul>
              <p className="text-gray-700 mb-4">
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Analyze platform usage</li>
                <li>Improve user experience</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings. Disabling cookies may affect some platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise these rights, contact us at info@siviacademy.in
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your information for as long as:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Your account is active</li>
                <li>Needed to provide our services</li>
                <li>Required by law or for legitimate business purposes</li>
              </ul>
              <p className="text-gray-700 mb-4">
                After account deletion, some information may be retained for legal compliance or fraud prevention.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our services are intended for users who are at least 13 years old. We do not knowingly collect information from children under 13. If you believe we have collected such information, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Links</h2>
              <p className="text-gray-700 mb-4">
                Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy periodically. We will notify you of significant changes through email or platform notifications. Your continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                For privacy-related questions or concerns:
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
