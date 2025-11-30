import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
