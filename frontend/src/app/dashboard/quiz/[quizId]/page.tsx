'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

  // State
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Practice mode state
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Exam mode state
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showQuestionPalette, setShowQuestionPalette] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Result state
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to hold submit function for timer callback
  const handleSubmitQuizRef = useRef<() => void>(() => {});

  // Start quiz attempt
  const startQuiz = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/learn/quizzes/${quizId}/start`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setAttempt(data.data);
        // Set timer for exam mode
        if (data.data.quiz.mode === 'exam') {
          const elapsed = Math.floor(
            (Date.now() - new Date(data.data.startedAt).getTime()) / 1000
          );
          const remaining = data.data.quiz.duration * 60 - elapsed;
          setTimeRemaining(Math.max(0, remaining));
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
  }, [quizId, router]);

  useEffect(() => {
    startQuiz();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startQuiz]);

  // Timer for exam mode
  useEffect(() => {
    if (attempt?.quiz.mode === 'exam' && timeRemaining !== null && timeRemaining > 0) {
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
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [attempt?.quiz.mode, timeRemaining]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Current question
  const currentQuestion = attempt?.questions[currentQuestionIndex];

  // Submit answer (practice mode)
  const handleSubmitAnswer = async () => {
    if (!attempt || !currentQuestion || !selectedOption) return;

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
          }),
        }
      );
      const data = await res.json();

      if (data.success) {
        setAnswerResult(data.data);
        setShowExplanation(true);
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

  // Save answer (exam mode - just saves locally)
  const handleSaveAnswer = () => {
    if (!attempt || !currentQuestion || !selectedOption) return;
    setAttempt({
      ...attempt,
      answers: { ...attempt.answers, [currentQuestion._id]: selectedOption },
    });
  };

  // Go to next question
  const handleNextQuestion = () => {
    if (!attempt) return;

    // Save answer in exam mode
    if (attempt.quiz.mode === 'exam' && selectedOption) {
      handleSaveAnswer();
    }

    // Reset states
    setAnswerResult(null);
    setShowExplanation(false);
    setSelectedOption(null);

    // Move to next question
    if (currentQuestionIndex < attempt.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Pre-select if already answered
      const nextQ = attempt.questions[currentQuestionIndex + 1];
      if (attempt.answers[nextQ._id]) {
        setSelectedOption(attempt.answers[nextQ._id]);
      }
    } else if (attempt.quiz.mode === 'practice') {
      // Auto-submit at end of practice
      handleSubmitQuiz();
    }
  };

  // Go to previous question
  const handlePrevQuestion = () => {
    if (!attempt || currentQuestionIndex === 0) return;

    // Save current answer in exam mode
    if (attempt.quiz.mode === 'exam' && selectedOption) {
      handleSaveAnswer();
    }

    setAnswerResult(null);
    setShowExplanation(false);
    setCurrentQuestionIndex(currentQuestionIndex - 1);

    // Pre-select if already answered
    const prevQ = attempt.questions[currentQuestionIndex - 1];
    if (attempt.answers[prevQ._id]) {
      setSelectedOption(attempt.answers[prevQ._id]);
    } else {
      setSelectedOption(null);
    }
  };

  // Go to specific question
  const handleGoToQuestion = (index: number) => {
    if (!attempt) return;

    // Save current answer in exam mode
    if (attempt.quiz.mode === 'exam' && selectedOption) {
      handleSaveAnswer();
    }

    setAnswerResult(null);
    setShowExplanation(false);
    setCurrentQuestionIndex(index);
    setShowQuestionPalette(false);

    // Pre-select if already answered
    const targetQ = attempt.questions[index];
    if (attempt.answers[targetQ._id]) {
      setSelectedOption(attempt.answers[targetQ._id]);
    } else {
      setSelectedOption(null);
    }
  };

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

    // Save current answer before submitting
    if (attempt.quiz.mode === 'exam' && selectedOption && currentQuestion) {
      attempt.answers[currentQuestion._id] = selectedOption;
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
          body: JSON.stringify({ answers: attempt.answers }),
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!attempt) {
    return null;
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
  const answeredCount = Object.keys(attempt.answers).length;
  const progressPercent = (answeredCount / attempt.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.back()}
              className="text-slate-400"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Badge
                variant="secondary"
                className={isPractice ? 'bg-emerald-600/20 text-emerald-400' : 'bg-blue-600/20 text-blue-400'}
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
                    ? 'bg-red-500/20 text-red-400'
                    : timeRemaining < 300
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-slate-800 text-white'
                )}
              >
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            {/* Stats for practice */}
            {isPractice && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-amber-400">
                  <Flame className="h-4 w-4" />
                  <span>{attempt.currentStreak || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-purple-400">
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
                className="border-slate-700 text-slate-300"
              >
                {answeredCount}/{attempt.questions.length}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <Progress value={progressPercent} className="h-1" />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Question number */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-400">
              Question {currentQuestionIndex + 1} of {attempt.questions.length}
            </span>
            {!isPractice && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFlag}
                className={cn(
                  'text-slate-400',
                  flaggedQuestions.has(currentQuestion?._id || '') && 'text-amber-400'
                )}
              >
                <Flag className="h-4 w-4 mr-1" />
                {flaggedQuestions.has(currentQuestion?._id || '') ? 'Flagged' : 'Flag'}
              </Button>
            )}
          </div>

          {/* Question text */}
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardContent className="pt-6">
              <p className="text-lg text-white leading-relaxed">
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
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
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
                        ? 'bg-primary text-white'
                        : 'bg-slate-700 text-slate-300'
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
                        ? 'text-emerald-400'
                        : isWrong
                        ? 'text-red-400'
                        : 'text-slate-200'
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
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-emerald-400">
                          {language === 'hi' ? 'सही उत्तर!' : 'Correct!'}
                        </p>
                        <p className="text-sm text-emerald-300/80">
                          +{answerResult.pointsEarned} points
                          {answerResult.bonusPoints > 0 && ` (+${answerResult.bonusPoints} streak bonus)`}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-400">
                          {language === 'hi' ? 'गलत उत्तर' : 'Incorrect'}
                        </p>
                        <p className="text-sm text-red-300/80">
                          {language === 'hi' ? 'सही उत्तर: ' : 'Correct answer: '}
                          {answerResult.correctOption.toUpperCase()}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {(answerResult.explanation || answerResult.explanationHi) && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-sm font-medium text-slate-300 mb-2">
                      {language === 'hi' ? 'व्याख्या:' : 'Explanation:'}
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed">
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
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Previous button */}
          {!isPractice && (
            <Button
              variant="outline"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="border-slate-700 text-slate-300"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}
          {isPractice && <div />}

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
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Question Palette</DialogTitle>
            <DialogDescription className="text-slate-400">
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
                      ? 'bg-primary text-white'
                      : isAnswered
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  )}
                >
                  {index + 1}
                  {isFlagged && (
                    <Flag className="absolute -top-1 -right-1 h-3 w-3 text-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-600/20 border border-emerald-600/30 rounded" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-700 rounded" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-3 w-3 text-amber-400" />
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
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Submit Quiz?</DialogTitle>
            <DialogDescription className="text-slate-400">
              You have answered {answeredCount} out of {attempt.questions.length} questions.
              {answeredCount < attempt.questions.length && (
                <span className="text-amber-400 block mt-2">
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
              className="border-slate-600 text-slate-300"
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
      case 'A+':
      case 'A':
        return 'text-emerald-400';
      case 'B+':
      case 'B':
        return 'text-blue-400';
      case 'C+':
      case 'C':
        return 'text-amber-400';
      default:
        return 'text-red-400';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Result Header */}
        <Card className="bg-slate-800 border-slate-700 text-center mb-6">
          <CardContent className="pt-8 pb-6">
            <div
              className={cn(
                'w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center',
                result.passed ? 'bg-emerald-500/20' : 'bg-red-500/20'
              )}
            >
              {result.passed ? (
                <Trophy className="h-12 w-12 text-emerald-400" />
              ) : (
                <XCircle className="h-12 w-12 text-red-400" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              {result.passed
                ? language === 'hi'
                  ? 'बधाई हो!'
                  : 'Congratulations!'
                : language === 'hi'
                ? 'पुनः प्रयास करें'
                : 'Better luck next time!'}
            </h1>

            <p className="text-slate-400 mb-6">
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
                <p className="text-sm text-slate-400 mt-1">Grade</p>
              </div>
              <div className="w-px h-16 bg-slate-700" />
              <div>
                <p className="text-5xl font-bold text-white">{result.percentage}%</p>
                <p className="text-sm text-slate-400 mt-1">Score</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-900/50 rounded-lg">
              <div>
                <div className="flex items-center justify-center gap-1 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xl font-semibold">{result.correctCount}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Correct</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-red-400">
                  <XCircle className="h-4 w-4" />
                  <span className="text-xl font-semibold">{result.incorrectCount}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Incorrect</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-slate-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xl font-semibold">{result.unansweredCount}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Skipped</p>
              </div>
            </div>

            {/* Additional stats */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="h-4 w-4" />
                <span>{formatTime(result.timeTaken)}</span>
              </div>
              {isPractice && result.bestStreak && (
                <div className="flex items-center gap-2 text-amber-400">
                  <Flame className="h-4 w-4" />
                  <span>Best streak: {result.bestStreak}</span>
                </div>
              )}
              {isPractice && result.totalPoints && (
                <div className="flex items-center gap-2 text-purple-400">
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
            className="flex-1 border-slate-700 text-slate-300"
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
            className="w-full border-slate-700 text-slate-300 mb-4"
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
                <Card key={qr.questionId} className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-sm text-slate-400">Q{index + 1}.</span>
                      <p className="text-white flex-1">
                        {language === 'hi' && question.questionHi
                          ? question.questionHi
                          : question.question}
                      </p>
                      {qr.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="ml-6 space-y-1 text-sm">
                      {qr.selectedOption ? (
                        <p className={qr.isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                          Your answer: {qr.selectedOption.toUpperCase()}
                        </p>
                      ) : (
                        <p className="text-slate-500">Not answered</p>
                      )}
                      {!qr.isCorrect && (
                        <p className="text-emerald-400">
                          Correct answer: {qr.correctOption.toUpperCase()}
                        </p>
                      )}
                      {qr.explanation && (
                        <p className="text-slate-400 mt-2">{qr.explanation}</p>
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
