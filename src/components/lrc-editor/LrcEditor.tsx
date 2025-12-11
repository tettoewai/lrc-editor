import { useState, useCallback, useEffect, useRef } from 'react';
import { Undo2, Redo2, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AudioUploader } from './AudioUploader';
import { AudioPlayer } from './AudioPlayer';
import { MetadataForm } from './MetadataForm';
import { LyricsInput } from './LyricsInput';
import { LyricsList } from './LyricsList';
import { KaraokePreview } from './KaraokePreview';
import { LrcOutput } from './LrcOutput';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useUndoRedo } from '@/hooks/use-undo-redo';
import { LyricLine, LrcMetadata } from '@/types/lrc';
import { generateLrc, parseLrc } from '@/utils/lrc-utils';

export function LrcEditor() {
  const [metadata, setMetadata] = useState<LrcMetadata>({
    title: '',
    artist: '',
    album: '',
    author: ''
  });
  const [lyricsText, setLyricsText] = useState('');
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [showLyricsList, setShowLyricsList] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipLyricsParseRef = useRef(false);
  const { audioUrl, isPlaying, currentTime, duration, loadAudio, togglePlay, seek, seekRelative } = useAudioPlayer();
  const { canUndo, canRedo, pushAction, undo, redo, clear } = useUndoRedo();

  // Parse lyrics text into lines (skip when loading from LRC file)
  useEffect(() => {
    if (skipLyricsParseRef.current) {
      skipLyricsParseRef.current = false;
      return;
    }
    if (!lyricsText.trim()) {
      setLines([]);
      setShowLyricsList(false);
      return;
    }
    const newLines = lyricsText.split('\n').map(text => ({
      id: crypto.randomUUID(),
      text,
      timestamp: null
    }));
    setLines(newLines);
    setCurrentLineIndex(0);
    setShowLyricsList(true);
    clear();
  }, [lyricsText, clear]);

  // Handle spacebar for timestamping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying && lines.length > 0) {
          const line = lines[currentLineIndex];
          if (line) {
            pushAction({
              type: 'set',
              lineId: line.id,
              previousTimestamp: line.timestamp,
              newTimestamp: currentTime
            });
            setLines(prev => prev.map((l, i) => 
              i === currentLineIndex ? { ...l, timestamp: currentTime } : l
            ));
            if (currentLineIndex < lines.length - 1) {
              setCurrentLineIndex(prev => prev + 1);
            }
          }
        }
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.code === 'KeyZ' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        }
        if ((e.code === 'KeyZ' && e.shiftKey) || e.code === 'KeyY') {
          e.preventDefault();
          handleRedo();
        }
      }

      if (e.code === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        seekRelative(-5);
      }
      if (e.code === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        seekRelative(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, lines, currentLineIndex, currentTime, pushAction, seekRelative]);

  const handleTimestampChange = useCallback((lineId: string, timestamp: number | null) => {
    const line = lines.find(l => l.id === lineId);
    if (line) {
      pushAction({
        type: timestamp !== null ? 'set' : 'clear',
        lineId,
        previousTimestamp: line.timestamp,
        newTimestamp: timestamp
      });
      setLines(prev => prev.map(l => l.id === lineId ? { ...l, timestamp } : l));
    }
  }, [lines, pushAction]);

  const handleTextChange = useCallback((lineId: string, newText: string) => {
    setLines(prev => prev.map(l => l.id === lineId ? { ...l, text: newText } : l));
  }, []);

  const handleAddLine = useCallback((index: number, position: 'above' | 'below') => {
    const newLine: LyricLine = {
      id: crypto.randomUUID(),
      text: '',
      timestamp: null
    };
    setLines(prev => {
      const newLines = [...prev];
      const insertIndex = position === 'above' ? index : index + 1;
      newLines.splice(insertIndex, 0, newLine);
      return newLines;
    });
    if (position === 'above' && currentLineIndex >= index) {
      setCurrentLineIndex(prev => prev + 1);
    } else if (position === 'below' && currentLineIndex > index) {
      setCurrentLineIndex(prev => prev + 1);
    }
  }, [currentLineIndex]);

  const handleUndo = useCallback(() => {
    const action = undo();
    if (action) {
      setLines(prev => prev.map(l => 
        l.id === action.lineId ? { ...l, timestamp: action.previousTimestamp } : l
      ));
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const action = redo();
    if (action) {
      setLines(prev => prev.map(l => 
        l.id === action.lineId ? { ...l, timestamp: action.newTimestamp } : l
      ));
    }
  }, [redo]);

  const handleLoadLrc = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleLrcFileLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const { lines: parsedLines, metadata: parsedMetadata } = parseLrc(content);
      setMetadata(parsedMetadata);
      setLines(parsedLines);
      setCurrentLineIndex(0);
      setShowLyricsList(true);
      clear();
      skipLyricsParseRef.current = true;
      setLyricsText(parsedLines.map(l => l.text).join('\n'));
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  }, [clear]);

  const lrcContent = generateLrc(lines, metadata, offset);

  const handleDownload = useCallback(() => {
    const blob = new Blob([lrcContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.title || 'lyrics'}.lrc`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lrcContent, metadata.title]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".lrc,.txt"
        onChange={handleLrcFileLoad}
        className="hidden"
      />
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">LRC Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sync lyrics with audio to create LRC files
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Left Column - Import & Metadata */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Import & Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AudioUploader onFileSelect={loadAudio} hasAudio={!!audioUrl} />
              <AudioPlayer
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onTogglePlay={togglePlay}
                onSeek={seek}
                onSeekRelative={seekRelative}
                disabled={!audioUrl}
              />
              <Separator />
              <MetadataForm metadata={metadata} onChange={setMetadata} />
              
              <Separator />
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1 font-medium">
                  <Keyboard className="h-3 w-3" />
                  Shortcuts
                </div>
                <div>Space: Stamp timestamp</div>
                <div>← →: Seek ±5s</div>
                <div>Ctrl+Z: Undo</div>
                <div>Ctrl+Shift+Z: Redo</div>
              </div>
            </CardContent>
          </Card>

          {/* Center Column - Lyrics Sync Workspace */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Lyrics Sync</CardTitle>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className="h-8 w-8"
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRedo}
                        disabled={!canRedo}
                        className="h-8 w-8"
                      >
                        <Redo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showLyricsList ? (
                <LyricsInput
                  value={lyricsText}
                  onChange={setLyricsText}
                  onLoadLrc={handleLoadLrc}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Line {currentLineIndex + 1} of {lines.length}
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setShowLyricsList(false);
                        clear();
                      }}
                      className="text-xs"
                    >
                      Edit text
                    </Button>
                  </div>
                  <LyricsList
                    lines={lines}
                    currentLineIndex={currentLineIndex}
                    currentTime={currentTime}
                    onTimestampChange={handleTimestampChange}
                    onLineClick={setCurrentLineIndex}
                    onTextChange={handleTextChange}
                    onAddLine={handleAddLine}
                    onPlayFromTimestamp={(timestamp) => {
                      seek(timestamp);
                      if (!isPlaying) togglePlay();
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Output & Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Output & Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium mb-2 block">Karaoke Preview</span>
                <KaraokePreview
                  lines={lines}
                  currentTime={currentTime}
                  offset={offset}
                />
              </div>
              <Separator />
              <LrcOutput
                lrcContent={lrcContent}
                offset={offset}
                onOffsetChange={setOffset}
                onDownload={handleDownload}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
