'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, BookOpen, BarChart3, Languages, Smartphone, RefreshCw,
  CheckCircle2, FileText, Award, Clock
} from 'lucide-react';
import { FEATURES } from '@/data/examCategories';

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  BookOpen,
  BarChart3,
  Languages,
  Smartphone,
  RefreshCw,
  FileText,
  Award,
  Clock,
};

const FeatureCard: React.FC<{
  feature: typeof FEATURES[0];
  index: number;
}> = ({ feature, index }) => {
  const Icon = iconMap[feature.icon] || Sparkles;
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${feature.color}15` }}
      >
        <Icon className="w-6 h-6" style={{ color: feature.color }} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
};

const Features: React.FC = () => {
  const benefits = [
    'Complete courses with Notes + PDFs + Quizzes',
    'Government exam-style test series with ranking',
    'Detailed explanations for every answer',
    'Study in Hindi or English - your choice',
    'Track progress with smart analytics',
    '2025 RPSC exam patterns covered',
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 bg-cat-defence/10 text-cat-defence rounded-full text-sm font-medium mb-4">
              Why SiviAcademy?
            </span>
            <h2 className="font-grotesk font-bold text-3xl sm:text-4xl text-gray-900 mb-6">
              Everything You Need for{' '}
              <span className="text-primary">Rajasthan Exams</span>
            </h2>
            <p className="text-gray-600 mb-8">
              From structured courses to government exam-style mock tests, SiviAcademy provides
              complete preparation for RAS, REET, Patwar, Police, and all RPSC exams.
            </p>

            {/* Benefits List */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  {benefit}
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0, 133, 255, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg"
            >
              Explore All Features
            </motion.button>
          </motion.div>

          {/* Right - Feature Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((feature, index) => (
              <FeatureCard key={feature.id} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
