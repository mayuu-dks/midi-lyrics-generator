import { FileText, ChevronLeft, ChevronRight, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
// We define types locally to avoid circular dependencies
type Language = 'ja' | 'en';

interface LyricsHistory {
  lyrics: string;
  timestamp: number;
}

interface ContentPanelProps {
  lyrics: string;
  isLoading: boolean;
  isGeneratingAI: boolean;
  error: string | null;
  lyricsHistory: LyricsHistory[];
  currentHistoryIndex: number;
  isCopied: boolean;
  navigateHistory: (direction: 'back' | 'forward') => void;
  copyLyrics: () => void;
  language: Language;
}

export default function ContentPanel({
  lyrics,
  isLoading,
  isGeneratingAI,
  error,
  lyricsHistory,
  currentHistoryIndex,
  isCopied,
  navigateHistory,
  copyLyrics,
  language
}: ContentPanelProps) {
  const showEmptyState = !lyrics && !isLoading && !isGeneratingAI && !error;
  
  return (
    <div className="w-full lg:w-2/3">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Lyrics Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={20} />
            {language === 'ja' ? '生成された歌詞' : 'Generated Lyrics'}
          </h2>
          <div className="flex items-center gap-2">
            {/* History Navigation */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateHistory('back')}
                disabled={currentHistoryIndex <= 0 || lyricsHistory.length === 0}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateHistory('forward')}
                disabled={currentHistoryIndex >= lyricsHistory.length - 1 || lyricsHistory.length === 0}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Copy Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={copyLyrics}
              disabled={!lyrics}
              className="h-8 w-8"
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Lyrics Content */}
        <div className="p-4 min-h-[50vh]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="text-center">
                <Spinner className="h-8 w-8 mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ja' ? 'MIDIファイルを解析中...' : 'Analyzing MIDI file...'}
                </p>
              </div>
            </div>
          )}

          {/* AI Generating State */}
          {isGeneratingAI && (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="text-center">
                <Spinner className="h-8 w-8 mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ja' ? 'AIが歌詞を生成中...' : 'AI is generating lyrics...'}
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {showEmptyState && (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="text-center max-w-md">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-50 dark:bg-gray-700 mb-4">
                  <Sparkles className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {language === 'ja' ? 'MIDIから歌詞を生成' : 'Generate Lyrics from MIDI'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {language === 'ja' 
                    ? 'MIDIファイルをアップロードして、AIを使って曲に合った歌詞を自動生成します。'
                    : 'Upload a MIDI file and generate lyrics that match your music using AI.'}
                </p>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-400">
                      <Music className="h-5 w-5" />
                    </div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {language === 'ja' ? 'MIDIファイルをアップロード' : 'Upload MIDI file'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-400">
                      <Key className="h-5 w-5" />
                    </div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {language === 'ja' ? 'APIキーを設定（設定しなくても使えます）' : 'Set API key (optional)'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-400">
                      <Wand2 className="h-5 w-5" />
                    </div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {language === 'ja' ? 'AIで歌詞を生成' : 'Generate lyrics with AI'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lyrics Display */}
          {lyrics && !isLoading && !isGeneratingAI && (
            <pre className="lyrics-container font-sans whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {lyrics}
            </pre>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

// Imported at the bottom to avoid circular dependencies
import { Music, KeyRound as Key, Wand2 } from 'lucide-react';
