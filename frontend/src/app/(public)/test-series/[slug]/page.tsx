'use client';

import { useState, useEffect } from 'react';
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
  Play,
  Lock,
  Globe,
  Award,
  Target,
  BarChart3,
  Shield,
  Share2,
  Heart,
  Loader2,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { paymentApi } from '@/lib/api';

interface Exam {
  _id: string;
  title: string;
  questions: number;
  duration: number;
  isFree: boolean;
  difficulty: string;
}

interface TestSeries {
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
  totalExams: number;
  freeExams: number;
  rating: number;
  ratingCount: number;
  enrollmentCount: number;
  isFree: boolean;
  features: string[];
  exams: Exam[];
}

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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function TestSeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [testSeries, setTestSeries] = useState<TestSeries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<{
    isEnrolled: boolean;
    enrollment: any | null;
  } | null>(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  useEffect(() => {
    fetchTestSeries();
  }, [params.slug]);

  useEffect(() => {
    if (testSeries && isAuthenticated) {
      checkEnrollment();
    }
  }, [testSeries, isAuthenticated]);

  const fetchTestSeries = async () => {
    // Validate slug parameter before making API call
    if (!params?.slug || typeof params.slug !== 'string') {
      toast.error('Invalid test series');
      router.push('/test-series');
      return;
    }

    setIsLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/store/test-series/${params.slug}`;
      console.log('Fetching test series from:', url);

      const res = await fetch(url);
      console.log('Response status:', res.status);

      const data = await res.json();
      console.log('Response data:', data);

      if (data.success) {
        setTestSeries(data.data);
      } else {
        console.error('Test series fetch failed:', data);
        toast.error(data.error?.message || 'Test series not found');
        router.push('/test-series');
      }
    } catch (error) {
      console.error('Test series fetch error:', error);
      toast.error('Failed to load test series');
      router.push('/test-series');
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!testSeries) return;

    setCheckingEnrollment(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setEnrollmentStatus({ isEnrolled: false, enrollment: null });
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/learn/check-enrollment?itemId=${testSeries._id}&itemType=test_series`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setEnrollmentStatus(data.data);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
      setEnrollmentStatus({ isEnrolled: false, enrollment: null });
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const hasDiscount = testSeries?.discountPrice && testSeries.discountPrice < testSeries.price;
  const discount = hasDiscount
    ? Math.round(((testSeries!.price - testSeries!.discountPrice!) / testSeries!.price) * 100)
    : 0;

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/test-series/${params.slug}`);
      return;
    }

    if (!testSeries) return;

    if (testSeries.isFree) {
      toast.success('Enrolled successfully!');
      router.push('/dashboard/test-series');
      return;
    }

    setIsPurchasing(true);

    try {
      // Create order using paymentApi (handles token refresh automatically)
      const { data: orderData } = await paymentApi.createOrder('test_series', testSeries._id);

      if (!orderData.success) {
        throw new Error(orderData.error?.message || 'Failed to create order');
      }

      const { razorpayOrderId, amount, currency, orderId } = orderData.data;

      // Validate Razorpay key
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        console.error('Razorpay key is not configured');
        toast.error('Payment system is not configured. Please contact support.');
        setIsPurchasing(false);
        return;
      }

      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const options = {
        key: razorpayKeyId,
        amount: amount,
        currency: currency,
        name: 'SiviAcademy',
        description: testSeries.title,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          // Verify payment using paymentApi (handles token refresh automatically)
          try {
            const { data: verifyData } = await paymentApi.verifyPayment({
              orderId: orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyData.success) {
              toast.success('Payment successful! Redirecting to your test series...');
              // Wait briefly for backend to sync
              setTimeout(() => {
                router.push('/dashboard/test-series');
              }, 1000);
            } else {
              // Show specific error message from backend
              const errorMessage = verifyData.error?.message || verifyData.message || 'Payment verification failed';
              toast.error(errorMessage);
              console.error('Payment verification error:', verifyData);
            }
          } catch (error) {
            console.error('Payment verification exception:', error);
            toast.error('Unable to verify payment. Please contact support with your order ID.');
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

  const handleStartFreeTest = (examId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/test-series/${params.slug}`);
      return;
    }
    router.push(`/exam/${examId}/start`);
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

  if (!testSeries) {
    return null;
  }

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
              <Badge className={cn('mb-4', categoryColors[testSeries.examCategory])}>
                {testSeries.examCategory}
              </Badge>

              <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">
                {testSeries.title}
              </h1>

              {testSeries.shortDescription && (
                <p className="mt-4 text-lg text-slate-300">
                  {testSeries.shortDescription}
                </p>
              )}

              {/* Stats */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-white">{testSeries.rating.toFixed(1)}</span>
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
                    {testSeries.isFree ? (
                      <span className="text-3xl font-bold text-emerald-600">Free</span>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="mt-6 space-y-3">
                    {enrollmentStatus?.isEnrolled ? (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => router.push('/dashboard/test-series')}
                      >
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Go to Dashboard
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handlePurchase}
                        disabled={isPurchasing || checkingEnrollment}
                      >
                        {isPurchasing || checkingEnrollment ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <ShoppingCart className="mr-2 h-5 w-5" />
                        )}
                        {checkingEnrollment
                          ? 'Checking...'
                          : testSeries.isFree
                          ? 'Enroll Now'
                          : 'Buy Now'}
                      </Button>
                    )}
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
                  {testSeries.features && testSeries.features.length > 0 && (
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
                  )}

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
            {testSeries.isFree ? (
              <span className="text-xl font-bold text-emerald-600">Free</span>
            ) : (
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
            )}
            <p className="text-xs text-muted-foreground">{testSeries.validityDays} days access</p>
          </div>
          {enrollmentStatus?.isEnrolled ? (
            <Button size="lg" onClick={() => router.push('/dashboard/test-series')}>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
          ) : (
            <Button size="lg" onClick={handlePurchase} disabled={isPurchasing || checkingEnrollment}>
              {isPurchasing || checkingEnrollment ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              {checkingEnrollment
                ? 'Checking...'
                : testSeries.isFree
                ? 'Enroll Now'
                : 'Buy Now'}
            </Button>
          )}
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
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* Tests Tab */}
              <TabsContent value="tests" className="mt-6">
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    {/* Exam list removed - exams will be created later by admin */}
                    Tests will be available after purchase. Admin will create the exam content.
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Description */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-foreground">About This Test Series</h3>
                    <div
                      className="prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: testSeries.description }}
                    />
                  </CardContent>
                </Card>

                {/* Features Grid */}
                {testSeries.features && testSeries.features.length > 0 && (
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
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    {/* Rating Summary */}
                    <div className="mb-6 flex items-center gap-6 border-b border-border pb-6">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-foreground">{testSeries.rating.toFixed(1)}</p>
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
