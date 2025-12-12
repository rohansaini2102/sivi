'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'info@siviacademy.in',
      href: 'mailto:info@siviacademy.in',
      color: 'bg-blue-500',
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+91 70734 31114',
      href: 'tel:+917073431114',
      color: 'bg-green-500',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: 'Jaipur, Rajasthan, India',
      href: '#',
      color: 'bg-purple-500',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      content: 'Mon - Sat: 9 AM - 6 PM',
      href: '#',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-white to-blue-50 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Get in Touch
              </h1>
              <p className="text-lg text-gray-600">
                Have questions about our courses or need assistance? We&apos;re here to help you succeed in your Rajasthan government exam preparation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 -mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={item.title}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.content}</p>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
                    <p className="text-green-700">
                      Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      className="mt-4"
                      variant="outline"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Your Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Select a subject</option>
                          <option value="course-inquiry">Course Inquiry</option>
                          <option value="test-series">Test Series Query</option>
                          <option value="payment">Payment Issue</option>
                          <option value="technical">Technical Support</option>
                          <option value="refund">Refund Request</option>
                          <option value="feedback">Feedback</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you..."
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </motion.div>

              {/* FAQ Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

                <div className="space-y-4">
                  {[
                    {
                      q: 'How do I access my purchased courses?',
                      a: 'After purchasing, log in to your account and visit the Dashboard. All your courses will be available under "My Courses" section.',
                    },
                    {
                      q: 'What payment methods do you accept?',
                      a: 'We accept UPI, debit/credit cards, net banking, and popular wallets like Paytm and PhonePe.',
                    },
                    {
                      q: 'Can I access courses on mobile?',
                      a: 'Yes! Our platform is fully mobile-responsive. You can access all courses, tests, and materials on any device.',
                    },
                    {
                      q: 'What is the validity of courses?',
                      a: 'Each course has its own validity period mentioned on the course page. Typically, courses are valid for 6-12 months.',
                    },
                    {
                      q: 'How can I request a refund?',
                      a: 'Please email us at info@siviacademy.in with your order details within 7 days of purchase. Check our Refund Policy for eligibility.',
                    },
                  ].map((faq, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-5 border border-gray-100"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                      <p className="text-gray-600 text-sm">{faq.a}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <h3 className="font-semibold text-gray-900 mb-2">Need Immediate Help?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    For urgent queries, reach out to us directly via phone or WhatsApp.
                  </p>
                  <a
                    href="tel:+917073431114"
                    className="inline-flex items-center text-primary font-medium hover:underline"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    +91 70734 31114
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
