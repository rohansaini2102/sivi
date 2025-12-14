'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Question {
  _id: string;
  question: string;
  questionHindi?: string;
  questionType: string;
}

interface Section {
  _id: string;
  title: string;
  titleHi?: string;
  questions: Question[];
}

interface QuestionPaperModalProps {
  open: boolean;
  onClose: () => void;
  sections: Section[];
  language: 'en' | 'hi';
  onNavigate: (sectionIdx: number, questionIdx: number) => void;
}

export default function QuestionPaperModal({
  open,
  onClose,
  sections,
  language,
  onNavigate,
}: QuestionPaperModalProps) {
  let globalQuestionNumber = 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Question Paper</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-8">
            {sections.map((section, sectionIdx) => (
              <div key={section._id}>
                {/* Section Header */}
                {sections.length > 1 && (
                  <h3 className="font-bold text-lg text-primary mb-4 pb-2 border-b">
                    {language === 'hi' && section.titleHi ? section.titleHi : section.title}
                  </h3>
                )}

                {/* Questions */}
                <div className="space-y-4">
                  {section.questions.map((question, qIdx) => {
                    globalQuestionNumber++;
                    return (
                      <div
                        key={question._id}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => onNavigate(sectionIdx, qIdx)}
                      >
                        <div className="flex gap-3">
                          <span className="font-bold text-primary shrink-0">
                            Q{globalQuestionNumber}.
                          </span>
                          <p className="text-gray-700">
                            {language === 'hi' && question.questionHindi
                              ? question.questionHindi
                              : question.question}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
