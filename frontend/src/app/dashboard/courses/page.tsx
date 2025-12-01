'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Filter,
  Grid3X3,
  List,
  Play,
  Clock,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseCard } from '@/components/cards';

// Mock enrolled courses data
const mockEnrolledCourses = [
  {
    id: '1',
    title: 'RAS Complete Course 2024',
    shortDescription: 'Comprehensive preparation for Rajasthan Administrative Service exam.',
    thumbnail: '',
    category: 'RAS',
    price: 1999,
    validityDays: 365,
    daysLeft: 280,
    language: 'both' as const,
    level: 'intermediate' as const,
    totalLessons: 180,
    completedLessons: 45,
    lastAccessed: '2024-11-30',
    isEnrolled: true,
  },
  {
    id: '2',
    title: 'REET Level 1 & 2 Complete',
    shortDescription: 'Complete preparation for REET Level 1 and Level 2.',
    thumbnail: '',
    category: 'REET',
    price: 999,
    validityDays: 180,
    daysLeft: 120,
    language: 'hi' as const,
    level: 'beginner' as const,
    totalLessons: 120,
    completedLessons: 85,
    lastAccessed: '2024-11-29',
    isEnrolled: true,
  },
  {
    id: '3',
    title: 'Rajasthan GK Complete Course',
    shortDescription: 'Complete Rajasthan GK for all competitive exams.',
    thumbnail: '',
    category: 'OTHER',
    price: 699,
    validityDays: 180,
    daysLeft: 90,
    language: 'hi' as const,
    level: 'beginner' as const,
    totalLessons: 60,
    completedLessons: 60,
    lastAccessed: '2024-11-20',
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

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate course status
  const getStatus = (course: typeof mockEnrolledCourses[0]) => {
    const progress = Math.round((course.completedLessons / course.totalLessons) * 100);
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'not-started';
  };

  // Filter and sort courses
  const filteredCourses = mockEnrolledCourses
    .filter((course) => {
      if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterStatus !== 'all' && getStatus(course) !== filterStatus) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
        case 'progress':
          const progressA = a.completedLessons / a.totalLessons;
          const progressB = b.completedLessons / b.totalLessons;
          return progressB - progressA;
        case 'expiring':
          return a.daysLeft - b.daysLeft;
        default:
          return 0;
      }
    });

  const inProgress = mockEnrolledCourses.filter((c) => getStatus(c) === 'in-progress').length;
  const completed = mockEnrolledCourses.filter((c) => getStatus(c) === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground">
            {mockEnrolledCourses.length} courses enrolled
          </p>
        </div>
        <Button asChild>
          <Link href="/courses">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse More Courses
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{mockEnrolledCourses.length}</p>
            <p className="text-sm text-muted-foreground">Total Enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{inProgress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
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
            placeholder="Search your courses..."
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
            <SelectItem value="all">All Courses</SelectItem>
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
            <SelectItem value="recent">Recently Accessed</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
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

      {/* Courses */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No courses found
            </h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : "You haven't enrolled in any courses yet"}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CourseCard {...course} variant="enrolled" />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course, index) => {
            const progress = Math.round((course.completedLessons / course.totalLessons) * 100);
            const status = getStatus(course);
            return (
              <motion.div
                key={course.id}
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
                          <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                        <Badge className={`absolute left-3 top-3 ${categoryColors[course.category]}`}>
                          {course.category}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-foreground line-clamp-1">
                              {course.title}
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
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {course.shortDescription}
                          </p>
                        </div>

                        <div className="mt-4 space-y-3">
                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium text-foreground">
                                {course.completedLessons}/{course.totalLessons} lessons
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{course.daysLeft} days left</span>
                            </div>
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/courses/${course.id}`}>
                                <Play className="mr-1 h-3 w-3" />
                                {progress > 0 ? 'Continue' : 'Start'}
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
