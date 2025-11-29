'use client';

import React from 'react';
import { motion } from 'framer-motion';

const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg viewBox="0 0 500 400" className="w-full h-auto">
        {/* Background shapes */}
        <motion.ellipse
          cx="250"
          cy="350"
          rx="200"
          ry="30"
          fill="#E5E7EB"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
        />

        {/* Desk */}
        <motion.rect
          x="100"
          y="280"
          width="300"
          height="20"
          rx="4"
          fill="#D97706"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />
        <motion.rect
          x="110"
          y="300"
          width="20"
          height="60"
          rx="2"
          fill="#B45309"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          style={{ transformOrigin: 'top' }}
        />
        <motion.rect
          x="370"
          y="300"
          width="20"
          height="60"
          rx="2"
          fill="#B45309"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          style={{ transformOrigin: 'top' }}
        />

        {/* Person body */}
        <motion.ellipse
          cx="250"
          cy="260"
          rx="50"
          ry="30"
          fill="#3B82F6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        />

        {/* Person head */}
        <motion.circle
          cx="250"
          cy="190"
          r="40"
          fill="#FCD34D"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
        />

        {/* Hair */}
        <motion.path
          d="M220 180 Q 250 140 280 180"
          fill="#1E293B"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.7 }}
        />
        <motion.ellipse
          cx="250"
          cy="165"
          rx="35"
          ry="20"
          fill="#1E293B"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        />

        {/* Face features */}
        <motion.circle
          cx="238"
          cy="188"
          r="4"
          fill="#1E293B"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 }}
        />
        <motion.circle
          cx="262"
          cy="188"
          r="4"
          fill="#1E293B"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 }}
        />
        <motion.path
          d="M242 205 Q 250 212 258 205"
          stroke="#1E293B"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.9 }}
        />

        {/* Laptop */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <rect x="180" y="250" width="140" height="30" rx="4" fill="#374151" />
          <rect x="185" y="220" width="130" height="30" rx="2" fill="#1F2937" />
          <rect x="190" y="225" width="120" height="20" rx="1" fill="#60A5FA" />
          {/* Screen content - exam */}
          <rect x="195" y="228" width="50" height="5" rx="1" fill="white" opacity="0.8" />
          <rect x="195" y="236" width="80" height="3" rx="1" fill="white" opacity="0.5" />
        </motion.g>

        {/* Books stack */}
        <motion.g
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
        >
          <rect x="330" y="250" width="50" height="10" rx="2" fill="#DC2626" />
          <rect x="335" y="240" width="45" height="10" rx="2" fill="#059669" />
          <rect x="332" y="230" width="48" height="10" rx="2" fill="#7C3AED" />
        </motion.g>

        {/* Coffee cup */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <rect x="120" y="255" width="25" height="25" rx="3" fill="#FEF3C7" />
          <ellipse cx="132.5" cy="255" rx="12.5" ry="4" fill="#FDE68A" />
          <path d="M145 262 Q 155 265 145 275" stroke="#FEF3C7" strokeWidth="4" fill="none" />
        </motion.g>

        {/* Floating elements - Exam papers */}
        <motion.g
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="60" y="120" width="60" height="80" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
          <rect x="70" y="135" width="40" height="4" rx="1" fill="#0085FF" />
          <rect x="70" y="145" width="35" height="3" rx="1" fill="#E5E7EB" />
          <rect x="70" y="152" width="38" height="3" rx="1" fill="#E5E7EB" />
          <rect x="70" y="159" width="30" height="3" rx="1" fill="#E5E7EB" />
          <circle cx="75" cy="175" r="5" fill="#DC2626" opacity="0.2" />
          <circle cx="90" cy="175" r="5" fill="#059669" opacity="0.2" />
          <circle cx="105" cy="175" r="5" fill="#059669" />
        </motion.g>

        <motion.g
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <rect x="380" y="100" width="60" height="80" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
          <rect x="390" y="115" width="40" height="4" rx="1" fill="#059669" />
          <rect x="390" y="125" width="35" height="3" rx="1" fill="#E5E7EB" />
          <rect x="390" y="132" width="38" height="3" rx="1" fill="#E5E7EB" />
          <rect x="390" y="139" width="30" height="3" rx="1" fill="#E5E7EB" />
          <text x="395" y="165" fontSize="12" fill="#059669" fontWeight="bold">A+</text>
        </motion.g>

        {/* Stars/sparkles */}
        <motion.g
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <path d="M160 80 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#F59E0B" />
        </motion.g>
        <motion.g
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <path d="M340 60 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#0085FF" />
        </motion.g>
        <motion.g
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        >
          <path d="M420 200 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#7C3AED" />
        </motion.g>

        {/* Pencil */}
        <motion.g
          initial={{ rotate: -20, x: -20 }}
          animate={{ rotate: 0, x: 0 }}
          transition={{ delay: 0.8, type: 'spring' }}
        >
          <rect x="350" y="260" width="8" height="25" rx="1" fill="#FCD34D" transform="rotate(30 354 272)" />
          <polygon points="354,287 350,295 358,295" fill="#FCD34D" transform="rotate(30 354 291)" />
          <rect x="350" y="258" width="8" height="5" rx="1" fill="#EC4899" transform="rotate(30 354 260)" />
        </motion.g>

        {/* Clock */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.9, type: 'spring' }}
        >
          <circle cx="80" cy="200" r="25" fill="white" stroke="#E5E7EB" strokeWidth="2" />
          <circle cx="80" cy="200" r="2" fill="#1E293B" />
          <motion.line
            x1="80"
            y1="200"
            x2="80"
            y2="185"
            stroke="#1E293B"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '80px 200px' }}
          />
          <motion.line
            x1="80"
            y1="200"
            x2="95"
            y2="200"
            stroke="#0085FF"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{ duration: 3600, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '80px 200px' }}
          />
        </motion.g>
      </svg>
    </div>
  );
};

export default HeroIllustration;
