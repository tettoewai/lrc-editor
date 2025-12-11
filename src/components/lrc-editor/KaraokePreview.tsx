import { useMemo } from 'react';
import { LyricLine } from '@/types/lrc';
import { cn } from '@/lib/utils';

interface KaraokePreviewProps {
  lines: LyricLine[];
  currentTime: number;
  offset: number;
}

export function KaraokePreview({ lines, currentTime, offset }: KaraokePreviewProps) {
  const adjustedTime = currentTime - offset;

  const { prevLine, currentLine, nextLine } = useMemo(() => {
    let currentIdx = -1;
    
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].timestamp !== null && lines[i].timestamp! <= adjustedTime) {
        currentIdx = i;
        break;
      }
    }

    return {
      prevLine: currentIdx > 0 ? lines[currentIdx - 1] : null,
      currentLine: currentIdx >= 0 ? lines[currentIdx] : null,
      nextLine: currentIdx < lines.length - 1 ? lines[currentIdx + 1] : (currentIdx === -1 && lines.length > 0 ? lines[0] : null)
    };
  }, [lines, adjustedTime]);

  return (
    <div className="bg-accent/30 rounded-lg p-4 h-32 flex flex-col items-center justify-center overflow-hidden">
      <div className="text-center space-y-2 w-full">
        <p className="text-xs text-muted-foreground truncate opacity-60">
          {prevLine?.text || '\u00A0'}
        </p>
        <p className={cn(
          'text-base font-medium truncate transition-all duration-200',
          currentLine ? 'text-primary scale-105' : 'text-muted-foreground'
        )}>
          {currentLine?.text || '♪ ♪ ♪'}
        </p>
        <p className="text-xs text-muted-foreground truncate opacity-60">
          {nextLine?.text || '\u00A0'}
        </p>
      </div>
    </div>
  );
}
