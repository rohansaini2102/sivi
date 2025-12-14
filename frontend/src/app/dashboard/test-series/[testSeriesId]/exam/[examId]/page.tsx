'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page redirects to the new exam route
// Kept for backwards compatibility
export default function OldExamPage() {
  const params = useParams();
  const examId = params.examId as string;

  useEffect(() => {
    // Redirect to new exam route in a new tab
    window.location.href = `/exam/${examId}`;
  }, [examId]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to exam...</p>
      </div>
    </div>
  );
}
