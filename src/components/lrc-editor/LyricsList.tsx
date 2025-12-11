import { useRef, useEffect, useState } from 'react';
import { X, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LyricLine } from '@/types/lrc';
import { formatTimestamp, parseTimestamp } from '@/utils/lrc-utils';
import { cn } from '@/lib/utils';

interface LyricsListProps {
  lines: LyricLine[];
  currentLineIndex: number;
  currentTime: number;
  onTimestampChange: (lineId: string, timestamp: number | null) => void;
  onLineClick: (index: number) => void;
}

export function LyricsList({
  lines,
  currentLineIndex,
  currentTime,
  onTimestampChange,
  onLineClick
}: LyricsListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (currentLineIndex >= 0 && scrollAreaRef.current) {
      const lineElement = scrollAreaRef.current.querySelector(`[data-line-index="${currentLineIndex}"]`);
      lineElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentLineIndex]);

  const handleEditStart = (line: LyricLine) => {
    setEditingId(line.id);
    setEditValue(line.timestamp !== null ? formatTimestamp(line.timestamp).slice(1, -1) : '');
  };

  const handleEditSave = (lineId: string) => {
    const parsed = parseTimestamp(`[${editValue}]`);
    onTimestampChange(lineId, parsed);
    setEditingId(null);
  };

  const getActiveLineIndex = () => {
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].timestamp !== null && lines[i].timestamp! <= currentTime) {
        return i;
      }
    }
    return -1;
  };

  const activeIndex = getActiveLineIndex();

  return (
    <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
      <div className="space-y-1">
        {lines.map((line, index) => (
          <div
            key={line.id}
            data-line-index={index}
            onClick={() => onLineClick(index)}
            className={cn(
              'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
              index === currentLineIndex && 'bg-primary/10 ring-1 ring-primary/30',
              index === activeIndex && index !== currentLineIndex && 'bg-accent/50',
              index !== currentLineIndex && index !== activeIndex && 'hover:bg-accent/30'
            )}
          >
            <div className="flex-shrink-0 w-24">
              {editingId === line.id ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="00:00.00"
                    className="h-6 text-xs w-20 px-1"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSave(line.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSave(line.id);
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Badge
                    variant={line.timestamp !== null ? 'default' : 'secondary'}
                    className="text-xs font-mono cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(line);
                    }}
                  >
                    {formatTimestamp(line.timestamp)}
                  </Badge>
                  {line.timestamp !== null && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTimestampChange(line.id, null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            <span className={cn(
              'text-sm flex-1',
              !line.text.trim() && 'text-muted-foreground italic'
            )}>
              {line.text || '(empty line)'}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
