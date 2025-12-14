'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Plus,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  MoreVertical,
  FileText,
  HelpCircle,
  ClipboardList,
  Settings,
  Eye,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
interface ExamSection {
  _id: string;
  title: string;
  titleHi?: string;
  order: number;
  questions: string[];
  instructions?: string;
  instructionsHi?: string;
}

interface Exam {
  _id: string;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  order: number;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  defaultPositiveMarks: number;
  defaultNegativeMarks: number;
  passingPercentage: number;
  multipleCorrectAlgorithm: 'partial' | 'all_or_none' | 'proportional';
  allowSectionNavigation: boolean;
  showSectionWiseResult: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  isFree: boolean;
  isPublished: boolean;
  sections: ExamSection[];
}

interface TestSeries {
  _id: string;
  title: string;
  slug: string;
  examCategory: string;
  language: string;
  isPublished: boolean;
}

interface TestSeriesStructure {
  testSeries: TestSeries;
  exams: Exam[];
}

export default function TestSeriesBuilderEditorPage() {
  const router = useRouter();
  const params = useParams();
  const testSeriesId = params.testSeriesId as string;

  // State
  const [structure, setStructure] = useState<TestSeriesStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedExams, setExpandedExams] = useState<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  // Selected item for editing
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedSection, setSelectedSection] = useState<{
    examId: string;
    section: ExamSection;
  } | null>(null);

  // Dialog states
  const [examDialog, setExamDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    data?: Partial<Exam>;
  }>({ open: false, mode: 'create' });

  const [sectionDialog, setSectionDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    examId?: string;
    data?: Partial<ExamSection>;
  }>({ open: false, mode: 'create' });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'exam' | 'section';
    id: string;
    examId?: string;
    title: string;
  } | null>(null);

  // Fetch test series structure
  const fetchStructure = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/test-series-builder/series/${testSeriesId}/structure`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setStructure(data.data);
        if (isInitialLoad.current && data.data.exams.length > 0) {
          setExpandedExams(new Set([data.data.exams[0]._id]));
          isInitialLoad.current = false;
        }
      } else {
        toast.error('Failed to load test series structure');
        router.push('/admin/test-series-builder');
      }
    } catch {
      toast.error('Failed to load test series structure');
      router.push('/admin/test-series-builder');
    } finally {
      setIsLoading(false);
    }
  }, [testSeriesId, router]);

  useEffect(() => {
    fetchStructure();
  }, [fetchStructure]);

  // Toggle expand/collapse
  const toggleExam = (examId: string) => {
    setExpandedExams((prev) => {
      const next = new Set(prev);
      if (next.has(examId)) {
        next.delete(examId);
      } else {
        next.add(examId);
      }
      return next;
    });
  };

  // API helpers
  const apiCall = async (url: string, method: string, body?: any) => {
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

  // Create Exam
  const handleCreateExam = async (formData: Partial<Exam>) => {
    setIsSaving(true);
    try {
      const result = await apiCall(
        `/admin/test-series-builder/series/${testSeriesId}/exams`,
        'POST',
        formData
      );

      if (result.success) {
        toast.success('Exam created successfully');
        setExamDialog({ open: false, mode: 'create' });
        fetchStructure();
      } else {
        toast.error(result.error?.message || 'Failed to create exam');
      }
    } catch {
      toast.error('Failed to create exam');
    } finally {
      setIsSaving(false);
    }
  };

  // Update Exam
  const handleUpdateExam = async (examId: string, formData: Partial<Exam>) => {
    setIsSaving(true);
    try {
      const result = await apiCall(
        `/admin/test-series-builder/exams/${examId}`,
        'PUT',
        formData
      );

      if (result.success) {
        toast.success('Exam updated successfully');
        setExamDialog({ open: false, mode: 'create' });
        fetchStructure();
      } else {
        toast.error(result.error?.message || 'Failed to update exam');
      }
    } catch {
      toast.error('Failed to update exam');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Exam
  const handleDeleteExam = async (examId: string) => {
    setIsSaving(true);
    try {
      const result = await apiCall(
        `/admin/test-series-builder/exams/${examId}`,
        'DELETE'
      );

      if (result.success) {
        toast.success('Exam deleted successfully');
        setDeleteDialog(null);
        fetchStructure();
      } else {
        toast.error(result.error?.message || 'Failed to delete exam');
      }
    } catch {
      toast.error('Failed to delete exam');
    } finally {
      setIsSaving(false);
    }
  };

  // Create Section
  const handleCreateSection = async (examId: string, formData: Partial<ExamSection>) => {
    setIsSaving(true);
    try {
      const result = await apiCall(
        `/admin/test-series-builder/exams/${examId}/sections`,
        'POST',
        formData
      );

      if (result.success) {
        toast.success('Section created successfully');
        setSectionDialog({ open: false, mode: 'create' });
        fetchStructure();
      } else {
        toast.error(result.error?.message || 'Failed to create section');
      }
    } catch {
      toast.error('Failed to create section');
    } finally {
      setIsSaving(false);
    }
  };

  // Update Section
  const handleUpdateSection = async (
    examId: string,
    sectionId: string,
    formData: Partial<ExamSection>
  ) => {
    setIsSaving(true);
    try {
      const result = await apiCall(
        `/admin/test-series-builder/sections/${examId}/${sectionId}`,
        'PUT',
        formData
      );

      if (result.success) {
        toast.success('Section updated successfully');
        setSectionDialog({ open: false, mode: 'create' });
        fetchStructure();
      } else {
        toast.error(result.error?.message || 'Failed to update section');
      }
    } catch {
      toast.error('Failed to update section');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Section
  const handleDeleteSection = async (examId: string, sectionId: string) => {
    setIsSaving(true);
    try {
      const result = await apiCall(
        `/admin/test-series-builder/sections/${examId}/${sectionId}`,
        'DELETE'
      );

      if (result.success) {
        toast.success('Section deleted successfully');
        setDeleteDialog(null);
        fetchStructure();
      } else {
        toast.error(result.error?.message || 'Failed to delete section');
      }
    } catch {
      toast.error('Failed to delete section');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Exam Publish
  const handleTogglePublish = async (examId: string) => {
    try {
      const result = await apiCall(
        `/admin/test-series-builder/exams/${examId}/publish`,
        'PATCH'
      );

      if (result.success) {
        toast.success('Exam status updated');
        fetchStructure();
      } else {
        toast.error(result.error?.message || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!structure) {
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
          onClick={() => router.push('/admin/test-series-builder')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {structure.testSeries.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{structure.testSeries.examCategory}</Badge>
            <Badge
              variant={structure.testSeries.isPublished ? 'default' : 'secondary'}
              className={structure.testSeries.isPublished ? 'bg-emerald-600' : ''}
            >
              {structure.testSeries.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>
        <Button
          onClick={() => setExamDialog({ open: true, mode: 'create' })}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Exam
        </Button>
      </div>

      {/* Exams List */}
      <div className="space-y-3">
        {structure.exams.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No exams yet. Click &quot;Add Exam&quot; to create your first exam.
              </p>
            </CardContent>
          </Card>
        ) : (
          structure.exams.map((exam) => (
            <Card key={exam._id} className="overflow-hidden">
              {/* Exam Header */}
              <div
                className={cn(
                  'flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                  expandedExams.has(exam._id) && 'border-b'
                )}
                onClick={() => toggleExam(exam._id)}
              >
                <Button variant="ghost" size="icon-sm" className="shrink-0">
                  {expandedExams.has(exam._id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{exam.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{exam.duration} mins</span>
                    <span>{exam.totalQuestions} questions</span>
                    <span>{exam.totalMarks} marks</span>
                    <span>{exam.sections?.length || 0} sections</span>
                  </div>
                </div>
                <Badge
                  variant={exam.isPublished ? 'default' : 'secondary'}
                  className={exam.isPublished ? 'bg-emerald-600' : ''}
                >
                  {exam.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/test-series-builder/exam/${exam._id}`);
                      }}
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Manage Questions
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setExamDialog({ open: true, mode: 'edit', data: exam });
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePublish(exam._id);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {exam.isPublished ? 'Unpublish' : 'Publish'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialog({
                          open: true,
                          type: 'exam',
                          id: exam._id,
                          title: exam.title,
                        });
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Exam
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Sections (Expanded) */}
              {expandedExams.has(exam._id) && (
                <div className="p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-foreground">Sections</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSectionDialog({
                          open: true,
                          mode: 'create',
                          examId: exam._id,
                        })
                      }
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Section
                    </Button>
                  </div>

                  {exam.sections?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No sections yet. Add sections to organize questions.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {exam.sections
                        ?.sort((a, b) => a.order - b.order)
                        .map((section) => (
                          <div
                            key={section._id}
                            className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {section.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {section.questions?.length || 0} questions
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/admin/test-series-builder/exam/${exam._id}?section=${section._id}`
                                )
                              }
                            >
                              <HelpCircle className="h-4 w-4 mr-1" />
                              Questions
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    setSectionDialog({
                                      open: true,
                                      mode: 'edit',
                                      examId: exam._id,
                                      data: section,
                                    })
                                  }
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Section
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      type: 'section',
                                      id: section._id,
                                      examId: exam._id,
                                      title: section.title,
                                    })
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Section
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Exam Dialog */}
      <ExamDialog
        open={examDialog.open}
        mode={examDialog.mode}
        data={examDialog.data}
        isSaving={isSaving}
        onClose={() => setExamDialog({ open: false, mode: 'create' })}
        onSave={(data) => {
          if (examDialog.mode === 'create') {
            handleCreateExam(data);
          } else if (examDialog.data?._id) {
            handleUpdateExam(examDialog.data._id, data);
          }
        }}
      />

      {/* Section Dialog */}
      <SectionDialog
        open={sectionDialog.open}
        mode={sectionDialog.mode}
        data={sectionDialog.data}
        isSaving={isSaving}
        onClose={() => setSectionDialog({ open: false, mode: 'create' })}
        onSave={(data) => {
          if (sectionDialog.mode === 'create' && sectionDialog.examId) {
            handleCreateSection(sectionDialog.examId, data);
          } else if (sectionDialog.data?._id && sectionDialog.examId) {
            handleUpdateSection(sectionDialog.examId, sectionDialog.data._id, data);
          }
        }}
      />

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog?.open || false}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteDialog?.type}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteDialog?.title}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isSaving}
              onClick={() => {
                if (deleteDialog?.type === 'exam') {
                  handleDeleteExam(deleteDialog.id);
                } else if (deleteDialog?.type === 'section' && deleteDialog.examId) {
                  handleDeleteSection(deleteDialog.examId, deleteDialog.id);
                }
              }}
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Exam Dialog Component
function ExamDialog({
  open,
  mode,
  data,
  isSaving,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  data?: Partial<Exam>;
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: Partial<Exam>) => void;
}) {
  const [formData, setFormData] = useState<Partial<Exam>>({
    title: '',
    titleHi: '',
    description: '',
    duration: 120,
    defaultPositiveMarks: 4,
    defaultNegativeMarks: 1,
    passingPercentage: 40,
    multipleCorrectAlgorithm: 'all_or_none',
    allowSectionNavigation: true,
    showSectionWiseResult: true,
    shuffleQuestions: false,
    shuffleOptions: false,
    isFree: false,
    isPublished: false,
  });

  useEffect(() => {
    if (data && mode === 'edit') {
      setFormData(data);
    } else {
      setFormData({
        title: '',
        titleHi: '',
        description: '',
        duration: 120,
        defaultPositiveMarks: 4,
        defaultNegativeMarks: 1,
        passingPercentage: 40,
        multipleCorrectAlgorithm: 'all_or_none',
        allowSectionNavigation: true,
        showSectionWiseResult: true,
        shuffleQuestions: false,
        shuffleOptions: false,
        isFree: false,
        isPublished: false,
      });
    }
  }, [data, mode, open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Exam' : 'Edit Exam'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new exam to this test series'
              : 'Update exam settings'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title (English) *</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter exam title"
              />
            </div>
            <div className="space-y-2">
              <Label>Title (Hindi)</Label>
              <Input
                value={formData.titleHi || ''}
                onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                placeholder="Enter Hindi title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter exam description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Duration (minutes) *</Label>
              <Input
                type="number"
                value={formData.duration || 120}
                onChange={(e) =>
                  setFormData({ ...formData, duration: Number(e.target.value) })
                }
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Positive Marks *</Label>
              <Input
                type="number"
                value={formData.defaultPositiveMarks || 4}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultPositiveMarks: Number(e.target.value),
                  })
                }
                min={0}
                step={0.5}
              />
            </div>
            <div className="space-y-2">
              <Label>Negative Marks *</Label>
              <Input
                type="number"
                value={formData.defaultNegativeMarks || 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultNegativeMarks: Number(e.target.value),
                  })
                }
                min={0}
                step={0.25}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Passing Percentage</Label>
              <Input
                type="number"
                value={formData.passingPercentage || 40}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    passingPercentage: Number(e.target.value),
                  })
                }
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Multiple Correct Algorithm</Label>
              <Select
                value={formData.multipleCorrectAlgorithm || 'all_or_none'}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    multipleCorrectAlgorithm: v as Exam['multipleCorrectAlgorithm'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_or_none">All or None</SelectItem>
                  <SelectItem value="partial">Partial Credit</SelectItem>
                  <SelectItem value="proportional">Proportional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Section Navigation</p>
                <p className="text-xs text-muted-foreground">
                  Allow jumping between sections
                </p>
              </div>
              <Switch
                checked={formData.allowSectionNavigation}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, allowSectionNavigation: v })
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Section-wise Results</p>
                <p className="text-xs text-muted-foreground">Show section breakdown</p>
              </div>
              <Switch
                checked={formData.showSectionWiseResult}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, showSectionWiseResult: v })
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Shuffle Questions</p>
                <p className="text-xs text-muted-foreground">Randomize question order</p>
              </div>
              <Switch
                checked={formData.shuffleQuestions}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, shuffleQuestions: v })
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Shuffle Options</p>
                <p className="text-xs text-muted-foreground">Randomize option order</p>
              </div>
              <Switch
                checked={formData.shuffleOptions}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, shuffleOptions: v })
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Free Exam</p>
                <p className="text-xs text-muted-foreground">
                  Available without enrollment
                </p>
              </div>
              <Switch
                checked={formData.isFree}
                onCheckedChange={(v) => setFormData({ ...formData, isFree: v })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(formData)}
            disabled={isSaving || !formData.title}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'create' ? 'Create Exam' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Section Dialog Component
function SectionDialog({
  open,
  mode,
  data,
  isSaving,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  data?: Partial<ExamSection>;
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: Partial<ExamSection>) => void;
}) {
  const [formData, setFormData] = useState<Partial<ExamSection>>({
    title: '',
    titleHi: '',
    instructions: '',
    instructionsHi: '',
  });

  useEffect(() => {
    if (data && mode === 'edit') {
      setFormData(data);
    } else {
      setFormData({
        title: '',
        titleHi: '',
        instructions: '',
        instructionsHi: '',
      });
    }
  }, [data, mode, open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Section' : 'Edit Section'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new section to organize questions'
              : 'Update section details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title (English) *</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Mathematics, Reasoning"
              />
            </div>
            <div className="space-y-2">
              <Label>Title (Hindi)</Label>
              <Input
                value={formData.titleHi || ''}
                onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                placeholder="Hindi title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Instructions (Optional)</Label>
            <Textarea
              value={formData.instructions || ''}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              placeholder="Instructions for this section"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(formData)}
            disabled={isSaving || !formData.title}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'create' ? 'Create Section' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
