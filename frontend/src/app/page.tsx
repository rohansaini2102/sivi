import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import TestSeries from '@/components/TestSeries';
import Footer from '@/components/Footer';
import { generateBreadcrumbJsonLd, generateFAQJsonLd } from '@/lib/seo';

// FAQ data for homepage
const homeFAQs = [
  {
    question: "What exams does Sivi Academy prepare students for?",
    answer: "Sivi Academy provides comprehensive preparation for all Rajasthan government exams including RAS (Rajasthan Administrative Service), REET (Rajasthan Eligibility Examination for Teachers), Patwar, Rajasthan Police, and all RPSC (Rajasthan Public Service Commission) exams."
  },
  {
    question: "Are the mock tests based on actual exam patterns?",
    answer: "Yes, all our mock tests are designed to match the exact pattern, difficulty level, and time constraints of actual government exams. Our expert faculty analyzes previous year papers to create authentic exam experiences."
  },
  {
    question: "Can I access courses on mobile devices?",
    answer: "Yes, Sivi Academy is fully mobile-responsive. You can access all courses, mock tests, and study materials on your smartphone, tablet, or desktop computer."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, we offer free mock tests so you can experience our platform quality before purchasing. Visit our Free Tests section to start practicing at no cost."
  },
  {
    question: "What is the medium of instruction?",
    answer: "Our courses are available in both Hindi and English to cater to all Rajasthan aspirants. You can choose your preferred language while accessing the content."
  }
];

const breadcrumbData = generateBreadcrumbJsonLd([
  { name: "Home", url: "/" }
]);

const faqJsonLd = generateFAQJsonLd(homeFAQs);

export default function Home() {
  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Hero />
          <Features />
          <TestSeries />
        </main>
        <Footer />
      </div>
    </>
  );
}
