import { useCallback } from 'react';
import { Upload, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  hasAudio: boolean;
}

export function AudioUploader({ onFileSelect, hasAudio }: AudioUploaderProps) {
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
      className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
    >
      {hasAudio ? (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Music className="h-5 w-5" />
          <span>Audio loaded</span>
        </div>
      ) : (
        <>
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            Drag & drop audio file or
          </p>
        </>
      )}
      <Button variant="outline" size="sm" asChild>
        <label className="cursor-pointer">
          {hasAudio ? 'Change File' : 'Browse'}
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </Button>
    </div>
  );
}
