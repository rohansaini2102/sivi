'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Menu, X, ChevronDown, User, LogOut, LayoutDashboard,
  BookOpen, FileText, Info, Phone, HelpCircle, Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  onStartQuiz?: () => void;
}

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  type: 'course' | 'test-series';
  examCategory?: string;
  price?: number;
  discountPrice?: number;
}

const Header: React.FC<HeaderProps> = ({ onStartQuiz }) => {
  const router = useRouter();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsHydrated(true);
    checkAuth();
  }, [checkAuth]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Fetch courses and test series in parallel
      const [coursesRes, testSeriesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/store/courses?search=${encodeURIComponent(query)}&limit=5`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/store/test-series?search=${encodeURIComponent(query)}&limit=5`)
      ]);

      const coursesData = await coursesRes.json();
      const testSeriesData = await testSeriesRes.json();

      const results: SearchResult[] = [];

      if (coursesData.success && coursesData.data?.courses) {
        coursesData.data.courses.forEach((course: any) => {
          results.push({
            _id: course._id,
            title: course.title,
            slug: course.slug,
            type: 'course',
            examCategory: course.examCategory,
            price: course.price,
            discountPrice: course.discountPrice,
          });
        });
      }

      if (testSeriesData.success && testSeriesData.data?.testSeries) {
        testSeriesData.data.testSeries.forEach((series: any) => {
          results.push({
            _id: series._id,
            title: series.title,
            slug: series.slug,
            type: 'test-series',
            examCategory: series.examCategory,
            price: series.price,
            discountPrice: series.discountPrice,
          });
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const navItems = [
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Test Series', href: '/test-series', icon: FileText },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Phone },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      return '/admin';
    }
    return '/dashboard';
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (result.type === 'course') {
      router.push(`/courses/${result.slug}`);
    } else {
      router.push(`/test-series/${result.slug}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      router.push(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Image
                src="/icononly.svg"
                alt="Sivi Academy"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
              <span className="font-grotesk font-bold text-xl text-gray-900 hidden sm:inline">
                Sivi<span className="text-primary">Academy</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <motion.span
                  whileHover={{ backgroundColor: 'rgba(0, 133, 255, 0.05)' }}
                  className="px-3 py-2 rounded-lg text-gray-700 font-medium text-sm flex items-center gap-1.5 transition-colors cursor-pointer hover:text-primary"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </motion.span>
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div ref={searchRef} className="hidden md:block relative">
            <form onSubmit={handleSearchSubmit}>
              <motion.div
                animate={{ width: isSearchFocused ? 320 : 240 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, test series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setShowSearchResults(true);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
              </motion.div>
            </form>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearchResults && (searchQuery.trim() || searchResults.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result._id}`}
                          onClick={() => handleSearchResultClick(result)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-0"
                        >
                          <div className={`p-2 rounded-lg ${result.type === 'course' ? 'bg-primary/10' : 'bg-green-100'}`}>
                            {result.type === 'course' ? (
                              <BookOpen className="w-4 h-4 text-primary" />
                            ) : (
                              <FileText className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{result.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${result.type === 'course' ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-700'}`}>
                                {result.type === 'course' ? 'Course' : 'Test Series'}
                              </span>
                              {result.examCategory && (
                                <span className="text-xs text-gray-500">{result.examCategory}</span>
                              )}
                            </div>
                          </div>
                          {result.discountPrice ? (
                            <span className="text-sm font-semibold text-primary">₹{result.discountPrice}</span>
                          ) : result.price ? (
                            <span className="text-sm font-semibold text-gray-900">₹{result.price}</span>
                          ) : null}
                        </button>
                      ))}
                      {searchQuery.trim() && (
                        <Link
                          href={`/courses?search=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setShowSearchResults(false)}
                          className="block px-4 py-3 text-center text-sm text-primary font-medium hover:bg-primary/5 transition-colors"
                        >
                          View all results for &quot;{searchQuery}&quot;
                        </Link>
                      )}
                    </div>
                  ) : searchQuery.trim() ? (
                    <div className="p-4 text-center text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No results found for &quot;{searchQuery}&quot;</p>
                      <p className="text-xs mt-1">Try different keywords</p>
                    </div>
                  ) : (
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-3">Popular Searches</p>
                      <div className="flex flex-wrap gap-2">
                        {['RAS', 'REET', 'Patwar', 'Police', 'RPSC'].map((term) => (
                          <button
                            key={term}
                            onClick={() => setSearchQuery(term)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isHydrated && isAuthenticated && user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium text-sm max-w-[100px] truncate">
                    {user.name || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email || user.phone}</p>
                      </div>
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-gray-700 font-medium text-sm hover:text-primary transition-colors cursor-pointer"
                  >
                    Login
                  </motion.span>
                </Link>
                <Link href="/login">
                  <motion.span
                    whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0, 133, 255, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2 bg-primary text-white font-medium text-sm rounded-xl shadow-md transition-all cursor-pointer inline-block"
                  >
                    Start Free
                  </motion.span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, test series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </form>

              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full px-4 py-3 text-left text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-3"
                >
                  <item.icon className="w-5 h-5 text-gray-500" />
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-100">
                {isHydrated && isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email || user.phone}</p>
                      </div>
                    </div>
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-3 text-gray-700 font-medium rounded-xl border border-gray-200 flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full py-3 text-red-600 font-medium rounded-xl border border-red-200 flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 py-3 text-gray-700 font-medium rounded-xl border border-gray-200 text-center"
                    >
                      Login
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 py-3 bg-primary text-white font-medium rounded-xl text-center"
                    >
                      Start Free
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for closing user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </motion.header>
  );
};

export default Header;
