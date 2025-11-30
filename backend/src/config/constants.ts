export const CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // JWT
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // OTP
  OTP_EXPIRY_MINUTES: 10,
  OTP_MAX_ATTEMPTS: 3,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Enrollment validity (days)
  DEFAULT_COURSE_VALIDITY: 365,
  DEFAULT_TEST_SERIES_VALIDITY: 180,

  // Quiz/Test settings
  QUIZ_POINTS_PER_QUESTION: 1,
  TEST_POSITIVE_MARKS: 2,
  TEST_NEGATIVE_MARKS: 0.5,

  // User roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
  },

  // Content types
  LESSON_TYPES: {
    NOTES: 'notes',
    PDF: 'pdf',
    QUIZ: 'quiz',
  },

  // Exam categories
  EXAM_CATEGORIES: [
    'RAS',
    'REET',
    'PATWAR',
    'POLICE',
    'RPSC',
    'OTHER',
  ],
} as const;
