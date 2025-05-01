import { useState, useRef, useCallback } from 'react';
import { Midi } from '@tonejs/midi';

export interface MidiAnalysis {
  noteCount: number;
  duration: number;
  averagePitch: number;
  notes: Array<{
    name: string;
    duration: number;
    time: number;
    velocity: number;
  }>;
}

export function useMidiAnalysis() {
  const [midiData, setMidiData] = useState<MidiAnalysis | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Store a reference to the current MIDI data
  const midiDataRef = useRef<{ fileName: string | null; data: MidiAnalysis | null }>({
    fileName: null,
    data: null
  });

  // Reset the application state
  const resetState = useCallback(() => {
    console.log('状態をリセットしています...');
    setMidiData(null);
    setError(null);
    setCurrentFileName(null);
    midiDataRef.current = {
      fileName: null,
      data: null
    };
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Analyze a MIDI file
  const analyzeMidi = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    const file = event.target.files[0];
    
    // Check if the same file is uploaded again
    if (file.name === midiDataRef.current.fileName && midiDataRef.current.data) {
      console.log('同じファイルが再度アップロードされました。スキップします:', file.name);
      return; // Avoid re-processing the same file
    }
    
    setIsLoading(true);
    setError(null);
    setMidiData(null);
    setCurrentFileName(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const midi = new Midi(arrayBuffer);
      
      let totalNotes = 0;
      let totalPitch = 0;
      const notes: MidiAnalysis['notes'] = [];
      
      midi.tracks.forEach(track => {
        track.notes.forEach(note => {
          totalNotes++;
          totalPitch += note.midi;
          notes.push({
            name: note.name,
            duration: note.duration,
            time: note.time,
            velocity: note.velocity
          });
        });
      });
      
      notes.sort((a, b) => a.time - b.time); // Sort notes by time
      
      const analysis: MidiAnalysis = {
        noteCount: totalNotes,
        duration: midi.duration,
        averagePitch: totalNotes > 0 ? totalPitch / totalNotes : 0,
        notes
      };
      
      setCurrentFileName(file.name);
      setMidiData(analysis);
      
      // Update the ref with the new MIDI data
      midiDataRef.current = {
        fileName: file.name,
        data: analysis
      };
      
    } catch (error) {
      console.error('MIDIファイルの解析中にエラーが発生しました:', error);
      setError(`MIDIファイルの解析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    midiData,
    currentFileName,
    isLoading,
    error,
    fileInputRef,
    analyzeMidi,
    resetState
  };
}
