'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FileText, Users, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TestSeriesCardProps {
  id: string;
  title: string;
  shortDescription?: string;
  thumbnail?: string;
  category: string;
  price: number;
  discountPrice?: number;
  validityDays: number;
  language: 'hi' | 'en' | 'both';
  totalExams: number;
  freeExams?: number;
  rating?: number;
  ratingCount?: number;
  enrollmentCount?: number;
  isFree?: boolean;
  isEnrolled?: boolean;
  examsAttempted?: number;
  daysLeft?: number;
  variant?: 'shop' | 'enrolled';
}

const categoryColors: Record<string, string> = {
  RAS: 'bg-indigo-100 text-indigo-700',
  REET: 'bg-emerald-100 text-emerald-700',
  PATWAR: 'bg-amber-100 text-amber-700',
  POLICE: 'bg-slate-100 text-slate-700',
  RPSC: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

export function TestSeriesCard({
  id,
  title,
  shortDescription,
  thumbnail,
  category,
  price,
  discountPrice,
  validityDays,
  language,
  totalExams,
  freeExams = 0,
  rating = 0,
  ratingCount = 0,
  enrollmentCount = 0,
  isFree = false,
  isEnrolled = false,
  examsAttempted = 0,
  daysLeft,
  variant = 'shop',
}: TestSeriesCardProps) {
  const href = variant === 'enrolled'
    ? `/dashboard/test-series/${id}`
    : `/test-series/${id}`;
  const hasDiscount = discountPrice && discountPrice < price;
  const progress = totalExams > 0 ? Math.round((examsAttempted / totalExams) * 100) : 0;

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* Thumbnail */}
      <Link href={href} className="block relative aspect-video overflow-hidden bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        {/* Category Badge */}
        <Badge
          className={cn(
            'absolute left-3 top-3',
            categoryColors[category] || categoryColors.OTHER
          )}
        >
          {category}
        </Badge>
        {/* Free Badge */}
        {isFree && (
          <Badge className="absolute right-3 top-3 bg-emerald-500 text-white">
            FREE
          </Badge>
        )}
        {/* Free Exams Badge */}
        {!isFree && freeExams > 0 && (
          <Badge className="absolute right-3 top-3 bg-amber-500 text-white">
            {freeExams} Free Tests
          </Badge>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Link href={href}>
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {/* Description */}
        {shortDescription && variant === 'shop' && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {shortDescription}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            <span>{totalExams} tests</span>
          </div>
          {enrollmentCount > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{enrollmentCount.toLocaleString()}</span>
            </div>
          )}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{validityDays} days</span>
          </div>
        </div>

        {/* Progress (for enrolled) */}
        {variant === 'enrolled' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-medium text-foreground">
                {examsAttempted}/{totalExams} tests
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            {daysLeft !== undefined && (
              <p className="text-xs text-muted-foreground">
                {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
              </p>
            )}
          </div>
        )}

        {/* Price & CTA (for shop) */}
        {variant === 'shop' && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-baseline gap-2">
              {isFree ? (
                <span className="text-lg font-bold text-emerald-600">Free</span>
              ) : (
                <>
                  <span className="text-lg font-bold text-foreground">
                    ₹{hasDiscount ? discountPrice : price}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{price}
                    </span>
                  )}
                </>
              )}
            </div>
            <Button size="sm" asChild>
              <Link href={href}>View Details</Link>
            </Button>
          </div>
        )}

        {/* Continue Button (for enrolled) */}
        {variant === 'enrolled' && (
          <Button className="w-full" asChild>
            <Link href={href}>
              {examsAttempted > 0 ? 'Continue Tests' : 'Start Tests'}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
