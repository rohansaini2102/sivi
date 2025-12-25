'use client';

import { useState, useEffect } from 'react';
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

// Define types for enrollment data
interface EnrollmentCourse {
  _id: string;
  title: string;
  category: string;
  thumbnail?: string;
}

interface CourseEnrollment {
  _id: string;
  course: EnrollmentCourse;
  progress: {
    completedLessons: string[];
    percentage: number;
  };
  validUntil: string;
  isActive: boolean;
}

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
  const [enrolledCourses, setEnrolledCourses] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrollments = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/learn/enrollments?itemType=course`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          // Filter out enrollments with null/deleted courses
          const validEnrollments = (data.data.enrollments || []).filter(
            (enrollment: CourseEnrollment) => enrollment.course != null
          );
          setEnrolledCourses(validEnrollments);
        } else {
          console.error('Failed to fetch enrollments:', data.error);
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  // Filter and calculate stats
  const filteredCourses = enrolledCourses.filter((enrollment) => {
    if (searchQuery && !enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus === 'in-progress' && enrollment.progress.percentage >= 100) {
      return false;
    }
    if (filterStatus === 'completed' && enrollment.progress.percentage < 100) {
      return false;
    }
    return true;
  });

  const inProgress = enrolledCourses.filter((e) => e.progress.percentage > 0 && e.progress.percentage < 100).length;
  const completed = enrolledCourses.filter((e) => e.progress.percentage >= 100).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground">
            {enrolledCourses.length} courses enrolled
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
            <p className="text-2xl font-bold text-foreground">{enrolledCourses.length}</p>
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
      {loading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading courses...</p>
          </CardContent>
        </Card>
      ) : filteredCourses.length === 0 ? (
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
          {filteredCourses.map((enrollment, index) => {
            const daysLeft = Math.ceil(
              (new Date(enrollment.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <motion.div
                key={enrollment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CourseCard
                  id={enrollment.course._id}
                  title={enrollment.course.title}
                  category={enrollment.course.category}
                  thumbnail={enrollment.course.thumbnail}
                  price={0}
                  validityDays={0}
                  language="both"
                  level="beginner"
                  variant="enrolled"
                  isEnrolled={true}
                  progress={enrollment.progress.percentage}
                  daysLeft={daysLeft}
                />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((enrollment, index) => {
            const progress = enrollment.progress.percentage;
            const completedCount = enrollment.progress.completedLessons.length;
            const daysLeft = Math.ceil(
              (new Date(enrollment.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            const status = progress >= 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started';

            return (
              <motion.div
                key={enrollment._id}
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
                        <Badge className={`absolute left-3 top-3 ${categoryColors[enrollment.course.category]}`}>
                          {enrollment.course.category}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-foreground line-clamp-1">
                              {enrollment.course.title}
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
                        </div>

                        <div className="mt-4 space-y-3">
                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium text-foreground">
                                {completedCount} lessons completed
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</span>
                            </div>
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/courses/${enrollment.course._id}`}>
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
