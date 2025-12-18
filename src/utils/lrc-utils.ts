import { LyricLine, LrcMetadata } from '@/types/lrc';

export function formatTimestamp(seconds: number | null): string {
  if (seconds === null) return '[--:--.--]';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `[${mins.toString().padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}]`;
}

export function parseTimestamp(tag: string): number | null {
  const match = tag.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]/);
  if (!match) return null;
  const mins = parseInt(match[1], 10);
  const secs = parseInt(match[2], 10);
  const ms = parseInt(match[3].padEnd(3, '0'), 10);
  return mins * 60 + secs + ms / 1000;
}

export function generateLrc(lines: LyricLine[], metadata: LrcMetadata, offset: number): string {
  const metaTags: string[] = [];
  if (metadata.title) metaTags.push(`[ti:${metadata.title}]`);
  if (metadata.artist) metaTags.push(`[ar:${metadata.artist}]`);
  if (metadata.album) metaTags.push(`[al:${metadata.album}]`);
  if (metadata.author) metaTags.push(`[by:${metadata.author}]`);
  if (offset !== 0) metaTags.push(`[offset:${Math.round(offset * 1000)}]`);

  const lyricLines = lines
    .filter(line => line.text.trim())
    .map(line => {
      if (line.timestamp === null) {
        return line.text;
      }
      const adjustedTime = line.timestamp + offset;
      return `${formatTimestamp(adjustedTime)} ${line.text}`;
    });

  return [...metaTags, '', ...lyricLines].join('\n');
}

export function parseLrc(content: string): { lines: LyricLine[]; metadata: LrcMetadata } {
  const metadata: LrcMetadata = { title: '', artist: '', album: '', author: '' };
  const lines: LyricLine[] = [];

  const lrcLines = content.split('\n');
  
  for (const line of lrcLines) {
    const metaMatch = line.match(/\[(ti|ar|al|by):(.+)\]/i);
    if (metaMatch) {
      const key = metaMatch[1].toLowerCase();
      const value = metaMatch[2].trim();
      if (key === 'ti') metadata.title = value;
      else if (key === 'ar') metadata.artist = value;
      else if (key === 'al') metadata.album = value;
      else if (key === 'by') metadata.author = value;
      continue;
    }

    // Skip offset and other metadata tags
    if (line.match(/^\[.+:.*\]$/)) {
      continue;
    }

    const lyricMatch = line.match(/\[(\d{2}:\d{2}\.\d{2,3})\]\s*(.*)/);
    if (lyricMatch) {
      const timestamp = parseTimestamp(`[${lyricMatch[1]}]`);
      lines.push({
        id: crypto.randomUUID(),
        text: lyricMatch[2],
        timestamp
      });
    } else {
      // Handle unsynced text (plain text without timestamp)
      const trimmedLine = line.trim();
      if (trimmedLine) {
        let text = trimmedLine;
        if (text.startsWith('[--:--.--]')) {
          text = text.slice('[--:--.--]'.length).trimStart();
        }

        if (text) {
          lines.push({
            id: crypto.randomUUID(),
            text,
            timestamp: null
          });
        }
      }
    }
  }

  return { lines, metadata };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
