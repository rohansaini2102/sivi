import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { generateMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
  title: 'Cookie Policy - Sivi Academy',
  description: 'Learn about how Sivi Academy uses cookies and similar technologies on our website.',
  path: '/cookies',
  keywords: ['cookie policy', 'cookies', 'tracking', 'privacy'],
});

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Cookie Policy
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last Updated:</strong> December 2024
            </p>

            <p className="text-gray-700 mb-6">
              This Cookie Policy explains how Sivi Academy (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies and similar technologies when you visit our website siviacademy.in.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember your preferences and improve your browsing experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Types of Cookies We Use</h2>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Essential Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies are necessary for the website to function properly. They enable core functionalities such as:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>User authentication and session management</li>
                <li>Security features</li>
                <li>Remembering items in your cart</li>
                <li>Enabling access to secure areas</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Performance Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies help us understand how visitors interact with our website:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Pages visited and time spent</li>
                <li>Error messages encountered</li>
                <li>How you navigate the site</li>
                <li>Which features are most popular</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Functional Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies remember your preferences and choices:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Language preferences</li>
                <li>Display settings</li>
                <li>Login information (if you choose &quot;Remember me&quot;)</li>
                <li>Previously viewed courses or tests</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Analytics Cookies</h3>
              <p className="text-gray-700 mb-4">
                We use analytics services (like Google Analytics) to understand how our website is used:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Number of visitors</li>
                <li>Pages that are most/least popular</li>
                <li>How visitors navigate the site</li>
                <li>Technical information about devices used</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                Some cookies are placed by third-party services that appear on our pages:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Google Analytics:</strong> For website analytics and performance tracking</li>
                <li><strong>Payment Gateways:</strong> For secure payment processing (Razorpay, etc.)</li>
                <li><strong>Social Media:</strong> If you interact with social sharing buttons</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookie Duration</h2>
              <p className="text-gray-700 mb-4">
                Cookies can be classified by their duration:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period or until you delete them</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. How to Control Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can control and manage cookies in several ways:
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Browser Settings</h3>
              <p className="text-gray-700 mb-4">
                Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>View what cookies are stored</li>
                <li>Delete cookies individually or all at once</li>
                <li>Block all cookies or third-party cookies</li>
                <li>Set preferences for certain websites</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Browser-Specific Instructions</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                <li><strong>Edge:</strong> Settings → Privacy, Search, and Services → Cookies</li>
              </ul>

              <p className="text-gray-700 mb-4">
                <strong>Note:</strong> Disabling cookies may affect the functionality of our website. Some features may not work properly without cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Impact of Disabling Cookies</h2>
              <p className="text-gray-700 mb-4">
                If you choose to disable cookies:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>You may need to log in every time you visit</li>
                <li>Your preferences won&apos;t be remembered</li>
                <li>Some features may not work correctly</li>
                <li>Personalized content may not be available</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Local Storage</h2>
              <p className="text-gray-700 mb-4">
                In addition to cookies, we may use local storage (HTML5) to store data in your browser. This is similar to cookies but allows for more data storage. The same controls in your browser settings apply to local storage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please check this page periodically for updates.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about our use of cookies, please contact us:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li><strong>Email:</strong> info@siviacademy.in</li>
                <li><strong>Phone:</strong> +91 70734 31114</li>
                <li><strong>Address:</strong> Jaipur, Rajasthan, India</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. More Information</h2>
              <p className="text-gray-700 mb-4">
                For more information about cookies and how to manage them, visit:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.aboutcookies.org</a></li>
                <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.allaboutcookies.org</a></li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
