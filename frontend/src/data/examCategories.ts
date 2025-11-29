export interface Exam {
  id: string;
  name: string;
  fullName?: string;
  color: string;
  totalTests?: number;
  freeTests?: number;
}

export interface ExamCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  logo: string;
  exams: Exam[];
}

// Rajasthan-focused exam categories
export const EXAM_CATEGORIES: ExamCategory[] = [
  {
    id: 'ras',
    name: 'RAS & State Services',
    icon: 'Building2',
    color: 'cat-upsc',
    logo: '/assets/logos/ras.png',
    exams: [
      { id: 'ras-prelims', name: 'RAS Prelims', fullName: 'Rajasthan Administrative Service Prelims', color: '#4F46E5', totalTests: 50, freeTests: 10 },
      { id: 'ras-mains', name: 'RAS Mains', fullName: 'Rajasthan Administrative Service Mains', color: '#4F46E5', totalTests: 30, freeTests: 5 },
      { id: 'rts', name: 'RTS', fullName: 'Rajasthan Technical Service', color: '#4F46E5', totalTests: 25, freeTests: 5 },
      { id: 'rps', name: 'RPS', fullName: 'Rajasthan Police Service', color: '#4F46E5', totalTests: 20, freeTests: 4 },
    ]
  },
  {
    id: 'reet',
    name: 'REET & Teaching',
    icon: 'GraduationCap',
    color: 'cat-teaching',
    logo: '/assets/logos/reet.png',
    exams: [
      { id: 'reet-level1', name: 'REET Level 1', fullName: 'Rajasthan Eligibility Examination for Teachers (1-5)', color: '#F59E0B', totalTests: 40, freeTests: 8 },
      { id: 'reet-level2', name: 'REET Level 2', fullName: 'Rajasthan Eligibility Examination for Teachers (6-8)', color: '#F59E0B', totalTests: 40, freeTests: 8 },
      { id: 'rpsc-1st-grade', name: 'RPSC 1st Grade', fullName: 'RPSC School Lecturer', color: '#F59E0B', totalTests: 35, freeTests: 6 },
      { id: 'rpsc-2nd-grade', name: 'RPSC 2nd Grade', fullName: 'RPSC Senior Teacher', color: '#F59E0B', totalTests: 35, freeTests: 6 },
      { id: 'rpsc-3rd-grade', name: '3rd Grade Teacher', fullName: 'Rajasthan 3rd Grade Teacher', color: '#F59E0B', totalTests: 30, freeTests: 5 },
    ]
  },
  {
    id: 'patwar',
    name: 'Patwar & Revenue',
    icon: 'FileText',
    color: 'cat-railways',
    logo: '/assets/logos/patwar.png',
    exams: [
      { id: 'patwar', name: 'Rajasthan Patwar', fullName: 'Rajasthan Patwari Exam', color: '#059669', totalTests: 30, freeTests: 6 },
      { id: 'ri', name: 'Revenue Inspector', fullName: 'Rajasthan Revenue Inspector', color: '#059669', totalTests: 20, freeTests: 4 },
      { id: 'kanungo', name: 'Kanungo', fullName: 'Rajasthan Kanungo Exam', color: '#059669', totalTests: 15, freeTests: 3 },
    ]
  },
  {
    id: 'police',
    name: 'Rajasthan Police',
    icon: 'Shield',
    color: 'cat-ssc',
    logo: '/assets/logos/police.png',
    exams: [
      { id: 'raj-police-constable', name: 'Police Constable', fullName: 'Rajasthan Police Constable', color: '#DC2626', totalTests: 25, freeTests: 5 },
      { id: 'raj-police-si', name: 'Police SI', fullName: 'Rajasthan Police Sub Inspector', color: '#DC2626', totalTests: 30, freeTests: 6 },
      { id: 'jail-prahari', name: 'Jail Prahari', fullName: 'Rajasthan Jail Prahari', color: '#DC2626', totalTests: 20, freeTests: 4 },
      { id: 'forest-guard', name: 'Forest Guard', fullName: 'Rajasthan Forest Guard', color: '#DC2626', totalTests: 20, freeTests: 4 },
    ]
  },
  {
    id: 'rpsc',
    name: 'Other RPSC Exams',
    icon: 'Landmark',
    color: 'cat-psc',
    logo: '/assets/logos/rpsc.png',
    exams: [
      { id: 'ldc', name: 'LDC', fullName: 'Lower Division Clerk', color: '#0891B2', totalTests: 25, freeTests: 5 },
      { id: 'junior-accountant', name: 'Junior Accountant', fullName: 'Rajasthan Junior Accountant', color: '#0891B2', totalTests: 25, freeTests: 5 },
      { id: 'tax-assistant', name: 'Tax Assistant', fullName: 'Rajasthan Tax Assistant', color: '#0891B2', totalTests: 20, freeTests: 4 },
      { id: 'stenographer', name: 'Stenographer', fullName: 'Rajasthan Stenographer', color: '#0891B2', totalTests: 20, freeTests: 4 },
      { id: 'librarian', name: 'Librarian', fullName: 'Rajasthan Librarian Grade III', color: '#0891B2', totalTests: 15, freeTests: 3 },
    ]
  },
  {
    id: 'rajasthan-boards',
    name: 'Rajasthan Boards & PSUs',
    icon: 'Building',
    color: 'cat-banking',
    logo: '/assets/logos/boards.png',
    exams: [
      { id: 'rajasthan-high-court', name: 'High Court LDC', fullName: 'Rajasthan High Court LDC', color: '#2563EB', totalTests: 20, freeTests: 4 },
      { id: 'rsmssb', name: 'RSMSSB', fullName: 'Rajasthan Staff Selection Board', color: '#2563EB', totalTests: 25, freeTests: 5 },
      { id: 'rvunl', name: 'RVUNL', fullName: 'Rajasthan Vidyut Utpadan Nigam', color: '#2563EB', totalTests: 20, freeTests: 4 },
      { id: 'phed', name: 'PHED', fullName: 'Public Health Engineering Dept', color: '#2563EB', totalTests: 15, freeTests: 3 },
    ]
  },
];

export const SUBJECTS = [
  {
    id: 'rajasthan-gk',
    name: 'Rajasthan GK',
    icon: 'MapPin',
    color: '#4F46E5',
    topics: ['Rajasthan History', 'Rajasthan Geography', 'Art & Culture', 'Polity', 'Economy', 'Current Affairs']
  },
  {
    id: 'hindi',
    name: 'Hindi',
    icon: 'BookOpen',
    color: '#F59E0B',
    topics: ['Grammar', 'Vocabulary', 'Comprehension', 'Error Correction', 'Idioms & Phrases', 'Essay Writing']
  },
  {
    id: 'english',
    name: 'English',
    icon: 'BookOpen',
    color: '#2563EB',
    topics: ['Grammar', 'Vocabulary', 'Comprehension', 'Error Spotting', 'Fill in the Blanks', 'Cloze Test']
  },
  {
    id: 'maths',
    name: 'Mathematics',
    icon: 'Calculator',
    color: '#DC2626',
    topics: ['Arithmetic', 'Algebra', 'Geometry', 'Trigonometry', 'Data Interpretation', 'Number System']
  },
  {
    id: 'reasoning',
    name: 'Reasoning',
    icon: 'Brain',
    color: '#7C3AED',
    topics: ['Verbal Reasoning', 'Non-Verbal Reasoning', 'Logical Reasoning', 'Analytical Reasoning', 'Coding-Decoding', 'Puzzles']
  },
  {
    id: 'computer',
    name: 'Computer',
    icon: 'Monitor',
    color: '#0891B2',
    topics: ['Computer Basics', 'MS Office', 'Internet', 'Networking', 'Database', 'Security']
  },
  {
    id: 'general-science',
    name: 'General Science',
    icon: 'Atom',
    color: '#059669',
    topics: ['Physics', 'Chemistry', 'Biology', 'Environmental Science', 'Science & Technology']
  },
  {
    id: 'indian-history',
    name: 'Indian History',
    icon: 'Landmark',
    color: '#64748B',
    topics: ['Ancient India', 'Medieval India', 'Modern India', 'Freedom Movement', 'Post Independence']
  },
];

export const STATS = [
  { label: 'Registered Students', value: '50K+', icon: 'Users' },
  { label: 'Mock Tests', value: '500+', icon: 'FileText' },
  { label: 'Questions', value: '1L+', icon: 'HelpCircle' },
  { label: 'Success Rate', value: '92%', icon: 'TrendingUp' },
];

export const FEATURES = [
  {
    id: 'courses',
    title: 'Structured Courses',
    description: 'Complete courses with Notes, PDFs & chapter-wise quizzes. Study systematically for any Rajasthan exam.',
    icon: 'BookOpen',
    color: '#4F46E5',
  },
  {
    id: 'test-series',
    title: 'Govt Exam Style Tests',
    description: 'Practice with RPSC exam pattern mock tests. Get ranking, detailed solutions & performance analysis.',
    icon: 'FileText',
    color: '#DC2626',
  },
  {
    id: 'analytics',
    title: 'Performance Analytics',
    description: 'Track your progress with detailed insights. Identify weak areas and improve your preparation.',
    icon: 'BarChart3',
    color: '#059669',
  },
  {
    id: 'bilingual',
    title: 'Hindi & English',
    description: 'Study in Hindi or English as per your comfort. Switch languages anytime during your preparation.',
    icon: 'Languages',
    color: '#F59E0B',
  },
  {
    id: 'mobile',
    title: 'Mobile-First Design',
    description: 'Practice anywhere, anytime. Our platform works seamlessly on all devices.',
    icon: 'Smartphone',
    color: '#7C3AED',
  },
  {
    id: 'updated',
    title: '2025 RPSC Syllabus',
    description: 'Content aligned with latest RPSC exam patterns and updated Rajasthan government exam syllabus.',
    icon: 'RefreshCw',
    color: '#0891B2',
  },
];
