'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  FileText,
  Grid3X3,
  List,
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

// Mock data - will be replaced with API calls
const mockTestSeries = [
  {
    id: '1',
    title: 'RAS Prelims Mock Test Series 2024',
    shortDescription: 'Complete mock test series for RAS Prelims with detailed solutions and performance analysis.',
    thumbnail: '',
    category: 'RAS',
    price: 1499,
    discountPrice: 999,
    validityDays: 180,
    language: 'both' as const,
    totalExams: 25,
    freeExams: 3,
    rating: 4.9,
    ratingCount: 2100,
    enrollmentCount: 8500,
    isFree: false,
  },
  {
    id: '2',
    title: 'REET Level 1 Practice Tests',
    shortDescription: 'Practice tests designed for REET Level 1 examination with topic-wise breakdown.',
    thumbnail: '',
    category: 'REET',
    price: 799,
    discountPrice: 599,
    validityDays: 120,
    language: 'hi' as const,
    totalExams: 20,
    freeExams: 2,
    rating: 4.7,
    ratingCount: 1560,
    enrollmentCount: 6200,
    isFree: false,
  },
  {
    id: '3',
    title: 'REET Level 2 Practice Tests',
    shortDescription: 'Comprehensive practice tests for REET Level 2 with subject-wise questions.',
    thumbnail: '',
    category: 'REET',
    price: 899,
    discountPrice: 699,
    validityDays: 120,
    language: 'hi' as const,
    totalExams: 22,
    freeExams: 2,
    rating: 4.6,
    ratingCount: 980,
    enrollmentCount: 4100,
    isFree: false,
  },
  {
    id: '4',
    title: 'Rajasthan Patwar Test Series',
    shortDescription: 'Previous year pattern based tests for Rajasthan Patwar recruitment exam.',
    thumbnail: '',
    category: 'PATWAR',
    price: 599,
    discountPrice: 399,
    validityDays: 90,
    language: 'hi' as const,
    totalExams: 15,
    freeExams: 2,
    rating: 4.5,
    ratingCount: 720,
    enrollmentCount: 3400,
    isFree: false,
  },
  {
    id: '5',
    title: 'Rajasthan Police Constable Tests',
    shortDescription: 'Mock tests based on latest exam pattern for Rajasthan Police Constable exam.',
    thumbnail: '',
    category: 'POLICE',
    price: 499,
    discountPrice: 349,
    validityDays: 90,
    language: 'hi' as const,
    totalExams: 12,
    freeExams: 1,
    rating: 4.4,
    ratingCount: 540,
    enrollmentCount: 2800,
    isFree: false,
  },
  {
    id: '6',
    title: 'RAS Mains Test Series',
    shortDescription: 'Descriptive answer practice for RAS Mains with expert evaluation.',
    thumbnail: '',
    category: 'RAS',
    price: 2499,
    discountPrice: 1999,
    validityDays: 365,
    language: 'both' as const,
    totalExams: 30,
    freeExams: 2,
    rating: 4.8,
    ratingCount: 650,
    enrollmentCount: 2100,
    isFree: false,
  },
  {
    id: '7',
    title: 'RPSC 1st Grade Teacher Tests',
    shortDescription: 'Subject-wise mock tests for RPSC 1st Grade Teacher examination.',
    thumbnail: '',
    category: 'RPSC',
    price: 1299,
    discountPrice: 999,
    validityDays: 180,
    language: 'both' as const,
    totalExams: 18,
    freeExams: 2,
    rating: 4.7,
    ratingCount: 420,
    enrollmentCount: 1600,
    isFree: false,
  },
  {
    id: '8',
    title: 'Free: Rajasthan GK Practice Tests',
    shortDescription: 'Free practice tests to assess your Rajasthan GK knowledge.',
    thumbnail: '',
    category: 'OTHER',
    price: 0,
    validityDays: 30,
    language: 'hi' as const,
    totalExams: 5,
    freeExams: 5,
    rating: 4.3,
    ratingCount: 3200,
    enrollmentCount: 12000,
    isFree: true,
  },
];

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

export default function TestSeriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [language, setLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter test series
  const filteredTestSeries = mockTestSeries.filter((series) => {
    if (searchQuery && !series.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (category !== 'all' && series.category !== category) {
      return false;
    }
    if (language !== 'all' && series.language !== language) {
      return false;
    }
    if (priceFilter === 'free' && !series.isFree) {
      return false;
    }
    if (priceFilter === 'paid' && series.isFree) {
      return false;
    }
    return true;
  });

  // Sort test series
  const sortedTestSeries = [...filteredTestSeries].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.enrollmentCount - a.enrollmentCount;
      case 'newest':
        return 0; // Would sort by date in real implementation
      case 'price-low':
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case 'price-high':
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case 'rating':
        return b.rating - a.rating;
      case 'tests':
        return b.totalExams - a.totalExams;
      default:
        return 0;
    }
  });

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
              onClick={() => setCategory(cat.value)}
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
              onClick={() => setLanguage(lang.value)}
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
            onClick={() => setPriceFilter('all')}
          >
            All
          </Badge>
          <Badge
            variant={priceFilter === 'free' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setPriceFilter('free')}
          >
            Free
          </Badge>
          <Badge
            variant={priceFilter === 'paid' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setPriceFilter('paid')}
          >
            Paid
          </Badge>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setCategory('all');
          setLanguage('all');
          setPriceFilter('all');
        }}
      >
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                Showing <span className="font-medium text-foreground">{sortedTestSeries.length}</span> test series
              </p>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
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
            {sortedTestSeries.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  No test series found
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setCategory('all');
                    setLanguage('all');
                    setPriceFilter('all');
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-4'
                }
              >
                {sortedTestSeries.map((series, index) => (
                  <motion.div
                    key={series.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TestSeriesCard {...series} variant="shop" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
