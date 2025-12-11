import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface LyricsInputProps {
  value: string;
  onChange: (value: string) => void;
  onLoadLrc: () => void;
}

export function LyricsInput({ value, onChange, onLoadLrc }: LyricsInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Paste Lyrics</span>
        <Button variant="outline" size="sm" onClick={onLoadLrc}>
          <FileText className="h-4 w-4 mr-1" />
          Load LRC
        </Button>
      </div>
      <Textarea
        placeholder="Paste your lyrics here, one line per line..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[150px] font-mono text-sm resize-none"
      />
    </div>
  );
}
