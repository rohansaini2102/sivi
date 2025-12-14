import { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Exam | Sivi Academy',
  description: 'Computer Based Test - Sivi Academy',
};

export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is an isolated layout without the dashboard sidebar
  // The exam runs in fullscreen mode
  return (
    <div className="min-h-screen bg-white antialiased">
      {children}
    </div>
  );
}
