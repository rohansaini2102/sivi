'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  Users,
  Star,
  ChevronRight,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface FreeTest {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  examCategory: string;
  totalQuestions: number;
  duration: number;
  attemptCount: number;
  language: 'hi' | 'en' | 'both';
}

const categories = [
  { value: 'all', label: 'All Exams' },
  { value: 'RAS', label: 'RAS' },
  { value: 'REET', label: 'REET' },
  { value: 'PATWAR', label: 'Patwar' },
  { value: 'POLICE', label: 'Police' },
  { value: 'RPSC', label: 'RPSC' },
];

export default function FreeTestsPage() {
  const [tests, setTests] = useState<FreeTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchFreeTests = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          isFree: 'true',
          ...(searchQuery && { search: searchQuery }),
          ...(selectedCategory !== 'all' && { category: selectedCategory }),
        });

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store/test-series?${params}`);
        const data = await res.json();

        if (data.success) {
          setTests(data.data.testSeries || []);
        }
      } catch (error) {
        console.error('Failed to fetch free tests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchFreeTests, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedCategory]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      RAS: 'bg-purple-100 text-purple-700',
      REET: 'bg-amber-100 text-amber-700',
      PATWAR: 'bg-green-100 text-green-700',
      POLICE: 'bg-red-100 text-red-700',
      RPSC: 'bg-blue-100 text-blue-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge className="bg-white/20 text-white mb-4">100% Free</Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Free Mock Tests
              </h1>
              <p className="text-lg text-green-100 mb-8">
                Experience our exam-quality mock tests at no cost. Practice with real exam patterns
                for RAS, REET, Patwar, Police & all RPSC exams.
              </p>

              {/* Search */}
              <div className="max-w-xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search free tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-white text-gray-900"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b bg-white sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Filter className="w-4 h-4 text-gray-500 shrink-0" />
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className="shrink-0"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Tests Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : tests.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Free Tests Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Check back soon for new free tests!'}
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{tests.length}</span> free tests
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tests.map((test, index) => (
                    <motion.div
                      key={test._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/test-series/${test.slug}`}>
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                          {/* Header */}
                          <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between mb-3">
                              <Badge className={getCategoryColor(test.examCategory)}>
                                {test.examCategory}
                              </Badge>
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                FREE
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary transition-colors line-clamp-2">
                              {test.title}
                            </h3>
                            {test.description && (
                              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                {test.description}
                              </p>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <FileText className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                <p className="text-sm font-medium text-gray-900">{test.totalQuestions}</p>
                                <p className="text-xs text-gray-500">Questions</p>
                              </div>
                              <div>
                                <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                <p className="text-sm font-medium text-gray-900">{test.duration} min</p>
                                <p className="text-xs text-gray-500">Duration</p>
                              </div>
                              <div>
                                <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                <p className="text-sm font-medium text-gray-900">{test.attemptCount || 0}</p>
                                <p className="text-xs text-gray-500">Attempts</p>
                              </div>
                            </div>
                          </div>

                          {/* CTA */}
                          <div className="p-4">
                            <Button className="w-full group-hover:bg-primary/90">
                              Start Free Test
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready for Complete Exam Preparation?
            </h2>
            <p className="text-blue-100 mb-8">
              Upgrade to our premium test series for unlimited access to 500+ mock tests with detailed analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/test-series">
                <Button size="lg" variant="secondary">
                  View All Test Series
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
