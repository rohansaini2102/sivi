'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  FileText,
  HelpCircle,
  BookOpen,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Pencil,
  Trash2,
  MoreVertical,
  Layers,
  File,
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
import { RichTextEditor } from '@/components/admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
interface Lesson {
  _id: string;
  title: string;
  titleHi?: string;
  type: 'notes' | 'pdf' | 'quiz';
  order: number;
  isPublished: boolean;
  content?: string;
  contentHi?: string;
  pdfUrl?: string;
  pdfName?: string;
  pdfSize?: number;
  allowDownload?: boolean;
  quiz?: string;
}

interface Chapter {
  _id: string;
  title: string;
  titleHi?: string;
  order: number;
  isFree: boolean;
  isPublished: boolean;
  lessons: Lesson[];
}

interface Subject {
  _id: string;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  icon?: string;
  order: number;
  isPublished: boolean;
  chapters: Chapter[];
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  examCategory: string;
  isPublished: boolean;
}

interface CourseStructure {
  course: Course;
  subjects: Subject[];
}

// Icon options for subjects
const SUBJECT_ICONS = [
  { value: 'book', label: 'Book', icon: BookOpen },
  { value: 'file', label: 'Document', icon: FileText },
  { value: 'layers', label: 'Layers', icon: Layers },
  { value: 'help', label: 'Help', icon: HelpCircle },
];

export default function CourseBuilderEditorPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  // State
  const [structure, setStructure] = useState<CourseStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  // Selected item for editing
  const [selectedItem, setSelectedItem] = useState<{
    type: 'subject' | 'chapter' | 'lesson';
    id: string;
    data: Subject | Chapter | Lesson;
    parentId?: string;
  } | null>(null);

  // Dialog states
  const [subjectDialog, setSubjectDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    data?: Subject;
  }>({ open: false, mode: 'create' });

  const [chapterDialog, setChapterDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    subjectId?: string;
    data?: Chapter;
  }>({ open: false, mode: 'create' });

  const [lessonDialog, setLessonDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    chapterId?: string;
    data?: Lesson;
  }>({ open: false, mode: 'create' });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'subject' | 'chapter' | 'lesson';
    id: string;
    title: string;
  } | null>(null);

  // Fetch course structure
  const fetchStructure = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/courses/${courseId}/structure`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setStructure(data.data);
        // Auto-expand first subject only on initial load
        if (isInitialLoad.current && data.data.subjects.length > 0) {
          setExpandedSubjects(new Set([data.data.subjects[0]._id]));
          isInitialLoad.current = false;
        }
      } else {
        toast.error('Failed to load course structure');
        router.push('/admin/course-builder');
      }
    } catch {
      toast.error('Failed to load course structure');
      router.push('/admin/course-builder');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    fetchStructure();
  }, [fetchStructure]);

  // Toggle expand/collapse
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

  // Get icon component for subject
  const getSubjectIcon = (iconName?: string) => {
    const found = SUBJECT_ICONS.find((i) => i.value === iconName);
    return found?.icon || BookOpen;
  };

  // Get lesson type icon and color
  const getLessonTypeInfo = (type: Lesson['type']) => {
    switch (type) {
      case 'notes':
        return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'pdf':
        return { icon: File, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'quiz':
        return { icon: HelpCircle, color: 'text-purple-600', bg: 'bg-purple-100' };
    }
  };

  // API calls
  const createSubject = async (formData: Partial<Subject>) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/courses/${courseId}/subjects`,
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
        toast.success('Subject created');
        fetchStructure();
        setSubjectDialog({ open: false, mode: 'create' });
      } else {
        toast.error(data.error?.message || 'Failed to create subject');
      }
    } catch {
      toast.error('Failed to create subject');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSubject = async (subjectId: string, formData: Partial<Subject>) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/subjects/${subjectId}`,
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
        toast.success('Subject updated');
        fetchStructure();
        setSubjectDialog({ open: false, mode: 'create' });
      } else {
        toast.error(data.error?.message || 'Failed to update subject');
      }
    } catch {
      toast.error('Failed to update subject');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSubject = async (subjectId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/subjects/${subjectId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('Subject deleted');
        fetchStructure();
        if (selectedItem?.id === subjectId) setSelectedItem(null);
      } else {
        toast.error(data.error?.message || 'Failed to delete subject');
      }
    } catch {
      toast.error('Failed to delete subject');
    }
  };

  const createChapter = async (subjectId: string, formData: Partial<Chapter>) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/subjects/${subjectId}/chapters`,
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
        toast.success('Chapter created');
        fetchStructure();
        setChapterDialog({ open: false, mode: 'create' });
        // Expand the parent subject
        setExpandedSubjects((prev) => new Set([...prev, subjectId]));
      } else {
        toast.error(data.error?.message || 'Failed to create chapter');
      }
    } catch {
      toast.error('Failed to create chapter');
    } finally {
      setIsSaving(false);
    }
  };

  const updateChapter = async (chapterId: string, formData: Partial<Chapter>) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/chapters/${chapterId}`,
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
        toast.success('Chapter updated');
        fetchStructure();
        setChapterDialog({ open: false, mode: 'create' });
      } else {
        toast.error(data.error?.message || 'Failed to update chapter');
      }
    } catch {
      toast.error('Failed to update chapter');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteChapter = async (chapterId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/chapters/${chapterId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('Chapter deleted');
        fetchStructure();
        if (selectedItem?.id === chapterId) setSelectedItem(null);
      } else {
        toast.error(data.error?.message || 'Failed to delete chapter');
      }
    } catch {
      toast.error('Failed to delete chapter');
    }
  };

  const createLesson = async (chapterId: string, formData: Partial<Lesson>) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/chapters/${chapterId}/lessons`,
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
        toast.success('Lesson created');
        fetchStructure();
        setLessonDialog({ open: false, mode: 'create' });
        // Expand the parent chapter
        setExpandedChapters((prev) => new Set([...prev, chapterId]));
      } else {
        toast.error(data.error?.message || 'Failed to create lesson');
      }
    } catch {
      toast.error('Failed to create lesson');
    } finally {
      setIsSaving(false);
    }
  };

  const updateLesson = async (lessonId: string, formData: Partial<Lesson>) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/lessons/${lessonId}`,
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
        toast.success('Lesson updated');
        fetchStructure();
      } else {
        toast.error(data.error?.message || 'Failed to update lesson');
      }
    } catch {
      toast.error('Failed to update lesson');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLesson = async (lessonId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/lessons/${lessonId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('Lesson deleted');
        fetchStructure();
        if (selectedItem?.id === lessonId) setSelectedItem(null);
      } else {
        toast.error(data.error?.message || 'Failed to delete lesson');
      }
    } catch {
      toast.error('Failed to delete lesson');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    switch (deleteDialog.type) {
      case 'subject':
        await deleteSubject(deleteDialog.id);
        break;
      case 'chapter':
        await deleteChapter(deleteDialog.id);
        break;
      case 'lesson':
        await deleteLesson(deleteDialog.id);
        break;
    }
    setDeleteDialog(null);
  };

  // Select a lesson to edit
  const selectLesson = (lesson: Lesson, chapterId: string) => {
    setSelectedItem({
      type: 'lesson',
      id: lesson._id,
      data: lesson,
      parentId: chapterId,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!structure) {
    return null;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/course-builder')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{structure.course.title}</h1>
            <p className="text-sm text-muted-foreground">
              {structure.subjects.length} Subjects • {structure.course.examCategory}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={structure.course.isPublished ? 'default' : 'secondary'}
            className={structure.course.isPublished ? 'bg-emerald-600 text-foreground' : ''}
          >
            {structure.course.isPublished ? 'Published' : 'Draft'}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Sidebar - Course Structure */}
        <div className="w-80 shrink-0 border-r border-border overflow-y-auto pr-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Structure
            </h2>
            <Button
              size="sm"
              onClick={() => setSubjectDialog({ open: true, mode: 'create' })}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Subject
            </Button>
          </div>

          {structure.subjects.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No subjects yet</p>
              <p className="text-muted-foreground text-xs mt-1">
                Add your first subject to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {structure.subjects.map((subject) => (
                <div key={subject._id} className="space-y-1">
                  {/* Subject */}
                  <div
                    className={cn(
                      'group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                      'hover:bg-muted',
                      selectedItem?.id === subject._id && 'bg-muted'
                    )}
                  >
                    <button
                      onClick={() => toggleSubject(subject._id)}
                      className="p-0.5 hover:bg-muted rounded"
                    >
                      {expandedSubjects.has(subject._id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                    {(() => {
                      const Icon = getSubjectIcon(subject.icon);
                      return <Icon className="h-4 w-4 text-blue-600" />;
                    })()}
                    <span className="flex-1 text-sm text-foreground truncate">
                      {subject.title}
                    </span>
                    {!subject.isPublished && (
                      <Badge variant="secondary" className="h-5 text-xs bg-muted">
                        Draft
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem
                          onClick={() => setChapterDialog({ open: true, mode: 'create', subjectId: subject._id })}
                          className="text-foreground"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Chapter
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSubjectDialog({ open: true, mode: 'edit', data: subject })}
                          className="text-foreground"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Subject
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted" />
                        <DropdownMenuItem
                          onClick={() => setDeleteDialog({
                            open: true,
                            type: 'subject',
                            id: subject._id,
                            title: subject.title,
                          })}
                          className="text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Subject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Chapters */}
                  {expandedSubjects.has(subject._id) && (
                    <div className="ml-6 space-y-1">
                      {subject.chapters.map((chapter) => (
                        <div key={chapter._id} className="space-y-1">
                          {/* Chapter */}
                          <div
                            className={cn(
                              'group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                              'hover:bg-muted',
                              selectedItem?.id === chapter._id && 'bg-muted'
                            )}
                          >
                            <button
                              onClick={() => toggleChapter(chapter._id)}
                              className="p-0.5 hover:bg-muted rounded"
                            >
                              {expandedChapters.has(chapter._id) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                            <FileText className="h-4 w-4 text-purple-600" />
                            <span className="flex-1 text-sm text-foreground truncate">
                              {chapter.title}
                            </span>
                            {chapter.isFree && (
                              <Badge variant="secondary" className="h-5 text-xs bg-emerald-100 text-emerald-700">
                                Free
                              </Badge>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border">
                                <DropdownMenuItem
                                  onClick={() => setLessonDialog({ open: true, mode: 'create', chapterId: chapter._id })}
                                  className="text-foreground"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Lesson
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setChapterDialog({ open: true, mode: 'edit', data: chapter })}
                                  className="text-foreground"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Chapter
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-muted" />
                                <DropdownMenuItem
                                  onClick={() => setDeleteDialog({
                                    open: true,
                                    type: 'chapter',
                                    id: chapter._id,
                                    title: chapter.title,
                                  })}
                                  className="text-red-400"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Chapter
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Lessons */}
                          {expandedChapters.has(chapter._id) && (
                            <div className="ml-6 space-y-1">
                              {chapter.lessons.map((lesson) => {
                                const typeInfo = getLessonTypeInfo(lesson.type);
                                const TypeIcon = typeInfo.icon;
                                return (
                                  <div
                                    key={lesson._id}
                                    onClick={() => selectLesson(lesson, chapter._id)}
                                    className={cn(
                                      'group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                                      'hover:bg-muted',
                                      selectedItem?.id === lesson._id && 'bg-emerald-100 border border-emerald-500/30'
                                    )}
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                                    <div className={cn('p-1 rounded', typeInfo.bg)}>
                                      <TypeIcon className={cn('h-3 w-3', typeInfo.color)} />
                                    </div>
                                    <span className="flex-1 text-sm text-foreground truncate">
                                      {lesson.title}
                                    </span>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon-sm"
                                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-card border-border">
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setLessonDialog({ open: true, mode: 'edit', data: lesson });
                                          }}
                                          className="text-foreground"
                                        >
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Edit Lesson
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-muted" />
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteDialog({
                                              open: true,
                                              type: 'lesson',
                                              id: lesson._id,
                                              title: lesson.title,
                                            });
                                          }}
                                          className="text-red-400"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete Lesson
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                );
                              })}
                              {chapter.lessons.length === 0 && (
                                <div className="p-2 text-center">
                                  <p className="text-xs text-muted-foreground">No lessons yet</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {subject.chapters.length === 0 && (
                        <div className="p-2 text-center">
                          <p className="text-xs text-muted-foreground">No chapters yet</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {selectedItem?.type === 'lesson' ? (
            <LessonEditor
              key={selectedItem.id}
              lesson={selectedItem.data as Lesson}
              onSave={(data) => updateLesson(selectedItem.id, data)}
              isSaving={isSaving}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Select a Lesson to Edit
              </h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Choose a lesson from the sidebar to edit its content.
                You can create notes with rich text, upload PDFs, or build quizzes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subject Dialog */}
      <SubjectFormDialog
        key={`subject-${subjectDialog.mode}-${subjectDialog.data?._id || 'new'}`}
        open={subjectDialog.open}
        mode={subjectDialog.mode}
        data={subjectDialog.data}
        onClose={() => setSubjectDialog({ open: false, mode: 'create' })}
        onSubmit={(data) => {
          if (subjectDialog.mode === 'edit' && subjectDialog.data) {
            updateSubject(subjectDialog.data._id, data);
          } else {
            createSubject(data);
          }
        }}
        isSaving={isSaving}
      />

      {/* Chapter Dialog */}
      <ChapterFormDialog
        key={`chapter-${chapterDialog.mode}-${chapterDialog.data?._id || 'new'}`}
        open={chapterDialog.open}
        mode={chapterDialog.mode}
        data={chapterDialog.data}
        onClose={() => setChapterDialog({ open: false, mode: 'create' })}
        onSubmit={(data) => {
          if (chapterDialog.mode === 'edit' && chapterDialog.data) {
            updateChapter(chapterDialog.data._id, data);
          } else if (chapterDialog.subjectId) {
            createChapter(chapterDialog.subjectId, data);
          }
        }}
        isSaving={isSaving}
      />

      {/* Lesson Dialog */}
      <LessonFormDialog
        key={`lesson-${lessonDialog.mode}-${lessonDialog.data?._id || 'new'}`}
        open={lessonDialog.open}
        mode={lessonDialog.mode}
        data={lessonDialog.data}
        onClose={() => setLessonDialog({ open: false, mode: 'create' })}
        onSubmit={(data) => {
          if (lessonDialog.mode === 'edit' && lessonDialog.data) {
            updateLesson(lessonDialog.data._id, data);
            setLessonDialog({ open: false, mode: 'create' });
          } else if (lessonDialog.chapterId) {
            createLesson(lessonDialog.chapterId, data);
          }
        }}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Delete {deleteDialog?.type}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{deleteDialog?.title}&quot;?
              {deleteDialog?.type === 'subject' && ' All chapters and lessons within will also be deleted.'}
              {deleteDialog?.type === 'chapter' && ' All lessons within will also be deleted.'}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(null)}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Sub-components ============

// Subject Form Dialog
function SubjectFormDialog({
  open,
  mode,
  data,
  onClose,
  onSubmit,
  isSaving,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  data?: Subject;
  onClose: () => void;
  onSubmit: (data: Partial<Subject>) => void;
  isSaving: boolean;
}) {
  // Using key prop on parent to reset form state when data changes
  const [formData, setFormData] = useState({
    title: data?.title || '',
    titleHi: data?.titleHi || '',
    description: data?.description || '',
    descriptionHi: data?.descriptionHi || '',
    icon: data?.icon || 'book',
    isPublished: data?.isPublished ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {mode === 'create' ? 'Create Subject' : 'Edit Subject'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Title (English) *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Subject title"
                className="bg-background border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Title (Hindi)</Label>
              <Input
                value={formData.titleHi}
                onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                placeholder="विषय शीर्षक"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Description (English)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description"
              className="bg-background border-border text-foreground resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Description (Hindi)</Label>
            <Textarea
              value={formData.descriptionHi}
              onChange={(e) => setFormData({ ...formData, descriptionHi: e.target.value })}
              placeholder="संक्षिप्त विवरण"
              className="bg-background border-border text-foreground resize-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {SUBJECT_ICONS.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value} className="text-foreground">
                      <div className="flex items-center gap-2">
                        <icon.icon className="h-4 w-4" />
                        {icon.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Published</Label>
              <div className="flex items-center h-10">
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
              </div>
            </div>
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
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Chapter Form Dialog
function ChapterFormDialog({
  open,
  mode,
  data,
  onClose,
  onSubmit,
  isSaving,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  data?: Chapter;
  onClose: () => void;
  onSubmit: (data: Partial<Chapter>) => void;
  isSaving: boolean;
}) {
  // Using key prop on parent to reset form state when data changes
  const [formData, setFormData] = useState({
    title: data?.title || '',
    titleHi: data?.titleHi || '',
    isFree: data?.isFree ?? false,
    isPublished: data?.isPublished ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {mode === 'create' ? 'Create Chapter' : 'Edit Chapter'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Title (English) *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Chapter title"
                className="bg-background border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Title (Hindi)</Label>
              <Input
                value={formData.titleHi}
                onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                placeholder="अध्याय शीर्षक"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Free Preview</Label>
              <div className="flex items-center h-10">
                <Switch
                  checked={formData.isFree}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  {formData.isFree ? 'Available to all' : 'Enrolled only'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Published</Label>
              <div className="flex items-center h-10">
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
              </div>
            </div>
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
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Lesson Form Dialog
function LessonFormDialog({
  open,
  mode,
  data,
  onClose,
  onSubmit,
  isSaving,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  data?: Lesson;
  onClose: () => void;
  onSubmit: (data: Partial<Lesson>) => void;
  isSaving: boolean;
}) {
  // Using key prop on parent to reset form state when data changes
  const [formData, setFormData] = useState({
    title: data?.title || '',
    titleHi: data?.titleHi || '',
    type: (data?.type || 'notes') as Lesson['type'],
    isPublished: data?.isPublished ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {mode === 'create' ? 'Create Lesson' : 'Edit Lesson'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Title (English) *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Lesson title"
                className="bg-background border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Title (Hindi)</Label>
              <Input
                value={formData.titleHi}
                onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                placeholder="पाठ शीर्षक"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Lesson Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: Lesson['type']) => setFormData({ ...formData, type: value })}
              disabled={mode === 'edit'}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="notes" className="text-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Notes (Rich Text)
                  </div>
                </SelectItem>
                <SelectItem value="pdf" className="text-foreground">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-orange-600" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="quiz" className="text-foreground">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-purple-600" />
                    Quiz
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">Lesson type cannot be changed after creation</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Published</Label>
            <div className="flex items-center">
              <Switch
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
              />
            </div>
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
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Lesson Editor Component
function LessonEditor({
  lesson,
  onSave,
  isSaving,
}: {
  lesson: Lesson;
  onSave: (data: Partial<Lesson>) => void;
  isSaving: boolean;
}) {
  // Using key prop on parent to reset state when lesson changes
  const [content, setContent] = useState(lesson.content || '');
  const [contentHi, setContentHi] = useState(lesson.contentHi || '');
  const [activeTab, setActiveTab] = useState<'en' | 'hi'>('en');
  const [hasChanges, setHasChanges] = useState(false);

  const handleContentChange = (value: string, lang: 'en' | 'hi') => {
    if (lang === 'en') {
      setContent(value);
    } else {
      setContentHi(value);
    }
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave({ content, contentHi });
    setHasChanges(false);
  };

  // Auto-save on blur
  const handleBlur = () => {
    if (hasChanges) {
      handleSave();
    }
  };

  if (lesson.type === 'notes') {
    return (
      <Card className="bg-card border-border h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-foreground">{lesson.title}</CardTitle>
                <p className="text-sm text-muted-foreground">Rich Text Notes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  Unsaved changes
                </Badge>
              )}
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {hasChanges ? 'Save Changes' : 'Saved'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Language Tabs */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('en')}
              className={activeTab !== 'en' ? 'border-border text-foreground' : ''}
            >
              English
            </Button>
            <Button
              variant={activeTab === 'hi' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('hi')}
              className={activeTab !== 'hi' ? 'border-border text-foreground' : ''}
            >
              Hindi
            </Button>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-auto" onBlur={handleBlur}>
            {activeTab === 'en' ? (
              <RichTextEditor
                value={content}
                onChange={(value) => handleContentChange(value, 'en')}
                placeholder="Start writing your notes..."
                minHeight="400px"
                className="bg-background border-border"
              />
            ) : (
              <RichTextEditor
                value={contentHi}
                onChange={(value) => handleContentChange(value, 'hi')}
                placeholder="अपने नोट्स लिखना शुरू करें..."
                minHeight="400px"
                className="bg-background border-border"
              />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lesson.type === 'pdf') {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <File className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-foreground">{lesson.title}</CardTitle>
              <p className="text-sm text-muted-foreground">PDF Document</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PDFUploader
            lesson={lesson}
            onUpload={(data) => onSave(data)}
            isSaving={isSaving}
          />
        </CardContent>
      </Card>
    );
  }

  if (lesson.type === 'quiz') {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HelpCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-foreground">{lesson.title}</CardTitle>
              <p className="text-sm text-muted-foreground">Quiz</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <QuizBuilder lessonId={lesson._id} quizId={lesson.quiz} />
        </CardContent>
      </Card>
    );
  }

  return null;
}

// PDF Uploader Component
function PDFUploader({
  lesson,
  onUpload,
  isSaving,
}: {
  lesson: Lesson;
  onUpload: (data: Partial<Lesson>) => void;
  isSaving: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [allowDownload, setAllowDownload] = useState(lesson.allowDownload ?? true);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/upload/pdf`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();

      if (data.success) {
        onUpload({
          pdfUrl: data.data.url,
          pdfName: file.name,
          pdfSize: file.size,
          allowDownload,
        });
        toast.success('PDF uploaded successfully');
      } else {
        toast.error(data.error?.message || 'Failed to upload PDF');
      }
    } catch {
      toast.error('Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-4">
      {lesson.pdfUrl ? (
        <>
          {/* PDF Preview */}
          <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
            <iframe
              src={`${lesson.pdfUrl}#toolbar=0`}
              className="w-full h-full"
              title={lesson.pdfName || 'PDF Document'}
            />
          </div>
          {/* PDF Info */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <File className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{lesson.pdfName || 'PDF Document'}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(lesson.pdfSize)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(lesson.pdfUrl, '_blank')}
                className="border-border text-foreground"
              >
                View PDF
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No PDF uploaded yet</p>
          <p className="text-muted-foreground text-sm mb-4">Upload a PDF document (max 50MB)</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch
            checked={allowDownload}
            onCheckedChange={(checked) => {
              setAllowDownload(checked);
              if (lesson.pdfUrl) {
                onUpload({ allowDownload: checked });
              }
            }}
          />
          <Label className="text-foreground">Allow students to download PDF</Label>
        </div>
        <div>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
            disabled={isUploading || isSaving}
          />
          <label htmlFor="pdf-upload">
            <Button
              asChild
              variant={lesson.pdfUrl ? 'outline' : 'default'}
              disabled={isUploading || isSaving}
              className={lesson.pdfUrl ? 'border-border text-foreground' : ''}
            >
              <span>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {lesson.pdfUrl ? 'Replace PDF' : 'Upload PDF'}
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
}

// Quiz Builder Component (placeholder for now)
function QuizBuilder({ lessonId, quizId }: { lessonId: string; quizId?: string }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<{
    _id: string;
    mode: string;
    totalQuestions: number;
    duration: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchQuiz = useCallback(async () => {
    if (!quizId) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/quizzes/${quizId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setQuiz(data.data);
      }
    } catch {
      console.error('Failed to fetch quiz');
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId, fetchQuiz]);

  const createQuiz = async () => {
    setIsCreating(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/lessons/${lessonId}/quiz`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );
      const data = await res.json();
      if (data.success) {
        setQuiz(data.data);
        toast.success('Quiz created');
      } else {
        toast.error(data.error?.message || 'Failed to create quiz');
      }
    } catch {
      toast.error('Failed to create quiz');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-8">
        <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">No quiz created yet</p>
        <Button
          onClick={() => createQuiz()}
          disabled={isCreating}
          className="bg-primary"
        >
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Quiz</p>
            <p className="text-sm text-muted-foreground">
              {quiz.totalQuestions} questions • {quiz.duration} minutes
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/admin/course-builder/quiz/${quiz._id}`)}
          className="bg-primary"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Quiz
        </Button>
      </div>
    </div>
  );
}
