'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  CheckCircle,
  XCircle,
  MinusCircle,
  ArrowLeft,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast, Toaster } from 'sonner';
import { cn } from '@/lib/utils';

interface ResultData {
  exam: {
    _id: string;
    title: string;
    totalQuestions: number;
    totalMarks: number;
    duration: number;
  };
  attempt: {
    _id: string;
    score: number;
    maxScore: number;
    percentage: number;
    grade: string;
    passed: boolean;
    correct: number;
    wrong: number;
    skipped: number;
    totalTimeTaken: number;
    rank?: number;
    percentile?: number;
    completedAt: string;
    attemptCount?: number;
  };
  sectionProgress: {
    sectionId: string;
    sectionTitle: string;
    total: number;
    attempted: number;
    correct: number;
    wrong: number;
    score: number;
    maxScore: number;
  }[];
}

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.examId as string;
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // API helper
  const apiCall = async (url: string) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return res.json();
  };

  // Fetch result
  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await apiCall(`/test/attempt/${attemptId}/result`);
        if (res.success) {
          setResult(res.data);
        } else {
          toast.error('Failed to load result');
        }
      } catch {
        toast.error('Failed to load result');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const calculateSpeed = () => {
    if (!result) return '0';
    const totalQuestions = result.attempt.correct + result.attempt.wrong + result.attempt.skipped;
    const timeInMinutes = result.attempt.totalTimeTaken / 60;
    if (timeInMinutes === 0) return '0';
    return (totalQuestions / timeInMinutes).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        <Toaster position="top-center" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Result not found</p>
        <Button onClick={() => window.close()}>Close</Button>
        <Toaster position="top-center" />
      </div>
    );
  }

  const { exam, attempt, sectionProgress } = result;
  const totalQuestions = attempt.correct + attempt.wrong + attempt.skipped;

  // Calculate donut chart percentages
  const correctPercent = (attempt.correct / totalQuestions) * 100;
  const wrongPercent = (attempt.wrong / totalQuestions) * 100;
  const skippedPercent = (attempt.skipped / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="font-semibold text-gray-800">{exam.title}</h1>
          <Button
            variant="ghost"
            onClick={() => window.close()}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </header>

      {/* Thank You Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            Thank you for attempting {exam.title}
          </h2>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rank Card */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Rank</h3>
                  {attempt.rank ? (
                    <p className="text-3xl font-bold text-purple-600">#{attempt.rank}</p>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">Will be announced at</p>
                      <p className="text-purple-600 font-medium">
                        {new Date(attempt.completedAt).toLocaleDateString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  <div className="relative w-20 h-20">
                    <Trophy className="w-16 h-16 text-yellow-400 absolute top-2 left-2" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Card */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Score</p>
                    <p className="font-bold text-gray-800">
                      {attempt.score.toFixed(2)}/{attempt.maxScore}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <RotateCcw className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Attempts</p>
                    <p className="font-bold text-gray-800">{attempt.attemptCount || 1}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Speed</p>
                    <p className="font-bold text-gray-800">{calculateSpeed()}Q/min</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Accuracy</p>
                    <p className="font-bold text-gray-800">
                      {attempt.correct + attempt.wrong > 0
                        ? Math.round((attempt.correct / (attempt.correct + attempt.wrong)) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donut Chart Card */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Donut Chart */}
                <div className="relative w-28 h-28 shrink-0">
                  <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                    />
                    {/* Correct (Green) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="12"
                      strokeDasharray={`${correctPercent * 2.51} 251`}
                      strokeDashoffset="0"
                    />
                    {/* Wrong (Red) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="12"
                      strokeDasharray={`${wrongPercent * 2.51} 251`}
                      strokeDashoffset={`${-correctPercent * 2.51}`}
                    />
                    {/* Skipped (Gray) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#9CA3AF"
                      strokeWidth="12"
                      strokeDasharray={`${skippedPercent * 2.51} 251`}
                      strokeDashoffset={`${-(correctPercent + wrongPercent) * 2.51}`}
                    />
                  </svg>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-sm text-gray-600">CORRECT</span>
                    <span className="font-bold text-green-600 ml-auto">{attempt.correct}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-sm text-gray-600">INCORRECT</span>
                    <span className="font-bold text-red-600 ml-auto">{attempt.wrong}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                    <span className="text-sm text-gray-600">SKIPPED</span>
                    <span className="font-bold text-gray-600 ml-auto">{attempt.skipped}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grade Badge */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white',
                  attempt.passed ? 'bg-green-500' : 'bg-red-500'
                )}>
                  {attempt.grade}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {attempt.passed ? 'Congratulations!' : 'Keep Practicing!'}
                  </h3>
                  <p className="text-gray-600">
                    You scored {attempt.percentage.toFixed(1)}% in this exam
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/exam/${examId}`)}
                  className="border-purple-500 text-purple-600 hover:bg-purple-50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Test
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section-wise Performance */}
      {sectionProgress && sectionProgress.length > 1 && (
        <div className="max-w-6xl mx-auto px-6 mt-8 pb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Section-wise Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Section</th>
                      <th className="text-center py-3 px-4 text-gray-600 font-medium">Total</th>
                      <th className="text-center py-3 px-4 text-gray-600 font-medium">Attempted</th>
                      <th className="text-center py-3 px-4 text-gray-600 font-medium">Correct</th>
                      <th className="text-center py-3 px-4 text-gray-600 font-medium">Wrong</th>
                      <th className="text-center py-3 px-4 text-gray-600 font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionProgress.map((section) => (
                      <tr key={section.sectionId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{section.sectionTitle}</td>
                        <td className="text-center py-3 px-4 text-gray-600">{section.total}</td>
                        <td className="text-center py-3 px-4 text-blue-600">{section.attempted}</td>
                        <td className="text-center py-3 px-4 text-green-600">{section.correct}</td>
                        <td className="text-center py-3 px-4 text-red-600">{section.wrong}</td>
                        <td className="text-center py-3 px-4 font-bold text-purple-600">
                          {(section.marksObtained ?? section.score ?? 0).toFixed(1)}/{section.maxScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary Stats */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{totalQuestions}</p>
              <p className="text-sm text-gray-500">Total Questions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{attempt.correct}</p>
              <p className="text-sm text-gray-500">Correct Answers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{attempt.wrong}</p>
              <p className="text-sm text-gray-500">Wrong Answers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                <MinusCircle className="h-6 w-6 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-600">{attempt.skipped}</p>
              <p className="text-sm text-gray-500">Skipped</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
