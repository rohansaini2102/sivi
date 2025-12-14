'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Section {
  _id: string;
  title: string;
  titleHi?: string;
  questions: { _id: string }[];
}

interface SectionStats {
  total: number;
  answered: number;
  marked: number;
  notVisited: number;
}

interface SubmitModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  sections: Section[];
  getSectionStats: (sectionId: string) => SectionStats;
  isSubmitting: boolean;
}

export default function SubmitModal({
  open,
  onClose,
  onSubmit,
  sections,
  getSectionStats,
  isSubmitting,
}: SubmitModalProps) {
  // Calculate overall stats
  const allStats = sections.map(s => ({
    ...s,
    stats: getSectionStats(s._id),
  }));

  const totalQuestions = allStats.reduce((acc, s) => acc + s.stats.total, 0);
  const totalAnswered = allStats.reduce((acc, s) => acc + s.stats.answered, 0);
  const totalNotAnswered = allStats.reduce((acc, s) => acc + (s.stats.total - s.stats.answered - s.stats.notVisited), 0);
  const totalMarked = allStats.reduce((acc, s) => acc + s.stats.marked, 0);
  const totalNotVisited = allStats.reduce((acc, s) => acc + s.stats.notVisited, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Submit your test</DialogTitle>
        </DialogHeader>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border border-primary-dark px-4 py-3 text-left whitespace-nowrap">Section</th>
                <th className="border border-primary-dark px-4 py-3 text-center whitespace-nowrap">No. of questions</th>
                <th className="border border-primary-dark px-4 py-3 text-center whitespace-nowrap">Answered</th>
                <th className="border border-primary-dark px-4 py-3 text-center whitespace-nowrap">Not Answered</th>
                <th className="border border-primary-dark px-4 py-3 text-center whitespace-nowrap">Marked for Review</th>
                <th className="border border-primary-dark px-4 py-3 text-center whitespace-nowrap">Not Visited</th>
              </tr>
            </thead>
            <tbody>
              {allStats.map((section) => (
                <tr key={section._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-3 font-medium">{section.title}</td>
                  <td className="border px-4 py-3 text-center">{section.stats.total}</td>
                  <td className="border px-4 py-3 text-center text-green-600 font-medium">
                    {section.stats.answered}
                  </td>
                  <td className="border px-4 py-3 text-center text-red-600 font-medium">
                    {section.stats.total - section.stats.answered - section.stats.notVisited}
                  </td>
                  <td className="border px-4 py-3 text-center text-purple-600 font-medium">
                    {section.stats.marked}
                  </td>
                  <td className="border px-4 py-3 text-center text-gray-500">
                    {section.stats.notVisited}
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-gray-100 font-bold">
                <td className="border px-4 py-3">Total</td>
                <td className="border px-4 py-3 text-center">{totalQuestions}</td>
                <td className="border px-4 py-3 text-center text-green-600">{totalAnswered}</td>
                <td className="border px-4 py-3 text-center text-red-600">{totalNotAnswered}</td>
                <td className="border px-4 py-3 text-center text-purple-600">{totalMarked}</td>
                <td className="border px-4 py-3 text-center text-gray-500">{totalNotVisited}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Warning if unanswered questions */}
        {totalAnswered < totalQuestions && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-700 text-sm">
              You have {totalQuestions - totalAnswered} unanswered question(s). Are you sure you want to submit?
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 bg-primary text-white hover:bg-primary-dark border-none"
          >
            Close
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-6 bg-primary hover:bg-primary-dark text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
