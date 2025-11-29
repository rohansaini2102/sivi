'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, HelpCircle, TrendingUp, Play, ArrowRight, Award, BookOpen } from 'lucide-react';
import HeroIllustration from './HeroIllustration';

const stats = [
  { label: 'Students', value: 50000, suffix: '+', icon: Users, color: 'text-primary' },
  { label: 'Mock Tests', value: 500, suffix: '+', icon: FileText, color: 'text-cat-ssc' },
  { label: 'Questions', value: 100000, suffix: '+', icon: HelpCircle, color: 'text-cat-railways' },
  { label: 'Success Rate', value: 92, suffix: '%', icon: TrendingUp, color: 'text-cat-defence' },
];

const examBadges = [
  { name: 'RAS', color: '#4F46E5' },
  { name: 'REET', color: '#F59E0B' },
  { name: 'Patwar', color: '#059669' },
  { name: 'Police', color: '#DC2626' },
  { name: 'RPSC', color: '#0891B2' },
];

const formatNumber = (num: number): string => {
  if (num >= 100000) return `${(num / 100000).toFixed(0)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

const AnimatedCounter: React.FC<{ value: number; suffix: string }> = ({ value, suffix }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="font-grotesk font-bold text-2xl sm:text-3xl text-gray-900">
      {formatNumber(count)}{suffix}
    </span>
  );
};

interface HeroProps {
  onStartQuiz?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartQuiz }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230085FF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success-dark rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              2025 Rajasthan Exam Syllabus Updated
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={itemVariants} className="font-grotesk font-bold text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight mb-6">
              Crack{' '}
              <span className="relative">
                <span className="text-primary">Rajasthan</span>
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <motion.path
                    d="M2 8 C 50 2, 150 2, 198 8"
                    stroke="#0085FF"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </span>{' '}
              Govt Exams
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={itemVariants} className="text-lg text-gray-600 mb-6 max-w-xl mx-auto lg:mx-0">
              Rajasthan&apos;s most trusted exam preparation platform for{' '}
              <span className="font-semibold text-gray-900">RAS, REET, Patwar, Police & RPSC</span> exams.
              Get structured courses, notes, PDFs & government exam-style mock tests.
            </motion.p>

            {/* Exam Badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
              {examBadges.map((exam) => (
                <span
                  key={exam.name}
                  className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: exam.color }}
                >
                  {exam.name}
                </span>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0, 133, 255, 0.35)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartQuiz}
                className="px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg"
              >
                Explore Courses
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 133, 255, 0.05)' }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 text-lg"
              >
                <Play className="w-5 h-5 text-primary" />
                Free Mock Test
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Hindi & English
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-success" />
                RPSC Pattern
              </div>
            </motion.div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative z-10">
              <HeroIllustration />
            </div>
            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-10 right-10 bg-white rounded-xl shadow-lg p-3 hidden lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Selection</p>
                  <p className="font-bold text-sm">92%</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute bottom-20 left-0 bg-white rounded-xl shadow-lg p-3 hidden lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Students</p>
                  <p className="font-bold text-sm">50K+</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 mb-3 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
