'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Upload,
  Download,
  HelpCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Tag,
  BarChart3,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
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
  questionHi?: string;
  options: QuestionOption[];
  correctOption: string;
  explanation?: string;
  explanationHi?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject?: string;
  topic?: string;
  tags: string[];
  source?: string;
  year?: number;
  usageCount: number;
  correctCount: number;
  incorrectCount: number;
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface QuestionStats {
  total: number;
  active: number;
  byDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  totalUsage: number;
  averageAccuracy: number;
}

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-700' },
];

const SUBJECTS = ['History', 'Geography', 'Polity', 'Economy', 'Science', 'Current Affairs', 'General Knowledge'];

export default function QuestionBankPage() {
  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');

  // Dialog states
  const [questionDialog, setQuestionDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    data?: Question;
  }>({ open: false, mode: 'create' });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    question: string;
  } | null>(null);

  const [bulkImportSheet, setBulkImportSheet] = useState(false);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(search && { search }),
        ...(filterDifficulty !== 'all' && { difficulty: filterDifficulty }),
        ...(filterSubject !== 'all' && { subject: filterSubject }),
        ...(filterActive !== 'all' && { isActive: filterActive }),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/question-bank?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setQuestions(data.data.questions);
        setPagination(data.data.pagination);
      }
    } catch {
      toast.error('Failed to fetch questions');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filterDifficulty, filterSubject, filterActive]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/question-bank/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchStats();
  }, [fetchQuestions]);

  // Create question
  const createQuestion = async (formData: Partial<Question>) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/question-bank`,
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
        toast.success('Question created');
        fetchQuestions();
        fetchStats();
        setQuestionDialog({ open: false, mode: 'create' });
      } else {
        toast.error(data.error?.message || 'Failed to create question');
      }
    } catch {
      toast.error('Failed to create question');
    }
  };

  // Update question
  const updateQuestion = async (id: string, formData: Partial<Question>) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/question-bank/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('Question updated');
        fetchQuestions();
        setQuestionDialog({ open: false, mode: 'create' });
      } else {
        toast.error(data.error?.message || 'Failed to update question');
      }
    } catch {
      toast.error('Failed to update question');
    }
  };

  // Delete question
  const deleteQuestion = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/question-bank/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('Question deleted');
        fetchQuestions();
        fetchStats();
      } else {
        toast.error(data.error?.message || 'Failed to delete question');
      }
    } catch {
      toast.error('Failed to delete question');
    } finally {
      setDeleteDialog(null);
    }
  };

  // Duplicate question
  const duplicateQuestion = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/question-bank/${id}/duplicate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('Question duplicated');
        fetchQuestions();
        fetchStats();
      } else {
        toast.error(data.error?.message || 'Failed to duplicate question');
      }
    } catch {
      toast.error('Failed to duplicate question');
    }
  };

  // Download template - now returns actual file
  const downloadTemplate = async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/question-bank/template?format=${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to download template');
      }

      // Get blob from response
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `question-import-template.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded');
    } catch {
      toast.error('Failed to download template');
    }
  };

  // Export questions
  const exportQuestions = async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/question-bank/export`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            format,
            // Apply current filters to export
            ...(filterSubject !== 'all' && { subject: filterSubject }),
            ...(filterDifficulty !== 'all' && { difficulty: filterDifficulty }),
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to export questions');
      }

      const blob = await res.blob();
      const timestamp = new Date().toISOString().split('T')[0];
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions-export-${timestamp}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Questions exported successfully');
    } catch {
      toast.error('Failed to export questions');
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const config = DIFFICULTY_OPTIONS.find((d) => d.value === difficulty);
    return config ? (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    ) : null;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-emerald-600';
    if (accuracy >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Question Bank</h1>
          <p className="text-muted-foreground">Manage quiz questions across all courses</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border text-foreground">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem
                onClick={() => exportQuestions('csv')}
                className="text-foreground"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportQuestions('xlsx')}
                className="text-foreground"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={() => setBulkImportSheet(true)}
            className="border-border text-foreground"
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button onClick={() => setQuestionDialog({ open: true, mode: 'create' })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalUsage}</p>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Tag className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.averageAccuracy.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg. Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border text-foreground"
            />
          </div>
        </div>

        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-[140px] bg-card border-border text-foreground">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-foreground">All Levels</SelectItem>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-foreground">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-[160px] bg-card border-border text-foreground">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-foreground">All Subjects</SelectItem>
            {SUBJECTS.map((subject) => (
              <SelectItem key={subject} value={subject} className="text-foreground">
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="w-[120px] bg-card border-border text-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-foreground">All Status</SelectItem>
            <SelectItem value="true" className="text-foreground">Active</SelectItem>
            <SelectItem value="false" className="text-foreground">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No questions found</p>
            <p className="text-muted-foreground text-sm mt-1">
              {search || filterDifficulty !== 'all' || filterSubject !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first question to get started'}
            </p>
          </div>
        ) : (
          <>
            {questions.map((question) => (
              <Card key={question._id} className="bg-card border-border">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-foreground line-clamp-2">{question.question}</p>
                      {question.questionHi && (
                        <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
                          {question.questionHi}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {getDifficultyBadge(question.difficulty)}
                        {question.subject && (
                          <Badge variant="secondary" className="bg-muted text-foreground">
                            {question.subject}
                          </Badge>
                        )}
                        {question.year && (
                          <Badge variant="secondary" className="bg-muted text-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {question.year}
                          </Badge>
                        )}
                        {question.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-muted/50 text-muted-foreground text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {question.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{question.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Usage</p>
                        <p className="text-foreground font-medium">{question.usageCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Accuracy</p>
                        <p className={cn(
                          'font-medium',
                          getAccuracyColor(
                            question.usageCount > 0
                              ? (question.correctCount / question.usageCount) * 100
                              : 0
                          )
                        )}>
                          {question.usageCount > 0
                            ? Math.round((question.correctCount / question.usageCount) * 100)
                            : '-'}
                          %
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem
                            onClick={() => setQuestionDialog({ open: true, mode: 'edit', data: question })}
                            className="text-foreground"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => duplicateQuestion(question._id)}
                            className="text-foreground"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-muted" />
                          <DropdownMenuItem
                            onClick={() => setDeleteDialog({
                              open: true,
                              id: question._id,
                              question: question.question,
                            })}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} questions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    className="border-border text-foreground"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    className="border-border text-foreground"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Question Form Dialog */}
      <QuestionFormDialog
        open={questionDialog.open}
        mode={questionDialog.mode}
        data={questionDialog.data}
        onClose={() => setQuestionDialog({ open: false, mode: 'create' })}
        onSubmit={(data) => {
          if (questionDialog.mode === 'edit' && questionDialog.data) {
            updateQuestion(questionDialog.data._id, data);
          } else {
            createQuestion(data);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Question</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-background rounded-lg">
            <p className="text-foreground text-sm line-clamp-3">{deleteDialog?.question}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(null)}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && deleteQuestion(deleteDialog.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Sheet */}
      <Sheet open={bulkImportSheet} onOpenChange={setBulkImportSheet}>
        <SheetContent className="bg-card border-border w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle className="text-foreground">Bulk Import Questions</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Import multiple questions from CSV or Excel file
            </SheetDescription>
          </SheetHeader>
          <BulkImportForm
            onSuccess={() => {
              setBulkImportSheet(false);
              fetchQuestions();
              fetchStats();
            }}
            onDownloadTemplate={(format) => downloadTemplate(format)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Question Form Dialog Component
function QuestionFormDialog({
  open,
  mode,
  data,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  data?: Question;
  onClose: () => void;
  onSubmit: (data: Partial<Question>) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'en' | 'hi'>('en');
  const [formData, setFormData] = useState({
    question: '',
    questionHi: '',
    options: [
      { id: 'a', text: '', textHi: '' },
      { id: 'b', text: '', textHi: '' },
      { id: 'c', text: '', textHi: '' },
      { id: 'd', text: '', textHi: '' },
    ],
    correctOption: 'a',
    explanation: '',
    explanationHi: '',
    difficulty: 'medium' as Question['difficulty'],
    subject: '',
    topic: '',
    tags: [] as string[],
    source: '',
    year: undefined as number | undefined,
    isActive: true,
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (data) {
      setFormData({
        question: data.question || '',
        questionHi: data.questionHi || '',
        options: data.options.length === 4 ? data.options.map(o => ({
          id: o.id,
          text: o.text,
          textHi: o.textHi || '',
        })) : [
          { id: 'a', text: '', textHi: '' },
          { id: 'b', text: '', textHi: '' },
          { id: 'c', text: '', textHi: '' },
          { id: 'd', text: '', textHi: '' },
        ],
        correctOption: data.correctOption || 'a',
        explanation: data.explanation || '',
        explanationHi: data.explanationHi || '',
        difficulty: data.difficulty || 'medium',
        subject: data.subject || '',
        topic: data.topic || '',
        tags: data.tags || [],
        source: data.source || '',
        year: data.year,
        isActive: data.isActive ?? true,
      });
    } else {
      setFormData({
        question: '',
        questionHi: '',
        options: [
          { id: 'a', text: '', textHi: '' },
          { id: 'b', text: '', textHi: '' },
          { id: 'c', text: '', textHi: '' },
          { id: 'd', text: '', textHi: '' },
        ],
        correctOption: 'a',
        explanation: '',
        explanationHi: '',
        difficulty: 'medium',
        subject: '',
        topic: '',
        tags: [],
        source: '',
        year: undefined,
        isActive: true,
      });
    }
    setActiveTab('en');
  }, [data, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const updateOption = (index: number, field: 'text' | 'textHi', value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {mode === 'create' ? 'Create Question' : 'Edit Question'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'en' | 'hi')}>
            <TabsList className="bg-muted">
              <TabsTrigger value="en" className="data-[state=active]:bg-accent">
                English
              </TabsTrigger>
              <TabsTrigger value="hi" className="data-[state=active]:bg-accent">
                Hindi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="en" className="space-y-4 mt-4">
              {/* Question */}
              <div className="space-y-2">
                <Label className="text-foreground">Question *</Label>
                <Textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question..."
                  className="bg-background border-border text-foreground min-h-[80px]"
                  required
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <Label className="text-foreground">Options *</Label>
                {formData.options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <div
                      onClick={() => setFormData({ ...formData, correctOption: option.id })}
                      className={cn(
                        'w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm font-medium transition-colors',
                        formData.correctOption === option.id
                          ? 'bg-emerald-500 text-foreground'
                          : 'bg-muted text-foreground hover:bg-accent'
                      )}
                    >
                      {option.id.toUpperCase()}
                    </div>
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder={`Option ${option.id.toUpperCase()}`}
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
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="hi" className="space-y-4 mt-4">
              {/* Question Hindi */}
              <div className="space-y-2">
                <Label className="text-foreground">Question (Hindi)</Label>
                <Textarea
                  value={formData.questionHi}
                  onChange={(e) => setFormData({ ...formData, questionHi: e.target.value })}
                  placeholder="प्रश्न दर्ज करें..."
                  className="bg-background border-border text-foreground min-h-[80px]"
                />
              </div>

              {/* Options Hindi */}
              <div className="space-y-3">
                <Label className="text-foreground">Options (Hindi)</Label>
                {formData.options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium',
                        formData.correctOption === option.id
                          ? 'bg-emerald-500 text-foreground'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      {option.id.toUpperCase()}
                    </div>
                    <Input
                      value={option.textHi || ''}
                      onChange={(e) => updateOption(index, 'textHi', e.target.value)}
                      placeholder={`विकल्प ${option.id.toUpperCase()}`}
                      className="bg-background border-border text-foreground flex-1"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation Hindi */}
              <div className="space-y-2">
                <Label className="text-foreground">Explanation (Hindi)</Label>
                <Textarea
                  value={formData.explanationHi}
                  onChange={(e) => setFormData({ ...formData, explanationHi: e.target.value })}
                  placeholder="सही उत्तर का विवरण..."
                  className="bg-background border-border text-foreground"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Difficulty *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: Question['difficulty']) =>
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
              <Select
                value={formData.subject || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, subject: value === 'none' ? '' : value })
                }
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="none" className="text-foreground">None</SelectItem>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject} className="text-foreground">
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Topic</Label>
              <Input
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Indian History"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Source</Label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., UPSC 2023"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Year</Label>
              <Input
                type="number"
                value={formData.year || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="e.g., 2023"
                className="bg-background border-border text-foreground"
                min={2000}
                max={2100}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Status</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-foreground">Tags</Label>
            <div className="flex items-center gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="bg-background border-border text-foreground"
              />
              <Button type="button" onClick={addTag} variant="secondary" size="sm">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-muted text-foreground"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Question' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Bulk Import Form Component
function BulkImportForm({
  onSuccess,
  onDownloadTemplate,
}: {
  onSuccess: () => void;
  onDownloadTemplate: (format: 'csv' | 'xlsx') => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/question-bank/bulk-import`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();

      if (data.success) {
        setResult(data.data);
        if (data.data.success > 0) {
          toast.success(`${data.data.success} questions imported successfully`);
          onSuccess();
        }
      } else {
        toast.error(data.error?.message || 'Failed to import questions');
      }
    } catch {
      toast.error('Failed to import questions');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext === 'xlsx' || ext === 'xls') {
      return <FileText className="h-8 w-8 text-emerald-600" />;
    }
    return <FileText className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Instructions */}
      <div className="space-y-2">
        <h4 className="font-medium text-foreground">Instructions</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Download the template (CSV or Excel format)</li>
          <li>Fill in your questions following the format</li>
          <li>Upload the completed file</li>
          <li>Review any errors and fix them</li>
        </ul>
      </div>

      {/* Download Template Options */}
      <div className="space-y-2">
        <Label className="text-foreground">Download Template</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onDownloadTemplate('csv')}
            className="flex-1 border-border text-foreground"
          >
            <Download className="mr-2 h-4 w-4" />
            CSV Template
          </Button>
          <Button
            variant="outline"
            onClick={() => onDownloadTemplate('xlsx')}
            className="flex-1 border-border text-foreground"
          >
            <Download className="mr-2 h-4 w-4" />
            Excel Template
          </Button>
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label className="text-foreground">Upload File</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center relative">
          {file ? (
            <div className="flex items-center justify-center gap-3">
              {getFileIcon()}
              <div className="text-left">
                <p className="text-foreground font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                Click to upload or drag and drop
              </p>
              <p className="text-muted-foreground text-xs mt-1">CSV or Excel files (.csv, .xlsx, .xls)</p>
            </>
          )}
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className={cn(
              'absolute inset-0 opacity-0 cursor-pointer',
              file && 'hidden'
            )}
          />
        </div>
      </div>

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Import Questions
          </>
        )}
      </Button>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>{result.success} imported</span>
            </div>
            {result.failed > 0 && (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span>{result.failed} failed</span>
              </div>
            )}
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-100 border border-red-500/20 rounded-lg p-3">
              <p className="text-destructive text-sm font-medium mb-2">Errors:</p>
              <ul className="text-sm text-destructive space-y-1">
                {result.errors.slice(0, 5).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
                {result.errors.length > 5 && (
                  <li className="text-destructive">
                    ... and {result.errors.length - 5} more errors
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
