'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  File,
  HelpCircle,
  CheckCircle2,
  Play,
  Clock,
  Trophy,
  Flame,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
interface Lesson {
  _id: string;
  title: string;
  titleHi?: string;
  type: 'notes' | 'pdf' | 'quiz';
  isCompleted: boolean;
  isFree: boolean;
}

interface Chapter {
  _id: string;
  title: string;
  titleHi?: string;
  isFree: boolean;
  lessons: Lesson[];
  completedLessons: number;
  totalLessons: number;
}

interface Subject {
  _id: string;
  title: string;
  titleHi?: string;
  icon?: string;
  chapters: Chapter[];
  completedLessons: number;
  totalLessons: number;
}

interface CourseProgress {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  streak: number;
  totalPoints: number;
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  subjects: Subject[];
  progress: CourseProgress;
}

interface LessonContent {
  _id: string;
  title: string;
  titleHi?: string;
  type: 'notes' | 'pdf' | 'quiz';
  content?: string;
  contentHi?: string;
  pdfUrl?: string;
  pdfName?: string;
  allowDownload?: boolean;
  quiz?: {
    _id: string;
    mode: 'practice' | 'exam';
    totalQuestions: number;
    duration: number;
    passingPercentage: number;
  };
  isCompleted: boolean;
  nextLesson?: {
    _id: string;
    title: string;
    chapterId: string;
  };
  prevLesson?: {
    _id: string;
    title: string;
    chapterId: string;
  };
}

export default function CourseViewerPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  // State
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Fetch course content
  const fetchCourse = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/learn/courses/${slug}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setCourse(data.data);
        // Auto-expand first subject
        if (data.data.subjects.length > 0) {
          setExpandedSubjects(new Set([data.data.subjects[0]._id]));
          if (data.data.subjects[0].chapters.length > 0) {
            setExpandedChapters(new Set([data.data.subjects[0].chapters[0]._id]));
          }
        }
      } else {
        toast.error('Failed to load course');
        router.push('/dashboard');
      }
    } catch {
      toast.error('Failed to load course');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Fetch lesson content
  const fetchLesson = async (lessonId: string) => {
    setIsLoadingLesson(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/learn/lessons/${lessonId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setSelectedLesson(data.data);
      } else {
        toast.error(data.error?.message || 'Failed to load lesson');
      }
    } catch {
      toast.error('Failed to load lesson');
    } finally {
      setIsLoadingLesson(false);
    }
  };

  // Mark lesson complete
  const markComplete = async () => {
    if (!selectedLesson) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/learn/lessons/${selectedLesson._id}/complete`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('Lesson completed!');
        setSelectedLesson({ ...selectedLesson, isCompleted: true });
        fetchCourse(); // Refresh progress
      }
    } catch {
      toast.error('Failed to mark complete');
    }
  };

  // Toggle expand
  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  // Get lesson type icon
  const getLessonIcon = (type: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }
    switch (type) {
      case 'notes':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'pdf':
        return <File className="h-4 w-4 text-orange-400" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-purple-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-slate-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div
        className={cn(
          'flex flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300',
          sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-800">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white truncate">{course.title}</h2>
            <p className="text-xs text-slate-400">
              {course.progress.completedLessons}/{course.progress.totalLessons} lessons
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Your Progress</span>
            <span className="text-sm font-medium text-white">
              {course.progress.percentage}%
            </span>
          </div>
          <Progress value={course.progress.percentage} className="h-2" />
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1 text-amber-400">
              <Flame className="h-3 w-3" />
              <span>{course.progress.streak} day streak</span>
            </div>
            <div className="flex items-center gap-1 text-purple-400">
              <Trophy className="h-3 w-3" />
              <span>{course.progress.totalPoints} pts</span>
            </div>
          </div>
        </div>

        {/* Course Structure */}
        <div className="flex-1 overflow-y-auto p-2">
          {course.subjects.map((subject) => (
            <div key={subject._id} className="mb-1">
              {/* Subject */}
              <button
                onClick={() => toggleSubject(subject._id)}
                className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {expandedSubjects.has(subject._id) ? (
                  <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                )}
                <BookOpen className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="flex-1 text-sm text-slate-200 text-left truncate">
                  {language === 'hi' && subject.titleHi ? subject.titleHi : subject.title}
                </span>
                <span className="text-xs text-slate-500">
                  {subject.completedLessons}/{subject.totalLessons}
                </span>
              </button>

              {/* Chapters */}
              {expandedSubjects.has(subject._id) && (
                <div className="ml-4">
                  {subject.chapters.map((chapter) => (
                    <div key={chapter._id} className="mb-1">
                      {/* Chapter */}
                      <button
                        onClick={() => toggleChapter(chapter._id)}
                        className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        {expandedChapters.has(chapter._id) ? (
                          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        )}
                        <FileText className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span className="flex-1 text-sm text-slate-300 text-left truncate">
                          {language === 'hi' && chapter.titleHi ? chapter.titleHi : chapter.title}
                        </span>
                        {chapter.isFree && (
                          <Badge variant="secondary" className="h-5 text-xs bg-emerald-600/20 text-emerald-400">
                            Free
                          </Badge>
                        )}
                      </button>

                      {/* Lessons */}
                      {expandedChapters.has(chapter._id) && (
                        <div className="ml-4">
                          {chapter.lessons.map((lesson) => (
                            <button
                              key={lesson._id}
                              onClick={() => fetchLesson(lesson._id)}
                              className={cn(
                                'flex items-center gap-2 w-full p-2 rounded-lg transition-colors',
                                selectedLesson?._id === lesson._id
                                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                                  : 'hover:bg-slate-800'
                              )}
                            >
                              {getLessonIcon(lesson.type, lesson.isCompleted)}
                              <span
                                className={cn(
                                  'flex-1 text-sm text-left truncate',
                                  lesson.isCompleted ? 'text-slate-400' : 'text-slate-300'
                                )}
                              >
                                {language === 'hi' && lesson.titleHi ? lesson.titleHi : lesson.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-slate-800">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400"
          >
            {sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 rotate-90" />}
          </Button>
          {selectedLesson && (
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-white">
                {language === 'hi' && selectedLesson.titleHi
                  ? selectedLesson.titleHi
                  : selectedLesson.title}
              </h1>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
              className={language !== 'en' ? 'border-slate-700 text-slate-300' : ''}
            >
              English
            </Button>
            <Button
              variant={language === 'hi' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('hi')}
              className={language !== 'hi' ? 'border-slate-700 text-slate-300' : ''}
            >
              हिंदी
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoadingLesson ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedLesson ? (
            <LessonViewer
              lesson={selectedLesson}
              language={language}
              onComplete={markComplete}
              onNavigate={(lessonId) => fetchLesson(lessonId)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BookOpen className="h-16 w-16 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                {language === 'hi' ? 'पाठ चुनें' : 'Select a Lesson'}
              </h3>
              <p className="text-slate-500 text-sm max-w-md">
                {language === 'hi'
                  ? 'सीखना शुरू करने के लिए साइडबार से एक पाठ चुनें।'
                  : 'Choose a lesson from the sidebar to start learning.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Lesson Viewer Component
function LessonViewer({
  lesson,
  language,
  onComplete,
  onNavigate,
}: {
  lesson: LessonContent;
  language: 'en' | 'hi';
  onComplete: () => void;
  onNavigate: (lessonId: string) => void;
}) {
  if (lesson.type === 'notes') {
    const content = language === 'hi' && lesson.contentHi ? lesson.contentHi : lesson.content;
    return (
      <div className="max-w-4xl mx-auto">
        {/* Notes Content */}
        <div
          className="prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content || '' }}
        />

        {/* Navigation */}
        <LessonNavigation
          lesson={lesson}
          onComplete={onComplete}
          onNavigate={onNavigate}
          language={language}
        />
      </div>
    );
  }

  if (lesson.type === 'pdf') {
    return (
      <div className="max-w-4xl mx-auto">
        {/* PDF Viewer */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-400/10 rounded-lg">
                  <File className="h-8 w-8 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{lesson.pdfName || 'PDF Document'}</h3>
                  <p className="text-sm text-slate-400">PDF Document</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lesson.allowDownload && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(lesson.pdfUrl, '_blank')}
                    className="border-slate-700 text-slate-300"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
                <Button
                  onClick={() => window.open(lesson.pdfUrl, '_blank')}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Open PDF
                </Button>
              </div>
            </div>

            {/* Embedded PDF */}
            <div className="aspect-[4/3] bg-slate-900 rounded-lg overflow-hidden">
              <iframe
                src={`${lesson.pdfUrl}#toolbar=0`}
                className="w-full h-full"
                title={lesson.pdfName || 'PDF Document'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <LessonNavigation
          lesson={lesson}
          onComplete={onComplete}
          onNavigate={onNavigate}
          language={language}
        />
      </div>
    );
  }

  if (lesson.type === 'quiz' && lesson.quiz) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Quiz Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <div
              className={cn(
                'w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center',
                lesson.quiz.mode === 'practice'
                  ? 'bg-emerald-500/10'
                  : 'bg-blue-500/10'
              )}
            >
              <HelpCircle
                className={cn(
                  'h-10 w-10',
                  lesson.quiz.mode === 'practice' ? 'text-emerald-400' : 'text-blue-400'
                )}
              />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {lesson.quiz.mode === 'practice'
                ? language === 'hi'
                  ? 'अभ्यास क्विज़'
                  : 'Practice Quiz'
                : language === 'hi'
                ? 'परीक्षा क्विज़'
                : 'Exam Quiz'}
            </h2>

            <p className="text-slate-400 mb-6">
              {language === 'hi' && lesson.titleHi ? lesson.titleHi : lesson.title}
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-400 mb-8">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>{lesson.quiz.totalQuestions} {language === 'hi' ? 'प्रश्न' : 'questions'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{lesson.quiz.duration} {language === 'hi' ? 'मिनट' : 'minutes'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span>{lesson.quiz.passingPercentage}% {language === 'hi' ? 'उत्तीर्ण' : 'to pass'}</span>
              </div>
            </div>

            {lesson.quiz.mode === 'practice' ? (
              <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">
                    {language === 'hi' ? 'प्रत्येक उत्तर के बाद तुरंत प्रतिक्रिया' : 'Immediate feedback after each answer'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">
                    {language === 'hi' ? 'कोई नकारात्मक अंकन नहीं' : 'No negative marking'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">
                    {language === 'hi' ? 'अपनी गति से सीखें' : 'Learn at your own pace'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
                <div className="flex items-center gap-2 text-blue-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {language === 'hi' ? 'समयबद्ध परीक्षा' : 'Timed examination'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-amber-400">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm">
                    {language === 'hi' ? '-0.25 नकारात्मक अंकन' : '-0.25 negative marking'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">
                    {language === 'hi' ? 'अंत में परिणाम' : 'Results at the end'}
                  </span>
                </div>
              </div>
            )}

            <Link href={`/dashboard/quiz/${lesson.quiz._id}`}>
              <Button
                size="lg"
                className={
                  lesson.quiz.mode === 'practice'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }
              >
                <Play className="mr-2 h-5 w-5" />
                {language === 'hi' ? 'क्विज़ शुरू करें' : 'Start Quiz'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

// Lesson Navigation Component
function LessonNavigation({
  lesson,
  onComplete,
  onNavigate,
  language,
}: {
  lesson: LessonContent;
  onComplete: () => void;
  onNavigate: (lessonId: string) => void;
  language: 'en' | 'hi';
}) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
      {lesson.prevLesson ? (
        <Button
          variant="outline"
          onClick={() => onNavigate(lesson.prevLesson!._id)}
          className="border-slate-700 text-slate-300"
        >
          <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
          {language === 'hi' ? 'पिछला' : 'Previous'}
        </Button>
      ) : (
        <div />
      )}

      {!lesson.isCompleted && lesson.type !== 'quiz' && (
        <Button onClick={onComplete} className="bg-emerald-600 hover:bg-emerald-700">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {language === 'hi' ? 'पूर्ण चिह्नित करें' : 'Mark Complete'}
        </Button>
      )}

      {lesson.isCompleted && (
        <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-400">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {language === 'hi' ? 'पूर्ण' : 'Completed'}
        </Badge>
      )}

      {lesson.nextLesson ? (
        <Button onClick={() => onNavigate(lesson.nextLesson!._id)}>
          {language === 'hi' ? 'अगला' : 'Next'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
}
