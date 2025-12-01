'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  Star,
  PlayCircle,
  BookOpen,
  Check,
  Globe,
  Award,
  ChevronDown,
  ChevronUp,
  Lock,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/authStore';

// Mock data - will be replaced with API calls
const mockCourse = {
  id: '1',
  slug: 'ras-complete-course-2024',
  title: 'RAS Complete Course 2024',
  shortDescription: 'Comprehensive preparation for Rajasthan Administrative Service exam with all subjects covered.',
  description: `
    <p>This comprehensive course is designed to help you prepare for the Rajasthan Administrative Service (RAS) examination. The course covers all subjects and topics as per the latest syllabus.</p>

    <h3>What you'll learn:</h3>
    <ul>
      <li>Complete coverage of General Knowledge</li>
      <li>Rajasthan History, Culture & Geography</li>
      <li>Indian History & Polity</li>
      <li>Economy & Current Affairs</li>
      <li>Science & Technology</li>
      <li>Reasoning & Mental Ability</li>
    </ul>

    <p>Our expert faculty provides detailed explanations with examples, practice questions, and regular assessments to track your progress.</p>
  `,
  thumbnail: '',
  category: 'RAS',
  price: 2999,
  discountPrice: 1999,
  validityDays: 365,
  language: 'both',
  level: 'intermediate',
  rating: 4.8,
  ratingCount: 1250,
  enrollmentCount: 5400,
  totalLessons: 180,
  totalDuration: 120, // hours
  isFree: false,
  isPublished: true,
  features: [
    '180+ Video Lessons',
    'Downloadable Study Material',
    '5000+ Practice Questions',
    'Live Doubt Sessions',
    '10 Full Mock Tests',
    'Certificate of Completion',
  ],
  subjects: [
    {
      id: 's1',
      title: 'General Knowledge',
      chapters: [
        { id: 'c1', title: 'Indian History', lessons: 15 },
        { id: 'c2', title: 'Indian Geography', lessons: 12 },
        { id: 'c3', title: 'Indian Polity', lessons: 18 },
        { id: 'c4', title: 'Indian Economy', lessons: 10 },
      ],
    },
    {
      id: 's2',
      title: 'Rajasthan GK',
      chapters: [
        { id: 'c5', title: 'Rajasthan History', lessons: 20 },
        { id: 'c6', title: 'Rajasthan Geography', lessons: 15 },
        { id: 'c7', title: 'Rajasthan Culture', lessons: 12 },
        { id: 'c8', title: 'Rajasthan Economy', lessons: 8 },
      ],
    },
    {
      id: 's3',
      title: 'Science & Technology',
      chapters: [
        { id: 'c9', title: 'General Science', lessons: 20 },
        { id: 'c10', title: 'Computer Knowledge', lessons: 10 },
        { id: 'c11', title: 'Current Technology', lessons: 8 },
      ],
    },
    {
      id: 's4',
      title: 'Reasoning & Mental Ability',
      chapters: [
        { id: 'c12', title: 'Logical Reasoning', lessons: 15 },
        { id: 'c13', title: 'Analytical Reasoning', lessons: 12 },
        { id: 'c14', title: 'Mental Ability', lessons: 10 },
      ],
    },
  ],
  reviews: [
    {
      id: 'r1',
      user: 'Rahul S.',
      rating: 5,
      comment: 'Excellent course! The content is comprehensive and well-structured.',
      date: '2 weeks ago',
    },
    {
      id: 'r2',
      user: 'Priya M.',
      rating: 4,
      comment: 'Very helpful for RAS preparation. Good explanations.',
      date: '1 month ago',
    },
  ],
};

const categoryColors: Record<string, string> = {
  RAS: 'bg-indigo-100 text-indigo-700',
  REET: 'bg-emerald-100 text-emerald-700',
  PATWAR: 'bg-amber-100 text-amber-700',
  POLICE: 'bg-slate-100 text-slate-700',
  RPSC: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>(['s1']);

  const course = mockCourse; // In real app, fetch based on params.slug
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  const discountPercent = hasDiscount
    ? Math.round(((course.price - course.discountPrice!) / course.price) * 100)
    : 0;

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${params.slug}`);
      return;
    }
    // Handle purchase flow
    console.log('Proceed to payment');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="border-b border-border bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            {/* Course Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge className={categoryColors[course.category] || categoryColors.OTHER}>
                  {course.category}
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
              </div>

              <h1 className="mt-4 text-3xl font-bold md:text-4xl">{course.title}</h1>
              <p className="mt-3 text-lg text-slate-300">{course.shortDescription}</p>

              {/* Meta Info */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-white">{course.rating}</span>
                  <span>({course.ratingCount.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.enrollmentCount.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.totalDuration} hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>
                    {course.language === 'hi'
                      ? 'Hindi'
                      : course.language === 'en'
                      ? 'English'
                      : 'Hindi & English'}
                  </span>
                </div>
              </div>

              {/* Features (Desktop) */}
              <div className="mt-8 hidden lg:block">
                <h3 className="mb-3 text-lg font-semibold">What you&apos;ll get:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {course.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-slate-300">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Card (Desktop) */}
            <div className="hidden w-[380px] shrink-0 lg:block">
              <Card className="sticky top-24 overflow-hidden border-0 shadow-xl">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-800">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <PlayCircle className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="gap-2 rounded-full"
                    >
                      <PlayCircle className="h-5 w-5" />
                      Preview Course
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Price */}
                  <div className="mb-4">
                    {course.isFree ? (
                      <span className="text-3xl font-bold text-emerald-600">Free</span>
                    ) : (
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-foreground">
                          ₹{hasDiscount ? course.discountPrice : course.price}
                        </span>
                        {hasDiscount && (
                          <>
                            <span className="text-lg text-muted-foreground line-through">
                              ₹{course.price}
                            </span>
                            <Badge variant="destructive">{discountPercent}% OFF</Badge>
                          </>
                        )}
                      </div>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {course.validityDays} days validity
                    </p>
                  </div>

                  {/* CTA */}
                  <Button className="w-full" size="lg" onClick={handleBuyNow}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {course.isFree ? 'Enroll Now' : 'Buy Now'}
                  </Button>

                  <Separator className="my-4" />

                  {/* Course Includes */}
                  <div className="space-y-3 text-sm">
                    <h4 className="font-semibold text-foreground">This course includes:</h4>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{course.totalDuration} hours of content</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Pricing Card */}
      <div className="sticky bottom-0 z-40 border-t border-border bg-card p-4 shadow-lg lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            {course.isFree ? (
              <span className="text-2xl font-bold text-emerald-600">Free</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  ₹{hasDiscount ? course.discountPrice : course.price}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{course.price}
                  </span>
                )}
              </div>
            )}
          </div>
          <Button size="lg" onClick={handleBuyNow}>
            {course.isFree ? 'Enroll Now' : 'Buy Now'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-8">
            {/* Features (Mobile) */}
            <Card className="lg:hidden">
              <CardContent className="p-5">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  What you&apos;ll get:
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {course.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  About This Course
                </h2>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </CardContent>
            </Card>

            {/* Curriculum */}
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Course Curriculum
                </h2>
                <div className="space-y-3">
                  {course.subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="rounded-lg border border-border overflow-hidden"
                    >
                      <button
                        className="flex w-full items-center justify-between bg-muted/50 p-4 text-left transition-colors hover:bg-muted"
                        onClick={() => toggleSubject(subject.id)}
                      >
                        <div>
                          <h3 className="font-medium text-foreground">
                            {subject.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {subject.chapters.length} chapters •{' '}
                            {subject.chapters.reduce((acc, ch) => acc + ch.lessons, 0)}{' '}
                            lessons
                          </p>
                        </div>
                        {expandedSubjects.includes(subject.id) ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>

                      {expandedSubjects.includes(subject.id) && (
                        <div className="divide-y divide-border">
                          {subject.chapters.map((chapter) => (
                            <div
                              key={chapter.id}
                              className="flex items-center justify-between p-4"
                            >
                              <div className="flex items-center gap-3">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">
                                  {chapter.title}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {chapter.lessons} lessons
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    Student Reviews
                  </h2>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-semibold">{course.rating}</span>
                    <span className="text-muted-foreground">
                      ({course.ratingCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="mb-6 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-8 text-sm text-muted-foreground">
                        {stars} ★
                      </span>
                      <Progress
                        value={stars === 5 ? 70 : stars === 4 ? 20 : 10}
                        className="h-2 flex-1"
                      />
                      <span className="w-10 text-right text-sm text-muted-foreground">
                        {stars === 5 ? '70%' : stars === 4 ? '20%' : '10%'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Review List */}
                <div className="space-y-4">
                  {course.reviews.map((review) => (
                    <div key={review.id} className="border-t border-border pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{review.user}</p>
                          <div className="mt-1 flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {review.date}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spacer for desktop pricing card */}
          <div className="hidden w-[380px] shrink-0 lg:block" />
        </div>
      </div>
    </div>
  );
}
