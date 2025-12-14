'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  FileText,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useExamAttemptStore } from '@/store/examAttemptStore';
import api from '@/lib/api';

// Import sub-components
import SubmitModal from './SubmitModal';
import QuestionPaperModal from './QuestionPaperModal';
import InstructionsModal from './InstructionsModal';

// Normalize options to array format
interface NormalizedOption {
  id: string;
  text: string;
  textHi?: string;
}

const normalizeOptions = (options: any): NormalizedOption[] => {
  if (!options) return [];
  if (Array.isArray(options)) {
    return options.map(opt => ({
      id: opt.id || opt._id || '',
      text: opt.text || '',
      textHi: opt.textHi,
    }));
  }
  if (typeof options === 'object') {
    return Object.entries(options).map(([key, value]) => ({
      id: key,
      text: typeof value === 'string' ? value : (value as any)?.text || '',
      textHi: typeof value === 'object' ? (value as any)?.textHi : undefined,
    }));
  }
  return [];
};

// Format time as HH:MM:SS
const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

interface ExamCBTProps {
  examId: string;
  testSeriesId: string | null;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  userName: string;
}

export default function ExamCBT({
  examId,
  testSeriesId,
  isFullScreen,
  onToggleFullScreen,
  userName,
}: ExamCBTProps) {
  const router = useRouter();
  const {
    attemptId,
    exam,
    sections,
    answers,
    currentSectionIndex,
    currentQuestionIndex,
    visitedQuestions,
    markedForReview,
    timeRemaining,
    language,
    isSaving,
    isSubmitting,
    setAnswer,
    toggleMarkForReview,
    navigateTo,
    nextQuestion,
    prevQuestion,
    setLanguage,
    decrementTimer,
    setSaving,
    setSubmitting,
    getCurrentQuestion,
    getCurrentSection,
    getQuestionStatus,
    getSectionStats,
  } = useExamAttemptStore();

  // Local state
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuestionPaper, setShowQuestionPaper] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [questionTime, setQuestionTime] = useState(0);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);

  // Initialize selected options when question changes
  useEffect(() => {
    const currentQ = getCurrentQuestion();
    if (currentQ) {
      const existingAnswer = answers.get(currentQ._id);
      setSelectedOptions(existingAnswer?.selectedOptions || []);
      setQuestionTime(0);
    }
  }, [currentSectionIndex, currentQuestionIndex, getCurrentQuestion, answers]);

  // Main timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      decrementTimer();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [decrementTimer]);

  // Question timer
  useEffect(() => {
    questionTimerRef.current = setInterval(() => {
      setQuestionTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [currentSectionIndex, currentQuestionIndex]);

  // Auto submit when time is up
  useEffect(() => {
    if (timeRemaining <= 0 && attemptId) {
      toast.warning('Time is up! Submitting your exam...');
      handleSubmit();
    }
  }, [timeRemaining, attemptId]);

  // Heartbeat
  useEffect(() => {
    if (attemptId) {
      heartbeatRef.current = setInterval(async () => {
        try {
          await api.post(`/test/attempt/${attemptId}/heartbeat`, {
            currentSectionIndex,
            currentQuestionIndex,
            timeRemaining,
          });
        } catch (e) {
          console.error('Heartbeat failed:', e);
        }
      }, 30000);
    }

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [attemptId, currentSectionIndex, currentQuestionIndex, timeRemaining]);

  // Save answer
  const saveAnswer = useCallback(async () => {
    const currentQ = getCurrentQuestion();
    if (!currentQ || !attemptId) return;

    const now = Date.now();
    if (now - lastSaveRef.current < 500) return;
    lastSaveRef.current = now;

    setSaving(true);
    try {
      await api.put(`/test/attempt/${attemptId}/answer`, {
        questionId: currentQ._id,
        selectedOptions,
        timeTaken: questionTime,
      });
      setAnswer(currentQ._id, selectedOptions);
    } catch {
      console.error('Failed to save answer');
    } finally {
      setSaving(false);
    }
  }, [attemptId, selectedOptions, questionTime, getCurrentQuestion, setAnswer, setSaving]);

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    const currentQ = getCurrentQuestion();
    if (!currentQ) return;

    if (currentQ.questionType === 'single') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  // Clear response
  const handleClearResponse = () => {
    setSelectedOptions([]);
  };

  // Save and next
  const handleSaveAndNext = async () => {
    await saveAnswer();
    nextQuestion();
  };

  // Mark for review and next
  const handleMarkAndNext = async () => {
    const currentQ = getCurrentQuestion();
    if (currentQ) {
      await saveAnswer();
      toggleMarkForReview(currentQ._id);
    }
    nextQuestion();
  };

  // Navigate to question
  const handleNavigate = (sectionIdx: number, questionIdx: number) => {
    saveAnswer();
    navigateTo(sectionIdx, questionIdx);
  };

  // Submit exam
  const handleSubmit = async () => {
    if (!attemptId) return;

    setSubmitting(true);
    try {
      await saveAnswer();
      const { data: result } = await api.post(`/test/attempt/${attemptId}/submit`);

      if (result.success) {
        toast.success('Exam submitted successfully!');
        router.push(`/exam/${examId}/result/${attemptId}`);
      } else {
        toast.error(result.error?.message || 'Failed to submit exam');
      }
    } catch {
      toast.error('Failed to submit exam');
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const currentQuestion = getCurrentQuestion();
  const currentSection = getCurrentSection();

  if (!exam || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const options = normalizeOptions(currentQuestion.options);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b shadow-sm px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-800">{exam.title}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded font-mono font-bold',
            timeRemaining <= 300
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-800'
          )}>
            <span className="text-sm text-gray-500">Time Left</span>
            <div className="flex items-center gap-1">
              <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
                {Math.floor(timeRemaining / 3600).toString().padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
                {Math.floor((timeRemaining % 3600) / 60).toString().padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
                {(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFullScreen}
            className="text-primary border-primary hover:bg-primary/10"
          >
            {isFullScreen ? (
              <>
                <Minimize className="h-4 w-4 mr-2" />
                Exit Full Screen
              </>
            ) : (
              <>
                <Maximize className="h-4 w-4 mr-2" />
                Switch Full Screen
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Section Tabs */}
      {sections.length > 0 && (
        <div className="bg-white border-b px-4 py-1 flex items-center gap-1 overflow-x-auto">
          <span className="text-sm font-medium text-gray-600 mr-2">SECTIONS</span>
          {sections.map((section, idx) => (
            <button
              key={section._id}
              onClick={() => handleNavigate(idx, 0)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-t transition-colors truncate max-w-[150px]',
                idx === currentSectionIndex
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
              title={language === 'hi' && section.titleHi ? section.titleHi : section.title}
            >
              {language === 'hi' && section.titleHi ? section.titleHi : section.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Panel */}
        <div className="flex-1 flex flex-col bg-white border-r">
          {/* Question Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-800">
                Question No. {currentQuestionIndex + 1}
              </span>
            </div>

            <div className="flex items-center gap-6">
              {/* Marks */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Marks</span>
                <span className="bg-green-500 text-white px-2 py-0.5 rounded text-sm font-medium">
                  +{exam.defaultPositiveMarks}
                </span>
                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-sm font-medium">
                  -{exam.defaultNegativeMarks}
                </span>
              </div>

              {/* Time spent */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Time</span>
                <span className="font-mono text-sm">
                  {Math.floor(questionTime / 60).toString().padStart(2, '0')}:
                  {(questionTime % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {/* Language Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">View in</span>
                <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'hi')}>
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Comprehension Passage */}
            {currentQuestion.comprehensionPassage && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold text-gray-700 mb-2">Read the following passage:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {language === 'hi' && currentQuestion.comprehensionPassage.passageHi
                    ? currentQuestion.comprehensionPassage.passageHi
                    : currentQuestion.comprehensionPassage.passage}
                </p>
                {currentQuestion.comprehensionPassage.imageUrl && (
                  <img
                    src={currentQuestion.comprehensionPassage.imageUrl}
                    alt="Passage"
                    className="mt-4 max-w-full rounded"
                  />
                )}
              </div>
            )}

            {/* Question Image */}
            {currentQuestion.imageUrl && (
              <div className="mb-4">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question"
                  className="max-w-full rounded-lg border"
                />
              </div>
            )}

            {/* Question Text */}
            <div className="text-gray-800 text-lg mb-6">
              {language === 'hi' && currentQuestion.questionHindi
                ? currentQuestion.questionHindi
                : currentQuestion.question}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {options.map((option, idx) => {
                const isSelected = selectedOptions.includes(option.id);
                const optionLabel = String.fromCharCode(65 + idx);

                return (
                  <label
                    key={option.id}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <input
                      type={currentQuestion.questionType === 'multiple' ? 'checkbox' : 'radio'}
                      name="option"
                      checked={isSelected}
                      onChange={() => handleOptionSelect(option.id)}
                      className="sr-only"
                    />
                    <span className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300'
                    )}>
                      {isSelected && (
                        <span className="text-xs font-bold">{optionLabel}</span>
                      )}
                      {!isSelected && (
                        <span className="text-xs text-gray-500">{optionLabel}</span>
                      )}
                    </span>
                    <span className="text-gray-700 flex-1">
                      {language === 'hi' && option.textHi ? option.textHi : option.text}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t bg-gray-50 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleMarkAndNext}
                disabled={isSaving}
                className="border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                Mark for Review & Next
              </Button>
              <Button
                variant="ghost"
                onClick={handleClearResponse}
                className="text-gray-600"
              >
                Clear Response
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={handleSaveAndNext}
                disabled={isSaving}
                className="bg-primary hover:bg-primary-dark text-white px-6"
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save & Next
              </Button>
            </div>
          </div>
        </div>

        {/* Question Palette */}
        <div className="w-72 bg-white flex flex-col">
          {/* User Info */}
          <div className="p-4 border-b flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
              <User className="h-6 w-6" />
            </div>
            <span className="font-medium text-gray-800">{userName}</span>
          </div>

          {/* Legend */}
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">0</span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">0</span>
                <span>Marked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center text-gray-500 text-xs">{sections.reduce((acc, s) => acc + s.questions.length, 0)}</span>
                <span>Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">0</span>
                <span>Not Answered</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="w-6 h-6 rounded-full bg-green-500 relative flex items-center justify-center text-white text-xs">
                0
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-purple-500 border border-white"></span>
              </span>
              <span>Marked and answered</span>
            </div>
          </div>

          {/* Section Label */}
          <div className="px-4 py-2 bg-gray-50 border-b">
            <span className="text-sm font-medium text-gray-600">
              SECTION: {currentSection?.title || 'Questions'}
            </span>
          </div>

          {/* Question Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {sections.map((section, sectionIdx) => (
              <div key={section._id} className={cn(sectionIdx !== currentSectionIndex && 'hidden')}>
                <div className="grid grid-cols-5 gap-2">
                  {section.questions.map((q, qIdx) => {
                    const status = getQuestionStatus(q._id);
                    const isCurrent = sectionIdx === currentSectionIndex && qIdx === currentQuestionIndex;

                    let bgClass = 'bg-white border-2 border-gray-300 text-gray-700'; // not visited
                    if (status === 'answered') bgClass = 'bg-green-500 text-white';
                    else if (status === 'visited') bgClass = 'bg-red-500 text-white';
                    else if (status === 'marked') bgClass = 'bg-purple-500 text-white';
                    else if (status === 'marked_answered') bgClass = 'bg-green-500 text-white';

                    return (
                      <button
                        key={q._id}
                        onClick={() => handleNavigate(sectionIdx, qIdx)}
                        className={cn(
                          'w-10 h-10 rounded-full text-sm font-medium transition-all relative',
                          bgClass,
                          isCurrent && 'ring-2 ring-primary ring-offset-2'
                        )}
                      >
                        {qIdx + 1}
                        {status === 'marked_answered' && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-purple-500 border border-white"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Buttons */}
          <div className="p-4 border-t space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuestionPaper(true)}
                className="text-xs"
              >
                <FileText className="h-3 w-3 mr-1" />
                Question Paper
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInstructions(true)}
                className="text-xs"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Instructions
              </Button>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary-dark text-white"
              onClick={() => setShowSubmitModal(true)}
            >
              Submit Test
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SubmitModal
        open={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={handleSubmit}
        sections={sections}
        getSectionStats={getSectionStats}
        isSubmitting={isSubmitting}
      />

      <QuestionPaperModal
        open={showQuestionPaper}
        onClose={() => setShowQuestionPaper(false)}
        sections={sections}
        language={language}
        onNavigate={(sectionIdx, qIdx) => {
          setShowQuestionPaper(false);
          handleNavigate(sectionIdx, qIdx);
        }}
      />

      <InstructionsModal
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </div>
  );
}
