import { useState, useCallback } from 'react';
import { TimestampAction } from '@/types/lrc';

export function useUndoRedo() {
  const [undoStack, setUndoStack] = useState<TimestampAction[]>([]);
  const [redoStack, setRedoStack] = useState<TimestampAction[]>([]);

  const pushAction = useCallback((action: TimestampAction) => {
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]);
  }, []);

  const undo = useCallback((): TimestampAction | null => {
    if (undoStack.length === 0) return null;
    const action = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, action]);
    return action;
  }, [undoStack]);

  const redo = useCallback((): TimestampAction | null => {
    if (redoStack.length === 0) return null;
    const action = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, action]);
    return action;
  }, [redoStack]);

  const clear = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  return {
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    pushAction,
    undo,
    redo,
    clear
  };
}
