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
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

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

export default function CourseViewerByIdPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  // State
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Fetch course content by ID
  const fetchCourse = useCallback(async () => {
    try {
      const { data } = await api.get(`/learn/courses/${courseId}`);

      if (data.success) {
        // Transform backend response to match our Course interface
        const { course: courseData, subjects, progress } = data.data;
        const transformedCourse: Course = {
          _id: courseData._id,
          title: courseData.title,
          slug: courseData.slug,
          thumbnail: courseData.thumbnail,
          subjects: subjects.map((subject: any) => ({
            _id: subject._id,
            title: subject.title,
            titleHi: subject.titleHi,
            icon: subject.icon,
            chapters: subject.chapters.map((chapter: any) => ({
              _id: chapter._id,
              title: chapter.title,
              titleHi: chapter.titleHi,
              isFree: chapter.isFree,
              lessons: chapter.lessons.map((lesson: any) => ({
                _id: lesson._id,
                title: lesson.title,
                titleHi: lesson.titleHi,
                type: lesson.type,
                isCompleted: progress?.completedLessons?.includes(lesson._id) || false,
                isFree: lesson.isFree,
              })),
              completedLessons: chapter.lessons.filter((l: any) =>
                progress?.completedLessons?.includes(l._id)
              ).length,
              totalLessons: chapter.lessons.length,
            })),
            completedLessons: subject.chapters.reduce((sum: number, ch: any) =>
              sum + ch.lessons.filter((l: any) => progress?.completedLessons?.includes(l._id)).length, 0
            ),
            totalLessons: subject.chapters.reduce((sum: number, ch: any) => sum + ch.lessons.length, 0),
          })),
          progress: {
            completedLessons: progress?.completedLessons?.length || 0,
            totalLessons: subjects.reduce((sum: number, s: any) =>
              sum + s.chapters.reduce((csum: number, ch: any) => csum + ch.lessons.length, 0), 0
            ),
            percentage: progress?.percentage || 0,
            streak: progress?.streak || 0,
            totalPoints: progress?.totalPoints || 0,
          },
        };

        setCourse(transformedCourse);
        // Auto-expand first subject
        if (transformedCourse.subjects.length > 0) {
          setExpandedSubjects(new Set([transformedCourse.subjects[0]._id]));
          if (transformedCourse.subjects[0].chapters.length > 0) {
            setExpandedChapters(new Set([transformedCourse.subjects[0].chapters[0]._id]));
          }
        }
      } else {
        toast.error(data.error?.message || 'Failed to load course');
        router.push('/dashboard/courses');
      }
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast.error('Failed to load course');
      }
      router.push('/dashboard/courses');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Fetch lesson content
  const fetchLesson = async (lessonId: string) => {
    setIsLoadingLesson(true);
    try {
      const { data } = await api.get(`/learn/lessons/${lessonId}`);

      if (data.success) {
        setSelectedLesson(data.data);
      } else {
        toast.error(data.error?.message || 'Failed to load lesson');
      }
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast.error('Failed to load lesson');
      }
    } finally {
      setIsLoadingLesson(false);
    }
  };

  // Mark lesson complete
  const markComplete = async () => {
    if (!selectedLesson) return;

    try {
      const { data } = await api.post(`/learn/lessons/${selectedLesson._id}/complete`);

      if (data.success) {
        toast.success('Lesson completed!');
        setSelectedLesson({ ...selectedLesson, isCompleted: true });
        fetchCourse(); // Refresh progress
      }
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast.error('Failed to mark complete');
      }
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
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    }
    switch (type) {
      case 'notes':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'pdf':
        return <File className="h-4 w-4 text-orange-600" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-purple-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'flex flex-col border-r border-border bg-card transition-all duration-300',
          sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/courses')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{course.title}</h2>
            <p className="text-xs text-muted-foreground">
              {course.progress.completedLessons}/{course.progress.totalLessons} lessons
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Your Progress</span>
            <span className="text-sm font-medium text-foreground">
              {course.progress.percentage}%
            </span>
          </div>
          <Progress value={course.progress.percentage} className="h-2" />
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1 text-amber-600">
              <Flame className="h-3 w-3" />
              <span>{course.progress.streak} day streak</span>
            </div>
            <div className="flex items-center gap-1 text-purple-600">
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
                className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {expandedSubjects.has(subject._id) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="flex-1 text-sm text-foreground text-left truncate">
                  {language === 'hi' && subject.titleHi ? subject.titleHi : subject.title}
                </span>
                <span className="text-xs text-muted-foreground">
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
                        className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        {expandedChapters.has(chapter._id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <FileText className="h-4 w-4 text-purple-600 shrink-0" />
                        <span className="flex-1 text-sm text-foreground/80 text-left truncate">
                          {language === 'hi' && chapter.titleHi ? chapter.titleHi : chapter.title}
                        </span>
                        {chapter.isFree && (
                          <Badge variant="secondary" className="h-5 text-xs bg-emerald-100 text-emerald-700">
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
                                  ? 'bg-primary/10 border border-primary/30'
                                  : 'hover:bg-muted'
                              )}
                            >
                              {getLessonIcon(lesson.type, lesson.isCompleted)}
                              <span
                                className={cn(
                                  'flex-1 text-sm text-left truncate',
                                  lesson.isCompleted ? 'text-muted-foreground' : 'text-foreground/80'
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
        <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground"
          >
            <Menu className="h-4 w-4" />
          </Button>
          {selectedLesson && (
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">
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
            >
              English
            </Button>
            <Button
              variant={language === 'hi' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('hi')}
            >
              Hindi
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-background">
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
              <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {language === 'hi' ? 'पाठ चुनें' : 'Select a Lesson'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-md">
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
          className="prose prose-lg max-w-none"
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
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <File className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{lesson.pdfName || 'PDF Document'}</h3>
                  <p className="text-sm text-muted-foreground">PDF Document</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lesson.allowDownload && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(lesson.pdfUrl, '_blank')}
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
            <div className="aspect-4/3 bg-muted rounded-lg overflow-hidden">
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
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <div
              className={cn(
                'w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center',
                lesson.quiz.mode === 'practice'
                  ? 'bg-emerald-100'
                  : 'bg-blue-100'
              )}
            >
              <HelpCircle
                className={cn(
                  'h-10 w-10',
                  lesson.quiz.mode === 'practice' ? 'text-emerald-600' : 'text-blue-600'
                )}
              />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {lesson.quiz.mode === 'practice'
                ? language === 'hi'
                  ? 'Practice Quiz'
                  : 'Practice Quiz'
                : language === 'hi'
                ? 'Exam Quiz'
                : 'Exam Quiz'}
            </h2>

            <p className="text-muted-foreground mb-6">
              {language === 'hi' && lesson.titleHi ? lesson.titleHi : lesson.title}
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>{lesson.quiz.totalQuestions} {language === 'hi' ? 'questions' : 'questions'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{lesson.quiz.duration} {language === 'hi' ? 'minutes' : 'minutes'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span>{lesson.quiz.passingPercentage}% {language === 'hi' ? 'to pass' : 'to pass'}</span>
              </div>
            </div>

            {lesson.quiz.mode === 'practice' ? (
              <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">
                    {language === 'hi' ? 'Immediate feedback after each answer' : 'Immediate feedback after each answer'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">
                    {language === 'hi' ? 'No negative marking' : 'No negative marking'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">
                    {language === 'hi' ? 'Learn at your own pace' : 'Learn at your own pace'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
                <div className="flex items-center gap-2 text-blue-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {language === 'hi' ? 'Timed examination' : 'Timed examination'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-amber-600">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm">
                    {language === 'hi' ? '-0.25 negative marking' : '-0.25 negative marking'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">
                    {language === 'hi' ? 'Results at the end' : 'Results at the end'}
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
                {language === 'hi' ? 'Start Quiz' : 'Start Quiz'}
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
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
      {lesson.prevLesson ? (
        <Button
          variant="outline"
          onClick={() => onNavigate(lesson.prevLesson!._id)}
        >
          <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
          {language === 'hi' ? 'Previous' : 'Previous'}
        </Button>
      ) : (
        <div />
      )}

      {!lesson.isCompleted && lesson.type !== 'quiz' && (
        <Button onClick={onComplete} className="bg-emerald-600 hover:bg-emerald-700">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {language === 'hi' ? 'Mark Complete' : 'Mark Complete'}
        </Button>
      )}

      {lesson.isCompleted && (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {language === 'hi' ? 'Completed' : 'Completed'}
        </Badge>
      )}

      {lesson.nextLesson ? (
        <Button onClick={() => onNavigate(lesson.nextLesson!._id)}>
          {language === 'hi' ? 'Next' : 'Next'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
}
