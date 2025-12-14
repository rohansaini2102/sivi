'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ClipboardList,
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

interface TestSeriesStats {
  totalExams: number;
  publishedExams: number;
  totalQuestions: number;
}

interface TestSeries {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  examCategory: string;
  isPublished: boolean;
  stats?: TestSeriesStats;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TestSeriesBuilderPage() {
  const router = useRouter();
  const [testSeriesList, setTestSeriesList] = useState<TestSeries[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTestSeries = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(search && { search }),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/test-series-builder/series?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        setTestSeriesList(data.data.testSeries);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch test series');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchTestSeries();
  }, [fetchTestSeries]);

  const columns: Column<TestSeries>[] = [
    {
      key: 'title',
      header: 'Test Series',
      cell: (series) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-20 rounded-md overflow-hidden bg-muted shrink-0">
            {series.thumbnail ? (
              <Image
                src={series.thumbnail}
                alt={series.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-foreground line-clamp-1">{series.title}</p>
            <p className="text-xs text-muted-foreground">{series.examCategory}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'exams',
      header: 'Exams',
      cell: (series) => (
        <div className="flex items-center gap-1.5 text-foreground">
          <FileText className="h-4 w-4 text-blue-500" />
          <span>{series.stats?.totalExams || 0}</span>
          <span className="text-xs text-muted-foreground">
            ({series.stats?.publishedExams || 0} published)
          </span>
        </div>
      ),
    },
    {
      key: 'questions',
      header: 'Questions',
      cell: (series) => (
        <div className="flex items-center gap-1.5 text-foreground">
          <HelpCircle className="h-4 w-4 text-amber-500" />
          <span>{series.stats?.totalQuestions || 0}</span>
        </div>
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      cell: (series) => (
        <Badge
          variant={series.isPublished ? 'default' : 'secondary'}
          className={series.isPublished ? 'bg-emerald-600 text-white' : ''}
        >
          {series.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      cell: (series) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/test-series-builder/${series._id}`)}
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
              <DropdownMenuItem onClick={() => router.push(`/test-series/${series.slug}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Store Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/admin/content/test-series/${series._id}`)}>
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
          <h1 className="text-2xl font-bold text-foreground">Test Series Builder</h1>
          <p className="text-muted-foreground">
            Build test series with exams, sections, and questions
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ClipboardList className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-800">Getting Started</h3>
            <p className="text-sm text-blue-700 mt-1">
              Select a test series to start building its content. Create exams, add sections,
              and fill them with questions from the question bank. Test series are created in the{' '}
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

      {/* Test Series Table */}
      <DataTable
        columns={columns}
        data={testSeriesList}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
        onLimitChange={(limit) => setPagination((p) => ({ ...p, limit, page: 1 }))}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search test series..."
        keyExtractor={(series) => series._id}
        emptyMessage="No test series found. Create a test series first in Content Management."
        emptyIcon={<ClipboardList className="h-12 w-12 text-muted-foreground" />}
      />
    </div>
  );
}
