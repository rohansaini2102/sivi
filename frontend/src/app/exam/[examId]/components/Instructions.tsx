'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronRight, Clock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExamInfo {
  _id: string;
  title: string;
  titleHi?: string;
  description?: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  defaultPositiveMarks: number;
  defaultNegativeMarks: number;
  instructions?: string;
  instructionsHi?: string;
  sections?: {
    _id: string;
    title: string;
    titleHi?: string;
    questionCount: number;
  }[];
}

interface ResumeAttempt {
  _id: string;
  timeRemaining: number;
}

interface InstructionsProps {
  examInfo: ExamInfo;
  resumeAttempt: ResumeAttempt | null;
  userName: string;
  onStart: (language: 'en' | 'hi') => void;
  onGoBack: () => void;
}

export default function Instructions({
  examInfo,
  resumeAttempt,
  userName,
  onStart,
  onGoBack,
}: InstructionsProps) {
  const [step, setStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleStart = async () => {
    if (!declarationChecked) return;
    setIsStarting(true);
    await onStart(selectedLanguage);
    setIsStarting(false);
  };

  // Step 1: General Instructions
  if (step === 1) {
    return (
      <div className="min-h-screen bg-white flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-primary text-white px-6 py-3 flex items-center gap-4">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
              <span className="font-bold text-lg">S</span>
            </div>
            <span className="font-semibold">{examInfo.title}</span>
          </header>

          {/* Instructions Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-6">General Instructions:</h2>

            <ol className="space-y-6 text-gray-700">
              <li className="flex gap-3">
                <span className="font-semibold shrink-0">1.</span>
                <span>
                  The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You need not terminate the examination or submit your paper.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="font-semibold shrink-0">2.</span>
                <div>
                  <p className="mb-3">The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</p>
                  <div className="space-y-2 ml-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded border-2 border-gray-300 bg-white"></span>
                      <span>You have not visited the question yet.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-red-500"></span>
                      <span>You have not answered the question.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-500"></span>
                      <span>You have answered the question.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500"></span>
                      <span>You have NOT answered the question, but have marked the question for review.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500 relative">
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border border-white"></span>
                      </span>
                      <span>You have answered the question, but marked it for review.</span>
                    </div>
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="font-semibold shrink-0"></span>
                <span className="text-sm text-gray-600">
                  The <strong>Mark For Review</strong> status for a question simply indicates that you would like to look at that question again. If a question is answered, but marked for review, then the answer will be considered for evaluation unless the status is modified by the candidate.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="font-semibold shrink-0"></span>
                <div>
                  <p className="font-semibold mb-2">Navigating to a Question:</p>
                  <ol className="space-y-2 ml-4 list-decimal list-inside">
                    <li>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</li>
                    <li>Click on <strong>Save &amp; Next</strong> to save your answer for the current question and then go to the next question.</li>
                    <li>Click on <strong>Mark for Review &amp; Next</strong> to save your answer for the current question and also mark it for review, and then go to the next question.</li>
                  </ol>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="font-semibold shrink-0"></span>
                <span className="text-sm text-gray-600">
                  Note that your answer for the current question will not be saved, if you navigate to another question directly by clicking on a question number without saving the answer to the previous question.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="font-semibold shrink-0"></span>
                <span>
                  You can view all the questions by clicking on the <strong>Question Paper</strong> button.{' '}
                  <span className="text-red-500">This feature is provided, so that if you want you can just see the entire question paper at a glance.</span>
                </span>
              </li>
            </ol>

            <div className="mt-6">
              <p className="font-semibold mb-2">Answering a Question:</p>
              <ol className="space-y-2 ml-4 text-gray-700">
                <li className="flex gap-2">
                  <span className="shrink-0">4.</span>
                  <span>Procedure for answering a multiple choice (MCQ) type question:</span>
                </li>
                <li className="ml-6">
                  <ol className="list-disc list-inside space-y-1">
                    <li>Choose one answer from the 4 options (A,B,C,D) given below the question, click on the bubble placed before the chosen option.</li>
                    <li>To deselect your chosen answer, click on the bubble of the chosen option again or click on the <strong>Clear Response</strong> button.</li>
                    <li>To change your chosen answer, click on the bubble of another option.</li>
                    <li>To save your answer, you MUST click on the <strong>Save &amp; Next</strong> button.</li>
                  </ol>
                </li>
              </ol>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={onGoBack}
              className="text-primary hover:text-primary-dark font-medium flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Tests
            </button>
            <Button
              onClick={() => setStep(2)}
              className="bg-primary hover:bg-primary-dark text-white px-6"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </footer>
        </div>

        {/* Right Panel - Student Info */}
        <div className="w-80 bg-gray-50 border-l flex flex-col items-center justify-center p-8">
          <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center mb-4">
            <User className="h-16 w-16 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">{userName}</h3>
        </div>
      </div>
    );
  }

  // Step 2: Test-Specific Instructions + Declaration
  return (
    <div className="min-h-screen bg-white flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-primary text-white px-6 py-3 flex items-center gap-4">
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
            <span className="font-bold text-lg">S</span>
          </div>
          <span className="font-semibold">{examInfo.title}</span>
        </header>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Exam Title */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            {examInfo.title}
          </h1>

          {/* Duration & Marks */}
          <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Duration: {examInfo.duration} Mins</span>
            </div>
            <div className="text-gray-700">
              <span className="font-medium">Maximum Marks: {examInfo.totalMarks}</span>
            </div>
          </div>

          {/* Resume Notice */}
          {resumeAttempt && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-700 font-medium">
                You have an ongoing attempt. Time remaining: {formatTime(resumeAttempt.timeRemaining)}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="max-w-2xl mx-auto mb-8">
            <h3 className="font-bold text-gray-800 mb-4">Read the following instructions carefully.</h3>
            <ol className="space-y-3 text-gray-700 list-decimal list-inside">
              <li>The test contains {examInfo.totalQuestions} total questions.</li>
              <li>Each question has 4 options out of which only one is correct.</li>
              <li>You have to finish the test in {examInfo.duration} minutes.</li>
              <li>
                You will be awarded <strong className="text-green-600">+{examInfo.defaultPositiveMarks} mark</strong> for each correct answer and{' '}
                <strong className="text-red-600">-{examInfo.defaultNegativeMarks}</strong> will be deducted for each wrong answer.
              </li>
              <li>There is no negative marking for the questions that you have not attempted.</li>
              {examInfo.sections && examInfo.sections.length > 1 && (
                <li>
                  The test has {examInfo.sections.length} sections:{' '}
                  {examInfo.sections.map((s, i) => (
                    <span key={s._id}>
                      {s.title} ({s.questionCount} questions)
                      {i < examInfo.sections!.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </li>
              )}
            </ol>
          </div>

          {/* Language Selection */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex items-center gap-3">
              <label className="font-medium text-gray-700">Choose your default language:</label>
              <Select
                value={selectedLanguage}
                onValueChange={(v) => setSelectedLanguage(v as 'en' | 'hi')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-red-500 mt-2">
              Please note all questions will appear in your default language. This language can be changed for a particular question later on.
            </p>
          </div>

          {/* Declaration */}
          <div className="max-w-2xl mx-auto mb-8">
            <p className="font-semibold text-gray-700 mb-3">Declaration:</p>
            <div className="flex items-start gap-3">
              <Checkbox
                id="declaration"
                checked={declarationChecked}
                onCheckedChange={(checked) => setDeclarationChecked(checked === true)}
                className="mt-1"
              />
              <label htmlFor="declaration" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                I have read all the instructions carefully and have understood them. I agree not to cheat or use unfair means in this examination. I understand that using unfair means of any sort for my own or someone else&apos;s advantage will lead to my immediate disqualification. The decision of Sivi Academy will be final in these matters and cannot be appealed.
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(1)}
            className="px-6"
          >
            Previous
          </Button>
          <Button
            onClick={handleStart}
            disabled={!declarationChecked || isStarting}
            className="bg-green-500 hover:bg-green-600 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStarting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              'I am ready to begin'
            )}
          </Button>
        </footer>
      </div>

      {/* Right Panel - Student Info */}
      <div className="w-80 bg-gray-50 border-l flex flex-col items-center justify-center p-8">
        <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center mb-4">
          <User className="h-16 w-16 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{userName}</h3>
      </div>
    </div>
  );
}
