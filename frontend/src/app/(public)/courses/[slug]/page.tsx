'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
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
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface Subject {
  _id: string;
  title: string;
  chapters: {
    _id: string;
    title: string;
    lessons: number;
  }[];
}

interface Course {
  _id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description: string;
  thumbnail?: string;
  examCategory: string;
  price: number;
  discountPrice?: number;
  validityDays: number;
  language: 'hi' | 'en' | 'both';
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  ratingCount: number;
  enrollmentCount: number;
  totalLessons: number;
  totalDuration: number;
  isFree: boolean;
  features: string[];
  subjects: Subject[];
}

const categoryColors: Record<string, string> = {
  RAS: 'bg-indigo-100 text-indigo-700',
  REET: 'bg-emerald-100 text-emerald-700',
  PATWAR: 'bg-amber-100 text-amber-700',
  POLICE: 'bg-slate-100 text-slate-700',
  RPSC: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchCourse();
  }, [params.slug]);

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/store/courses/${params.slug}`
      );
      const data = await res.json();

      if (data.success) {
        setCourse(data.data);
        if (data.data.subjects?.length > 0) {
          setExpandedSubjects([data.data.subjects[0]._id]);
        }
      } else {
        toast.error('Course not found');
        router.push('/courses');
      }
    } catch (error) {
      toast.error('Failed to load course');
      router.push('/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const hasDiscount = course?.discountPrice && course.discountPrice < course.price;
  const discountPercent = hasDiscount
    ? Math.round(((course!.price - course!.discountPrice!) / course!.price) * 100)
    : 0;

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${params.slug}`);
      return;
    }

    if (!course) return;

    // If course is free, directly enroll
    if (course.isFree) {
      toast.success('Enrolled successfully!');
      router.push('/dashboard/courses');
      return;
    }

    setIsPurchasing(true);

    try {
      const token = localStorage.getItem('accessToken');

      // Create order
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: course._id,
          itemType: 'course',
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error?.message || 'Failed to create order');
      }

      const { razorpayOrderId, amount, currency, paymentId } = orderData.data;

      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'SiviAcademy',
        description: course.title,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          // Verify payment
          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success('Payment successful! You are now enrolled.');
              router.push('/dashboard/courses');
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#6366F1',
        },
        modal: {
          ondismiss: () => {
            setIsPurchasing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

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
                <Badge className={categoryColors[course.examCategory] || categoryColors.OTHER}>
                  {course.examCategory}
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
              </div>

              <h1 className="mt-4 text-3xl font-bold md:text-4xl">{course.title}</h1>
              {course.shortDescription && (
                <p className="mt-3 text-lg text-slate-300">{course.shortDescription}</p>
              )}

              {/* Meta Info */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-white">{course.rating.toFixed(1)}</span>
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
              {course.features && course.features.length > 0 && (
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
              )}
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
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleBuyNow}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <ShoppingCart className="mr-2 h-5 w-5" />
                    )}
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
          <Button size="lg" onClick={handleBuyNow} disabled={isPurchasing}>
            {isPurchasing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : null}
            {course.isFree ? 'Enroll Now' : 'Buy Now'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-8">
            {/* Features (Mobile) */}
            {course.features && course.features.length > 0 && (
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
            )}

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
            {course.subjects && course.subjects.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Course Curriculum
                  </h2>
                  <div className="space-y-3">
                    {course.subjects.map((subject) => (
                      <div
                        key={subject._id}
                        className="rounded-lg border border-border overflow-hidden"
                      >
                        <button
                          className="flex w-full items-center justify-between bg-muted/50 p-4 text-left transition-colors hover:bg-muted"
                          onClick={() => toggleSubject(subject._id)}
                        >
                          <div>
                            <h3 className="font-medium text-foreground">
                              {subject.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {subject.chapters?.length || 0} chapters
                            </p>
                          </div>
                          {expandedSubjects.includes(subject._id) ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>

                        {expandedSubjects.includes(subject._id) && subject.chapters && (
                          <div className="divide-y divide-border">
                            {subject.chapters.map((chapter) => (
                              <div
                                key={chapter._id}
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
            )}

            {/* Reviews */}
            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    Student Reviews
                  </h2>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-semibold">{course.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({course.ratingCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
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
