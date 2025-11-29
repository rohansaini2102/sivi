'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Menu, X, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onStartQuiz?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onStartQuiz }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navItems = [
    { name: 'Courses', hasDropdown: true },
    { name: 'Test Series', hasDropdown: true },
    { name: 'Free Tests', hasDropdown: false },
    { name: 'Current Affairs', hasDropdown: false },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg font-grotesk">S</span>
            </div>
            <span className="font-grotesk font-bold text-xl text-gray-900">
              Sivi<span className="text-primary">Academy</span>
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.name}
                whileHover={{ backgroundColor: 'rgba(0, 133, 255, 0.05)' }}
                className="px-4 py-2 rounded-lg text-gray-700 font-medium text-sm flex items-center gap-1 transition-colors"
              >
                {item.name}
                {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </motion.button>
            ))}
          </nav>

          {/* Search Bar */}
          <motion.div
            animate={{ width: isSearchFocused ? 320 : 240 }}
            className="hidden lg:flex items-center relative"
          >
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search RAS, REET, Patwar..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </motion.div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 text-gray-700 font-medium text-sm hover:text-primary transition-colors"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0, 133, 255, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartQuiz}
              className="px-5 py-2 bg-primary text-white font-medium text-sm rounded-xl shadow-md transition-all"
            >
              Start Free
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
        className="md:hidden overflow-hidden bg-white border-t border-gray-100"
      >
        <div className="px-4 py-4 space-y-2">
          {/* Mobile Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search RAS, REET, Patwar..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {navItems.map((item) => (
            <button
              key={item.name}
              className="w-full px-4 py-3 text-left text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
              {item.name}
              {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
            </button>
          ))}

          <div className="pt-4 border-t border-gray-100 flex gap-3">
            <button className="flex-1 py-3 text-gray-700 font-medium rounded-xl border border-gray-200">
              Login
            </button>
            <button
              onClick={onStartQuiz}
              className="flex-1 py-3 bg-primary text-white font-medium rounded-xl"
            >
              Start Free
            </button>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;
