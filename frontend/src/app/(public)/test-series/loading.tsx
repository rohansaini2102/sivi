import { Loader2 } from 'lucide-react';

export default function TestSeriesLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading test series...</p>
      </div>
    </div>
  );
}
