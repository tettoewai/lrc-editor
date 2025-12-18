import { useRef, useEffect, useState } from 'react';
import { X, Check, Plus, Minus, Play, Trash2 } from 'lucide-react';
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
  onTextChange: (lineId: string, newText: string) => void;
  onAddLine: (index: number, position: 'above' | 'below') => void;
  onPlayFromTimestamp: (timestamp: number) => void;
  onDeleteLine: (index: number) => void;
}

export function LyricsList({
  lines,
  currentLineIndex,
  currentTime,
  onTimestampChange,
  onLineClick,
  onTextChange,
  onAddLine,
  onPlayFromTimestamp,
  onDeleteLine
}: LyricsListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [editingTimestampId, setEditingTimestampId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editTextValue, setEditTextValue] = useState('');

  useEffect(() => {
    if (currentLineIndex >= 0 && scrollAreaRef.current) {
      const lineElement = scrollAreaRef.current.querySelector(`[data-line-index="${currentLineIndex}"]`);
      lineElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentLineIndex]);

  const handleTimestampEditStart = (line: LyricLine) => {
    setEditingTimestampId(line.id);
    setEditValue(line.timestamp !== null ? formatTimestamp(line.timestamp).slice(1, -1) : '');
  };

  const handleTimestampEditSave = (lineId: string) => {
    const parsed = parseTimestamp(`[${editValue}]`);
    onTimestampChange(lineId, parsed);
    setEditingTimestampId(null);
  };

  const handleTextEditStart = (line: LyricLine) => {
    setEditingTextId(line.id);
    setEditTextValue(line.text);
  };

  const handleTextEditSave = (lineId: string) => {
    onTextChange(lineId, editTextValue);
    setEditingTextId(null);
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
    <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
      <div className="space-y-1">
        {lines.map((line, index) => (
          <div
            key={line.id}
            data-line-index={index}
            onClick={() => onLineClick(index)}
            className={cn(
              'group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors relative',
              index === currentLineIndex && 'bg-primary/10 ring-1 ring-primary/30',
              index === activeIndex && index !== currentLineIndex && 'bg-accent/50',
              index !== currentLineIndex && index !== activeIndex && 'hover:bg-accent/30'
            )}
          >
            {/* Add line above button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-1 left-1/2 -translate-x-1/2 h-4 w-4 opacity-0 group-hover:opacity-100 z-10 bg-background border"
              onClick={(e) => {
                e.stopPropagation();
                onAddLine(index, 'above');
              }}
            >
              <Plus className="h-2 w-2" />
            </Button>

            <div className="flex-shrink-0 w-48">
              {editingTimestampId === line.id ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="00:00.00"
                    className="h-6 text-xs w-20 px-1"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTimestampEditSave(line.id);
                      if (e.key === 'Escape') setEditingTimestampId(null);
                    }}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTimestampEditSave(line.id);
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  {line.timestamp !== null && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTimestampChange(line.id, Math.max(0, line.timestamp - 0.01));
                      }}
                      title="-10ms"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  )}
                  <Badge
                    variant={line.timestamp !== null ? 'default' : 'secondary'}
                    className="text-xs font-mono cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTimestampEditStart(line);
                    }}
                  >
                    {formatTimestamp(line.timestamp)}
                  </Badge>
                  {line.timestamp !== null && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-50 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTimestampChange(line.id, line.timestamp + 0.01);
                        }}
                        title="+10ms"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-50 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayFromTimestamp(line.timestamp);
                        }}
                        title="Play from here"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-50 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTimestampChange(line.id, null);
                        }}
                        title="Clear timestamp"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Text editing */}
            {editingTextId === line.id ? (
              <div className="flex items-center gap-1 flex-1">
                <Input
                  value={editTextValue}
                  onChange={(e) => setEditTextValue(e.target.value)}
                  className="h-6 text-sm flex-1"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTextEditSave(line.id);
                    if (e.key === 'Escape') setEditingTextId(null);
                  }}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTextEditSave(line.id);
                  }}
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <span
                className={cn(
                  'text-sm flex-1 hover:underline cursor-text',
                  !line.text.trim() && 'text-muted-foreground italic'
                )}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleTextEditStart(line);
                }}
              >
                {line.text || '(empty line)'}
              </span>
            )}

            {/* Delete line button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteLine(index);
              }}
              title="Delete line"
            >
              <Trash2 className="h-3 w-3" />
            </Button>

            {/* Add line below button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-4 w-4 opacity-0 group-hover:opacity-100 z-10 bg-background border"
              onClick={(e) => {
                e.stopPropagation();
                onAddLine(index, 'below');
              }}
            >
              <Plus className="h-2 w-2" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
