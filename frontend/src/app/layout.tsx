import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sivi Academy - Rajasthan Govt Exam Preparation",
    template: "%s | Sivi Academy",
  },
  description:
    "Crack RAS, REET, Patwar, Police & all RPSC exams with structured courses and government exam-style mock tests. Join 50,000+ students preparing for Rajasthan government exams.",
  keywords: [
    "RAS preparation",
    "REET exam",
    "Rajasthan Patwar",
    "RPSC exams",
    "Rajasthan Police exam",
    "government exam preparation",
    "mock tests",
    "online coaching",
  ],
  authors: [{ name: "Sivi Academy" }],
  creator: "Sivi Academy",
  publisher: "Sivi Academy",
  icons: {
    icon: [
      { url: "/icononly.png", sizes: "32x32", type: "image/png" },
      { url: "/icononly.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/icononly.png", sizes: "180x180" },
    shortcut: "/multisizelogo.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Sivi Academy - Rajasthan Govt Exam Preparation",
    description:
      "Crack RAS, REET, Patwar, Police & all RPSC exams with structured courses and mock tests",
    url: "https://siviacademy.in",
    siteName: "Sivi Academy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sivi Academy - Rajasthan Govt Exam Preparation",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sivi Academy - Rajasthan Govt Exam Preparation",
    description:
      "Crack RAS, REET, Patwar, Police & all RPSC exams with structured courses and mock tests",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://siviacademy.in"),
  alternates: {
    canonical: "/",
  },
};

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://siviacademy.in/#organization",
      name: "Sivi Academy",
      url: "https://siviacademy.in",
      logo: {
        "@type": "ImageObject",
        url: "https://siviacademy.in/fulllogo.png",
        width: 500,
        height: 500,
      },
      description:
        "Rajasthan's most trusted platform for government exam preparation. Crack RAS, REET, Patwar, Police & all RPSC exams.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaipur",
        addressRegion: "Rajasthan",
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-12345-67890",
        contactType: "customer service",
        availableLanguage: ["Hindi", "English"],
      },
      sameAs: [
        "https://facebook.com/siviacademy",
        "https://instagram.com/siviacademy",
        "https://youtube.com/siviacademy",
        "https://twitter.com/siviacademy",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://siviacademy.in/#website",
      url: "https://siviacademy.in",
      name: "Sivi Academy",
      description: "Rajasthan Govt Exam Preparation Platform",
      publisher: {
        "@id": "https://siviacademy.in/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://siviacademy.in/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
      inLanguage: "en-IN",
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://siviacademy.in/#educationalorg",
      name: "Sivi Academy",
      url: "https://siviacademy.in",
      description:
        "Online coaching platform for Rajasthan government exams including RAS, REET, Patwar, Police & RPSC",
      areaServed: {
        "@type": "State",
        name: "Rajasthan",
        containedInPlace: {
          "@type": "Country",
          name: "India",
        },
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
