'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  FileText,
  Grid3X3,
  List,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { TestSeriesCard } from '@/components/cards';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface TestSeries {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  thumbnail?: string;
  examCategory: string;
  price: number;
  discountPrice?: number;
  validityDays: number;
  language: 'hi' | 'en' | 'both';
  totalExams: number;
  freeExams: number;
  rating: number;
  ratingCount: number;
  enrollmentCount: number;
  isFree: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'RAS', label: 'RAS' },
  { value: 'REET', label: 'REET' },
  { value: 'PATWAR', label: 'Patwar' },
  { value: 'POLICE', label: 'Police' },
  { value: 'RPSC', label: 'RPSC' },
  { value: 'OTHER', label: 'Other' },
];

const languages = [
  { value: 'all', label: 'All Languages' },
  { value: 'hi', label: 'Hindi' },
  { value: 'en', label: 'English' },
  { value: 'both', label: 'Bilingual' },
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'tests', label: 'Most Tests' },
];

function TestSeriesContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');

  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(urlCategory || 'all');
  const [language, setLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Update category when URL param changes
  useEffect(() => {
    if (urlCategory) {
      setCategory(urlCategory);
    }
  }, [urlCategory]);

  const fetchTestSeries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(searchQuery && { search: searchQuery }),
        ...(category !== 'all' && { category }),
        ...(language !== 'all' && { language }),
        ...(priceFilter === 'free' && { isFree: 'true' }),
        sortBy: sortBy === 'popular' ? 'enrollmentCount' :
                sortBy === 'newest' ? 'createdAt' :
                sortBy === 'price-low' ? 'price' :
                sortBy === 'price-high' ? 'price' :
                sortBy === 'rating' ? 'rating' :
                sortBy === 'tests' ? 'totalExams' : 'enrollmentCount',
        sortOrder: sortBy === 'price-low' ? 'asc' : 'desc',
      });

      const res = await fetch(`${apiUrl}/store/test-series?${params}`);

      if (!res.ok) {
        throw new Error('Failed to fetch test series');
      }

      const data = await res.json();

      if (data.success) {
        setTestSeries(data.data.testSeries || []);
        setPagination(data.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 });
      } else {
        setTestSeries([]);
      }
    } catch (error) {
      console.error('Failed to fetch test series:', error);
      setError('Unable to load test series. Please try again later.');
      setTestSeries([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, category, language, priceFilter, sortBy]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTestSeries();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchTestSeries]);

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('all');
    setLanguage('all');
    setPriceFilter('all');
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat.value}
              variant={category === cat.value ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                setCategory(cat.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
            >
              {cat.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Language</h3>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <Badge
              key={lang.value}
              variant={language === lang.value ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                setLanguage(lang.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
            >
              {lang.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Price</h3>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={priceFilter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => {
              setPriceFilter('all');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          >
            All
          </Badge>
          <Badge
            variant={priceFilter === 'free' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => {
              setPriceFilter('free');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          >
            Free
          </Badge>
          <Badge
            variant={priceFilter === 'paid' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => {
              setPriceFilter('paid');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          >
            Paid
          </Badge>
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Test Series
            </h1>
            <p className="mt-3 text-muted-foreground">
              Practice with mock tests designed by experts to help you succeed
            </p>

            {/* Search */}
            <div className="mt-6 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search test series..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="pl-10"
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Filters
              </h2>
              <FilterContent />
            </div>
          </aside>

          {/* Test Series Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  'Loading...'
                ) : (
                  <>
                    Showing <span className="font-medium text-foreground">{testSeries.length}</span> of{' '}
                    <span className="font-medium text-foreground">{pagination.total}</span> test series
                  </>
                )}
              </p>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <Select value={sortBy} onValueChange={(value) => {
                  setSortBy(value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden items-center gap-1 rounded-lg border border-border p-1 sm:flex">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Test Series */}
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Something went wrong
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {error}
                </p>
                <Button variant="outline" className="mt-4" onClick={fetchTestSeries}>
                  Try Again
                </Button>
              </div>
            ) : testSeries.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  No test series found
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                      : 'space-y-4'
                  }
                >
                  {testSeries.map((series, index) => (
                    <motion.div
                      key={series._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TestSeriesCard
                        id={series.slug}
                        title={series.title}
                        shortDescription={series.shortDescription}
                        thumbnail={series.thumbnail}
                        category={series.examCategory}
                        price={series.price}
                        discountPrice={series.discountPrice}
                        validityDays={series.validityDays}
                        language={series.language}
                        totalExams={series.totalExams}
                        freeExams={series.freeExams}
                        rating={series.rating}
                        ratingCount={series.ratingCount}
                        enrollmentCount={series.enrollmentCount}
                        isFree={series.isFree}
                        variant="shop"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function TestSeriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <Footer />
        </div>
      }
    >
      <TestSeriesContent />
    </Suspense>
  );
}
