import { Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface LrcOutputProps {
  lrcContent: string;
  offset: number;
  onOffsetChange: (offset: number) => void;
  onDownload: () => void;
}

export function LrcOutput({ lrcContent, offset, onOffsetChange, onDownload }: LrcOutputProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(lrcContent);
    toast({
      title: 'Copied!',
      description: 'LRC content copied to clipboard'
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Offset Adjustment: {offset > 0 ? '+' : ''}{offset.toFixed(2)}s</Label>
        <Slider
          value={[offset]}
          min={-5}
          max={5}
          step={0.01}
          onValueChange={([value]) => onOffsetChange(value)}
        />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
        <Button size="sm" onClick={onDownload} className="flex-1">
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>

      <ScrollArea className="h-[200px] rounded-md border bg-muted/30 p-3">
        <pre className="text-xs font-mono whitespace-pre-wrap break-all">
          {lrcContent || 'LRC preview will appear here...'}
        </pre>
      </ScrollArea>
    </div>
  );
}
