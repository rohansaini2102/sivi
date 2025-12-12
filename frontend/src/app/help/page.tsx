'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  HelpCircle,
  BookOpen,
  CreditCard,
  User,
  Settings,
  FileText,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const categories = [
  {
    name: 'Getting Started',
    icon: BookOpen,
    color: 'bg-blue-500',
    faqs: [
      {
        q: 'How do I create an account?',
        a: 'Click on "Login" in the top right corner, then select "Sign Up" or use Google/Phone login. Fill in your details and verify your email or phone number to complete registration.',
      },
      {
        q: 'How do I access my purchased courses?',
        a: 'After logging in, go to your Dashboard. All your purchased courses will appear under "My Courses". Click on any course to start learning.',
      },
      {
        q: 'Can I access courses on mobile?',
        a: 'Yes! Our platform is fully mobile-responsive. You can access all courses, tests, and materials on any device - smartphone, tablet, or computer.',
      },
      {
        q: 'What languages are the courses available in?',
        a: 'Our courses are available in both Hindi and English. You can see the language option on each course page and choose based on your preference.',
      },
    ],
  },
  {
    name: 'Courses & Test Series',
    icon: FileText,
    color: 'bg-green-500',
    faqs: [
      {
        q: 'What is the validity of courses?',
        a: 'Each course has its own validity period mentioned on the course page. Typically, courses are valid for 6-12 months from the date of purchase.',
      },
      {
        q: 'Can I download course materials?',
        a: 'Yes, PDF notes and study materials can be downloaded for offline study. Video content is available for streaming only.',
      },
      {
        q: 'How are mock tests structured?',
        a: 'Our mock tests follow the exact pattern of actual government exams, including the same number of questions, marking scheme, and time duration.',
      },
      {
        q: 'Can I retake mock tests?',
        a: 'Yes, you can attempt mock tests multiple times within your subscription validity. Each attempt is recorded separately for tracking your progress.',
      },
    ],
  },
  {
    name: 'Payments & Billing',
    icon: CreditCard,
    color: 'bg-purple-500',
    faqs: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI, debit/credit cards (Visa, Mastercard, RuPay), net banking, and popular wallets like Paytm, PhonePe, and Google Pay.',
      },
      {
        q: 'Are there any hidden charges?',
        a: 'No, the price shown is the final price. All applicable taxes are included in the displayed price.',
      },
      {
        q: 'How do I get a payment receipt?',
        a: 'After successful payment, a receipt is sent to your registered email. You can also download receipts from Dashboard > Orders section.',
      },
      {
        q: 'What if my payment failed but money was deducted?',
        a: 'In case of failed transactions, the amount is automatically refunded within 5-7 business days. If not, contact us with your transaction details.',
      },
    ],
  },
  {
    name: 'Account & Profile',
    icon: User,
    color: 'bg-orange-500',
    faqs: [
      {
        q: 'How do I update my profile information?',
        a: 'Go to Dashboard > Profile. Click on "Edit Profile" to update your name, email, phone number, or profile picture.',
      },
      {
        q: 'How do I change my password?',
        a: 'Go to Dashboard > Profile > Change Password. Enter your current password and new password to update.',
      },
      {
        q: 'Can I use one account on multiple devices?',
        a: 'Yes, you can access your account from multiple devices. However, simultaneous logins may be limited based on your subscription.',
      },
      {
        q: 'How do I delete my account?',
        a: 'To delete your account, please contact us at info@siviacademy.in. Note that account deletion is permanent and you\'ll lose access to all purchased content.',
      },
    ],
  },
  {
    name: 'Technical Support',
    icon: Settings,
    color: 'bg-red-500',
    faqs: [
      {
        q: 'Video is not playing properly. What should I do?',
        a: 'Check your internet connection first. Try refreshing the page or clearing browser cache. If the issue persists, try a different browser or contact support.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Click on "Login" then "Forgot Password". Enter your registered email or phone number to receive a reset link/OTP.',
      },
      {
        q: 'The app/website is showing errors.',
        a: 'Try clearing your browser cache or updating the app. If the problem continues, take a screenshot and contact support with details.',
      },
      {
        q: 'Test timer ran out but I had network issues.',
        a: 'Our system auto-saves your answers periodically. If you face network issues during a test, contact support with your test details for assistance.',
      },
    ],
  },
  {
    name: 'Refunds & Cancellation',
    icon: HelpCircle,
    color: 'bg-cyan-500',
    faqs: [
      {
        q: 'What is your refund policy?',
        a: 'Refunds are available within 7 days of purchase if less than 20% content is consumed. Test series refunds are available within 3 days if only 1 test is attempted.',
      },
      {
        q: 'How do I request a refund?',
        a: 'Email us at info@siviacademy.in with your order ID and reason for refund. Our team will review and respond within 2-3 business days.',
      },
      {
        q: 'How long does refund processing take?',
        a: 'Once approved, refunds are processed within 5-7 business days. Bank processing may take an additional 3-5 days.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'You can cancel anytime from Dashboard > Orders. Access continues until the end of your current billing period.',
      },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Getting Started');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const filteredCategories = categories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.faqs.length > 0 || searchQuery === '');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-blue-600 text-white py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                How can we help you?
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                Find answers to common questions or contact our support team.
              </p>

              {/* Search */}
              <div className="max-w-xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white text-gray-900"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Contact */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="mailto:info@siviacademy.in" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
                <span>info@siviacademy.in</span>
              </a>
              <div className="hidden sm:block w-px h-6 bg-gray-300" />
              <a href="tel:+917073431114" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <Phone className="w-5 h-5" />
                <span>+91 70734 31114</span>
              </a>
              <div className="hidden sm:block w-px h-6 bg-gray-300" />
              <Link href="/contact" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>Contact Form</span>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {searchQuery && filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn&apos;t find any answers matching your search. Try different keywords or contact support.
                </p>
                <Link href="/contact">
                  <Button>Contact Support</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategories.map((category) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                  >
                    {/* Category Header */}
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${category.color} rounded-xl flex items-center justify-center`}>
                          <category.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900">{category.name}</span>
                        <span className="text-sm text-gray-500">({category.faqs.length} articles)</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedCategory === category.name ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* FAQs */}
                    <AnimatePresence>
                      {expandedCategory === category.name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-100"
                        >
                          <div className="p-4 space-y-2">
                            {category.faqs.map((faq) => (
                              <div
                                key={faq.q}
                                className="border border-gray-100 rounded-xl overflow-hidden"
                              >
                                <button
                                  onClick={() => setExpandedFaq(expandedFaq === faq.q ? null : faq.q)}
                                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                >
                                  <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                                  <ChevronRight
                                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                                      expandedFaq === faq.q ? 'rotate-90' : ''
                                    }`}
                                  />
                                </button>
                                <AnimatePresence>
                                  {expandedFaq === faq.q && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="px-4 pb-4"
                                    >
                                      <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg">
                                        {faq.a}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Still Need Help */}
        <section className="py-16 bg-gradient-to-r from-primary to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Still need help?
            </h2>
            <p className="text-blue-100 mb-8">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="secondary">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <a href="tel:+917073431114">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
