'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  MoreVertical,
  Pencil,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, Column } from '@/components/admin';
import { toast } from 'sonner';

interface CourseStats {
  totalSubjects: number;
  totalChapters: number;
  totalLessons: number;
  totalQuizzes: number;
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  examCategory: string;
  isPublished: boolean;
  stats?: CourseStats;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CourseBuilderPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(search && { search }),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/course-builder/courses?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setCourses(data.data.courses);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const columns: Column<Course>[] = [
    {
      key: 'title',
      header: 'Course',
      cell: (course) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-20 rounded-md overflow-hidden bg-muted shrink-0">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-foreground line-clamp-1">{course.title}</p>
            <p className="text-xs text-muted-foreground">{course.examCategory}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'subjects',
      header: 'Subjects',
      cell: (course) => (
        <div className="flex items-center gap-1.5 text-foreground">
          <Layers className="h-4 w-4 text-blue-500" />
          <span>{course.stats?.totalSubjects || 0}</span>
        </div>
      ),
    },
    {
      key: 'chapters',
      header: 'Chapters',
      cell: (course) => (
        <div className="flex items-center gap-1.5 text-foreground">
          <FileText className="h-4 w-4 text-purple-500" />
          <span>{course.stats?.totalChapters || 0}</span>
        </div>
      ),
    },
    {
      key: 'lessons',
      header: 'Lessons',
      cell: (course) => (
        <div className="flex items-center gap-1.5 text-foreground">
          <BookOpen className="h-4 w-4 text-emerald-500" />
          <span>{course.stats?.totalLessons || 0}</span>
        </div>
      ),
    },
    {
      key: 'quizzes',
      header: 'Quizzes',
      cell: (course) => (
        <div className="flex items-center gap-1.5 text-foreground">
          <HelpCircle className="h-4 w-4 text-amber-500" />
          <span>{course.stats?.totalQuizzes || 0}</span>
        </div>
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      cell: (course) => (
        <Badge
          variant={course.isPublished ? 'default' : 'secondary'}
          className={course.isPublished ? 'bg-emerald-600 text-white' : ''}
        >
          {course.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      cell: (course) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/course-builder/${course._id}`)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            Build
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/courses/${course.slug}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Store Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/admin/content/courses/${course._id}`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Course Builder</h1>
          <p className="text-muted-foreground">
            Build course content with subjects, chapters, and lessons
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-800">Getting Started</h3>
            <p className="text-sm text-blue-700 mt-1">
              Select a course to start building its content. Create subjects, add chapters,
              and fill them with lessons (Notes, PDF, or Quiz). Courses are created in the{' '}
              <button
                onClick={() => router.push('/admin/content')}
                className="text-blue-600 hover:underline font-medium"
              >
                Content Management
              </button>{' '}
              section.
            </p>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <DataTable
        columns={columns}
        data={courses}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
        onLimitChange={(limit) => setPagination((p) => ({ ...p, limit, page: 1 }))}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search courses..."
        keyExtractor={(course) => course._id}
        emptyMessage="No courses found. Create a course first in Content Management."
        emptyIcon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
      />
    </div>
  );
}
