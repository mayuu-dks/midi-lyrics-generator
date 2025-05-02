import { useState, useEffect } from 'react';
import { Music, Globe, Settings } from 'lucide-react';
import ControlPanel from './control-panel';
import ContentPanel from './content-panel';
import SettingsModal from './settings-modal';
import PromptPreviewModal from './prompt-preview-modal';
import TempLyricsEditor from './temp-lyrics-editor';
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
  const [showTempLyricsEditor, setShowTempLyricsEditor] = useState<boolean>(false);
  const [customTempLyrics, setCustomTempLyrics] = useState<string>('');
  
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
    handleApiKeyDelete,
    currentUserPrompt
  } = useLyricsGenerator({
    midiData,
    currentFileName,
    language,
    songTitle,
    songMood,
    customPrompt,
    setCustomPrompt,
    setShowPromptPreview,
    customTempLyrics
  });

  const error = midiError || lyricsError;

  // MIDIが読み込まれたら仮歌詞エディタを表示
  useEffect(() => {
    if (midiData) {
      setShowTempLyricsEditor(true);
    } else {
      setShowTempLyricsEditor(false);
      setCustomTempLyrics('');
    }
  }, [midiData]);

  // 仮歌詞が更新されたらカスタム仮歌詞を保存
  const handleTempLyricsUpdate = (tempLyrics: string) => {
    setCustomTempLyrics(tempLyrics);
  };
  
  // カスタム仮歌詞が更新されたら AI プロンプトに反映されるように適切なタイミングで再生成条件を見直す
  useEffect(() => {
    if (midiData && customTempLyrics) {
      // customTempLyricsが変更された場合は、AI生成は自動トリガーしないが、ユーザーが予測できるようにプレビューを更新
      // useLyricsGenerator の中でカスタム仮歌詞の変更に基づいて自動的にプロンプトが更新される
    }
  }, [midiData, customTempLyrics]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ja' ? 'en' : 'ja');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* App Header */}
      <header className="mb-6">
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
        
        <div className="mt-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-sm">
          <div className="font-medium mb-2 text-blue-800 dark:text-blue-300">
            {language === 'ja' 
              ? 'MIDIファイルから日本語/英語の歌詞を自動生成するツール' 
              : 'Generate Japanese/English lyrics from MIDI files'}
          </div>
          
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            {language === 'ja' ? (
              <>
                <li>MIDIファイルをアップロードして、メロディに合った歌詞をAI生成（ヒント：Aメロ、サビなどパートごとに分けて生成したほうがわかりやすいです）</li>
                <li>最新のAIモデル <strong>OpenAI GPT-4o</strong> を使用（APIキーは右上の設定ボタンから設定可能）</li>
                <li>日本語と英語の両方で歌詞を作成可能（右上のボタンで切り替え可能）</li>
                <li>【重要】OpenAI APIキーの設定がなくても、プロンプトを生成してコピーし、他のAIサービスで使用可能</li>
              </>
            ) : (
              <>
                <li>Upload a MIDI file and generate lyrics that match the melody (Tip: For better results, create separate MIDI files for verse, chorus, etc.)</li>
                <li>Uses the latest AI model <strong>OpenAI GPT-4o</strong> (set API key via settings button in the top-right)</li>
                <li>Create lyrics in both Japanese and English (switch language with the button in the top-right)</li>
                <li><strong>Important:</strong> Even without an OpenAI API key, you can generate and copy the prompts to use with other AI services</li>
              </>
            )}
          </ul>
          
          <div className="mt-3 text-xs flex flex-wrap gap-3">
            <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              {language === 'ja' ? '使用AIモデル: OpenAI GPT-4o' : 'AI Model: OpenAI GPT-4o'}
            </div>
            <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              {language === 'ja' ? '対応言語: 日本語 / 英語' : 'Languages: Japanese / English'}
            </div>
          </div>
        </div>
      </header>

      {/* 仮歌詞エディタ */}
      <TempLyricsEditor 
        midiData={midiData}
        onTempLyricsUpdate={handleTempLyricsUpdate}
        isVisible={showTempLyricsEditor}
        currentFileName={currentFileName}
      />

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
          userPrompt={currentUserPrompt}
          setCustomPrompt={setCustomPrompt}
          onGenerate={() => {
            setShowPromptPreview(false);
            generateAILyrics(true);
          }}
          onClose={() => setShowPromptPreview(false)}
        />
      )}
    </div>
  );
}
