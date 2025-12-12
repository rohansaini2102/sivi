import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { generateMetadata } from '@/lib/seo';
import {
  Target,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

export const metadata = generateMetadata({
  title: 'About Us - Sivi Academy',
  description: 'Learn about Sivi Academy\'s mission to make quality government exam preparation accessible to every aspirant in Rajasthan.',
  path: '/about',
  keywords: ['about us', 'our team', 'mission', 'vision'],
});

const stats = [
  { value: '50,000+', label: 'Students', icon: Users },
  { value: '500+', label: 'Mock Tests', icon: BookOpen },
  { value: '1,00,000+', label: 'Questions', icon: Target },
  { value: '92%', label: 'Success Rate', icon: Award },
];

const values = [
  {
    title: 'Quality Education',
    description: 'We create content that matches actual exam standards, ensuring students are fully prepared.',
    icon: BookOpen,
  },
  {
    title: 'Accessibility',
    description: 'Making quality education accessible to all, regardless of location or economic background.',
    icon: Users,
  },
  {
    title: 'Student Success',
    description: 'Every feature we build is designed to maximize student success in government exams.',
    icon: TrendingUp,
  },
  {
    title: 'Continuous Improvement',
    description: 'We constantly update our content and platform based on latest exam patterns and student feedback.',
    icon: Target,
  },
];

const features = [
  'Expert-curated content for all Rajasthan government exams',
  'Government exam-style mock tests with detailed analytics',
  'Bilingual support (Hindi & English)',
  'Mobile-friendly platform for learning on the go',
  'Performance tracking and personalized recommendations',
  '2025 RPSC syllabus aligned courses',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-white to-blue-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Empowering Rajasthan&apos;s Future
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Sivi Academy is Rajasthan&apos;s trusted platform for government exam preparation.
                We&apos;re committed to helping aspirants achieve their dreams of serving in government positions.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 -mt-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-gray-600 mb-6">
                  At Sivi Academy, our mission is to democratize access to quality government exam
                  preparation. We believe that every aspirant in Rajasthan, regardless of their
                  location or economic background, deserves access to the best study materials and
                  mock tests.
                </p>
                <p className="text-gray-600 mb-6">
                  We focus on Rajasthan government exams including RAS, REET, Patwar, Police,
                  and all RPSC examinations. Our content is created by experts who understand the
                  exam patterns and what it takes to succeed.
                </p>
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Why Choose Sivi Academy?</h3>
                <p className="text-blue-100 mb-6">
                  We&apos;re not just another exam preparation platform. We&apos;re your partners
                  in success, dedicated to helping you achieve your government job dreams.
                </p>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="font-semibold mb-1">Exam-Focused Content</p>
                    <p className="text-sm text-blue-100">
                      All questions match actual exam patterns and difficulty levels.
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="font-semibold mb-1">Detailed Analytics</p>
                    <p className="text-sm text-blue-100">
                      Track your progress and identify areas for improvement.
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="font-semibold mb-1">Updated Content</p>
                    <p className="text-sm text-blue-100">
                      Aligned with 2025 RPSC syllabus and exam patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                These core values guide everything we do at Sivi Academy.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div key={value.title} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exams We Cover */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Exams We Cover</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Comprehensive preparation for all major Rajasthan government examinations.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'RAS (Rajasthan Administrative Service)', desc: 'Complete preparation for Prelims & Mains' },
                { name: 'REET (Level 1 & 2)', desc: 'Teacher eligibility examination preparation' },
                { name: 'Rajasthan Patwar', desc: 'Revenue department examination' },
                { name: 'Rajasthan Police', desc: 'Constable & SI examination preparation' },
                { name: 'RPSC 1st & 2nd Grade', desc: 'School lecturer examinations' },
                { name: 'Other RPSC Exams', desc: 'LDC, Junior Accountant, and more' },
              ].map((exam) => (
                <div key={exam.name} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-primary/50 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2">{exam.name}</h3>
                  <p className="text-gray-600 text-sm">{exam.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-gradient-to-r from-primary to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Have Questions?
            </h2>
            <p className="text-blue-100 mb-8">
              We&apos;re here to help you with any queries about our courses or test series.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary font-medium rounded-xl hover:bg-gray-100 transition-colors">
                Contact Us
              </a>
              <a href="tel:+917073431114" className="inline-flex items-center justify-center px-6 py-3 bg-transparent text-white font-medium rounded-xl border border-white hover:bg-white/10 transition-colors">
                Call: +91 70734 31114
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
