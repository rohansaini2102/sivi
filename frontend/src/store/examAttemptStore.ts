import { create } from 'zustand';

// Types
interface QuestionOption {
  id: string;
  text: string;
  textHi?: string;
}

interface Question {
  _id: string;
  questionType: 'single' | 'multiple' | 'comprehension';
  question: string;
  questionHindi?: string;
  imageUrl?: string;
  options: QuestionOption[];
  comprehensionPassage?: {
    _id: string;
    title: string;
    titleHi?: string;
    passage: string;
    passageHi?: string;
    imageUrl?: string;
  };
}

interface Section {
  _id: string;
  title: string;
  titleHi?: string;
  order: number;
  questions: Question[];
  instructions?: string;
  instructionsHi?: string;
}

interface Answer {
  questionId: string;
  selectedOptions: string[];
  timeTaken: number;
  markedForReview: boolean;
  visitedAt?: Date;
  answeredAt?: Date;
}

interface ExamInfo {
  _id: string;
  title: string;
  titleHi?: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  defaultPositiveMarks: number;
  defaultNegativeMarks: number;
  allowSectionNavigation: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

interface ExamAttemptState {
  // Attempt data
  attemptId: string | null;
  exam: ExamInfo | null;
  sections: Section[];
  answers: Map<string, Answer>;

  // Navigation state
  currentSectionIndex: number;
  currentQuestionIndex: number;

  // Status tracking
  visitedQuestions: Set<string>;
  markedForReview: Set<string>;

  // Timer
  timeRemaining: number; // in seconds
  startTime: number | null;

  // Language
  language: 'en' | 'hi';

  // Status flags
  isLoading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  initializeAttempt: (data: {
    attemptId: string;
    exam: ExamInfo;
    sections: Section[];
    answers: Answer[];
    currentSectionIndex: number;
    currentQuestionIndex: number;
    timeRemaining: number;
    language: 'en' | 'hi';
  }) => void;

  setAnswer: (questionId: string, selectedOptions: string[]) => void;
  toggleMarkForReview: (questionId: string) => void;
  markAsVisited: (questionId: string) => void;

  navigateTo: (sectionIndex: number, questionIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;

  setLanguage: (lang: 'en' | 'hi') => void;
  decrementTimer: () => void;

  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;

  reset: () => void;

  // Computed helpers
  getCurrentQuestion: () => Question | null;
  getCurrentSection: () => Section | null;
  getQuestionStatus: (questionId: string) => 'not_visited' | 'visited' | 'answered' | 'marked' | 'marked_answered';
  getSectionStats: (sectionId: string) => {
    total: number;
    answered: number;
    marked: number;
    notVisited: number;
  };
  getAllAnswers: () => Answer[];
}

const initialState = {
  attemptId: null,
  exam: null,
  sections: [],
  answers: new Map<string, Answer>(),
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  visitedQuestions: new Set<string>(),
  markedForReview: new Set<string>(),
  timeRemaining: 0,
  startTime: null,
  language: 'en' as const,
  isLoading: false,
  isSaving: false,
  isSubmitting: false,
  error: null,
};

export const useExamAttemptStore = create<ExamAttemptState>((set, get) => ({
  ...initialState,

  initializeAttempt: (data) => {
    const answersMap = new Map<string, Answer>();
    const visited = new Set<string>();
    const marked = new Set<string>();

    // Populate from existing answers
    data.answers.forEach((answer) => {
      answersMap.set(answer.questionId, answer);
      if (answer.visitedAt) visited.add(answer.questionId);
      if (answer.markedForReview) marked.add(answer.questionId);
    });

    set({
      attemptId: data.attemptId,
      exam: data.exam,
      sections: data.sections,
      answers: answersMap,
      currentSectionIndex: data.currentSectionIndex,
      currentQuestionIndex: data.currentQuestionIndex,
      visitedQuestions: visited,
      markedForReview: marked,
      timeRemaining: data.timeRemaining,
      startTime: Date.now(),
      language: data.language,
      isLoading: false,
      error: null,
    });

    // Mark current question as visited
    const currentSection = data.sections[data.currentSectionIndex];
    if (currentSection?.questions[data.currentQuestionIndex]) {
      const qId = currentSection.questions[data.currentQuestionIndex]._id;
      visited.add(qId);
      set({ visitedQuestions: new Set(visited) });
    }
  },

  setAnswer: (questionId, selectedOptions) => {
    const { answers } = get();
    const existing = answers.get(questionId);

    const newAnswer: Answer = {
      questionId,
      selectedOptions,
      timeTaken: existing?.timeTaken || 0,
      markedForReview: existing?.markedForReview || false,
      visitedAt: existing?.visitedAt || new Date(),
      answeredAt: new Date(),
    };

    const newAnswers = new Map(answers);
    newAnswers.set(questionId, newAnswer);

    set({ answers: newAnswers });
  },

  toggleMarkForReview: (questionId) => {
    const { markedForReview, answers } = get();
    const newMarked = new Set(markedForReview);
    const isMarked = newMarked.has(questionId);

    if (isMarked) {
      newMarked.delete(questionId);
    } else {
      newMarked.add(questionId);
    }

    // Update answer
    const existing = answers.get(questionId);
    if (existing) {
      const newAnswers = new Map(answers);
      newAnswers.set(questionId, { ...existing, markedForReview: !isMarked });
      set({ answers: newAnswers });
    }

    set({ markedForReview: newMarked });
  },

  markAsVisited: (questionId) => {
    const { visitedQuestions, answers } = get();
    const newVisited = new Set(visitedQuestions);
    newVisited.add(questionId);

    // Update or create answer with visited time
    const existing = answers.get(questionId);
    if (!existing?.visitedAt) {
      const newAnswers = new Map(answers);
      newAnswers.set(questionId, {
        questionId,
        selectedOptions: existing?.selectedOptions || [],
        timeTaken: existing?.timeTaken || 0,
        markedForReview: existing?.markedForReview || false,
        visitedAt: new Date(),
        answeredAt: existing?.answeredAt,
      });
      set({ answers: newAnswers });
    }

    set({ visitedQuestions: newVisited });
  },

  navigateTo: (sectionIndex, questionIndex) => {
    const { sections } = get();
    const section = sections[sectionIndex];
    if (!section) return;

    const question = section.questions[questionIndex];
    if (!question) return;

    // Mark as visited
    get().markAsVisited(question._id);

    set({
      currentSectionIndex: sectionIndex,
      currentQuestionIndex: questionIndex,
    });
  },

  nextQuestion: () => {
    const { sections, currentSectionIndex, currentQuestionIndex, exam } = get();
    const currentSection = sections[currentSectionIndex];
    if (!currentSection) return;

    // Try next question in current section
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      get().navigateTo(currentSectionIndex, currentQuestionIndex + 1);
      return;
    }

    // Try next section (if section navigation allowed)
    if (exam?.allowSectionNavigation && currentSectionIndex < sections.length - 1) {
      get().navigateTo(currentSectionIndex + 1, 0);
    }
  },

  prevQuestion: () => {
    const { sections, currentSectionIndex, currentQuestionIndex, exam } = get();

    // Try previous question in current section
    if (currentQuestionIndex > 0) {
      get().navigateTo(currentSectionIndex, currentQuestionIndex - 1);
      return;
    }

    // Try previous section (if section navigation allowed)
    if (exam?.allowSectionNavigation && currentSectionIndex > 0) {
      const prevSection = sections[currentSectionIndex - 1];
      if (prevSection) {
        get().navigateTo(currentSectionIndex - 1, prevSection.questions.length - 1);
      }
    }
  },

  setLanguage: (lang) => set({ language: lang }),

  decrementTimer: () => {
    const { timeRemaining } = get();
    if (timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setSaving: (saving) => set({ isSaving: saving }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
  setError: (error) => set({ error }),

  reset: () => set({
    ...initialState,
    answers: new Map(),
    visitedQuestions: new Set(),
    markedForReview: new Set(),
  }),

  // Computed helpers
  getCurrentQuestion: () => {
    const { sections, currentSectionIndex, currentQuestionIndex } = get();
    if (!sections || sections.length === 0) return null;
    return sections[currentSectionIndex]?.questions?.[currentQuestionIndex] || null;
  },

  getCurrentSection: () => {
    const { sections, currentSectionIndex } = get();
    if (!sections || sections.length === 0) return null;
    return sections[currentSectionIndex] || null;
  },

  getQuestionStatus: (questionId) => {
    const { answers, visitedQuestions, markedForReview } = get();
    const answer = answers.get(questionId);
    const isAnswered = answer && answer.selectedOptions.length > 0;
    const isMarked = markedForReview.has(questionId);
    const isVisited = visitedQuestions.has(questionId);

    if (isMarked && isAnswered) return 'marked_answered';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    if (isVisited) return 'visited';
    return 'not_visited';
  },

  getSectionStats: (sectionId) => {
    const { sections, answers, markedForReview, visitedQuestions } = get();
    const section = sections.find(s => s._id === sectionId);
    if (!section) return { total: 0, answered: 0, marked: 0, notVisited: 0 };

    let answered = 0;
    let marked = 0;
    let notVisited = 0;

    section.questions.forEach(q => {
      const answer = answers.get(q._id);
      const isAnswered = answer && answer.selectedOptions.length > 0;
      const isMarked = markedForReview.has(q._id);
      const isVisited = visitedQuestions.has(q._id);

      if (isAnswered) answered++;
      if (isMarked) marked++;
      if (!isVisited) notVisited++;
    });

    return {
      total: section.questions.length,
      answered,
      marked,
      notVisited,
    };
  },

  getAllAnswers: () => {
    const { answers } = get();
    return Array.from(answers.values());
  },
}));
