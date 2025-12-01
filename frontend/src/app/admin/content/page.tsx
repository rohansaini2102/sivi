'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Plus,
  BookOpen,
  FileText,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Globe,
  GlobeLock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataTable, Column } from '@/components/admin';
import { toast } from 'sonner';

interface Course {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  examCategory: string;
  price: number;
  discountPrice?: number;
  isPublished: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  createdAt: string;
}

interface TestSeries {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  examCategory: string;
  price: number;
  discountPrice?: number;
  isPublished: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  totalExams: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminContentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [coursePagination, setCoursePagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [testSeriesPagination, setTestSeriesPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [courseSearch, setCourseSearch] = useState('');
  const [testSeriesSearch, setTestSeriesSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'course' | 'testSeries';
    id: string;
    title: string;
  } | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: String(coursePagination.page),
        limit: String(coursePagination.limit),
        ...(courseSearch && { search: courseSearch }),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/courses?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setCourses(data.data.courses);
        setCoursePagination(data.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  }, [coursePagination.page, coursePagination.limit, courseSearch]);

  const fetchTestSeries = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: String(testSeriesPagination.page),
        limit: String(testSeriesPagination.limit),
        ...(testSeriesSearch && { search: testSeriesSearch }),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/test-series?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setTestSeries(data.data.testSeries);
        setTestSeriesPagination(data.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch test series');
    } finally {
      setIsLoading(false);
    }
  }, [testSeriesPagination.page, testSeriesPagination.limit, testSeriesSearch]);

  useEffect(() => {
    if (activeTab === 'courses') {
      fetchCourses();
    } else {
      fetchTestSeries();
    }
  }, [activeTab, fetchCourses, fetchTestSeries]);

  const handleTogglePublish = async (type: 'course' | 'testSeries', id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = type === 'course'
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${id}/publish`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/test-series/${id}/publish`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        if (type === 'course') {
          fetchCourses();
        } else {
          fetchTestSeries();
        }
      } else {
        toast.error(data.error?.message || 'Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update publish status');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = deleteDialog.type === 'course'
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${deleteDialog.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/test-series/${deleteDialog.id}`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Deleted successfully');
        if (deleteDialog.type === 'course') {
          fetchCourses();
        } else {
          fetchTestSeries();
        }
      } else {
        toast.error(data.error?.message || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setDeleteDialog(null);
    }
  };

  const courseColumns: Column<Course>[] = [
    {
      key: 'title',
      header: 'Course',
      cell: (course) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-20 rounded-md overflow-hidden bg-slate-800 flex-shrink-0">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-5 w-5 text-slate-600" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-white line-clamp-1">{course.title}</p>
            <p className="text-xs text-slate-400">{course.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'examCategory',
      header: 'Category',
      cell: (course) => (
        <Badge variant="secondary" className="bg-slate-700 text-slate-300">
          {course.examCategory}
        </Badge>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      cell: (course) => (
        <div>
          <span className="text-white font-medium">
            {course.price === 0 ? 'Free' : `₹${course.discountPrice || course.price}`}
          </span>
          {course.discountPrice && course.discountPrice < course.price && (
            <span className="text-xs text-slate-500 line-through ml-2">
              ₹{course.price}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'enrollmentCount',
      header: 'Enrollments',
      cell: (course) => (
        <span className="text-slate-300">{course.enrollmentCount}</span>
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      cell: (course) => (
        <Badge
          variant={course.isPublished ? 'default' : 'secondary'}
          className={course.isPublished ? 'bg-emerald-600' : 'bg-slate-700'}
        >
          {course.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      cell: (course) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
            <DropdownMenuItem
              className="text-slate-300 hover:bg-slate-700"
              onClick={() => router.push(`/courses/${course.slug}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-slate-300 hover:bg-slate-700"
              onClick={() => router.push(`/admin/content/courses/${course._id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-slate-300 hover:bg-slate-700"
              onClick={() => handleTogglePublish('course', course._id)}
            >
              {course.isPublished ? (
                <>
                  <GlobeLock className="mr-2 h-4 w-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Publish
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-400 hover:bg-slate-700 hover:text-red-400"
              onClick={() => setDeleteDialog({
                open: true,
                type: 'course',
                id: course._id,
                title: course.title,
              })}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const testSeriesColumns: Column<TestSeries>[] = [
    {
      key: 'title',
      header: 'Test Series',
      cell: (ts) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-20 rounded-md overflow-hidden bg-slate-800 flex-shrink-0">
            {ts.thumbnail ? (
              <Image
                src={ts.thumbnail}
                alt={ts.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-white line-clamp-1">{ts.title}</p>
            <p className="text-xs text-slate-400">{ts.totalExams} exams</p>
          </div>
        </div>
      ),
    },
    {
      key: 'examCategory',
      header: 'Category',
      cell: (ts) => (
        <Badge variant="secondary" className="bg-slate-700 text-slate-300">
          {ts.examCategory}
        </Badge>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      cell: (ts) => (
        <div>
          <span className="text-white font-medium">
            {ts.price === 0 ? 'Free' : `₹${ts.discountPrice || ts.price}`}
          </span>
          {ts.discountPrice && ts.discountPrice < ts.price && (
            <span className="text-xs text-slate-500 line-through ml-2">
              ₹{ts.price}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'enrollmentCount',
      header: 'Enrollments',
      cell: (ts) => (
        <span className="text-slate-300">{ts.enrollmentCount}</span>
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      cell: (ts) => (
        <Badge
          variant={ts.isPublished ? 'default' : 'secondary'}
          className={ts.isPublished ? 'bg-emerald-600' : 'bg-slate-700'}
        >
          {ts.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      cell: (ts) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
            <DropdownMenuItem
              className="text-slate-300 hover:bg-slate-700"
              onClick={() => router.push(`/test-series/${ts.slug}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-slate-300 hover:bg-slate-700"
              onClick={() => router.push(`/admin/content/test-series/${ts._id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-slate-300 hover:bg-slate-700"
              onClick={() => handleTogglePublish('testSeries', ts._id)}
            >
              {ts.isPublished ? (
                <>
                  <GlobeLock className="mr-2 h-4 w-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Publish
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-400 hover:bg-slate-700 hover:text-red-400"
              onClick={() => setDeleteDialog({
                open: true,
                type: 'testSeries',
                id: ts._id,
                title: ts.title,
              })}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Management</h1>
          <p className="text-slate-400">Create and manage courses & test series</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => router.push('/admin/content/test-series/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Test Series
          </Button>
          <Button
            onClick={() => router.push('/admin/content/courses/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger
            value="courses"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger
            value="test-series"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Test Series
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <DataTable
            columns={courseColumns}
            data={courses}
            isLoading={isLoading}
            pagination={coursePagination}
            onPageChange={(page) => setCoursePagination((p) => ({ ...p, page }))}
            onLimitChange={(limit) => setCoursePagination((p) => ({ ...p, limit, page: 1 }))}
            searchValue={courseSearch}
            onSearchChange={setCourseSearch}
            searchPlaceholder="Search courses..."
            keyExtractor={(course) => course._id}
            emptyMessage="No courses found"
            emptyIcon={<BookOpen className="h-12 w-12 text-slate-600" />}
          />
        </TabsContent>

        <TabsContent value="test-series" className="mt-6">
          <DataTable
            columns={testSeriesColumns}
            data={testSeries}
            isLoading={isLoading}
            pagination={testSeriesPagination}
            onPageChange={(page) => setTestSeriesPagination((p) => ({ ...p, page }))}
            onLimitChange={(limit) => setTestSeriesPagination((p) => ({ ...p, limit, page: 1 }))}
            searchValue={testSeriesSearch}
            onSearchChange={setTestSeriesSearch}
            searchPlaceholder="Search test series..."
            keyExtractor={(ts) => ts._id}
            emptyMessage="No test series found"
            emptyIcon={<FileText className="h-12 w-12 text-slate-600" />}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete {deleteDialog?.type === 'course' ? 'Course' : 'Test Series'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete &quot;{deleteDialog?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(null)}
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
