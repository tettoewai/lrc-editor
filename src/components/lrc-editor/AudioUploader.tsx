import { useCallback } from 'react';
import { Upload, Music, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/utils/lrc-utils';

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  hasAudio: boolean;
  fileName?: string;
  duration: number;
}

export function AudioUploader({ onFileSelect, onRemove, hasAudio, fileName, duration }: AudioUploaderProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors"
    >
      {hasAudio ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-foreground">
            <Music className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium truncate max-w-[150px]" title={fileName}>
              {fileName || 'Audio loaded'}
            </span>
          </div>
          {duration > 0 && (
            <div className="text-xs text-muted-foreground">
              Duration: {formatTime(duration)}
            </div>
          )}
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                Change
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </Button>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            Drag & drop audio file or
          </p>
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              Browse
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </Button>
        </>
      )}
    </div>
  );
}
