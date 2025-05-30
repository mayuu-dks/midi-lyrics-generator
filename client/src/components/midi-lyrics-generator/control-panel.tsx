import { FileAudio, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MidiAnalysis } from '@/hooks/use-midi-analysis';

// We define types locally to avoid circular dependencies
type Language = 'ja' | 'en';

interface ControlPanelProps {
  language: Language;
  songTitle: string;
  songMood: string;
  midiData: MidiAnalysis | null;
  currentFileName: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  setSongTitle: (title: string) => void;
  setSongMood: (mood: string) => void;
  analyzeMidi: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  resetState: () => void;
  generateAILyrics: (useEditedPrompt?: boolean) => Promise<void>;
  moodOptions: {
    ja: string[];
    en: string[];
  };
}

export default function ControlPanel({
  language,
  songTitle,
  songMood,
  midiData,
  currentFileName,
  fileInputRef,
  setSongTitle,
  setSongMood,
  analyzeMidi,
  resetState,
  generateAILyrics,
  moodOptions
}: ControlPanelProps) {
  const currentMoodOptions = moodOptions[language as keyof typeof moodOptions];
  
  return (
    <div className="w-full lg:w-1/3 space-y-6">
      {/* File Upload Section */}
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FileAudio size={20} />
          {language === 'ja' ? 'MIDI ファイル' : 'MIDI File'}
        </h2>
        
        <div className="mb-6">
          <Label htmlFor="midi_file" className="mb-2">
            {language === 'ja' ? 'MIDI ファイルをアップロード' : 'Upload MIDI file'}
          </Label>
          <div className="relative">
            <input
              id="midi_file"
              ref={fileInputRef}
              type="file"
              accept=".mid,.midi"
              onChange={analyzeMidi}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="flex items-center text-muted-foreground w-full">
                <FileAudio className="mr-2 h-4 w-4" />
                <span className="flex-1 truncate">
                  {currentFileName
                    ? currentFileName
                    : language === 'ja' ? 'MIDIファイルを選択' : 'Choose MIDI file'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {midiData && (
          <div className="p-4 mb-4 text-sm text-primary-800 rounded-lg bg-primary-50 dark:bg-gray-700 dark:text-primary-400 flex flex-col">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">{language === 'ja' ? 'ノート数:' : 'Notes:'}</span>{' '}
                {midiData.noteCount}
              </div>
              <div>
                <span className="font-medium">{language === 'ja' ? '長さ:' : 'Duration:'}</span>{' '}
                {midiData.duration.toFixed(2)}{language === 'ja' ? '秒' : 's'}
              </div>
              <div>
                <span className="font-medium">{language === 'ja' ? '平均ピッチ:' : 'Avg Pitch:'}</span>{' '}
                {midiData.averagePitch.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Reset Button */}
        <Button
          variant="outline"
          className="w-full border-gray-200 dark:border-gray-600"
          onClick={resetState}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {language === 'ja' ? 'リセット' : 'Reset'}
        </Button>
      </div>

      {/* Song Details Section */}
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Waveform size={20} />
          {language === 'ja' ? '曲の詳細' : 'Song Details'}
        </h2>
        
        <div className="mb-4">
          <Label htmlFor="song_title" className="mb-2">
            {language === 'ja' ? 'タイトル (オプション)' : 'Title (Optional)'}
          </Label>
          <Input
            id="song_title"
            type="text"
            placeholder={language === 'ja' ? '曲のタイトル' : 'Song title'}
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="song_mood" className="mb-2">
            {language === 'ja' ? '雰囲気 (オプション)' : 'Mood (Optional)'}
          </Label>
          <Select value={songMood} onValueChange={setSongMood}>
            <SelectTrigger id="song_mood">
              <SelectValue placeholder={language === 'ja' ? '雰囲気を選択' : 'Select mood'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{language === 'ja' ? '雰囲気を選択' : 'Select mood'}</SelectItem>
              {currentMoodOptions.map((mood: string) => (
                <SelectItem key={mood} value={mood}>
                  {mood}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* AI Generation Button */}
        <Button 
          className="w-full" 
          onClick={() => generateAILyrics()}
          disabled={!midiData}
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {language === 'ja' ? 'プロンプトを生成' : 'Generate Prompt'}
        </Button>
      </div>
    </div>
  );
}

// Imported at the bottom to avoid circular dependencies
import { Wand2 } from 'lucide-react';
import { AudioWaveform as Waveform } from 'lucide-react';
