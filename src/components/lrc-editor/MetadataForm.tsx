import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LrcMetadata } from '@/types/lrc';

interface MetadataFormProps {
  metadata: LrcMetadata;
  onChange: (metadata: LrcMetadata) => void;
}

export function MetadataForm({ metadata, onChange }: MetadataFormProps) {
  const handleChange = (field: keyof LrcMetadata) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...metadata, [field]: e.target.value });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs">Song Title</Label>
        <Input
          id="title"
          placeholder="Enter song title"
          value={metadata.title}
          onChange={handleChange('title')}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="artist" className="text-xs">Artist</Label>
        <Input
          id="artist"
          placeholder="Enter artist name"
          value={metadata.artist}
          onChange={handleChange('artist')}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="album" className="text-xs">Album</Label>
        <Input
          id="album"
          placeholder="Enter album name"
          value={metadata.album}
          onChange={handleChange('album')}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="author" className="text-xs">LRC Author</Label>
        <Input
          id="author"
          placeholder="Your name"
          value={metadata.author}
          onChange={handleChange('author')}
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}
