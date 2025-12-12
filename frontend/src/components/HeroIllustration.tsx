'use client';

import React from 'react';
import { motion } from 'framer-motion';

const HeroIllustration: React.FC = () => {
  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 12 }
    },
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <motion.svg
        viewBox="0 0 500 400"
        className="w-full h-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Definitions - Gradients & Filters */}
        <defs>
          {/* Primary gradient */}
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0085FF" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>

          {/* Success gradient */}
          <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          {/* Purple accent gradient */}
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>

          {/* Card shadow filter */}
          <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.1" />
          </filter>

          {/* Glow effect */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Subtle background gradient blobs */}
        <defs>
          <radialGradient id="softBlueBlob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0085FF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0085FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="softGreenBlob" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Very subtle background accents - much smaller and softer */}
        <ellipse cx="450" cy="320" rx="40" ry="30" fill="url(#softBlueBlob)" />
        <ellipse cx="50" cy="100" rx="35" ry="25" fill="url(#softGreenBlob)" />

        {/* ====== TABLET DEVICE ====== */}
        <motion.g
          variants={itemVariants}
          animate={{ y: [0, -8, 0], rotate: [0, 1, 0] }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          {/* Tablet body - iPad style */}
          <rect
            x="120"
            y="100"
            width="180"
            height="140"
            rx="14"
            fill="#1F2937"
            filter="url(#cardShadow)"
          />

          {/* Camera dot */}
          <circle cx="210" cy="107" r="2" fill="#374151" />

          {/* Screen */}
          <rect x="127" y="113" width="166" height="120" rx="3" fill="#F8FAFC" />

          {/* Screen header */}
          <rect x="127" y="113" width="166" height="24" rx="3" fill="url(#primaryGradient)" />

          {/* Question text */}
          <text x="138" y="128" fontSize="8" fill="white" fontWeight="600">Question 15 of 50</text>

          {/* Progress indicator */}
          <rect x="258" y="120" width="28" height="5" rx="2.5" fill="rgba(255,255,255,0.2)" />
          <rect x="258" y="120" width="17" height="5" rx="2.5" fill="rgba(255,255,255,0.5)" />

          {/* Question content */}
          <rect x="138" y="145" width="145" height="5" rx="2" fill="#E5E7EB" />
          <rect x="138" y="154" width="110" height="4" rx="2" fill="#F3F4F6" />

          {/* Multiple choice options - 2x2 grid */}
          {/* Option A */}
          <rect x="138" y="165" width="72" height="20" rx="5" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
          <circle cx="149" cy="175" r="4" fill="white" stroke="#D1D5DB" strokeWidth="1" />
          <text x="158" y="178" fontSize="7" fill="#6B7280">Option A</text>

          {/* Option B - Selected */}
          <motion.g
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="214" y="165" width="72" height="20" rx="5" fill="#DBEAFE" stroke="#0085FF" strokeWidth="1.5" />
            <circle cx="225" cy="175" r="4" fill="#0085FF" />
            <motion.path
              d="M223 175 L224.5 177 L228 173"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1, duration: 0.3 }}
            />
            <text x="234" y="178" fontSize="7" fill="#0085FF" fontWeight="500">Option B</text>
          </motion.g>

          {/* Option C */}
          <rect x="138" y="189" width="72" height="20" rx="5" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
          <circle cx="149" cy="199" r="4" fill="white" stroke="#D1D5DB" strokeWidth="1" />
          <text x="158" y="202" fontSize="7" fill="#6B7280">Option C</text>

          {/* Option D */}
          <rect x="214" y="189" width="72" height="20" rx="5" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
          <circle cx="225" cy="199" r="4" fill="white" stroke="#D1D5DB" strokeWidth="1" />
          <text x="234" y="202" fontSize="7" fill="#6B7280">Option D</text>

          {/* Submit button */}
          <rect x="214" y="213" width="72" height="13" rx="4" fill="url(#successGradient)" />
          <text x="234" y="222" fontSize="6" fill="white" fontWeight="500">Next →</text>

          {/* Home indicator */}
          <rect x="185" y="230" width="50" height="3" rx="1.5" fill="#374151" />
        </motion.g>

        {/* ====== MOBILE PHONE ====== */}
        <motion.g
          variants={itemVariants}
          animate={{ y: [0, -6, 0], rotate: [0, -2, 0] }}
          transition={{
            y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
            rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          {/* Phone body */}
          <rect
            x="310"
            y="140"
            width="70"
            height="130"
            rx="12"
            fill="#1F2937"
            filter="url(#cardShadow)"
          />

          {/* Notch/Dynamic Island */}
          <rect x="330" y="145" width="30" height="8" rx="4" fill="#000" />

          {/* Screen */}
          <rect x="315" y="156" width="60" height="106" rx="2" fill="#F8FAFC" />

          {/* Screen header */}
          <rect x="315" y="156" width="60" height="18" rx="2" fill="url(#primaryGradient)" />
          <text x="322" y="168" fontSize="6" fill="white" fontWeight="600">Q.15/50</text>

          {/* Question placeholder */}
          <rect x="320" y="180" width="50" height="4" rx="1" fill="#E5E7EB" />
          <rect x="320" y="187" width="40" height="3" rx="1" fill="#F3F4F6" />

          {/* Options - vertical list */}
          <rect x="320" y="196" width="50" height="14" rx="3" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="0.5" />
          <circle cx="327" cy="203" r="3" fill="white" stroke="#D1D5DB" strokeWidth="1" />
          <text x="333" y="206" fontSize="5" fill="#6B7280">Option A</text>

          {/* Option B Selected on mobile */}
          <rect x="320" y="213" width="50" height="14" rx="3" fill="#DBEAFE" stroke="#0085FF" strokeWidth="1" />
          <circle cx="327" cy="220" r="3" fill="#0085FF" />
          <text x="333" y="223" fontSize="5" fill="#0085FF" fontWeight="500">Option B</text>

          <rect x="320" y="230" width="50" height="14" rx="3" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="0.5" />
          <circle cx="327" cy="237" r="3" fill="white" stroke="#D1D5DB" strokeWidth="1" />
          <text x="333" y="240" fontSize="5" fill="#6B7280">Option C</text>

          {/* Next button */}
          <rect x="320" y="248" width="50" height="10" rx="3" fill="url(#successGradient)" />
          <text x="335" y="255" fontSize="5" fill="white" fontWeight="500">Next</text>

          {/* Home indicator */}
          <rect x="330" y="264" width="30" height="2" rx="1" fill="#374151" />
        </motion.g>

        {/* ====== FLOATING OMR ANSWER SHEET ====== */}
        <motion.g
          variants={itemVariants}
          animate={{ y: [0, -10, 0], rotate: [-2, 0, -2] }}
          transition={{
            y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          {/* Paper */}
          <rect
            x="20"
            y="120"
            width="90"
            height="120"
            rx="4"
            fill="white"
            filter="url(#cardShadow)"
            stroke="#E5E7EB"
            strokeWidth="1"
          />

          {/* Header line */}
          <rect x="30" y="130" width="50" height="6" rx="2" fill="url(#primaryGradient)" />

          {/* OMR Bubbles Grid */}
          {[0, 1, 2, 3, 4].map((row) => (
            <g key={row}>
              {/* Question number */}
              <text x="32" y={155 + row * 16} fontSize="7" fill="#9CA3AF">{row + 1}.</text>
              {/* Bubbles */}
              {[0, 1, 2, 3].map((col) => (
                <motion.circle
                  key={`${row}-${col}`}
                  cx={50 + col * 14}
                  cy={152 + row * 16}
                  r="4"
                  fill={
                    (row === 0 && col === 1) ||
                    (row === 1 && col === 2) ||
                    (row === 2 && col === 0) ||
                    (row === 3 && col === 3) ||
                    (row === 4 && col === 1)
                      ? '#10B981'
                      : '#F3F4F6'
                  }
                  stroke="#D1D5DB"
                  strokeWidth="0.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + row * 0.1 + col * 0.05 }}
                />
              ))}
            </g>
          ))}
        </motion.g>

        {/* ====== CIRCULAR PROGRESS RING ====== */}
        <motion.g
          variants={itemVariants}
          animate={{ y: [0, 8, 0] }}
          transition={{
            y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }
          }}
        >
          {/* Background circle */}
          <circle
            cx="430"
            cy="180"
            r="40"
            fill="white"
            filter="url(#cardShadow)"
          />

          {/* Track */}
          <circle
            cx="430"
            cy="180"
            r="30"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="6"
          />

          {/* Progress arc - 92% */}
          <motion.circle
            cx="430"
            cy="180"
            r="30"
            fill="none"
            stroke="url(#successGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 30}
            strokeDashoffset={2 * Math.PI * 30}
            initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 30 * (1 - 0.92) }}
            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '430px 180px' }}
          />

          {/* Percentage text */}
          <text x="430" y="176" fontSize="14" fill="#1F2937" fontWeight="bold" textAnchor="middle">92%</text>
          <text x="430" y="190" fontSize="7" fill="#6B7280" textAnchor="middle">Score</text>
        </motion.g>

        {/* ====== TIMER ELEMENT ====== */}
        <motion.g
          variants={itemVariants}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          {/* Timer background */}
          <rect
            x="380"
            y="50"
            width="70"
            height="32"
            rx="16"
            fill="white"
            filter="url(#cardShadow)"
          />

          {/* Timer icon */}
          <circle cx="398" cy="66" r="8" fill="#FEF3C7" />
          <circle cx="398" cy="66" r="5" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
          <motion.line
            x1="398"
            y1="66"
            x2="398"
            y2="62"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '398px 66px' }}
          />
          <rect x="396" y="56" width="4" height="3" rx="1" fill="#F59E0B" />

          {/* Time text */}
          <text x="425" y="70" fontSize="11" fill="#1F2937" fontWeight="600">45:30</text>
        </motion.g>

        {/* ====== ANALYTICS BAR CHART ====== */}
        <motion.g
          variants={itemVariants}
          animate={{ y: [0, -6, 0] }}
          transition={{
            y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }
          }}
        >
          {/* Chart background */}
          <rect
            x="380"
            y="260"
            width="100"
            height="70"
            rx="8"
            fill="white"
            filter="url(#cardShadow)"
          />

          {/* Chart title */}
          <text x="395" y="278" fontSize="8" fill="#6B7280">Performance</text>

          {/* Bars */}
          {[
            { x: 395, height: 30, color: '#0085FF', delay: 0.6 },
            { x: 415, height: 40, color: '#10B981', delay: 0.7 },
            { x: 435, height: 25, color: '#8B5CF6', delay: 0.8 },
            { x: 455, height: 35, color: '#F59E0B', delay: 0.9 },
          ].map((bar, i) => (
            <motion.rect
              key={i}
              x={bar.x}
              y={320 - bar.height}
              width="12"
              height={bar.height}
              rx="2"
              fill={bar.color}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: bar.delay, duration: 0.5, ease: 'easeOut' }}
              style={{ transformOrigin: `${bar.x + 6}px 320px` }}
            />
          ))}

          {/* X-axis line */}
          <line x1="390" y1="320" x2="475" y2="320" stroke="#E5E7EB" strokeWidth="1" />
        </motion.g>

        {/* ====== SUCCESS CHECKMARK BADGE ====== */}
        <motion.g
          variants={itemVariants}
          animate={{ y: [0, 6, 0], rotate: [0, 3, 0] }}
          transition={{
            y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          {/* Badge circle */}
          <circle
            cx="70"
            cy="60"
            r="28"
            fill="url(#successGradient)"
            filter="url(#glow)"
          />

          {/* Inner circle */}
          <circle cx="70" cy="60" r="20" fill="white" opacity="0.2" />

          {/* Checkmark */}
          <motion.path
            d="M58 60 L66 68 L82 52"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          />
        </motion.g>

        {/* ====== FLOATING PARTICLES/STARS ====== */}
        {/* Star 1 - Gold */}
        <motion.g
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M140 50 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z"
            fill="#F59E0B"
          />
        </motion.g>

        {/* Star 2 - Blue */}
        <motion.g
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <path
            d="M350 300 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"
            fill="#0085FF"
          />
        </motion.g>

        {/* Star 3 - Purple */}
        <motion.g
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <path
            d="M120 280 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z"
            fill="#8B5CF6"
          />
        </motion.g>

        {/* Star 4 - Green */}
        <motion.g
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        >
          <path
            d="M320 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"
            fill="#10B981"
          />
        </motion.g>

        {/* Floating dots */}
        <motion.circle
          cx="180"
          cy="320"
          r="3"
          fill="#0085FF"
          opacity="0.4"
          animate={{ y: [0, -10, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle
          cx="320"
          cy="350"
          r="2"
          fill="#10B981"
          opacity="0.4"
          animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        />

        {/* ====== ACHIEVEMENT RIBBON ====== */}
        <motion.g
          variants={itemVariants}
          animate={{ rotate: [-3, 3, -3] }}
          transition={{
            rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          {/* Ribbon body */}
          <rect x="45" y="240" width="50" height="30" rx="4" fill="url(#purpleGradient)" filter="url(#cardShadow)" />

          {/* Ribbon tails */}
          <polygon points="45,270 55,280 55,270" fill="#7C3AED" />
          <polygon points="95,270 85,280 85,270" fill="#7C3AED" />

          {/* Text */}
          <text x="70" y="258" fontSize="8" fill="white" fontWeight="bold" textAnchor="middle">TOP</text>
          <text x="70" y="267" fontSize="6" fill="rgba(255,255,255,0.8)" textAnchor="middle">10%</text>
        </motion.g>

        {/* Ground shadow */}
        <motion.ellipse
          cx="250"
          cy="360"
          rx="180"
          ry="15"
          fill="#E5E7EB"
          opacity="0.3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ delay: 0.5 }}
        />
      </motion.svg>
    </div>
  );
};

export default HeroIllustration;
