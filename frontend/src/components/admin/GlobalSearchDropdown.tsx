'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, BookOpen, FileText, Users, HelpCircle, CreditCard, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SearchResults {
  courses?: Array<{
    _id: string;
    title: string;
    isPublished: boolean;
    examCategory: string;
  }>;
  testSeries?: Array<{
    _id: string;
    title: string;
    isPublished: boolean;
    examCategory: string;
  }>;
  users?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  questions?: Array<{
    _id: string;
    question: string;
    subject: string;
  }>;
  payments?: Array<{
    _id: string;
    razorpayOrderId: string;
    amount: number;
    status: string;
    user?: { name: string };
  }>;
  totalResults: number;
}

interface GlobalSearchDropdownProps {
  className?: string;
}

export function GlobalSearchDropdown({ className }: GlobalSearchDropdownProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setResults(data.data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        search(query);
      }, 300);
    } else {
      setResults(null);
      setIsOpen(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'courses':
        return <BookOpen className="h-4 w-4" />;
      case 'testSeries':
        return <FileText className="h-4 w-4" />;
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'questions':
        return <HelpCircle className="h-4 w-4" />;
      case 'payments':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'courses':
        return 'Courses';
      case 'testSeries':
        return 'Test Series';
      case 'users':
        return 'Users';
      case 'questions':
        return 'Questions';
      case 'payments':
        return 'Payments';
      default:
        return category;
    }
  };

  const getCategoryLink = (category: string, id: string) => {
    switch (category) {
      case 'courses':
        return `/admin/content/courses/${id}`;
      case 'testSeries':
        return `/admin/content/test-series/${id}`;
      case 'users':
        return `/admin/users/${id}`;
      case 'questions':
        return `/admin/question-bank`;
      case 'payments':
        return `/admin/payments/${id}`;
      default:
        return '#';
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search courses, tests, users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setIsOpen(true)}
          className="w-full pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {!isLoading && query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results && (
        <div className="absolute top-full left-0 right-0 mt-2 max-h-[400px] overflow-y-auto rounded-lg border bg-card shadow-lg z-50">
          {results.totalResults === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="p-2">
              {/* Courses */}
              {results.courses && results.courses.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                    {getCategoryIcon('courses')}
                    {getCategoryLabel('courses')}
                  </div>
                  {results.courses.map((course) => (
                    <Link
                      key={course._id}
                      href={getCategoryLink('courses', course._id)}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <BookOpen className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.examCategory} • {course.isPublished ? 'Published' : 'Draft'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Test Series */}
              {results.testSeries && results.testSeries.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                    {getCategoryIcon('testSeries')}
                    {getCategoryLabel('testSeries')}
                  </div>
                  {results.testSeries.map((ts) => (
                    <Link
                      key={ts._id}
                      href={getCategoryLink('testSeries', ts._id)}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <FileText className="h-4 w-4 text-orange-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ts.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ts.examCategory} • {ts.isPublished ? 'Published' : 'Draft'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Users */}
              {results.users && results.users.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                    {getCategoryIcon('users')}
                    {getCategoryLabel('users')}
                  </div>
                  {results.users.map((user) => (
                    <Link
                      key={user._id}
                      href={getCategoryLink('users', user._id)}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <Users className="h-4 w-4 text-green-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Questions */}
              {results.questions && results.questions.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                    {getCategoryIcon('questions')}
                    {getCategoryLabel('questions')}
                  </div>
                  {results.questions.map((q) => (
                    <Link
                      key={q._id}
                      href={getCategoryLink('questions', q._id)}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <HelpCircle className="h-4 w-4 text-purple-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{q.question}</p>
                        <p className="text-xs text-muted-foreground">{q.subject}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Payments */}
              {results.payments && results.payments.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                    {getCategoryIcon('payments')}
                    {getCategoryLabel('payments')}
                  </div>
                  {results.payments.map((payment) => (
                    <Link
                      key={payment._id}
                      href={getCategoryLink('payments', payment._id)}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <CreditCard className="h-4 w-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {payment.user?.name || 'Unknown'} - ₹{payment.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.razorpayOrderId} • {payment.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
