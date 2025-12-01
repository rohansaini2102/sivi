'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Trophy,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  BookOpen,
  Calendar,
  ChevronRight,
  BarChart3,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

// Mock performance data
const overallStats = {
  totalTests: 38,
  avgScore: 72,
  bestScore: 92,
  totalTime: '48h 30m',
  rank: 1250,
  percentile: 85,
  improvement: 12,
};

const subjectPerformance = [
  { subject: 'Rajasthan GK', score: 85, tests: 12, trend: 'up' },
  { subject: 'Indian Polity', score: 78, tests: 8, trend: 'up' },
  { subject: 'Indian History', score: 72, tests: 7, trend: 'stable' },
  { subject: 'Geography', score: 68, tests: 6, trend: 'down' },
  { subject: 'Economics', score: 65, tests: 5, trend: 'up' },
];

const recentTests = [
  {
    id: '1',
    title: 'RAS Prelims Mock Test 8',
    category: 'RAS',
    score: 85,
    maxScore: 100,
    rank: 245,
    date: '2024-11-30',
    duration: '2h 45m',
    status: 'passed',
  },
  {
    id: '2',
    title: 'Rajasthan History Sectional',
    category: 'RAS',
    score: 72,
    maxScore: 100,
    rank: 520,
    date: '2024-11-28',
    duration: '1h 20m',
    status: 'passed',
  },
  {
    id: '3',
    title: 'REET Level 1 Mock Test 15',
    category: 'REET',
    score: 68,
    maxScore: 100,
    rank: 890,
    date: '2024-11-26',
    duration: '2h 30m',
    status: 'passed',
  },
  {
    id: '4',
    title: 'Indian Polity Practice Test',
    category: 'RAS',
    score: 45,
    maxScore: 100,
    rank: 1200,
    date: '2024-11-24',
    duration: '55m',
    status: 'failed',
  },
  {
    id: '5',
    title: 'Patwar Full Mock Test 12',
    category: 'PATWAR',
    score: 92,
    maxScore: 100,
    rank: 45,
    date: '2024-11-22',
    duration: '1h 45m',
    status: 'passed',
  },
];

const weeklyProgress = [
  { week: 'Week 1', tests: 5, avgScore: 62 },
  { week: 'Week 2', tests: 8, avgScore: 68 },
  { week: 'Week 3', tests: 10, avgScore: 72 },
  { week: 'Week 4', tests: 15, avgScore: 78 },
];

const achievements = [
  { id: '1', title: 'First Test', description: 'Complete your first test', earned: true, date: '2024-10-15' },
  { id: '2', title: 'Perfect Score', description: 'Score 100% on any test', earned: false },
  { id: '3', title: 'Top 100', description: 'Rank in top 100', earned: true, date: '2024-11-22' },
  { id: '4', title: 'Consistent Learner', description: 'Complete 7 tests in a week', earned: true, date: '2024-11-20' },
  { id: '5', title: 'Subject Master', description: 'Score 90%+ in 5 tests of same subject', earned: false },
];

const categoryColors: Record<string, string> = {
  RAS: 'bg-indigo-100 text-indigo-700',
  REET: 'bg-emerald-100 text-emerald-700',
  PATWAR: 'bg-amber-100 text-amber-700',
  POLICE: 'bg-slate-100 text-slate-700',
  RPSC: 'bg-purple-100 text-purple-700',
};

export default function PerformancePage() {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance</h1>
          <p className="text-muted-foreground">Track your progress and improve</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tests Completed</p>
                  <p className="text-2xl font-bold text-foreground">{overallStats.totalTests}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-foreground">{overallStats.avgScore}%</p>
                    <span className="flex items-center text-xs text-emerald-600">
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      +{overallStats.improvement}%
                    </span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Best Score</p>
                  <p className="text-2xl font-bold text-foreground">{overallStats.bestScore}%</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <Trophy className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Percentile</p>
                  <p className="text-2xl font-bold text-foreground">{overallStats.percentile}th</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subject Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Subject-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance.map((subject, index) => (
                <motion.div
                  key={subject.subject}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{subject.subject}</span>
                      {subject.trend === 'up' && (
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      )}
                      {subject.trend === 'down' && (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{subject.tests} tests</span>
                      <span className="font-medium text-foreground">{subject.score}%</span>
                    </div>
                  </div>
                  <Progress value={subject.score} className="h-2" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Achievements</CardTitle>
              <Badge variant="secondary">
                {achievements.filter((a) => a.earned).length}/{achievements.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {achievements.slice(0, 4).map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-4 ${
                    !achievement.earned ? 'opacity-50' : ''
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      achievement.earned ? 'bg-amber-100' : 'bg-muted'
                    }`}
                  >
                    <Award
                      className={`h-5 w-5 ${
                        achievement.earned ? 'text-amber-600' : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.earned && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      Earned
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Test Results</CardTitle>
            <Link
              href="/dashboard/test-series"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentTests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                      test.status === 'passed' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}
                  >
                    <span
                      className={`text-lg font-bold ${
                        test.status === 'passed' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {test.score}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{test.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge className={categoryColors[test.category]} variant="secondary">
                        {test.category}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {test.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {test.duration}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <p className="text-muted-foreground">Rank</p>
                    <p className="font-medium text-foreground">#{test.rank}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/exam/${test.id}/result`}>View Result</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {weeklyProgress.map((week, index) => (
              <motion.div
                key={week.week}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-border p-4 text-center"
              >
                <p className="text-sm font-medium text-muted-foreground">{week.week}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{week.avgScore}%</p>
                <p className="text-xs text-muted-foreground">{week.tests} tests</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
