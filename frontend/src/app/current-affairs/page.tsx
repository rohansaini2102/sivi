'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Newspaper,
  Calendar,
  BookOpen,
  TrendingUp,
  Globe,
  Building2,
  Landmark,
  Users,
  ChevronRight,
  Bell,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categories = [
  { name: 'Rajasthan', icon: Building2, color: 'bg-orange-500' },
  { name: 'National', icon: Landmark, color: 'bg-blue-500' },
  { name: 'International', icon: Globe, color: 'bg-green-500' },
  { name: 'Economy', icon: TrendingUp, color: 'bg-purple-500' },
  { name: 'Sports', icon: Users, color: 'bg-red-500' },
  { name: 'Science & Tech', icon: BookOpen, color: 'bg-cyan-500' },
];

const months = [
  'January 2025', 'December 2024', 'November 2024', 'October 2024',
  'September 2024', 'August 2024', 'July 2024', 'June 2024',
];

export default function CurrentAffairsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge className="bg-white/20 text-white mb-4">
                <Newspaper className="w-3 h-3 mr-1" />
                Updated Daily
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Rajasthan Current Affairs
              </h1>
              <p className="text-lg text-indigo-100 mb-8">
                Stay updated with daily current affairs curated for RAS, REET, Patwar, Police & all Rajasthan government exams.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  <Bell className="w-4 h-4 mr-2" />
                  Subscribe for Updates
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <motion.button
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedCategory(category.name.toLowerCase())}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    selectedCategory === category.name.toLowerCase()
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon Notice */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 md:p-12 border border-amber-200 text-center"
            >
              <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Newspaper className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Current Affairs Section Coming Soon!
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                We&apos;re working hard to bring you daily current affairs updates specifically curated for Rajasthan government exams. Subscribe to get notified when we launch!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/test-series">
                  <Button>
                    Explore Test Series
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="outline">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Monthly Archives Placeholder */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Archives</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {months.map((month, index) => (
                <motion.div
                  key={month}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{month}</p>
                      <p className="text-sm text-gray-500">Coming soon</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What to Expect</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Daily Updates',
                  description: 'Fresh current affairs every day covering Rajasthan, national, and international news.',
                  icon: Newspaper,
                },
                {
                  title: 'Exam-Focused',
                  description: 'Content curated specifically for RAS, REET, Patwar, Police & RPSC exams.',
                  icon: BookOpen,
                },
                {
                  title: 'Downloadable PDFs',
                  description: 'Monthly compilations available for offline study and quick revision.',
                  icon: Download,
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-gray-200"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-primary to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Start Your Exam Preparation Today
            </h2>
            <p className="text-blue-100 mb-8">
              While we prepare current affairs content, explore our comprehensive courses and test series.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" variant="secondary">
                  View Courses
                </Button>
              </Link>
              <Link href="/free-tests">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  Try Free Tests
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
