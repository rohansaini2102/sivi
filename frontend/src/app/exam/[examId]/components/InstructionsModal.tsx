'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InstructionsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InstructionsModal({ open, onClose }: InstructionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">General Instructions</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-3">Question Palette Status:</h3>
              <div className="space-y-2 ml-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded border-2 border-gray-300 bg-white"></span>
                  <span>You have not visited the question yet.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-500"></span>
                  <span>You have not answered the question.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-500"></span>
                  <span>You have answered the question.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-500"></span>
                  <span>You have NOT answered the question, but have marked the question for review.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-500 relative">
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border border-white"></span>
                  </span>
                  <span>You have answered the question, but marked it for review.</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Navigating to a Question:</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Click on the question number in the Question Palette to go to that question directly.</li>
                <li>Click on <strong>Save &amp; Next</strong> to save your answer and go to the next question.</li>
                <li>Click on <strong>Mark for Review &amp; Next</strong> to save and mark for review, then go to next.</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Answering a Question:</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Choose one answer from the options given below the question.</li>
                <li>To deselect your answer, click on <strong>Clear Response</strong>.</li>
                <li>To change your answer, click on another option.</li>
                <li>To save your answer, you MUST click on <strong>Save &amp; Next</strong>.</li>
              </ol>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-700 text-sm">
                <strong>Note:</strong> Your answer will not be saved if you navigate to another question without clicking Save &amp; Next.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={onClose}
            className="px-6 bg-primary hover:bg-primary-dark text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
