import { Metadata } from "next";

const BASE_URL = "https://siviacademy.in";

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  image?: string;
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  path,
  image = "/og-image.png",
  noIndex = false,
}: SEOConfig): Metadata {
  const url = `${BASE_URL}${path}`;

  return {
    title,
    description,
    keywords: [
      ...keywords,
      "RAS preparation",
      "REET exam",
      "Rajasthan Patwar",
      "RPSC exams",
      "government exam preparation",
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Sivi Academy",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

// Breadcrumb JSON-LD generator
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

// FAQ JSON-LD generator
export function generateFAQJsonLd(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Course JSON-LD generator
export function generateCourseJsonLd(course: {
  name: string;
  description: string;
  provider?: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: course.provider || "Sivi Academy",
      sameAs: BASE_URL,
    },
    url: `${BASE_URL}${course.url}`,
    image: course.image || `${BASE_URL}/og-image.png`,
  };
}

// Page-specific metadata presets
export const pageMetadata = {
  home: generateMetadata({
    title: "Sivi Academy - Rajasthan Govt Exam Preparation",
    description:
      "Crack RAS, REET, Patwar, Police & all RPSC exams with structured courses and government exam-style mock tests. Join 50,000+ students preparing for Rajasthan government exams.",
    path: "/",
    keywords: ["online coaching", "mock tests", "Rajasthan Police exam"],
  }),

  courses: generateMetadata({
    title: "Courses - Comprehensive Exam Preparation",
    description:
      "Explore our comprehensive courses for RAS, REET, Patwar, Police & RPSC exams. Expert faculty, structured curriculum, and exam-focused content.",
    path: "/courses",
    keywords: ["RAS course", "REET course", "Patwar course", "RPSC course"],
  }),

  testSeries: generateMetadata({
    title: "Test Series - Practice Mock Tests",
    description:
      "Practice with government exam-style mock tests for RAS, REET, Patwar, Police & all RPSC exams. Detailed analytics and performance tracking.",
    path: "/test-series",
    keywords: ["mock tests", "practice tests", "exam preparation", "test series"],
  }),

  freeTests: generateMetadata({
    title: "Free Tests - Start Practicing Today",
    description:
      "Access free mock tests for Rajasthan government exams. Try before you buy - experience our exam-quality questions at no cost.",
    path: "/free-tests",
    keywords: ["free mock tests", "free practice tests", "sample tests"],
  }),

  currentAffairs: generateMetadata({
    title: "Current Affairs - Daily Updates",
    description:
      "Stay updated with daily current affairs relevant to RAS, REET, Patwar & all Rajasthan government exams. Curated news and analysis.",
    path: "/current-affairs",
    keywords: ["current affairs", "daily news", "exam updates", "Rajasthan news"],
  }),

  about: generateMetadata({
    title: "About Us - Our Mission & Vision",
    description:
      "Learn about Sivi Academy's mission to make quality government exam preparation accessible to every aspirant in Rajasthan.",
    path: "/about",
    keywords: ["about us", "our team", "mission", "vision"],
  }),

  contact: generateMetadata({
    title: "Contact Us - Get in Touch",
    description:
      "Have questions? Contact Sivi Academy for support, feedback, or partnership inquiries. We're here to help you succeed.",
    path: "/contact",
    keywords: ["contact", "support", "help", "feedback"],
  }),

  terms: generateMetadata({
    title: "Terms of Service",
    description:
      "Read Sivi Academy's terms of service. Understand the rules and guidelines for using our platform.",
    path: "/terms",
    keywords: ["terms of service", "terms and conditions", "user agreement"],
  }),

  privacy: generateMetadata({
    title: "Privacy Policy",
    description:
      "Sivi Academy's privacy policy. Learn how we collect, use, and protect your personal information.",
    path: "/privacy",
    keywords: ["privacy policy", "data protection", "user privacy"],
  }),

  refund: generateMetadata({
    title: "Refund Policy",
    description:
      "Sivi Academy's refund policy. Understand our refund terms and conditions for courses and test series.",
    path: "/refund",
    keywords: ["refund policy", "cancellation", "money back"],
  }),

  login: generateMetadata({
    title: "Login - Access Your Account",
    description: "Login to your Sivi Academy account to access courses, tests, and track your progress.",
    path: "/login",
    noIndex: true,
  }),

  adminLogin: generateMetadata({
    title: "Admin Login",
    description: "Admin portal login for Sivi Academy.",
    path: "/admin/login",
    noIndex: true,
  }),
};
