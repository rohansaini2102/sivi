'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  Flame,
  Star,
  Loader2,
  Flag,
  RotateCcw,
  Play,
  HelpCircle,
  SkipForward,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
interface QuestionOption {
  id: string;
  text: string;
  textHi?: string;
}

interface Question {
  _id: string;
  question: string;
  questionHi?: string;
  options: QuestionOption[];
  explanation?: string;
  explanationHi?: string;
}

interface QuizInfo {
  _id: string;
  title: string;
  titleHi?: string;
  mode: 'practice' | 'exam';
  totalQuestions: number;
  duration: number;
  passingPercentage: number;
  correctMarks: number;
  wrongMarks: number;
}

interface QuizAttempt {
  _id: string;
  quiz: {
    _id: string;
    mode: 'practice' | 'exam';
    duration: number;
    correctMarks: number;
    wrongMarks: number;
    passingPercentage: number;
    showExplanationAfterEach: boolean;
  };
  questions: Question[];
  answers: Record<string, string>;
  startedAt: string;
  status: 'in_progress' | 'completed';
  // Practice mode extras
  currentStreak?: number;
  bestStreak?: number;
  totalPoints?: number;
  correctCount?: number;
  incorrectCount?: number;
}

interface AnswerResult {
  isCorrect: boolean;
  correctOption: string;
  explanation?: string;
  explanationHi?: string;
  pointsEarned: number;
  streak: number;
  bonusPoints: number;
}

interface QuizResult {
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  timeTaken: number;
  passed: boolean;
  bestStreak?: number;
  totalPoints?: number;
  questionResults: {
    questionId: string;
    selectedOption: string | null;
    correctOption: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
}

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  // Start screen state
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [userSelectedMode, setUserSelectedMode] = useState<'practice' | 'exam'>('practice');

  // Quiz state
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Practice mode state
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionTimer, setQuestionTimer] = useState<number>(30);
  const [showPointsPopup, setShowPointsPopup] = useState<number | null>(null);

  // Exam mode state
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showQuestionPalette, setShowQuestionPalette] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Result state
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSubmitQuizRef = useRef<() => void>(() => {});

  // Start quiz attempt
  const startQuiz = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/learn/quizzes/${quizId}/start`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mode: userSelectedMode }),
        }
      );
      const data = await res.json();

      if (data.success) {
        setAttempt(data.data);
        setShowStartScreen(false);
        // Set timer for exam mode
        if (data.data.quiz.mode === 'exam') {
          const elapsed = Math.floor(
            (Date.now() - new Date(data.data.startedAt).getTime()) / 1000
          );
          const remaining = data.data.quiz.duration * 60 - elapsed;
          setTimeRemaining(Math.max(0, remaining));
        } else {
          // Start question timer for practice mode
          setQuestionTimer(30);
        }
      } else {
        toast.error(data.error?.message || 'Failed to start quiz');
        router.back();
      }
    } catch {
      toast.error('Failed to start quiz');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [quizId, router, userSelectedMode]);

  // Fetch quiz info for start screen
  useEffect(() => {
    const fetchQuizInfo = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/learn/quizzes/${quizId}/info`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (data.success) {
          setQuizInfo(data.data);
          // Initialize user-selected mode from quiz default
          setUserSelectedMode(data.data.mode || 'practice');
        } else {
          // If no info endpoint, skip start screen and start quiz directly
          setShowStartScreen(false);
        }
      } catch {
        // If fetch fails, skip start screen
        setShowStartScreen(false);
      } finally {
        setIsLoadingInfo(false);
      }
    };

    fetchQuizInfo();
  }, [quizId]);

  // Auto-start quiz when there's no start screen
  useEffect(() => {
    if (!isLoadingInfo && !showStartScreen && !attempt && !isLoading) {
      startQuiz();
    }
  }, [isLoadingInfo, showStartScreen, attempt, isLoading, startQuiz]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, []);

  // Timer for exam mode
  useEffect(() => {
    if (attempt?.quiz?.mode === 'exam' && timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmitQuizRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [attempt?.quiz?.mode, timeRemaining]);

  // Per-question timer for practice mode
  useEffect(() => {
    if (attempt?.quiz?.mode === 'practice' && !showExplanation && !showResult) {
      setQuestionTimer(30);
      questionTimerRef.current = setInterval(() => {
        setQuestionTimer((prev) => {
          if (prev <= 1) {
            clearInterval(questionTimerRef.current!);
            // Auto-skip on timeout
            handleSkipQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      };
    }
  }, [currentQuestionIndex, attempt?.quiz?.mode, showExplanation, showResult]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Current question
  const currentQuestion = attempt?.questions[currentQuestionIndex];

  // Calculate time bonus
  const getTimeBonus = (timeLeft: number) => {
    if (timeLeft >= 20) return 5;
    if (timeLeft >= 10) return 2;
    return 0;
  };

  // Submit answer (practice mode)
  const handleSubmitAnswer = async () => {
    if (!attempt || !currentQuestion || !selectedOption) return;

    // Clear question timer
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/learn/quiz-attempts/${attempt._id}/answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            questionId: currentQuestion._id,
            selectedOption,
            timeTaken: 30 - questionTimer,
          }),
        }
      );
      const data = await res.json();

      if (data.success) {
        setAnswerResult(data.data);
        setShowExplanation(true);
        // Show points popup
        if (data.data.pointsEarned > 0) {
          setShowPointsPopup(data.data.pointsEarned);
          setTimeout(() => setShowPointsPopup(null), 1500);
        }
        // Update attempt with new stats
        setAttempt({
          ...attempt,
          answers: { ...attempt.answers, [currentQuestion._id]: selectedOption },
          currentStreak: data.data.streak,
          bestStreak: Math.max(attempt.bestStreak || 0, data.data.streak),
          totalPoints: (attempt.totalPoints || 0) + data.data.pointsEarned,
          correctCount: (attempt.correctCount || 0) + (data.data.isCorrect ? 1 : 0),
          incorrectCount: (attempt.incorrectCount || 0) + (data.data.isCorrect ? 0 : 1),
        });
      }
    } catch {
      toast.error('Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip question (practice mode)
  const handleSkipQuestion = async () => {
    if (!attempt || !currentQuestion) return;

    // Clear question timer
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    // Move to next question without submitting
    setAnswerResult(null);
    setShowExplanation(false);
    setSelectedOption(null);

    if (currentQuestionIndex < attempt.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // At end, submit the quiz
      handleSubmitQuiz();
    }
  };

  // Save answer (exam mode - just saves locally) using functional update to avoid stale closures
  const handleSaveAnswer = useCallback(() => {
    if (!selectedOption) return;
    setAttempt((prev) => {
      if (!prev) return prev;
      const currentQ = prev.questions[currentQuestionIndex];
      if (!currentQ) return prev;
      return {
        ...prev,
        answers: { ...prev.answers, [currentQ._id]: selectedOption },
      };
    });
  }, [selectedOption, currentQuestionIndex]);

  // Go to next question
  const handleNextQuestion = useCallback(() => {
    if (!attempt) return;

    // Save current answer first (exam mode only - practice mode saves via API)
    if (attempt.quiz.mode === 'exam' && selectedOption) {
      handleSaveAnswer();
    }

    // Reset states
    setAnswerResult(null);
    setShowExplanation(false);

    // Move to next question
    if (currentQuestionIndex < attempt.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      // Pre-select if already answered - use functional read to get latest state
      setAttempt((prev) => {
        if (prev) {
          const nextQ = prev.questions[nextIndex];
          setSelectedOption(prev.answers[nextQ._id] || null);
        }
        return prev;
      });
    } else if (attempt.quiz.mode === 'practice') {
      // Auto-submit at end of practice - use ref to avoid dependency issues
      handleSubmitQuizRef.current();
    } else {
      // Exam mode: stay on last question, user needs to click submit
      setSelectedOption(null);
    }
  }, [attempt, selectedOption, currentQuestionIndex, handleSaveAnswer]);

  // Go to previous question
  const handlePrevQuestion = useCallback(() => {
    if (!attempt || currentQuestionIndex === 0) return;

    // Save current answer first (exam mode only)
    if (attempt.quiz.mode === 'exam' && selectedOption) {
      handleSaveAnswer();
    }

    setAnswerResult(null);
    setShowExplanation(false);

    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);

    // Pre-select if already answered - use functional read to get latest state
    setAttempt((prev) => {
      if (prev) {
        const prevQ = prev.questions[prevIndex];
        setSelectedOption(prev.answers[prevQ._id] || null);
      }
      return prev;
    });
  }, [attempt, currentQuestionIndex, selectedOption, handleSaveAnswer]);

  // Go to specific question
  const handleGoToQuestion = useCallback((index: number) => {
    if (!attempt) return;

    // Save current answer first (exam mode only)
    if (attempt.quiz.mode === 'exam' && selectedOption) {
      handleSaveAnswer();
    }

    setAnswerResult(null);
    setShowExplanation(false);
    setCurrentQuestionIndex(index);
    setShowQuestionPalette(false);

    // Pre-select if already answered - use functional read to get latest state
    setAttempt((prev) => {
      if (prev) {
        const targetQ = prev.questions[index];
        setSelectedOption(prev.answers[targetQ._id] || null);
      }
      return prev;
    });
  }, [attempt, selectedOption, handleSaveAnswer]);

  // Toggle flag
  const toggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion._id)) {
        next.delete(currentQuestion._id);
      } else {
        next.add(currentQuestion._id);
      }
      return next;
    });
  };

  // Submit entire quiz
  const handleSubmitQuiz = useCallback(async () => {
    if (!attempt) return;

    // Build final answers including current selection (without mutating state)
    const finalAnswers = { ...attempt.answers };
    if (attempt.quiz.mode === 'exam' && selectedOption && currentQuestion) {
      finalAnswers[currentQuestion._id] = selectedOption;
    }

    setIsSubmitting(true);
    setShowSubmitConfirm(false);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/learn/quiz-attempts/${attempt._id}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers: finalAnswers }),
        }
      );
      const data = await res.json();

      if (data.success) {
        setResult(data.data);
        setShowResult(true);
      } else {
        toast.error(data.error?.message || 'Failed to submit quiz');
      }
    } catch {
      toast.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  }, [attempt, selectedOption, currentQuestion]);

  // Keep ref updated with latest handleSubmitQuiz
  useEffect(() => {
    handleSubmitQuizRef.current = handleSubmitQuiz;
  }, [handleSubmitQuiz]);

  // Use useMemo to ensure counter is always accurate and only recalculates when answers change
  // IMPORTANT: This must be before any early returns to satisfy React's rules of hooks
  const answeredCount = useMemo(() => {
    if (!attempt) return 0;
    return Object.keys(attempt.answers).filter(
      (qId) => attempt.answers[qId] !== null && attempt.answers[qId] !== undefined && attempt.answers[qId] !== ''
    ).length;
  }, [attempt]);

  // Loading state for quiz info
  if (isLoadingInfo) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Start screen
  if (showStartScreen && quizInfo) {
    return (
      <QuizStartScreen
        quizInfo={quizInfo}
        language={language}
        onLanguageChange={setLanguage}
        selectedMode={userSelectedMode}
        onModeChange={setUserSelectedMode}
        onStart={() => startQuiz()}
        onBack={() => router.back()}
        isLoading={isLoading}
      />
    );
  }

  // Loading quiz
  if (isLoading || !attempt || !attempt.quiz) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show result
  if (showResult && result) {
    return (
      <QuizResultView
        result={result}
        attempt={attempt}
        language={language}
        onRetry={() => {
          setShowResult(false);
          setResult(null);
          setCurrentQuestionIndex(0);
          setSelectedOption(null);
          setAnswerResult(null);
          startQuiz();
        }}
        onBack={() => router.back()}
      />
    );
  }

  const isPractice = attempt.quiz.mode === 'practice';
  const progressPercent = (answeredCount / attempt.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Points popup animation */}
      {showPointsPopup && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="text-4xl font-bold text-yellow-500 animate-bounce">
            +{showPointsPopup}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Badge
                variant="secondary"
                className={isPractice ? 'bg-emerald-600/20 text-emerald-600' : 'bg-blue-600/20 text-blue-600'}
              >
                {isPractice ? 'Practice' : 'Exam'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language toggle */}
            <div className="flex items-center gap-1">
              <Button
                variant={language === 'en' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('en')}
                className="h-7 text-xs"
              >
                EN
              </Button>
              <Button
                variant={language === 'hi' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('hi')}
                className="h-7 text-xs"
              >
                हि
              </Button>
            </div>

            {/* Timer for exam */}
            {!isPractice && timeRemaining !== null && (
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono',
                  timeRemaining < 60
                    ? 'bg-red-500/20 text-red-600'
                    : timeRemaining < 300
                    ? 'bg-amber-500/20 text-amber-600'
                    : 'bg-muted text-foreground'
                )}
              >
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            {/* Per-question timer for practice */}
            {isPractice && !showExplanation && (
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono',
                  questionTimer < 10
                    ? 'bg-red-500/20 text-red-600'
                    : questionTimer < 20
                    ? 'bg-amber-500/20 text-amber-600'
                    : 'bg-muted text-foreground'
                )}
              >
                <Clock className="h-4 w-4" />
                <span>{questionTimer}s</span>
              </div>
            )}

            {/* Stats for practice */}
            {isPractice && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  <Flame className="h-4 w-4" />
                  <span>{attempt.currentStreak || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-purple-500">
                  <Star className="h-4 w-4" />
                  <span>{attempt.totalPoints || 0}</span>
                </div>
              </div>
            )}

            {/* Question palette button for exam */}
            {!isPractice && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuestionPalette(true)}
              >
                {answeredCount}/{attempt.questions.length}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card px-4 py-2 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <Progress value={progressPercent} className="h-1" />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Question number */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {attempt.questions.length}
            </span>
            {!isPractice && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFlag}
                className={cn(
                  'text-muted-foreground',
                  flaggedQuestions.has(currentQuestion?._id || '') && 'text-amber-500'
                )}
              >
                <Flag className="h-4 w-4 mr-1" />
                {flaggedQuestions.has(currentQuestion?._id || '') ? 'Flagged' : 'Flag'}
              </Button>
            )}
          </div>

          {/* Question text */}
          <Card className="bg-card border-border mb-6">
            <CardContent className="pt-6">
              <p className="text-lg text-foreground leading-relaxed">
                {language === 'hi' && currentQuestion?.questionHi
                  ? currentQuestion.questionHi
                  : currentQuestion?.question}
              </p>
            </CardContent>
          </Card>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion?.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const isAnswered = isPractice && answerResult !== null;
              const isCorrect = isAnswered && option.id === answerResult?.correctOption;
              const isWrong = isAnswered && isSelected && !answerResult?.isCorrect;

              return (
                <button
                  key={option.id}
                  onClick={() => !isAnswered && setSelectedOption(option.id)}
                  disabled={isAnswered}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left',
                    isCorrect
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : isWrong
                      ? 'border-red-500 bg-red-500/10'
                      : isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-muted-foreground/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0',
                      isCorrect
                        ? 'bg-emerald-500 text-white'
                        : isWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isWrong ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      option.id.toUpperCase()
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-base',
                      isCorrect
                        ? 'text-emerald-600'
                        : isWrong
                        ? 'text-red-600'
                        : 'text-foreground'
                    )}
                  >
                    {language === 'hi' && option.textHi ? option.textHi : option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Explanation (practice mode) */}
          {isPractice && showExplanation && answerResult && (
            <Card
              className={cn(
                'mt-6 border-2',
                answerResult.isCorrect
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-red-500/5 border-red-500/30'
              )}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  {answerResult.isCorrect ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-emerald-600">
                          {language === 'hi' ? 'सही उत्तर!' : 'Correct!'}
                        </p>
                        <p className="text-sm text-emerald-600/80">
                          +{answerResult.pointsEarned - answerResult.bonusPoints} base
                          {answerResult.bonusPoints > 0 && ` +${answerResult.bonusPoints} streak`}
                          {getTimeBonus(questionTimer) > 0 && ` +${getTimeBonus(questionTimer)} time`}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-600">
                          {language === 'hi' ? 'गलत उत्तर' : 'Incorrect'}
                        </p>
                        <p className="text-sm text-red-600/80">
                          {language === 'hi' ? 'सही उत्तर: ' : 'Correct answer: '}
                          {answerResult.correctOption.toUpperCase()}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {(answerResult.explanation || answerResult.explanationHi) && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-2">
                      {language === 'hi' ? 'व्याख्या:' : 'Explanation:'}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {language === 'hi' && answerResult.explanationHi
                        ? answerResult.explanationHi
                        : answerResult.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Previous button / Skip button */}
          {!isPractice ? (
            <Button
              variant="outline"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          ) : !showExplanation ? (
            <Button
              variant="outline"
              onClick={handleSkipQuestion}
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Skip
            </Button>
          ) : (
            <div />
          )}

          {/* Submit/Next button */}
          {isPractice ? (
            showExplanation ? (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < attempt.questions.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Finish
                    <Trophy className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Answer
              </Button>
            )
          ) : (
            <div className="flex items-center gap-2">
              {currentQuestionIndex < attempt.questions.length - 1 ? (
                <Button onClick={handleNextQuestion}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Question Palette Dialog (Exam mode) */}
      <Dialog open={showQuestionPalette} onOpenChange={setShowQuestionPalette}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Question Palette</DialogTitle>
            <DialogDescription>
              Click on a question number to navigate
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-2 py-4">
            {attempt.questions.map((q, index) => {
              const isAnswered = !!attempt.answers[q._id];
              const isFlagged = flaggedQuestions.has(q._id);
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={q._id}
                  onClick={() => handleGoToQuestion(index)}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors relative',
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isAnswered
                      ? 'bg-emerald-600/20 text-emerald-600 border border-emerald-600/30'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {index + 1}
                  {isFlagged && (
                    <Flag className="absolute -top-1 -right-1 h-3 w-3 text-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-600/20 border border-emerald-600/30 rounded" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-3 w-3 text-amber-500" />
              <span>Flagged</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowSubmitConfirm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Submit Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quiz?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} out of {attempt.questions.length} questions.
              {answeredCount < attempt.questions.length && (
                <span className="text-amber-500 block mt-2">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  {attempt.questions.length - answeredCount} questions are unanswered.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmitConfirm(false)}
            >
              Continue Quiz
            </Button>
            <Button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Quiz Start Screen Component
function QuizStartScreen({
  quizInfo,
  language,
  onLanguageChange,
  selectedMode,
  onModeChange,
  onStart,
  onBack,
  isLoading,
}: {
  quizInfo: QuizInfo;
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  selectedMode: 'practice' | 'exam';
  onModeChange: (mode: 'practice' | 'exam') => void;
  onStart: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const isPractice = selectedMode === 'practice';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 text-center">
          {/* Quiz icon */}
          <div
            className={cn(
              'w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center',
              isPractice ? 'bg-emerald-100' : 'bg-blue-100'
            )}
          >
            <HelpCircle
              className={cn(
                'h-10 w-10',
                isPractice ? 'text-emerald-600' : 'text-blue-600'
              )}
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {language === 'hi' && quizInfo.titleHi ? quizInfo.titleHi : quizInfo.title}
          </h1>

          {/* Mode Selector */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Select quiz mode:</p>
            <div className="flex gap-2">
              <Button
                variant={isPractice ? 'default' : 'outline'}
                onClick={() => onModeChange('practice')}
                className={cn(
                  'flex-1 h-auto py-3',
                  isPractice && 'bg-emerald-600 hover:bg-emerald-700 text-white'
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <Zap className="h-5 w-5" />
                  <span className="font-medium">Practice</span>
                  <span className="text-xs opacity-80">Learn with feedback</span>
                </div>
              </Button>
              <Button
                variant={!isPractice ? 'default' : 'outline'}
                onClick={() => onModeChange('exam')}
                className={cn(
                  'flex-1 h-auto py-3',
                  !isPractice && 'bg-blue-600 hover:bg-blue-700 text-white'
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Exam</span>
                  <span className="text-xs opacity-80">Simulate real test</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground my-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span>{quizInfo.totalQuestions} questions</span>
            </div>
            {quizInfo.duration > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{quizInfo.duration} min</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>{quizInfo.passingPercentage}% to pass</span>
            </div>
          </div>

          {/* Mode features */}
          {isPractice ? (
            <div className="space-y-2 mb-6 text-left bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Immediate feedback after each answer</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <Flame className="h-4 w-4" />
                <span className="text-sm">Streak bonuses for consecutive correct answers</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <Zap className="h-4 w-4" />
                <span className="text-sm">30 seconds per question timer</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 mb-6 text-left bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Timed examination</span>
              </div>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{quizInfo.wrongMarks} negative marking</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Flag className="h-4 w-4" />
                <span className="text-sm">Flag questions for review</span>
              </div>
            </div>
          )}

          {/* Language toggle */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLanguageChange('en')}
            >
              English
            </Button>
            <Button
              variant={language === 'hi' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLanguageChange('hi')}
            >
              हिंदी
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={onStart}
              disabled={isLoading}
              className={cn(
                'flex-1',
                isPractice ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quiz Result View Component
function QuizResultView({
  result,
  attempt,
  language,
  onRetry,
  onBack,
}: {
  result: QuizResult;
  attempt: QuizAttempt;
  language: 'en' | 'hi';
  onRetry: () => void;
  onBack: () => void;
}) {
  const isPractice = attempt.quiz.mode === 'practice';
  const [showAnswers, setShowAnswers] = useState(false);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S':
      case 'A+':
      case 'A':
        return 'text-emerald-500';
      case 'B+':
      case 'B':
        return 'text-blue-500';
      case 'C+':
      case 'C':
        return 'text-amber-500';
      default:
        return 'text-red-500';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Result Header */}
        <Card className="text-center mb-6">
          <CardContent className="pt-8 pb-6">
            <div
              className={cn(
                'w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center',
                result.passed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
              )}
            >
              {result.passed ? (
                <Trophy className="h-12 w-12 text-emerald-500" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              {result.passed
                ? language === 'hi'
                  ? 'बधाई हो!'
                  : 'Congratulations!'
                : language === 'hi'
                ? 'पुनः प्रयास करें'
                : 'Better luck next time!'}
            </h1>

            <p className="text-muted-foreground mb-6">
              {result.passed
                ? language === 'hi'
                  ? 'आपने क्विज़ पास कर लिया!'
                  : 'You passed the quiz!'
                : language === 'hi'
                ? 'आप इसे कर सकते हैं, फिर से कोशिश करें।'
                : 'You can do it, try again.'}
            </p>

            {/* Score */}
            <div className="flex items-center justify-center gap-8 mb-6">
              <div>
                <p className={cn('text-5xl font-bold', getGradeColor(result.grade))}>
                  {result.grade}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Grade</p>
              </div>
              <div className="w-px h-16 bg-border" />
              <div>
                <p className="text-5xl font-bold text-foreground">{result.percentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">Score</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="flex items-center justify-center gap-1 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xl font-semibold">{result.correctCount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Correct</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-red-500">
                  <XCircle className="h-4 w-4" />
                  <span className="text-xl font-semibold">{result.incorrectCount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Incorrect</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xl font-semibold">{result.unansweredCount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Skipped</p>
              </div>
            </div>

            {/* Additional stats */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatTime(result.timeTaken)}</span>
              </div>
              {isPractice && result.bestStreak && (
                <div className="flex items-center gap-2 text-amber-500">
                  <Flame className="h-4 w-4" />
                  <span>Best streak: {result.bestStreak}</span>
                </div>
              )}
              {isPractice && result.totalPoints && (
                <div className="flex items-center gap-2 text-purple-500">
                  <Star className="h-4 w-4" />
                  <span>{result.totalPoints} points</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
          <Button onClick={onRetry} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>

        {/* View Answers */}
        {!isPractice && (
          <Button
            variant="outline"
            onClick={() => setShowAnswers(!showAnswers)}
            className="w-full mb-4"
          >
            {showAnswers ? 'Hide Answers' : 'View Answers'}
          </Button>
        )}

        {/* Answer Review (Exam mode only, after submission) */}
        {showAnswers && (
          <div className="space-y-4">
            {result.questionResults.map((qr, index) => {
              const question = attempt.questions.find((q) => q._id === qr.questionId);
              if (!question) return null;

              return (
                <Card key={qr.questionId}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-sm text-muted-foreground">Q{index + 1}.</span>
                      <p className="text-foreground flex-1">
                        {language === 'hi' && question.questionHi
                          ? question.questionHi
                          : question.question}
                      </p>
                      {qr.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="ml-6 space-y-1 text-sm">
                      {qr.selectedOption ? (
                        <p className={qr.isCorrect ? 'text-emerald-600' : 'text-red-600'}>
                          Your answer: {qr.selectedOption.toUpperCase()}
                        </p>
                      ) : (
                        <p className="text-muted-foreground">Not answered</p>
                      )}
                      {!qr.isCorrect && (
                        <p className="text-emerald-600">
                          Correct answer: {qr.correctOption.toUpperCase()}
                        </p>
                      )}
                      {qr.explanation && (
                        <p className="text-muted-foreground mt-2">{qr.explanation}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
