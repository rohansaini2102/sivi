'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Clock,
  HelpCircle,
  Award,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Exam {
  _id: string;
  title: string;
  titleHi?: string;
  description?: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  defaultPositiveMarks: number;
  defaultNegativeMarks: number;
  isFree: boolean;
  isPublished: boolean;
  order: number;
}

interface ExamAttempt {
  _id: string;
  exam: string;
  status: 'in_progress' | 'completed' | 'auto_submitted';
  score?: number;
  maxScore?: number;
  percentage?: number;
  passed?: boolean;
  completedAt?: string;
}

interface TestSeriesDetail {
  _id: string;
  title: string;
  titleHi?: string;
  description?: string;
  examCategory: string;
  thumbnail?: string;
  totalExams: number;
  language: string;
}

export default function TestSeriesDetailPage() {
  const router = useRouter();
  const params = useParams();
  const testSeriesId = params.testSeriesId as string;

  const [testSeries, setTestSeries] = useState<TestSeriesDetail | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Map<string, ExamAttempt>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // API helper
  const apiCall = async (url: string) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  };

  // Fetch test series data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seriesResult, progressResult] = await Promise.all([
          apiCall(`/test/series/${testSeriesId}`),
          apiCall(`/test/series/${testSeriesId}/progress`),
        ]);

        if (seriesResult.success) {
          setTestSeries(seriesResult.data.testSeries);
          setExams(seriesResult.data.exams);
        } else {
          toast.error('Failed to load test series');
          router.push('/dashboard/test-series');
        }

        if (progressResult.success) {
          const attemptMap = new Map<string, ExamAttempt>();
          progressResult.data.attempts.forEach((attempt: ExamAttempt) => {
            attemptMap.set(attempt.exam, attempt);
          });
          setAttempts(attemptMap);
        }
      } catch {
        toast.error('Failed to load test series');
        router.push('/dashboard/test-series');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [testSeriesId, router]);

  // Get exam status
  const getExamStatus = (examId: string) => {
    const attempt = attempts.get(examId);
    if (!attempt) return 'not_started';
    if (attempt.status === 'in_progress') return 'in_progress';
    return 'completed';
  };

  // Calculate stats
  const completedExams = exams.filter(
    (e) => getExamStatus(e._id) === 'completed'
  ).length;
  const inProgressExams = exams.filter(
    (e) => getExamStatus(e._id) === 'in_progress'
  ).length;
  const overallProgress = exams.length > 0
    ? Math.round((completedExams / exams.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!testSeries) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Test series not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/test-series')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{testSeries.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{testSeries.examCategory}</Badge>
            <span className="text-sm text-muted-foreground">
              {exams.length} Exams
            </span>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{exams.length}</p>
            <p className="text-sm text-muted-foreground">Total Exams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{completedExams}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{inProgressExams}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{overallProgress}%</p>
            <p className="text-sm text-muted-foreground">Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedExams}/{exams.length} exams
            </span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Exams List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Exams</h2>
        {exams.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No exams available yet</p>
            </CardContent>
          </Card>
        ) : (
          exams
            .sort((a, b) => a.order - b.order)
            .map((exam) => {
              const status = getExamStatus(exam._id);
              const attempt = attempts.get(exam._id);

              return (
                <Card key={exam._id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div
                        className={`shrink-0 rounded-full p-2 ${
                          status === 'completed'
                            ? 'bg-emerald-100 text-emerald-600'
                            : status === 'in_progress'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : status === 'in_progress' ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>

                      {/* Exam Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground">
                            {exam.title}
                          </h3>
                          {exam.isFree && (
                            <Badge variant="secondary" className="shrink-0">
                              Free
                            </Badge>
                          )}
                        </div>

                        {exam.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {exam.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {exam.duration} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <HelpCircle className="h-4 w-4" />
                            {exam.totalQuestions} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {exam.totalMarks} marks
                          </span>
                          <span className="text-xs">
                            (+{exam.defaultPositiveMarks}/-{exam.defaultNegativeMarks})
                          </span>
                        </div>

                        {/* Score if completed */}
                        {status === 'completed' && attempt && (
                          <div className="mt-3 flex items-center gap-4">
                            <div
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                attempt.passed
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {attempt.percentage?.toFixed(1)}% - {attempt.passed ? 'Passed' : 'Failed'}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Score: {attempt.score}/{attempt.maxScore}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0">
                        {status === 'completed' ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/exam/${exam._id}/result/${attempt?._id}`, '_blank')}
                            >
                              View Result
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/exam/${exam._id}`, '_blank')}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : status === 'in_progress' ? (
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700"
                            onClick={() => window.open(`/exam/${exam._id}`, '_blank')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => window.open(`/exam/${exam._id}`, '_blank')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
        )}
      </div>
    </div>
  );
}
