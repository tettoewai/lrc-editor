export interface LyricLine {
  id: string;
  text: string;
  timestamp: number | null; // in seconds
}

export interface LrcMetadata {
  title: string;
  artist: string;
  album: string;
  author: string;
}

export interface TimestampAction {
  type: 'set' | 'clear';
  lineId: string;
  previousTimestamp: number | null;
  newTimestamp: number | null;
}
