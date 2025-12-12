'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Facebook, Twitter, Instagram, Youtube, Linkedin,
  Mail, Phone, MapPin
} from 'lucide-react';

const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Help Center', href: '/help' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Refund Policy', href: '/refund' },
  ];

  const resources = [
    { name: 'All Courses', href: '/courses' },
    { name: 'Test Series', href: '/test-series' },
  ];

  const examLinks = [
    { name: 'RAS Prelims', href: '/test-series/ras-prelims' },
    { name: 'RAS Mains', href: '/test-series/ras-mains' },
    { name: 'REET Level 1', href: '/test-series/reet-level-1' },
    { name: 'REET Level 2', href: '/test-series/reet-level-2' },
    { name: 'Rajasthan Patwar', href: '/test-series/patwar' },
    { name: 'Rajasthan Police', href: '/test-series/police' },
    { name: 'RPSC 1st Grade', href: '/test-series/rpsc-1st-grade' },
    { name: 'RPSC 2nd Grade', href: '/test-series/rpsc-2nd-grade' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Exam Links Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-grotesk font-bold text-xl mb-8 text-center"
          >
            Rajasthan Government Exams We Cover
          </motion.h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {examLinks.map((exam, index) => (
              <Link key={exam.name} href={exam.href}>
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 133, 255, 0.1)' }}
                  className="block px-4 py-3 bg-gray-800 rounded-xl text-center text-sm font-medium hover:text-primary transition-all cursor-pointer"
                >
                  {exam.name}
                </motion.span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/icononly.svg"
                alt="Sivi Academy"
                width={40}
                height={40}
                className="h-10 w-10 object-contain brightness-0 invert"
              />
              <span className="font-grotesk font-bold text-xl">
                Sivi<span className="text-primary">Academy</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Rajasthan&apos;s most trusted platform for government exam preparation.
              Crack RAS, REET, Patwar, Police & all RPSC exams with structured courses
              and government exam-style mock tests.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:info@siviacademy.in" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                info@siviacademy.in
              </a>
              <a href="tel:+917073431114" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                +91 70734 31114
              </a>
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Jaipur, Rajasthan, India</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-white mb-4">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-4">
              Get RPSC exam notifications, Rajasthan current affairs & study tips in your inbox.
            </p>

            {/* Newsletter Form */}
            <div className="flex gap-2 mb-6">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary text-white placeholder-gray-500"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2.5 bg-primary text-white rounded-xl font-medium text-sm"
              >
                Subscribe
              </motion.button>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm text-gray-400 mb-3">Follow us</p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 133, 255, 0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 SiviAcademy. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
