'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useExamAttemptStore } from '@/store/examAttemptStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

// Import components
import Instructions from './components/Instructions';
import ExamCBT from './components/ExamCBT';

// Types
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
  currentSectionIndex: number;
  currentQuestionIndex: number;
}

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.examId as string;

  const { user } = useAuthStore();
  const {
    initializeAttempt,
    setLoading,
    reset,
  } = useExamAttemptStore();

  // Page states
  const [pageState, setPageState] = useState<'loading' | 'instructions' | 'exam'>('loading');
  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null);
  const [resumeAttempt, setResumeAttempt] = useState<ResumeAttempt | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [testSeriesId, setTestSeriesId] = useState<string | null>(null);

  // Check authentication and listen for token changes from other tabs
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please login to take the exam');
      router.push('/login');
    }

    // Listen for token changes from other tabs (e.g., if user logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        // Token was removed (logout in another tab), redirect to login
        toast.error('Session expired. Please login again.');
        router.push('/login');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  // Fetch exam info on mount
  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const { data: result } = await api.get(`/test/exam/${examId}/info`);
        if (result.success) {
          setExamInfo(result.data.exam);
          setTestSeriesId(result.data.testSeriesId);
          if (result.data.existingAttempt) {
            setResumeAttempt(result.data.existingAttempt);
          }
          setPageState('instructions');
        } else {
          toast.error('Failed to load exam');
          window.close();
        }
      } catch {
        toast.error('Failed to load exam');
        window.close();
      }
    };

    fetchExamInfo();
    return () => reset();
  }, [examId, reset]);

  // Fullscreen handling
  const enterFullScreen = useCallback(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => setIsFullScreen(true)).catch(() => {});
    }
  }, []);

  const exitFullScreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => {});
    }
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (isFullScreen) {
      exitFullScreen();
    } else {
      enterFullScreen();
    }
  }, [isFullScreen, enterFullScreen, exitFullScreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  // Start exam
  const handleStartExam = async (language: 'en' | 'hi') => {
    setLoading(true);
    try {
      // Enter fullscreen
      enterFullScreen();

      const { data: result } = await api.post(`/test/exam/${examId}/start`, { language });
      if (result.success) {
        const data = result.data;
        initializeAttempt({
          attemptId: data.attemptId,
          exam: data.exam,
          sections: data.sections,
          answers: data.answers || [],
          currentSectionIndex: data.currentSectionIndex || 0,
          currentQuestionIndex: data.currentQuestionIndex || 0,
          timeRemaining: data.timeRemaining,
          language: data.language || language,
        });
        setPageState('exam');
      } else {
        toast.error(result.error?.message || 'Failed to start exam');
      }
    } catch {
      toast.error('Failed to start exam');
    } finally {
      setLoading(false);
    }
  };

  // Go back to tests
  const handleGoToTests = () => {
    window.close();
    // Fallback if window.close doesn't work
    setTimeout(() => {
      router.push('/dashboard/test-series');
    }, 100);
  };

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading exam...</p>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

  // Instructions page
  if (pageState === 'instructions' && examInfo) {
    return (
      <>
        <Instructions
          examInfo={examInfo}
          resumeAttempt={resumeAttempt}
          userName={user?.name || 'Student'}
          onStart={handleStartExam}
          onGoBack={handleGoToTests}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  // Exam CBT interface
  return (
    <>
      <ExamCBT
        examId={examId}
        testSeriesId={testSeriesId}
        isFullScreen={isFullScreen}
        onToggleFullScreen={toggleFullScreen}
        userName={user?.name || 'Student'}
      />
      <Toaster position="top-center" />
    </>
  );
}
