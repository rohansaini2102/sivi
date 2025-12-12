import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { generateMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
  title: 'Refund Policy - Sivi Academy',
  description: 'Sivi Academy\'s refund policy. Understand our refund terms and conditions for courses and test series.',
  path: '/refund',
  keywords: ['refund policy', 'cancellation', 'money back'],
});

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Refund Policy
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last Updated:</strong> December 2024
            </p>

            <p className="text-gray-700 mb-6">
              At Sivi Academy, we strive to provide high-quality educational content for Rajasthan government exam preparation. Please read our refund policy carefully before making a purchase.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Refund Eligibility</h2>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Courses</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Refund requests must be made within <strong>7 days</strong> of purchase</li>
                <li>Course content consumption must be less than <strong>20%</strong></li>
                <li>No downloads of PDFs or study materials should have been made</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Test Series</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Refund requests must be made within <strong>3 days</strong> of purchase</li>
                <li>No more than <strong>1 test</strong> should have been attempted</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Non-Refundable Items</h2>
              <p className="text-gray-700 mb-4">
                The following are <strong>not eligible</strong> for refunds:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Free courses or test series</li>
                <li>Discounted or promotional purchases (unless specified otherwise)</li>
                <li>Purchases made more than 7 days ago</li>
                <li>Content that has been substantially consumed (more than 20%)</li>
                <li>Downloaded materials</li>
                <li>Subscription renewals (after renewal date)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How to Request a Refund</h2>
              <p className="text-gray-700 mb-4">
                To request a refund:
              </p>
              <ol className="list-decimal pl-6 text-gray-700 mb-4 space-y-2">
                <li>Email us at <strong>info@siviacademy.in</strong> with the subject line &quot;Refund Request&quot;</li>
                <li>Include your registered email address and order ID</li>
                <li>Provide the reason for your refund request</li>
                <li>Our team will review your request within 2-3 business days</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Processing</h2>
              <p className="text-gray-700 mb-4">
                Once your refund is approved:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Refunds will be processed within <strong>5-7 business days</strong></li>
                <li>Amount will be credited to the original payment method</li>
                <li>Bank processing time may add 3-5 additional days</li>
                <li>You will receive email confirmation once the refund is initiated</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Partial Refunds</h2>
              <p className="text-gray-700 mb-4">
                In some cases, partial refunds may be granted:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Content consumption between 20-40%: 50% refund may be considered</li>
                <li>Technical issues preventing access: Pro-rated refund based on unused period</li>
                <li>Course discontinued by Sivi Academy: Full or partial refund based on completion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Technical Issues</h2>
              <p className="text-gray-700 mb-4">
                If you experience technical issues:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Contact our support team first at info@siviacademy.in</li>
                <li>We will attempt to resolve the issue within 24-48 hours</li>
                <li>If the issue cannot be resolved and prevents course access, a refund will be considered</li>
                <li>Please provide screenshots or details of the technical problem</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Account Suspension</h2>
              <p className="text-gray-700 mb-4">
                No refunds will be provided if your account is suspended due to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Violation of Terms of Service</li>
                <li>Sharing account credentials</li>
                <li>Fraudulent activity</li>
                <li>Content piracy or redistribution</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cancellation Policy</h2>
              <p className="text-gray-700 mb-4">
                You can cancel your subscription at any time:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Access continues until the end of the current billing period</li>
                <li>No refund for the remaining period of the current billing cycle</li>
                <li>You won&apos;t be charged for future billing cycles after cancellation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                If you&apos;re not satisfied with the refund decision:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>You may appeal by emailing info@siviacademy.in with additional details</li>
                <li>Appeals will be reviewed by senior management within 5 business days</li>
                <li>The appeal decision is final</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For refund-related queries:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li><strong>Email:</strong> info@siviacademy.in</li>
                <li><strong>Phone:</strong> +91 70734 31114</li>
                <li><strong>Address:</strong> Jaipur, Rajasthan, India</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Our support team is available Monday to Saturday, 9 AM to 6 PM IST.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
