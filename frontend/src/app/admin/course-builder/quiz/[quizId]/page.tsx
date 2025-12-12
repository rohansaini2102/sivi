'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  Search,
  HelpCircle,
  Trash2,
  GripVertical,
  Settings,
  Clock,
  Target,
  Award,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  questionHindi?: string;
  options: { a: string; b: string; c: string; d: string };
  optionsHindi?: { a: string; b: string; c: string; d: string };
  correctAnswer: string;
  explanation?: string;
  explanationHindi?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject?: string;
  topic?: string;
  tags?: string[];
}

interface Quiz {
  _id: string;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  mode: 'practice' | 'exam';
  questions: Question[];
  totalQuestions: number;
  duration: number;
  passingPercentage: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showExplanationAfterEach: boolean;
  allowRetake: boolean;
  maxAttempts: number;
  showAnswersAtEnd: boolean;
  correctMarks: number;
  wrongMarks: number;
  unattemptedMarks: number;
  isPublished: boolean;
}

interface QuestionBankQuestion {
  _id: string;
  question: string;
  questionHi?: string;
  options: QuestionOption[];
  correctOption: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject?: string;
  topic?: string;
  tags: string[];
}

const API = process.env.NEXT_PUBLIC_API_URL;

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-700' },
];

export default function QuizEditorPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  // State
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');

  // Question bank state
  const [questionBankSheet, setQuestionBankSheet] = useState(false);
  const [questionBankQuestions, setQuestionBankQuestions] = useState<QuestionBankQuestion[]>([]);
  const [questionBankSearch, setQuestionBankSearch] = useState('');
  const [questionBankLoading, setQuestionBankLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  // Create question dialog
  const [createQuestionDialog, setCreateQuestionDialog] = useState(false);

  // Expanded questions
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // Fetch quiz
  const fetchQuiz = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API}/admin/course-builder/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setQuiz(data.data);
      } else {
        toast.error('Failed to load quiz');
        router.push('/admin/course-builder');
      }
    } catch {
      toast.error('Failed to load quiz');
      router.push('/admin/course-builder');
    } finally {
      setIsLoading(false);
    }
  }, [quizId, router]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  // Save quiz settings
  const saveQuiz = async () => {
    if (!quiz) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API}/admin/course-builder/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: quiz.title,
          titleHi: quiz.titleHi,
          description: quiz.description,
          descriptionHi: quiz.descriptionHi,
          mode: quiz.mode,
          duration: quiz.duration,
          passingPercentage: quiz.passingPercentage,
          shuffleQuestions: quiz.shuffleQuestions,
          shuffleOptions: quiz.shuffleOptions,
          showExplanationAfterEach: quiz.showExplanationAfterEach,
          allowRetake: quiz.allowRetake,
          maxAttempts: quiz.maxAttempts,
          showAnswersAtEnd: quiz.showAnswersAtEnd,
          correctMarks: quiz.correctMarks,
          wrongMarks: quiz.wrongMarks,
          unattemptedMarks: quiz.unattemptedMarks,
          isPublished: quiz.isPublished,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Quiz saved successfully');
      } else {
        toast.error(data.error?.message || 'Failed to save quiz');
      }
    } catch {
      toast.error('Failed to save quiz');
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch question bank
  const fetchQuestionBank = async (search?: string) => {
    setQuestionBankLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        limit: '50',
        ...(search && { search }),
      });

      const res = await fetch(`${API}/admin/question-bank?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setQuestionBankQuestions(data.data.questions);
      }
    } catch {
      toast.error('Failed to load question bank');
    } finally {
      setQuestionBankLoading(false);
    }
  };

  // Add questions from bank
  const addQuestionsFromBank = async () => {
    if (selectedQuestions.size === 0) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API}/admin/course-builder/quizzes/${quizId}/questions/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionIds: Array.from(selectedQuestions) }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`${data.data?.addedCount || selectedQuestions.size} questions added`);
        setQuestionBankSheet(false);
        setSelectedQuestions(new Set());
        fetchQuiz();
      } else {
        toast.error(data.error?.message || 'Failed to add questions');
      }
    } catch {
      toast.error('Failed to add questions');
    }
  };

  // Remove question from quiz
  const removeQuestion = async (questionId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${API}/admin/course-builder/quizzes/${quizId}/questions/${questionId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('Question removed');
        fetchQuiz();
      } else {
        toast.error(data.error?.message || 'Failed to remove question');
      }
    } catch {
      toast.error('Failed to remove question');
    }
  };

  // Toggle question expansion
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    const config = DIFFICULTY_OPTIONS.find((d) => d.value === difficulty);
    return config ? (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    ) : null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={quiz.mode === 'practice' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}
              >
                {quiz.mode} mode
              </Badge>
              <span className="text-muted-foreground">
                {quiz.totalQuestions} questions
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <Switch
              checked={quiz.isPublished}
              onCheckedChange={(checked) => setQuiz({ ...quiz, isPublished: checked })}
            />
            <span className="text-sm text-muted-foreground">
              {quiz.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
          <Button onClick={saveQuiz} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'questions' | 'settings')}>
        <TabsList className="bg-muted">
          <TabsTrigger value="questions" className="data-[state=active]:bg-background">
            <HelpCircle className="mr-2 h-4 w-4" />
            Questions ({quiz.totalQuestions})
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-background">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4 mt-4">
          {/* Add Questions Button */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Manage questions for this quiz
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCreateQuestionDialog(true)}
                className="border-border text-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
              <Button
                onClick={() => {
                  setQuestionBankSheet(true);
                  fetchQuestionBank();
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add from Bank
              </Button>
            </div>
          </div>

          {/* Questions List */}
          {quiz.questions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No questions yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Add questions from the question bank or create new ones
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quiz.questions.map((question, index) => (
                <Card key={question._id} className="bg-card border-border">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 pt-1">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                        <span className="text-muted-foreground font-medium w-6">
                          {index + 1}.
                        </span>
                      </div>
                      <div className="flex-1">
                        <div
                          className="flex items-start justify-between cursor-pointer"
                          onClick={() => toggleQuestion(question._id)}
                        >
                          <div className="flex-1">
                            <p className="text-foreground">{question.question}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {getDifficultyBadge(question.difficulty)}
                              {question.subject && (
                                <Badge variant="secondary" className="bg-muted text-foreground">
                                  {question.subject}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeQuestion(question._id);
                              }}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {expandedQuestions.has(question._id) ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedQuestions.has(question._id) && (
                          <div className="mt-4 pt-4 border-t border-border space-y-3">
                            {/* Options */}
                            <div className="grid grid-cols-2 gap-2">
                              {['a', 'b', 'c', 'd'].map((opt) => (
                                <div
                                  key={opt}
                                  className={cn(
                                    'p-2 rounded-lg text-sm',
                                    question.correctAnswer === opt
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                      : 'bg-muted text-foreground'
                                  )}
                                >
                                  <span className="font-medium mr-2">{opt.toUpperCase()}.</span>
                                  {question.options[opt as keyof typeof question.options]}
                                  {question.correctAnswer === opt && (
                                    <Check className="inline-block ml-2 h-4 w-4" />
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Explanation */}
                            {question.explanation && (
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-700 mb-1">Explanation:</p>
                                <p className="text-sm text-blue-600">{question.explanation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 mt-4">
          {/* Basic Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Title (English)</Label>
                  <Input
                    value={quiz.title}
                    onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Title (Hindi)</Label>
                  <Input
                    value={quiz.titleHi || ''}
                    onChange={(e) => setQuiz({ ...quiz, titleHi: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Description (English)</Label>
                  <Textarea
                    value={quiz.description || ''}
                    onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                    className="bg-background border-border text-foreground"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Description (Hindi)</Label>
                  <Textarea
                    value={quiz.descriptionHi || ''}
                    onChange={(e) => setQuiz({ ...quiz, descriptionHi: e.target.value })}
                    className="bg-background border-border text-foreground"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time & Scoring */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time & Scoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={quiz.duration}
                    onChange={(e) => setQuiz({ ...quiz, duration: parseInt(e.target.value) || 0 })}
                    className="bg-background border-border text-foreground"
                    min={0}
                  />
                  <p className="text-xs text-muted-foreground">0 = no time limit</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Passing %</Label>
                  <Input
                    type="number"
                    value={quiz.passingPercentage}
                    onChange={(e) => setQuiz({ ...quiz, passingPercentage: parseInt(e.target.value) || 0 })}
                    className="bg-background border-border text-foreground"
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Correct Marks</Label>
                  <Input
                    type="number"
                    value={quiz.correctMarks}
                    onChange={(e) => setQuiz({ ...quiz, correctMarks: parseFloat(e.target.value) || 0 })}
                    className="bg-background border-border text-foreground"
                    step={0.25}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Wrong Marks</Label>
                  <Input
                    type="number"
                    value={quiz.wrongMarks}
                    onChange={(e) => setQuiz({ ...quiz, wrongMarks: parseFloat(e.target.value) || 0 })}
                    className="bg-background border-border text-foreground"
                    step={0.25}
                  />
                  <p className="text-xs text-muted-foreground">Use negative for penalty</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Options */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div>
                    <p className="text-foreground font-medium">Shuffle Questions</p>
                    <p className="text-sm text-muted-foreground">Randomize question order</p>
                  </div>
                  <Switch
                    checked={quiz.shuffleQuestions}
                    onCheckedChange={(checked) => setQuiz({ ...quiz, shuffleQuestions: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div>
                    <p className="text-foreground font-medium">Shuffle Options</p>
                    <p className="text-sm text-muted-foreground">Randomize option order</p>
                  </div>
                  <Switch
                    checked={quiz.shuffleOptions}
                    onCheckedChange={(checked) => setQuiz({ ...quiz, shuffleOptions: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div>
                    <p className="text-foreground font-medium">Allow Retake</p>
                    <p className="text-sm text-muted-foreground">Students can retry</p>
                  </div>
                  <Switch
                    checked={quiz.allowRetake}
                    onCheckedChange={(checked) => setQuiz({ ...quiz, allowRetake: checked })}
                  />
                </div>
                {quiz.mode === 'practice' && (
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="text-foreground font-medium">Show Explanation</p>
                      <p className="text-sm text-muted-foreground">After each answer</p>
                    </div>
                    <Switch
                      checked={quiz.showExplanationAfterEach}
                      onCheckedChange={(checked) => setQuiz({ ...quiz, showExplanationAfterEach: checked })}
                    />
                  </div>
                )}
                {quiz.mode === 'exam' && (
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="text-foreground font-medium">Show Answers</p>
                      <p className="text-sm text-muted-foreground">At end of exam</p>
                    </div>
                    <Switch
                      checked={quiz.showAnswersAtEnd}
                      onCheckedChange={(checked) => setQuiz({ ...quiz, showAnswersAtEnd: checked })}
                    />
                  </div>
                )}
              </div>
              {quiz.allowRetake && (
                <div className="space-y-2">
                  <Label className="text-foreground">Max Attempts (0 = unlimited)</Label>
                  <Input
                    type="number"
                    value={quiz.maxAttempts}
                    onChange={(e) => setQuiz({ ...quiz, maxAttempts: parseInt(e.target.value) || 0 })}
                    className="bg-background border-border text-foreground w-[200px]"
                    min={0}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Question Bank Sheet */}
      <Sheet open={questionBankSheet} onOpenChange={setQuestionBankSheet}>
        <SheetContent className="bg-card border-border w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle className="text-foreground">Add from Question Bank</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Select questions to add to this quiz
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={questionBankSearch}
                onChange={(e) => {
                  setQuestionBankSearch(e.target.value);
                  fetchQuestionBank(e.target.value);
                }}
                className="pl-9 bg-background border-border text-foreground"
              />
            </div>

            {/* Selected count */}
            {selectedQuestions.size > 0 && (
              <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
                <span className="text-sm text-primary">
                  {selectedQuestions.size} questions selected
                </span>
                <Button size="sm" onClick={addQuestionsFromBank}>
                  Add Selected
                </Button>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {questionBankLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : questionBankQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No questions found</p>
                </div>
              ) : (
                questionBankQuestions.map((q) => {
                  const isInQuiz = quiz.questions.some((qq) => qq._id === q._id);
                  const isSelected = selectedQuestions.has(q._id);

                  return (
                    <div
                      key={q._id}
                      className={cn(
                        'p-3 border rounded-lg cursor-pointer transition-colors',
                        isInQuiz
                          ? 'bg-muted/50 border-border opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'bg-background border-border hover:border-primary/50'
                      )}
                      onClick={() => {
                        if (isInQuiz) return;
                        setSelectedQuestions((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(q._id)) {
                            newSet.delete(q._id);
                          } else {
                            newSet.add(q._id);
                          }
                          return newSet;
                        });
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-5 h-5 rounded border flex items-center justify-center mt-0.5',
                            isSelected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border'
                          )}
                        >
                          {(isSelected || isInQuiz) && <Check className="h-3 w-3" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground text-sm line-clamp-2">{q.question}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {getDifficultyBadge(q.difficulty)}
                            {q.subject && (
                              <Badge variant="secondary" className="bg-muted text-foreground text-xs">
                                {q.subject}
                              </Badge>
                            )}
                            {isInQuiz && (
                              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                                Already in quiz
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Question Dialog */}
      <CreateQuestionDialog
        open={createQuestionDialog}
        onClose={() => setCreateQuestionDialog(false)}
        quizId={quizId}
        onSuccess={() => {
          setCreateQuestionDialog(false);
          fetchQuiz();
        }}
      />
    </div>
  );
}

// Create Question Dialog Component
function CreateQuestionDialog({
  open,
  onClose,
  quizId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  quizId: string;
  onSuccess: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    questionHindi: '',
    options: { a: '', b: '', c: '', d: '' },
    optionsHindi: { a: '', b: '', c: '', d: '' },
    correctAnswer: 'a',
    explanation: '',
    explanationHindi: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    subject: '',
    topic: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${API}/admin/course-builder/quizzes/${quizId}/questions/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('Question created and added');
        onSuccess();
        // Reset form
        setFormData({
          question: '',
          questionHindi: '',
          options: { a: '', b: '', c: '', d: '' },
          optionsHindi: { a: '', b: '', c: '', d: '' },
          correctAnswer: 'a',
          explanation: '',
          explanationHindi: '',
          difficulty: 'medium',
          subject: '',
          topic: '',
        });
      } else {
        toast.error(data.error?.message || 'Failed to create question');
      }
    } catch {
      toast.error('Failed to create question');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Question</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new question directly for this quiz
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question */}
          <div className="space-y-2">
            <Label className="text-foreground">Question (English) *</Label>
            <Textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter the question..."
              className="bg-background border-border text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Question (Hindi)</Label>
            <Textarea
              value={formData.questionHindi}
              onChange={(e) => setFormData({ ...formData, questionHindi: e.target.value })}
              placeholder="प्रश्न दर्ज करें..."
              className="bg-background border-border text-foreground"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-foreground">Options *</Label>
            {['a', 'b', 'c', 'd'].map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <div
                  onClick={() => setFormData({ ...formData, correctAnswer: opt })}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm font-medium transition-colors',
                    formData.correctAnswer === opt
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-foreground hover:bg-accent'
                  )}
                >
                  {opt.toUpperCase()}
                </div>
                <Input
                  value={formData.options[opt as keyof typeof formData.options]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      options: { ...formData.options, [opt]: e.target.value },
                    })
                  }
                  placeholder={`Option ${opt.toUpperCase()}`}
                  className="bg-background border-border text-foreground flex-1"
                  required
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Click on the letter to mark the correct answer</p>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label className="text-foreground">Explanation</Label>
            <Textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explain the correct answer..."
              className="bg-background border-border text-foreground"
              rows={2}
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-foreground">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Subject</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., History"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Topic</Label>
              <Input
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Ancient India"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Question
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
