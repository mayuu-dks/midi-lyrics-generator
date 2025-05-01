import { useState } from 'react';
import { Music } from 'lucide-react';
import ControlPanel from './control-panel';
import ContentPanel from './content-panel';
import SettingsModal from './settings-modal';
import PromptPreviewModal from './prompt-preview-modal';
import { useMidiAnalysis } from '@/hooks/use-midi-analysis';
import { useLyricsGenerator } from '@/hooks/use-lyrics-generator';

// Centralized language and mood options
const moodOptions = {
  ja: [
    '明るい', '切ない', '激しい', '穏やか', 
    'ロマンティック', '元気', '悲しい', '希望に満ちた',
    'ダンサブル', '神秘的', 'エモーショナル', '力強い'
  ],
  en: [
    'Cheerful', 'Melancholic', 'Intense', 'Calm',
    'Romantic', 'Energetic', 'Sad', 'Hopeful',
    'Danceable', 'Mysterious', 'Emotional', 'Powerful'
  ]
};

type Language = 'ja' | 'en';

interface LyricsHistory {
  lyrics: string;
  timestamp: number;
}

export default function MidiLyricsGenerator() {
  const [language, setLanguage] = useState<Language>('ja');
  const [showSettings, setShowSettings] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songMood, setSongMood] = useState('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  const {
    midiData,
    currentFileName,
    isLoading,
    error: midiError,
    fileInputRef,
    analyzeMidi,
    resetState
  } = useMidiAnalysis();

  const {
    lyrics,
    error: lyricsError,
    isGeneratingAI,
    lyricsHistory,
    currentHistoryIndex,
    isCopied,
    apiKey,
    setApiKey,
    generateAILyrics,
    navigateHistory,
    copyLyrics,
    handleApiKeySubmit,
    handleApiKeyDelete
  } = useLyricsGenerator({
    midiData,
    currentFileName,
    language,
    songTitle,
    songMood,
    customPrompt,
    setCustomPrompt,
    setShowPromptPreview
  });

  const error = midiError || lyricsError;

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ja' ? 'en' : 'ja');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* App Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-primary-600 dark:text-primary-400">
              <Music size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              MIDI Lyrics Generator
            </h1>
          </div>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={toggleLanguage}
              className="inline-flex items-center p-2 text-sm font-medium text-center text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 focus:ring-4 focus:outline-none dark:text-primary-400 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <Globe className="mr-2" size={20} />
              <span>{language === 'ja' ? 'English' : '日本語'}</span>
            </button>
            <button 
              type="button" 
              onClick={() => setShowSettings(true)}
              className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-6">
        <ControlPanel 
          language={language}
          songTitle={songTitle}
          songMood={songMood}
          midiData={midiData}
          currentFileName={currentFileName}
          fileInputRef={fileInputRef}
          setSongTitle={setSongTitle}
          setSongMood={setSongMood}
          analyzeMidi={analyzeMidi}
          resetState={resetState}
          generateAILyrics={generateAILyrics}
          moodOptions={moodOptions}
        />

        <ContentPanel 
          lyrics={lyrics}
          isLoading={isLoading}
          isGeneratingAI={isGeneratingAI}
          error={error}
          lyricsHistory={lyricsHistory}
          currentHistoryIndex={currentHistoryIndex}
          isCopied={isCopied}
          navigateHistory={navigateHistory}
          copyLyrics={copyLyrics}
          language={language}
        />
      </main>

      {/* Modals */}
      {showSettings && (
        <SettingsModal 
          apiKey={apiKey}
          setApiKey={setApiKey}
          onSubmit={handleApiKeySubmit}
          onDelete={handleApiKeyDelete}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showPromptPreview && (
        <PromptPreviewModal 
          customPrompt={customPrompt}
          setCustomPrompt={setCustomPrompt}
          onGenerate={() => generateAILyrics(true)}
          onClose={() => setShowPromptPreview(false)}
        />
      )}
    </div>
  );
}

// Moved the imported components here to avoid circular dependencies
import { Globe, Settings } from 'lucide-react';
