import { useState, useEffect } from 'react';
import { Music, Globe, Settings, HelpCircle } from 'lucide-react';
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
  // localStorageが利用可能か確認し、APIプロバイダー設定がなければ初期化
  useEffect(() => {
    try {
      // Web Componentモードの時にもイベントを通知
      if (window.customElements && window.customElements.get('midi-lyrics-generator')) {
        console.log('MidiLyricsGenerator Web Component connected');
      }
      
      const provider = localStorage.getItem('ai_provider');
      console.log(`MidiLyricsGenerator初期化、localStorage確認: ai_provider=${provider}`);
      
      // APIプロバイダー設定がない場合は初期化
      if (!provider) {
        console.log('☺️ APIプロバイダー設定が見つからないため、antrhopicを設定します');
        localStorage.setItem('ai_provider', 'anthropic');
      }
    } catch (err) {
      console.error('ローカルストレージアクセスエラー:', err);
    }
  }, []);
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
    apiProvider,
    setApiProvider,
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
                <li>最新のAIモデル <strong>Anthropic Claude 3.7 Sonnet</strong>、<strong>OpenAI GPT-4o</strong>、または <strong>Google Gemini 2.0 Flash</strong> を使用（APIキーは右上の設定ボタンから設定可能）</li>
                <li>日本語と英語の両方で歌詞を作成可能（右上のボタンで切り替え可能）</li>
                <li className="bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded border border-yellow-200 dark:border-yellow-700 font-medium">【重要】APIキーの設定がなくても、プロンプトを生成してコピーし、他のAIサービスで使用可能</li>
              </>
            ) : (
              <>
                <li>Upload a MIDI file and generate lyrics that match the melody (Tip: For better results, create separate MIDI files for verse, chorus, etc.)</li>
                <li>Uses the latest AI models <strong>Anthropic Claude 3.7 Sonnet</strong>, <strong>OpenAI GPT-4o</strong>, or <strong>Google Gemini 2.0 Flash</strong> (set API key via settings button in the top-right)</li>
                <li>Create lyrics in both Japanese and English (switch language with the button in the top-right)</li>
                <li className="bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded border border-yellow-200 dark:border-yellow-700 font-medium"><strong>Important:</strong> Even without an API key, you can generate and copy the prompts to use with other AI services</li>
              </>
            )}
          </ul>
          
          <div className="mt-3 text-xs flex flex-wrap gap-3">
            <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              {language === 'ja' 
                ? `使用AIモデル: ${apiProvider === 'openai' ? 'OpenAI GPT-4o' : apiProvider === 'google25' ? 'Google Gemini 2.0 Flash' : 'Anthropic Claude 3.7 Sonnet'}` 
                : `AI Model: ${apiProvider === 'openai' ? 'OpenAI GPT-4o' : apiProvider === 'google25' ? 'Google Gemini 2.0 Flash' : 'Anthropic Claude 3.7 Sonnet'}`}
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
        language={language}
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

      {/* FAQ Section */}
      <div className="mt-12 mb-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} />
          {language === 'ja' ? 'よくある質問' : 'Frequently Asked Questions'}
        </h2>
        
        <div className="space-y-4">

          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'ja' ? 'Q: 設定したAPIキー（Anthropic/OpenAI/Google）はどこに保存されるの？' : 'Q: Where are the API keys (Anthropic/OpenAI/Google) stored?'}
            </h3>
            <div className="text-gray-700 dark:text-gray-300">
              {language === 'ja' ? (
                <p>
                  APIキーはブラウザの「localStorage」に保存されます。これは以下の特徴があります：(1) ローカルストレージはブラウザ内に保存されるため、サーバーには送信されません (2) 同じブラウザ・同じデバイスでアプリを再度開いた場合に自動的に読み込まれます (3) 異なるブラウザやデバイス、またはプライベートモード/シークレットモードでは保存されません (4) ブラウザの履歴やキャッシュをクリアした場合は削除されます。セキュリティの観点では、APIキーはユーザーのデバイス内のみに保存され、アプリのサーバーサイドには保存されないため、サーバー側でのデータ漏洩リスクはありません。公共のコンピュータを使用する場合は、使用後にAPIキーを削除することをお勧めします。
                </p>
              ) : (
                <p>
                  API keys are stored in the browser's "localStorage". This has the following characteristics: (1) LocalStorage is saved within the browser and not sent to any server (2) It automatically loads when you open the app again in the same browser on the same device (3) It's not preserved across different browsers, devices, or when using private/incognito mode (4) It's deleted when browser history or cache is cleared. From a security perspective, API keys are stored only on the user's device and not on the app's server side, eliminating the risk of data leaks from the server. If using a public computer, it's recommended to delete the API key after use.
                </p>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'ja' ? 'Q: アップロードしたMIDIファイルはどこに送られるの？' : 'Q: Where are uploaded MIDI files sent?'}
            </h3>
            <div className="text-gray-700 dark:text-gray-300">
              {language === 'ja' ? (
                <p>
                  アップロードされたMIDIファイルは、ブラウザ内でのみ処理され、どこのサーバーにも送信されません。具体的には：(1) ファイルはブラウザのメモリ上に読み込まれます (2) ブラウザ内でMIDIファイルを解析・分析します (3) 分析結果（音符の数、長さ、ピッチなど）のみがアプリ内で利用されます (4) MIDIファイル自体は保存されず、ブラウザのメモリ上にのみ一時的に存在します (5) ブラウザを閉じるか、ページをリロードすると、読み込まれたMIDIデータは消去されます。このシステムはプライバシーとセキュリティを考慮して設計されており、MIDIファイルデータが外部に送信されることはありません。
                </p>
              ) : (
                <p>
                  Uploaded MIDI files are processed only within the browser and are not sent to any server. Specifically: (1) Files are loaded into the browser's memory (2) MIDI files are parsed and analyzed within the browser (3) Only the analysis results (number of notes, duration, pitch, etc.) are used within the app (4) The MIDI file itself is not saved and exists temporarily only in the browser's memory (5) When the browser is closed or the page is reloaded, the loaded MIDI data is erased. This system is designed with privacy and security in mind, ensuring that MIDI file data is never transmitted externally.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <footer className="mt-8 mb-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        &copy; 2025 MayuÜ
      </footer>

      {/* Modals */}
      {showSettings && (
        <SettingsModal 
          apiKey={apiKey}
          setApiKey={setApiKey}
          apiProvider={apiProvider}
          setApiProvider={setApiProvider}
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
          apiKey={apiKey}
          apiProvider={apiProvider}
          language={language}
        />
      )}
    </div>
  );
}
