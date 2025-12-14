'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Search,
  X,
  CheckCircle2,
  HelpCircle,
  FileText,
  Clock,
  Award,
  Filter,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
interface ExamSection {
  _id: string;
  title: string;
  titleHi?: string;
  order: number;
  questions: Question[];
  instructions?: string;
}

interface Question {
  _id: string;
  questionType: 'single' | 'multiple' | 'comprehension';
  question: string;
  questionHindi?: string;
  imageUrl?: string;
  options: { id: string; text: string; textHi?: string }[];
  correctAnswers: string[];
  explanation?: string;
  subject: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  examCategory: string;
}

interface Exam {
  _id: string;
  title: string;
  titleHi?: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  defaultPositiveMarks: number;
  defaultNegativeMarks: number;
  sections: ExamSection[];
  testSeries: {
    _id: string;
    title: string;
  };
}

interface QuestionBankItem {
  _id: string;
  questionType: 'single' | 'multiple' | 'comprehension';
  question: string;
  imageUrl?: string;
  options: { id: string; text: string }[];
  subject: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  examCategory: string;
}

interface QuestionBankResponse {
  questions: QuestionBankItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ExamEditorPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.examId as string;
  const initialSectionId = searchParams.get('section');

  // State
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(initialSectionId);

  // Question selector modal state
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionFilters, setQuestionFilters] = useState({
    search: '',
    subject: 'all',
    difficulty: 'all',
    questionType: 'all',
  });
  const [questionPagination, setQuestionPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    questionId: string;
    questionText: string;
  } | null>(null);

  // Drag and drop state
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);

  // API helper
  const apiCall = async (url: string, method: string, body?: object) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  };

  // Fetch exam details
  const fetchExam = useCallback(async () => {
    try {
      const result = await apiCall(
        `/admin/test-series-builder/exams/${examId}/full`,
        'GET'
      );

      if (result.success) {
        setExam(result.data);
        // Set first section as active if none specified
        if (!activeSection && result.data.sections.length > 0) {
          setActiveSection(result.data.sections[0]._id);
        }
      } else {
        toast.error('Failed to load exam');
        router.back();
      }
    } catch {
      toast.error('Failed to load exam');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [examId, activeSection, router]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  // Fetch question bank
  const fetchQuestionBank = useCallback(async () => {
    if (!exam) return;

    setIsLoadingQuestions(true);
    try {
      const params = new URLSearchParams({
        page: questionPagination.page.toString(),
        limit: '20',
        examCategory: exam.testSeries?.title ? 'all' : 'all', // Use exam category
        unused: 'false', // Show all questions, not just unused
      });

      if (questionFilters.search) params.set('search', questionFilters.search);
      if (questionFilters.subject !== 'all') params.set('subject', questionFilters.subject);
      if (questionFilters.difficulty !== 'all') params.set('difficulty', questionFilters.difficulty);
      if (questionFilters.questionType !== 'all') params.set('questionType', questionFilters.questionType);

      const result = await apiCall(
        `/admin/question-bank?${params.toString()}`,
        'GET'
      );

      if (result.success) {
        setQuestionBank(result.data.questions);
        setQuestionPagination({
          page: result.data.pagination.page,
          totalPages: result.data.pagination.totalPages,
          total: result.data.pagination.total,
        });
      }
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [exam, questionFilters, questionPagination.page]);

  useEffect(() => {
    if (selectorOpen) {
      fetchQuestionBank();
    }
  }, [selectorOpen, fetchQuestionBank]);

  // Get current section
  const currentSection = exam?.sections.find((s) => s._id === activeSection);

  // Add questions to section
  const handleAddQuestions = async () => {
    if (!activeSection || selectedQuestions.size === 0) return;

    setIsSaving(true);
    try {
      const result = await apiCall(
        `/admin/test-series-builder/sections/${examId}/${activeSection}/questions/bulk`,
        'POST',
        { questionIds: Array.from(selectedQuestions) }
      );

      if (result.success) {
        toast.success(`Added ${selectedQuestions.size} question(s) to section`);
        setSelectorOpen(false);
        setSelectedQuestions(new Set());
        fetchExam();
      } else {
        toast.error(result.error?.message || 'Failed to add questions');
      }
    } catch {
      toast.error('Failed to add questions');
    } finally {
      setIsSaving(false);
    }
  };

  // Remove question from section
  const handleRemoveQuestion = async (questionId: string) => {
    if (!activeSection) return;

    setIsSaving(true);
    try {
      const result = await apiCall(
        `/admin/test-series-builder/sections/${examId}/${activeSection}/questions/${questionId}`,
        'DELETE'
      );

      if (result.success) {
        toast.success('Question removed from section');
        setDeleteConfirm(null);
        fetchExam();
      } else {
        toast.error(result.error?.message || 'Failed to remove question');
      }
    } catch {
      toast.error('Failed to remove question');
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder questions
  const handleReorderQuestions = async (newOrder: string[]) => {
    if (!activeSection) return;

    try {
      const result = await apiCall(
        `/admin/test-series-builder/sections/${examId}/${activeSection}/questions/reorder`,
        'PATCH',
        { questionIds: newOrder }
      );

      if (result.success) {
        fetchExam();
      } else {
        toast.error('Failed to reorder questions');
      }
    } catch {
      toast.error('Failed to reorder questions');
    }
  };

  // Drag handlers
  const handleDragStart = (questionId: string) => {
    setDraggedQuestion(questionId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedQuestion || draggedQuestion === targetId || !currentSection) return;

    const questions = currentSection.questions;
    const draggedIndex = questions.findIndex((q) => q._id === draggedQuestion);
    const targetIndex = questions.findIndex((q) => q._id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...questions];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    // Update local state immediately for smooth UX
    setExam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) =>
          s._id === activeSection ? { ...s, questions: newOrder } : s
        ),
      };
    });
  };

  const handleDragEnd = () => {
    if (currentSection && draggedQuestion) {
      const newOrder = currentSection.questions.map((q) => q._id);
      handleReorderQuestions(newOrder);
    }
    setDraggedQuestion(null);
  };

  // Toggle question selection
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Check if question is already in section
  const isQuestionInSection = (questionId: string) => {
    if (!currentSection) return false;
    return currentSection.questions.some((q) => q._id === questionId);
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return '';
    }
  };

  // Get question type badge
  const getQuestionTypeBadge = (type: string) => {
    switch (type) {
      case 'single':
        return <Badge variant="outline">Single</Badge>;
      case 'multiple':
        return <Badge variant="outline" className="border-purple-500 text-purple-600">Multiple</Badge>;
      case 'comprehension':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Comprehension</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Exam not found</p>
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
          onClick={() => router.push(`/admin/test-series-builder/${exam.testSeries._id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{exam.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
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
              (+{exam.defaultPositiveMarks} / -{exam.defaultNegativeMarks})
            </span>
          </div>
        </div>
      </div>

      {/* Sections Tabs */}
      {exam.sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No sections in this exam. Go back and add sections first.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/admin/test-series-builder/${exam.testSeries._id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exam Settings
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeSection || undefined} onValueChange={setActiveSection}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              {exam.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <TabsTrigger key={section._id} value={section._id}>
                    {section.title}
                    <Badge variant="secondary" className="ml-2">
                      {section.questions.length}
                    </Badge>
                  </TabsTrigger>
                ))}
            </TabsList>
            <Button
              onClick={() => setSelectorOpen(true)}
              disabled={!activeSection}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Questions
            </Button>
          </div>

          {exam.sections.map((section) => (
            <TabsContent key={section._id} value={section._id}>
              {section.questions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No questions in this section yet.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setSelectorOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Questions from Bank
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {section.questions.map((question, index) => (
                    <Card
                      key={question._id}
                      draggable
                      onDragStart={() => handleDragStart(question._id)}
                      onDragOver={(e) => handleDragOver(e, question._id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'transition-opacity cursor-move',
                        draggedQuestion === question._id && 'opacity-50'
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 shrink-0">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground w-6">
                              {index + 1}.
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2">
                              {getQuestionTypeBadge(question.questionType)}
                              <Badge className={getDifficultyColor(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                              {question.imageUrl && (
                                <Badge variant="outline" className="gap-1">
                                  <ImageIcon className="h-3 w-3" />
                                  Image
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground line-clamp-2">
                              {question.question}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{question.subject}</span>
                              {question.topic && (
                                <>
                                  <span>•</span>
                                  <span>{question.topic}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              setDeleteConfirm({
                                open: true,
                                questionId: question._id,
                                questionText: question.question.slice(0, 50) + '...',
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Question Selector Modal */}
      <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Questions from Bank</DialogTitle>
            <DialogDescription>
              Select questions to add to &quot;{currentSection?.title}&quot; section
            </DialogDescription>
          </DialogHeader>

          {/* Filters */}
          <div className="flex items-center gap-3 py-3 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={questionFilters.search}
                onChange={(e) =>
                  setQuestionFilters({ ...questionFilters, search: e.target.value })
                }
                className="pl-10"
              />
            </div>
            <Select
              value={questionFilters.subject}
              onValueChange={(v) => setQuestionFilters({ ...questionFilters, subject: v })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Reasoning">Reasoning</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="General Knowledge">General Knowledge</SelectItem>
                <SelectItem value="Current Affairs">Current Affairs</SelectItem>
                <SelectItem value="Computer">Computer</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={questionFilters.difficulty}
              onValueChange={(v) => setQuestionFilters({ ...questionFilters, difficulty: v })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={questionFilters.questionType}
              onValueChange={(v) => setQuestionFilters({ ...questionFilters, questionType: v })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="multiple">Multiple</SelectItem>
                <SelectItem value="comprehension">Comprehension</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question List */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            {isLoadingQuestions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : questionBank.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No questions found</p>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                {questionBank.map((question) => {
                  const inSection = isQuestionInSection(question._id);
                  const isSelected = selectedQuestions.has(question._id);

                  return (
                    <div
                      key={question._id}
                      className={cn(
                        'flex items-start gap-3 p-3 border rounded-lg transition-colors',
                        inSection && 'bg-muted/50 opacity-60',
                        isSelected && !inSection && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={inSection}
                        onCheckedChange={() => toggleQuestionSelection(question._id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getQuestionTypeBadge(question.questionType)}
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          {question.imageUrl && (
                            <Badge variant="outline" className="gap-1">
                              <ImageIcon className="h-3 w-3" />
                            </Badge>
                          )}
                          {inSection && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Already added
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">
                          {question.question}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{question.subject}</span>
                          {question.topic && (
                            <>
                              <span>•</span>
                              <span>{question.topic}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {questionPagination.total} questions found
              {selectedQuestions.size > 0 && (
                <span className="ml-2 text-emerald-600 font-medium">
                  ({selectedQuestions.size} selected)
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={questionPagination.page === 1}
                onClick={() =>
                  setQuestionPagination((p) => ({ ...p, page: p.page - 1 }))
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {questionPagination.page} of {questionPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={questionPagination.page >= questionPagination.totalPages}
                onClick={() =>
                  setQuestionPagination((p) => ({ ...p, page: p.page + 1 }))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectorOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddQuestions}
              disabled={isSaving || selectedQuestions.size === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add {selectedQuestions.size} Question{selectedQuestions.size !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteConfirm?.open || false}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this question from the section?
              <br />
              <span className="font-medium mt-2 block">
                &quot;{deleteConfirm?.questionText}&quot;
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleRemoveQuestion(deleteConfirm.questionId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
