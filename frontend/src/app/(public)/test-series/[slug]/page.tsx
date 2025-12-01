'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  Users,
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Play,
  Lock,
  Globe,
  Award,
  Target,
  BarChart3,
  Shield,
  ArrowLeft,
  Share2,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with API
const mockTestSeriesData = {
  id: '1',
  title: 'RAS Prelims Mock Test Series 2024',
  slug: 'ras-prelims-mock-test-series-2024',
  shortDescription: 'Complete mock test series for RAS Prelims with detailed solutions and performance analysis.',
  longDescription: `Prepare for RAS Prelims 2024 with our comprehensive mock test series designed by subject matter experts and previous RAS toppers.

This test series includes full-length mock tests following the exact exam pattern, along with subject-wise practice tests to strengthen your weak areas. Each test comes with detailed solutions and performance analysis to help you track your progress.`,
  thumbnail: '',
  category: 'RAS',
  price: 1499,
  discountPrice: 999,
  validityDays: 180,
  language: 'both' as 'hi' | 'en' | 'both',
  totalExams: 25,
  freeExams: 3,
  rating: 4.9,
  ratingCount: 2100,
  enrollmentCount: 8500,
  isFree: false,
  features: [
    '25 Full-length Mock Tests',
    '3 Free Practice Tests',
    'Detailed Solutions & Explanations',
    'Performance Analytics Dashboard',
    'All India Rank Comparison',
    'Topic-wise Analysis',
    'Previous Year Pattern Based',
    '24/7 Access on All Devices',
  ],
  exams: [
    {
      id: 'e1',
      title: 'Free: Rajasthan GK Practice Test',
      questions: 50,
      duration: 60,
      isFree: true,
      difficulty: 'easy',
    },
    {
      id: 'e2',
      title: 'Free: Indian Polity Practice Test',
      questions: 50,
      duration: 60,
      isFree: true,
      difficulty: 'medium',
    },
    {
      id: 'e3',
      title: 'Free: General Science Practice Test',
      questions: 50,
      duration: 60,
      isFree: true,
      difficulty: 'easy',
    },
    {
      id: 'e4',
      title: 'RAS Prelims Full Mock Test 1',
      questions: 150,
      duration: 180,
      isFree: false,
      difficulty: 'medium',
    },
    {
      id: 'e5',
      title: 'RAS Prelims Full Mock Test 2',
      questions: 150,
      duration: 180,
      isFree: false,
      difficulty: 'medium',
    },
    {
      id: 'e6',
      title: 'RAS Prelims Full Mock Test 3',
      questions: 150,
      duration: 180,
      isFree: false,
      difficulty: 'hard',
    },
    {
      id: 'e7',
      title: 'Rajasthan History Sectional Test',
      questions: 75,
      duration: 90,
      isFree: false,
      difficulty: 'medium',
    },
    {
      id: 'e8',
      title: 'Rajasthan Geography Sectional Test',
      questions: 75,
      duration: 90,
      isFree: false,
      difficulty: 'medium',
    },
    {
      id: 'e9',
      title: 'Indian Economy Practice Test',
      questions: 50,
      duration: 60,
      isFree: false,
      difficulty: 'medium',
    },
    {
      id: 'e10',
      title: 'Current Affairs Monthly Test - Dec 2024',
      questions: 50,
      duration: 45,
      isFree: false,
      difficulty: 'easy',
    },
  ],
  stats: {
    avgScore: 68,
    highestScore: 145,
    passPercentage: 72,
    avgTimePerQuestion: 58,
  },
  reviews: [
    {
      id: 'r1',
      user: 'Rajendra Singh',
      rating: 5,
      comment: 'Excellent test series! Questions are very close to actual RAS exam pattern. Detailed solutions helped me understand concepts better.',
      date: '2024-11-28',
    },
    {
      id: 'r2',
      user: 'Priya Sharma',
      rating: 5,
      comment: 'Best test series for RAS preparation. Performance analytics really helped me identify my weak areas.',
      date: '2024-11-25',
    },
    {
      id: 'r3',
      user: 'Amit Kumar',
      rating: 4,
      comment: 'Good quality questions. Would recommend to all RAS aspirants. UI could be improved a bit.',
      date: '2024-11-20',
    },
  ],
  instructor: {
    name: 'Team SiviAcademy',
    bio: 'Expert faculty team with 10+ years of experience in competitive exam preparation',
  },
};

const categoryColors: Record<string, string> = {
  RAS: 'bg-indigo-100 text-indigo-700',
  REET: 'bg-emerald-100 text-emerald-700',
  PATWAR: 'bg-amber-100 text-amber-700',
  POLICE: 'bg-slate-100 text-slate-700',
  RPSC: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

const difficultyColors: Record<string, string> = {
  easy: 'text-emerald-600',
  medium: 'text-amber-600',
  hard: 'text-red-600',
};

export default function TestSeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // In real app, fetch test series data based on slug
  const testSeries = mockTestSeriesData;
  const hasDiscount = testSeries.discountPrice && testSeries.discountPrice < testSeries.price;
  const discount = hasDiscount
    ? Math.round(((testSeries.price - testSeries.discountPrice!) / testSeries.price) * 100)
    : 0;

  const handlePurchase = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/test-series/${params.slug}`);
      return;
    }
    // Handle purchase flow
    router.push(`/checkout/test-series/${testSeries.id}`);
  };

  const handleStartFreeTest = (examId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/test-series/${params.slug}`);
      return;
    }
    router.push(`/exam/${examId}/start`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/test-series" className="hover:text-foreground">
              Test Series
            </Link>
            <span>/</span>
            <span className="text-foreground">{testSeries.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* Left Content */}
            <div className="flex-1 text-white">
              <Badge className={cn('mb-4', categoryColors[testSeries.category])}>
                {testSeries.category}
              </Badge>

              <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">
                {testSeries.title}
              </h1>

              <p className="mt-4 text-lg text-slate-300">
                {testSeries.shortDescription}
              </p>

              {/* Stats */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-white">{testSeries.rating}</span>
                  <span>({testSeries.ratingCount.toLocaleString()} ratings)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{testSeries.enrollmentCount.toLocaleString()} enrolled</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{testSeries.totalExams} tests</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{testSeries.validityDays} days validity</span>
                </div>
              </div>

              {/* Language */}
              <div className="mt-4 flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-300">
                  {testSeries.language === 'hi' ? 'Hindi' : testSeries.language === 'en' ? 'English' : 'Hindi & English'}
                </span>
              </div>

              {/* Instructor */}
              <div className="mt-4 text-sm text-slate-300">
                Created by <span className="font-medium text-white">{testSeries.instructor.name}</span>
              </div>
            </div>

            {/* Right - Pricing Card (Desktop) */}
            <div className="hidden w-[380px] shrink-0 lg:block">
              <Card className="sticky top-24 overflow-hidden">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted">
                  {testSeries.thumbnail ? (
                    <Image
                      src={testSeries.thumbnail}
                      alt={testSeries.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                  {testSeries.freeExams > 0 && (
                    <Badge className="absolute right-3 top-3 bg-amber-500">
                      {testSeries.freeExams} Free Tests
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-foreground">
                      ₹{hasDiscount ? testSeries.discountPrice : testSeries.price}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-lg text-muted-foreground line-through">
                          ₹{testSeries.price}
                        </span>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          {discount}% off
                        </Badge>
                      </>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="mt-6 space-y-3">
                    <Button className="w-full" size="lg" onClick={handlePurchase}>
                      Buy Now
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsWishlisted(!isWishlisted)}
                      >
                        <Heart
                          className={cn(
                            'mr-2 h-4 w-4',
                            isWishlisted && 'fill-red-500 text-red-500'
                          )}
                        />
                        Wishlist
                      </Button>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-6 space-y-3 border-t border-border pt-6">
                    <h4 className="font-semibold text-foreground">This test series includes:</h4>
                    <ul className="space-y-2">
                      {testSeries.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Guarantee */}
                  <div className="mt-6 flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">30-day money-back guarantee</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Purchase Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">
                ₹{hasDiscount ? testSeries.discountPrice : testSeries.price}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{testSeries.price}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{testSeries.validityDays} days access</p>
          </div>
          <Button size="lg" onClick={handlePurchase}>
            Buy Now
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <Tabs defaultValue="tests" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="tests">Tests</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* Tests Tab */}
              <TabsContent value="tests" className="mt-6">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {testSeries.exams.map((exam, index) => (
                        <motion.div
                          key={exam.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-lg',
                              exam.isFree ? 'bg-emerald-100' : 'bg-slate-100'
                            )}>
                              {exam.isFree ? (
                                <Play className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <Lock className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">
                                {exam.title}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{exam.questions} Questions</span>
                                <span>{exam.duration} mins</span>
                                <span className={difficultyColors[exam.difficulty]}>
                                  {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {exam.isFree ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartFreeTest(exam.id)}
                            >
                              Start Free
                            </Button>
                          ) : (
                            <Badge variant="secondary">Locked</Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Description */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-foreground">About This Test Series</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      {testSeries.longDescription.split('\n\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Features Grid */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-foreground">What You Get</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {testSeries.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-lg font-semibold text-foreground">Test Series Statistics</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                          <Target className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{testSeries.stats.avgScore}%</p>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                      </div>
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                          <Award className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{testSeries.stats.highestScore}</p>
                        <p className="text-sm text-muted-foreground">Highest Score</p>
                      </div>
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                          <BarChart3 className="h-6 w-6 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{testSeries.stats.passPercentage}%</p>
                        <p className="text-sm text-muted-foreground">Pass Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                          <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{testSeries.stats.avgTimePerQuestion}s</p>
                        <p className="text-sm text-muted-foreground">Avg Time/Question</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    {/* Rating Summary */}
                    <div className="mb-6 flex items-center gap-6 border-b border-border pb-6">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-foreground">{testSeries.rating}</p>
                        <div className="mt-1 flex items-center justify-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'h-4 w-4',
                                star <= Math.round(testSeries.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground'
                              )}
                            />
                          ))}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {testSeries.ratingCount.toLocaleString()} ratings
                        </p>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6">
                      {testSeries.reviews.map((review) => (
                        <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-foreground">{review.user}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={cn(
                                        'h-3 w-3',
                                        star <= review.rating
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-muted-foreground'
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="mt-3 text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Sidebar - Empty for spacing */}
          <div className="hidden w-[380px] shrink-0 lg:block" />
        </div>
      </div>
    </div>
  );
}
