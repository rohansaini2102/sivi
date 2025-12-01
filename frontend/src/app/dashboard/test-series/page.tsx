'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Grid3X3,
  List,
  Play,
  Clock,
  Target,
  Award,
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
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TestSeriesCard } from '@/components/cards';

// Mock enrolled test series data
const mockEnrolledTestSeries = [
  {
    id: '1',
    title: 'RAS Prelims Mock Test Series 2024',
    shortDescription: 'Complete mock test series for RAS Prelims.',
    thumbnail: '',
    category: 'RAS',
    price: 999,
    validityDays: 180,
    daysLeft: 150,
    language: 'both' as const,
    totalExams: 25,
    examsAttempted: 8,
    avgScore: 72,
    bestScore: 85,
    lastAttempted: '2024-11-30',
    isEnrolled: true,
  },
  {
    id: '2',
    title: 'REET Level 1 Practice Tests',
    shortDescription: 'Practice tests for REET Level 1.',
    thumbnail: '',
    category: 'REET',
    price: 599,
    validityDays: 120,
    daysLeft: 80,
    language: 'hi' as const,
    totalExams: 20,
    examsAttempted: 15,
    avgScore: 68,
    bestScore: 78,
    lastAttempted: '2024-11-28',
    isEnrolled: true,
  },
  {
    id: '3',
    title: 'Rajasthan Patwar Test Series',
    shortDescription: 'Tests for Patwar examination.',
    thumbnail: '',
    category: 'PATWAR',
    price: 399,
    validityDays: 90,
    daysLeft: 45,
    language: 'hi' as const,
    totalExams: 15,
    examsAttempted: 15,
    avgScore: 82,
    bestScore: 92,
    lastAttempted: '2024-11-25',
    isEnrolled: true,
  },
];

const categoryColors: Record<string, string> = {
  RAS: 'bg-indigo-100 text-indigo-700',
  REET: 'bg-emerald-100 text-emerald-700',
  PATWAR: 'bg-amber-100 text-amber-700',
  POLICE: 'bg-slate-100 text-slate-700',
  RPSC: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

export default function MyTestSeriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate test series status
  const getStatus = (series: typeof mockEnrolledTestSeries[0]) => {
    const progress = Math.round((series.examsAttempted / series.totalExams) * 100);
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'not-started';
  };

  // Filter and sort test series
  const filteredTestSeries = mockEnrolledTestSeries
    .filter((series) => {
      if (searchQuery && !series.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterStatus !== 'all' && getStatus(series) !== filterStatus) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastAttempted).getTime() - new Date(a.lastAttempted).getTime();
        case 'progress':
          const progressA = a.examsAttempted / a.totalExams;
          const progressB = b.examsAttempted / b.totalExams;
          return progressB - progressA;
        case 'score':
          return b.avgScore - a.avgScore;
        case 'expiring':
          return a.daysLeft - b.daysLeft;
        default:
          return 0;
      }
    });

  // Stats
  const totalAttempted = mockEnrolledTestSeries.reduce((sum, s) => sum + s.examsAttempted, 0);
  const totalTests = mockEnrolledTestSeries.reduce((sum, s) => sum + s.totalExams, 0);
  const avgScore = mockEnrolledTestSeries.length > 0
    ? Math.round(mockEnrolledTestSeries.reduce((sum, s) => sum + s.avgScore, 0) / mockEnrolledTestSeries.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Test Series</h1>
          <p className="text-muted-foreground">
            {mockEnrolledTestSeries.length} test series enrolled
          </p>
        </div>
        <Button asChild>
          <Link href="/test-series">
            <FileText className="mr-2 h-4 w-4" />
            Browse More Tests
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{mockEnrolledTestSeries.length}</p>
            <p className="text-sm text-muted-foreground">Test Series</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalAttempted}/{totalTests}</p>
            <p className="text-sm text-muted-foreground">Tests Attempted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{avgScore}%</p>
            <p className="text-sm text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {Math.max(...mockEnrolledTestSeries.map((s) => s.bestScore))}%
            </p>
            <p className="text-sm text-muted-foreground">Best Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search your test series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Attempted</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="score">Highest Score</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
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

      {/* Test Series */}
      {filteredTestSeries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No test series found
            </h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : "You haven't enrolled in any test series yet"}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/test-series">Browse Test Series</Link>
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTestSeries.map((series, index) => (
            <motion.div
              key={series.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TestSeriesCard {...series} variant="enrolled" />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTestSeries.map((series, index) => {
            const progress = Math.round((series.examsAttempted / series.totalExams) * 100);
            const status = getStatus(series);
            return (
              <motion.div
                key={series.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Thumbnail */}
                      <div className="relative aspect-video w-full bg-muted sm:aspect-square sm:w-48">
                        <div className="flex h-full items-center justify-center">
                          <FileText className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                        <Badge className={`absolute left-3 top-3 ${categoryColors[series.category]}`}>
                          {series.category}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-foreground line-clamp-1">
                              {series.title}
                            </h3>
                            <Badge
                              variant={
                                status === 'completed'
                                  ? 'default'
                                  : status === 'in-progress'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className={
                                status === 'completed' ? 'bg-emerald-500' : ''
                              }
                            >
                              {status === 'completed'
                                ? 'Completed'
                                : status === 'in-progress'
                                ? 'In Progress'
                                : 'Not Started'}
                            </Badge>
                          </div>

                          {/* Stats */}
                          <div className="mt-3 flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Target className="h-4 w-4" />
                              <span>Avg: <span className="font-medium text-foreground">{series.avgScore}%</span></span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Award className="h-4 w-4" />
                              <span>Best: <span className="font-medium text-foreground">{series.bestScore}%</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Tests Attempted</span>
                              <span className="font-medium text-foreground">
                                {series.examsAttempted}/{series.totalExams}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{series.daysLeft} days left</span>
                            </div>
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/test-series/${series.id}`}>
                                <Play className="mr-1 h-3 w-3" />
                                {series.examsAttempted > 0 ? 'Continue' : 'Start'}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
