'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, FileText, Users, ArrowRight, Zap } from 'lucide-react';

interface TestSeriesCardProps {
  title: string;
  exam: string;
  tests: number;
  duration: string;
  students: string;
  price: number;
  originalPrice: number;
  color: string;
  popular?: boolean;
  index: number;
}

const TestSeriesCard: React.FC<TestSeriesCardProps> = ({
  title,
  exam,
  tests,
  duration,
  students,
  price,
  originalPrice,
  color,
  popular,
  index,
}) => {
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(0,0,0,0.12)' }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all relative group"
    >
      {popular && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning text-white text-xs font-semibold rounded-full">
            <Star className="w-3 h-3 fill-current" />
            Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div
        className="p-6 pb-4"
        style={{ background: `linear-gradient(135deg, ${color}10, ${color}05)` }}
      >
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {exam}
        </span>
        <h3 className="font-semibold text-lg text-gray-900 mb-4 line-clamp-2">{title}</h3>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{tests} Tests</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">{students} enrolled</span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-4">
          <span className="font-grotesk font-bold text-2xl text-gray-900">₹{price}</span>
          <span className="text-gray-400 line-through text-sm mb-1">₹{originalPrice}</span>
          <span className="text-success-dark text-sm font-medium mb-1">{discount}% off</span>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all"
          style={{ backgroundColor: color }}
        >
          Enroll Now
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const TestSeries: React.FC = () => {
  // Rajasthan-focused test series data
  const testSeriesData: Omit<TestSeriesCardProps, 'index'>[] = [
    {
      title: 'RAS Prelims Complete Test Series 2025',
      exam: 'RAS',
      tests: 50,
      duration: '12 months',
      students: '15K+',
      price: 999,
      originalPrice: 2499,
      color: '#4F46E5',
      popular: true,
    },
    {
      title: 'REET Level 1 & 2 Mock Tests',
      exam: 'REET',
      tests: 40,
      duration: '6 months',
      students: '25K+',
      price: 699,
      originalPrice: 1499,
      color: '#F59E0B',
      popular: true,
    },
    {
      title: 'Rajasthan Patwar Complete Pack',
      exam: 'Patwar',
      tests: 30,
      duration: '6 months',
      students: '18K+',
      price: 499,
      originalPrice: 999,
      color: '#059669',
    },
    {
      title: 'Rajasthan Police Constable Tests',
      exam: 'Police',
      tests: 25,
      duration: '6 months',
      students: '20K+',
      price: 399,
      originalPrice: 899,
      color: '#DC2626',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-warning/10 text-warning rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4 inline-block mr-1" />
            Popular Test Series
          </span>
          <h2 className="font-grotesk font-bold text-3xl sm:text-4xl text-gray-900 mb-4">
            Rajasthan Exam Test Series 2025
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Practice with government exam-style mock tests for RAS, REET, Patwar, Police & all RPSC exams.
            Get detailed solutions, ranking & performance analytics.
          </p>
        </motion.div>

        {/* Test Series Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {testSeriesData.map((series, index) => (
            <TestSeriesCard key={series.title} {...series} index={index} />
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-8 lg:p-10 text-white text-center"
        >
          <h3 className="font-grotesk font-bold text-2xl lg:text-3xl mb-3">
            Looking for Complete Course + Test Series?
          </h3>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Get structured courses with notes, PDFs & quizzes along with mock tests.
            Everything you need for Rajasthan government exams.
          </p>
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'white' }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-white text-primary font-semibold rounded-xl inline-flex items-center gap-2"
          >
            Browse All Courses
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default TestSeries;
