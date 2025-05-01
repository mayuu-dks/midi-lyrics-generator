import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Midi } from '@tonejs/midi';
import {
  Music,
  FileAudio,
  AudioWaveform as Waveform,
  Sparkles,
  Settings,
  KeyRound as Key, // Renamed Key to KeyRound to avoid conflict if needed, or choose one
  RefreshCw,
  Globe,
  MessageSquare,
  AlertCircle,
  History,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  Check,
  Wand2,
  X,
  FileText,
  BrainCircuit
} from 'lucide-react';
import OpenAI from 'openai';
import {
  FileInput,
  Button,
  Textarea,
  Label,
  TextInput,
  Alert,
  Spinner,
  Checkbox // Checkbox was only in the first flowbite import
} from 'flowbite-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

interface MidiAnalysis {
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

type Language = 'ja' | 'en';

interface LyricsHistory {
  lyrics: string;
  timestamp: number;
}

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

function App() {
  const [midiData, setMidiData] = useState<MidiAnalysis | null>(null);
  const [lyrics, setLyrics] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [language, setLanguage] = useState<Language>('ja');
  const [apiKey, setApiKey] = useState(() => {
    try {
      const savedKey = localStorage.getItem('openai_api_key');
      return savedKey || '';
    } catch (error) {
      console.error('APIキーの取得に失敗しました:', error);
      return '';
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState('');
  const [songMood, setSongMood] = useState('');
  const [lyricsHistory, setLyricsHistory] = useState<LyricsHistory[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [isCopied, setIsCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openaiClientRef = useRef<OpenAI | null>(null);
  const midiDataRef = useRef<{ fileName: string | null; data: MidiAnalysis | null }>({ // This ref holds the current MIDI data and filename
    fileName: null,
    data: null
  });

  // Effect to manage lyrics history
  useEffect(() => {
    if (lyrics && (lyricsHistory.length === 0 || lyricsHistory[currentHistoryIndex]?.lyrics !== lyrics)) {
      const newHistory = [...lyricsHistory.slice(0, currentHistoryIndex + 1), {
        lyrics,
        timestamp: Date.now()
      }];
      setLyricsHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
    }
  }, [lyrics]);

  // Effect to reset history when a new file is loaded
  useEffect(() => {
    if (currentFileName) {
      setLyricsHistory([]);
      setCurrentHistoryIndex(-1);
    }
  }, [currentFileName]);

  // Function to navigate through lyrics history
  const navigateHistory = (direction: 'back' | 'forward') => {
    const newIndex = direction === 'back' 
      ? Math.max(0, currentHistoryIndex - 1)
      : Math.min(lyricsHistory.length - 1, currentHistoryIndex + 1);
    
    if (newIndex !== currentHistoryIndex) {
      setCurrentHistoryIndex(newIndex);
      setLyrics(lyricsHistory[newIndex].lyrics);
    }
  };

  // Initialize OpenAI client
  const initializeOpenAIClient = useCallback((key: string) => {
    try {
      const client = new OpenAI({
        apiKey: key,
        dangerouslyAllowBrowser: true
      });
      openaiClientRef.current = client;
      return true;
    } catch (error) {
      console.error('OpenAIクライアントの初期化に失敗しました:', error);
      openaiClientRef.current = null;
      return false;
    }
  }, []);

  // Effect to initialize OpenAI client when API key changes
  useEffect(() => {
    if (apiKey) {
      const success = initializeOpenAIClient(apiKey);
      if (success) {
        localStorage.setItem('openai_api_key', apiKey);
        setError(null);
      } else {
        setError('APIキーの設定に失敗しました');
      }
    } else {
      openaiClientRef.current = null;
    }
  }, [apiKey, initializeOpenAIClient]);

  // Effect to update the midiDataRef when midiData or currentFileName changes
  useEffect(() => {
    midiDataRef.current = {
      fileName: currentFileName,
      data: midiData
    };
  }, [midiData, currentFileName]);

  // Function to reset application state
  const resetState = useCallback(() => {
    console.log('状態をリセットしています...');
    setMidiData(null);
    setLyrics('');
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

  // Handle API key submission
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      const success = initializeOpenAIClient(apiKey);
      if (success) {
        localStorage.setItem('openai_api_key', apiKey);
        setShowSettings(false);
        setError(null);
      } else {
        setError('APIキーの設定に失敗しました');
      }
    }
  };

  // Handle API key deletion
  const handleApiKeyDelete = () => {
    setApiKey('');
    localStorage.removeItem('openai_api_key');
    openaiClientRef.current = null;
  };

  // Calculate syllables based on note duration (simple example)
  const calculateSyllables = (note: { duration: number; velocity: number }) => {
    const duration = note.duration;
    
    if (language === 'ja') {
      if (duration <= 0.125) return 1;
      if (duration <= 0.25) return 1;
      if (duration <= 0.5) return 1;
      if (duration <= 1.0) return 2;
      if (duration <= 2.0) return 2;
      return 2;
    } else { // English
      if (duration <= 0.125) return 1;
      if (duration <= 0.25) return 1;
      if (duration <= 0.5) return 1;
      if (duration <= 1.0) return 1;
      if (duration <= 2.0) return 1;
      return 1;
    }
  };

  // Generate prompt for AI based on MIDI data
  const generatePrompt = (midi: MidiAnalysis): { systemPrompt: string; userPrompt: string } => {
    const notesSummary = midi.notes
      .slice(0, 20) // Limit to first 20 notes for brevity
      .map(n => `${n.name}(${n.duration.toFixed(2)}s)`)
      .join(', ');

    const systemPrompt = `あなたはプロの作詞家です。提供されたMIDIファイルの分析情報に基づいて、感情豊かで、メロディに合った歌詞を生成してください。
曲のタイトル: ${songTitle || '指定なし'}
曲の雰囲気: ${songMood || '指定なし'}
歌詞の言語: ${language === 'ja' ? '日本語' : 'English'}`;    

    const userPrompt = `以下のMIDI分析情報に基づいて歌詞を生成してください：

ノート数: ${midi.noteCount}
曲の長さ: ${midi.duration.toFixed(2)}秒
平均ピッチ: ${midi.averagePitch.toFixed(2)}
最初のノートシーケンス (一部): ${notesSummary}

指示:
- メロディのリズムと音符の長さに合わせて、自然な歌詞を作成してください。
- ${songTitle ? `曲のタイトル「${songTitle}」を考慮してください。` : ''}
- ${songMood ? `曲の雰囲気「${songMood}」を反映させてください。` : ''}
- 歌詞は${language === 'ja' ? '日本語' : 'English'}で生成してください。
- 歌詞のみを出力し、説明や前置きは不要です。`;

    return { systemPrompt, userPrompt };
  };

  // Generate lyrics using AI
  const generateAILyrics = async (useEditedPrompt = false) => {
    const currentMidiState = midiDataRef.current;

    if (!currentMidiState.data) {
      setError('MIDIデータが読み込まれていません');
      return;
    }

    const prompts = generatePrompt(currentMidiState.data);
    const systemContent = useEditedPrompt ? customPrompt : prompts.systemPrompt;
    const userContent = prompts.userPrompt;

    // If not using edited prompt and customPrompt is empty, set it and show preview
    if (!useEditedPrompt && !customPrompt) {
      setCustomPrompt(systemContent); // Set the default system prompt for editing
      setShowPromptPreview(true);
      return;
    }
    // If using edited prompt, ensure customPrompt is set
    if (useEditedPrompt && !customPrompt) {
       setCustomPrompt(systemContent); // Fallback if customPrompt somehow became empty
    }

    if (!openaiClientRef.current) {
      setShowSettings(true);
      setError('APIキーが設定されていません');
      return;
    }

    setIsGeneratingAI(true);
    setError(null);
    setShowPromptPreview(false); // Close preview modal when generation starts

    try {
      console.log('AI生成リクエスト:', { systemContent, userContent });
      const response = await openaiClientRef.current.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemContent
          },
          {
            role: "user",
            content: userContent
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        // presence_penalty: 0.6, // Consider removing or adjusting these penalties
        // frequency_penalty: 0.6
      });

      console.log('AI応答:', response);
      const generatedLyrics = response.choices[0].message.content;
      if (generatedLyrics) {
        setLyrics(generatedLyrics.trim()); // Trim whitespace
      } else {
        setError('AIが歌詞を生成できませんでした。');
      }
    } catch (error: any) {
      console.error('AI歌詞生成中にエラーが発生しました:', error);
      setError(`AI歌詞の生成に失敗しました: ${error.message || '不明なエラー'}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Analyze MIDI file
  const analyzeMidi = useCallback(async (file: File) => {
    // Check if the same file is uploaded again
    if (file.name === midiDataRef.current.fileName && midiDataRef.current.data) {
      console.log('同じファイルが再度アップロードされました。スキップします:', file.name);
      return; // Avoid re-processing the same file
    }

    setIsLoading(true);
    setError(null);
    // Don't reset lyrics immediately, maybe keep the last generated one?
    // resetState(); // Consider if full reset is desired on new file upload
    setMidiData(null); // Clear previous MIDI data
    setCurrentFileName(null); // Clear previous filename
    setLyrics(''); // Clear lyrics for the new file
    setSongTitle(''); // Reset title
    setSongMood(''); // Reset mood
    setLyricsHistory([]); // Reset history
    setCurrentHistoryIndex(-1);
    
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
        averagePitch: totalNotes > 0 ? totalPitch / totalNotes : 0, // Avoid division by zero
        notes
      };
      
      setCurrentFileName(file.name);
      setMidiData(analysis);
      
      // Generate default prompt based on new analysis
      const prompts = generatePrompt(analysis);
      setCustomPrompt(prompts.systemPrompt); // Set default prompt for potential editing

      // Optionally generate placeholder lyrics
      // const defaultLyrics = notes.map(() => 'ラ').join(' ');
      // setLyrics(defaultLyrics);

    } catch (error) {
      console.error('MIDIファイルの解析中にエラーが発生しました:', error);
      setError('MIDIファイルの解析に失敗しました');
      // resetState(); // Reset state fully on error
      setMidiData(null);
      setCurrentFileName(null);
      setLyrics('');
    } finally {
      setIsLoading(false);
      // Reset file input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [resetState, generatePrompt]);

  // Handle file upload event
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      analyzeMidi(file);
      // event.target.value = ''; // Moved this to analyzeMidi finally block
    }
  }, [analyzeMidi]);

  // Handle copying generated lyrics
  const handleCopyLyrics = async () => {
    try {
      await navigator.clipboard.writeText(lyrics);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    } catch (err) {
      console.error('歌詞のコピーに失敗しました:', err);
      setError('クリップボードへのコピーに失敗しました。');
    }
  };

  // Handle copying the prompt from the modal
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(customPrompt);
      // Optionally show a temporary confirmation message near the copy button
    } catch (err) {
      console.error('プロンプトのコピーに失敗しました:', err);
    }
  };

  // Handle file input change
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      resetState(); // Reset state if no file is selected
      return;
    }

    // Reset state for the new file
    resetState();
    setCurrentFileName(file.name);
    setIsLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const midi = new Midi(arrayBuffer);

      const notes = midi.tracks.flatMap(track => track.notes);
      const totalDuration = midi.duration;
      const averagePitch = notes.length > 0
        ? notes.reduce((sum, note) => sum + note.midi, 0) / notes.length
        : 0;

      const analysis: MidiAnalysis = {
        noteCount: notes.length,
        duration: totalDuration,
        averagePitch: averagePitch,
        notes: notes.map(note => ({
          name: note.name,
          duration: note.duration,
          time: note.time,
          velocity: note.velocity
        }))
      };

      setMidiData(analysis);
      console.log('MIDIデータが正常に解析されました:', analysis);
    } catch (error) { // Explicitly type error as 'any' or 'unknown'
      console.error('MIDIファイルの解析中にエラーが発生しました:', error);
      setError(`MIDIファイルの解析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
      setMidiData(null);
      setCurrentFileName(null);
    } finally {
      setIsLoading(false);
    }
  }, [resetState]);

  // Copy lyrics to clipboard
  const copyLyricsToClipboard = () => {
    navigator.clipboard.writeText(lyrics)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
        setError('クリップボードへのコピーに失敗しました。');
      });
  };

  // Clear lyrics and history
  const clearLyrics = () => {
    setLyrics('');
    setLyricsHistory([]);
    setCurrentHistoryIndex(-1);
  };

  // Generate prompt preview
  const getPromptPreview = () => {
    if (!midiData) return { systemPrompt: '', userPrompt: '' };
    return generatePrompt(midiData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Music size={32} />
            <h1 className="text-2xl font-bold">MIDI Lyric Generator AI</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              color="light"
              size="sm"
              onClick={() => setLanguage(lang => lang === 'ja' ? 'en' : 'ja')}
              title={language === 'ja' ? "Switch to English" : "日本語に切り替え"}
            >
              <Globe size={16} className="mr-1" />
              {language === 'ja' ? 'EN' : 'JA'}
            </Button>
            <Button
              color="light"
              size="sm"
              onClick={() => setShowSettings(true)}
              title={language === 'ja' ? "設定" : "Settings"}
            >
              <Settings size={16} />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: File Input & MIDI Info */}
          <div className="space-y-6">
            {/* File Input Section */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <Label htmlFor="midi-file-upload" className="flex items-center text-lg font-semibold mb-3 text-gray-700">
                <FileAudio size={20} className="mr-2 text-purple-600" />
                {language === 'ja' ? '1. MIDIファイルを選択' : '1. Select MIDI File'}
              </Label>
              <FileInput
                id="midi-file-upload"
                accept=".mid,.midi"
                onChange={handleFileChange}
                ref={fileInputRef}
                helperText={language === 'ja' ? 'MIDIファイル (.mid, .midi) をアップロードしてください。' : 'Upload your MIDI file (.mid, .midi).'}
                className="mb-2"
              />
              {currentFileName && (
                <p className="text-sm text-gray-600 mt-2">
                  {language === 'ja' ? '読み込み中のファイル:' : 'Loaded file:'} <span className="font-medium">{currentFileName}</span>
                </p>
              )}
              <Button
                onClick={resetState}
                color="light"
                size="sm"
                className="mt-3"
                disabled={!currentFileName && !midiData && !lyrics}
                title={language === 'ja' ? "リセット" : "Reset"}
              >
                <RefreshCw size={16} className="mr-1" />
                {language === 'ja' ? 'リセット' : 'Reset'}
              </Button>
            </div>

            {/* MIDI Analysis Section */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[150px]">
              <h2 className="flex items-center text-lg font-semibold mb-3 text-gray-700">
                <Waveform size={20} className="mr-2 text-blue-600" />
                {language === 'ja' ? 'MIDI分析情報' : 'MIDI Analysis'}
              </h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Spinner aria-label="MIDIデータの読み込み中" size="lg" />
                  <span className="ml-2 text-gray-600">{language === 'ja' ? '解析中...' : 'Analyzing...'}</span>
                </div>
              ) : midiData ? (
                <div className="space-y-2 text-sm text-gray-700">
                  <p>{language === 'ja' ? 'ノート数:' : 'Note Count:'} <span className="font-medium">{midiData.noteCount}</span></p>
                  <p>{language === 'ja' ? '曲の長さ:' : 'Duration:'} <span className="font-medium">{midiData.duration.toFixed(2)} {language === 'ja' ? '秒' : 'seconds'}</span></p>
                  <p>{language === 'ja' ? '平均ピッチ:' : 'Average Pitch:'} <span className="font-medium">{midiData.averagePitch.toFixed(2)}</span></p>
                  {/* Add more details if needed */}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  {language === 'ja' ? 'MIDIファイルをアップロードすると、ここに分析情報が表示されます。' : 'Upload a MIDI file to see analysis here.'}
                </p>
              )}
            </div>

            {/* Song Details Input */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h2 className="flex items-center text-lg font-semibold mb-3 text-gray-700">
                <BrainCircuit size={20} className="mr-2 text-green-600" />
                {language === 'ja' ? '曲の詳細 (任意)' : 'Song Details (Optional)'}
              </h2>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="song-title" value={language === 'ja' ? '曲のタイトル' : 'Song Title'} className="mb-1 block text-sm font-medium text-gray-700" />
                  <TextInput
                    id="song-title"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder={language === 'ja' ? '例: 夏の終わりのメロディー' : 'e.g., Melody of Summer\'s End'}
                  />
                </div>
                <div>
                  <Label htmlFor="song-mood" value={language === 'ja' ? '曲の雰囲気' : 'Song Mood'} className="mb-1 block text-sm font-medium text-gray-700" />
                  <select
                    id="song-mood"
                    value={songMood}
                    onChange={(e) => setSongMood(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">{language === 'ja' ? '-- 選択してください --' : '-- Select Mood --'}</option>
                    {moodOptions[language].map(mood => (
                      <option key={mood} value={mood}>{mood}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Lyrics Generation & Output */}
          <div className="space-y-6">
            {/* Lyrics Generation Control */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h2 className="flex items-center text-lg font-semibold mb-3 text-gray-700">
                <Sparkles size={20} className="mr-2 text-yellow-500" />
                {language === 'ja' ? '2. 歌詞を生成' : '2. Generate Lyrics'}
              </h2>
              <Button
                onClick={() => generateAILyrics(false)} // Pass false to indicate initial generation
                disabled={!midiData || isGeneratingAI || !apiKey}
                isProcessing={isGeneratingAI}
                gradientDuoTone="purpleToBlue"
                size="lg"
                className="w-full"
              >
                {isGeneratingAI ? (
                  <>{language === 'ja' ? '生成中...' : 'Generating...'}</>
                ) : (
                  <>{language === 'ja' ? 'AIで歌詞を生成' : 'Generate Lyrics with AI'}</>
                )}
              </Button>
              {!apiKey && (
                <Alert color="warning" className="mt-3">
                  <span className="font-medium">{language === 'ja' ? '注意:' : 'Note:'}</span> {language === 'ja' ? '歌詞生成にはOpenAI APIキーが必要です。設定でキーを追加してください。' : 'OpenAI API Key required for generation. Add it in Settings.'}
                </Alert>
              )}
              {midiData && apiKey && (
                <Button
                  color="light"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setCustomPrompt(getPromptPreview().systemPrompt); // Ensure custom prompt is populated
                    setShowPromptPreview(true);
                  }}
                  title={language === 'ja' ? "プロンプトを編集" : "Edit Prompt"}
                >
                  <Wand2 size={16} className="mr-1" />
                  {language === 'ja' ? 'プロンプトを編集' : 'Edit Prompt'}
                </Button>
              )}
            </div>

            {/* Lyrics Output Section */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white min-h-[300px] flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h2 className="flex items-center text-lg font-semibold text-gray-700">
                  <FileText size={20} className="mr-2 text-pink-600" />
                  {language === 'ja' ? '生成された歌詞' : 'Generated Lyrics'}
                </h2>
                <div className="flex items-center space-x-2">
                  {/* History Navigation */}
                  <Button
                    color="light"
                    size="xs"
                    onClick={() => navigateHistory('back')}
                    disabled={currentHistoryIndex <= 0}
                    title={language === 'ja' ? "戻る" : "Undo"}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    color="light"
                    size="xs"
                    onClick={() => navigateHistory('forward')}
                    disabled={currentHistoryIndex === -1 || currentHistoryIndex >= lyricsHistory.length - 1}
                    title={language === 'ja' ? "進む" : "Redo"}
                  >
                    <ChevronRight size={16} />
                  </Button>
                  {/* Copy Button */}
                  <Button
                    color={isCopied ? "success" : "light"}
                    size="xs"
                    onClick={copyLyricsToClipboard}
                    disabled={!lyrics}
                    title={language === 'ja' ? "コピー" : "Copy"}
                  >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                  {/* Clear Button */}                  
                  <Button
                    color="light"
                    size="xs"
                    onClick={clearLyrics}
                    disabled={!lyrics}
                    title={language === 'ja' ? "クリア" : "Clear"}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <Textarea
                id="lyrics-output"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)} // Allow manual editing
                placeholder={language === 'ja' ? 'ここに歌詞が表示されます...' : 'Lyrics will appear here...'}
                rows={10}
                className="flex-grow resize-none text-sm font-mono bg-gray-50 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                readOnly={isGeneratingAI} // Make read-only while generating
              />
            </div>
          </div>
        </main>

        {/* Error Display */}
        {error && (
          <div className="p-6 pt-0">
            <Alert color="failure" onDismiss={() => setError(null)}>
              <div className="flex items-center">
                <AlertCircle size={20} className="mr-2" />
                <span className="font-medium">{language === 'ja' ? 'エラー:' : 'Error:'}</span>
              </div>
              <p className="ml-6 text-sm">{error}</p>
            </Alert>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600 border-t border-gray-200">
          MIDI Lyric Generator AI - {new Date().getFullYear()}
        </footer>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              title={language === 'ja' ? "閉じる" : "Close"}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Key size={20} className="mr-2 text-indigo-600" />
              {language === 'ja' ? 'APIキー設定' : 'API Key Settings'}
            </h2>
            <form onSubmit={handleApiKeySubmit} className="space-y-4">
              <div>
                <Label htmlFor="api-key" value="OpenAI API Key" className="mb-1 block text-sm font-medium text-gray-700" />
                <TextInput
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={language === 'ja' ? 'sk-...' : 'sk-...'}
                  required
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ja' ? 'APIキーはローカルストレージに保存されます。' : 'Your API key is stored locally in your browser.'}
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                {apiKey && (
                  <Button color="failure" size="sm" onClick={handleApiKeyDelete} type="button">
                    <Trash2 size={16} className="mr-1" />
                    {language === 'ja' ? 'キーを削除' : 'Delete Key'}
                  </Button>
                )}
                <Button type="submit" gradientDuoTone="purpleToBlue" size="sm">
                  {language === 'ja' ? '保存して閉じる' : 'Save & Close'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prompt Preview Modal */}
      {showPromptPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setShowPromptPreview(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              title={language === 'ja' ? "閉じる" : "Close"}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageSquare size={20} className="mr-2 text-teal-600" />
              {language === 'ja' ? 'プロンプトプレビューと編集' : 'Prompt Preview & Edit'}
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              {language === 'ja' ? 'これはAIに送信されるシステムプロンプトです。必要に応じて編集し、「編集したプロンプトで生成」をクリックしてください。' : 'This is the system prompt sent to the AI. Edit it if needed and click "Generate with Edited Prompt".'}
            </p>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={15}
              className="flex-grow resize-y text-sm font-mono bg-gray-50 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              placeholder={language === 'ja' ? 'システムプロンプトを編集...' : 'Edit system prompt...'}
            />
            <div className="flex justify-end space-x-3">
              <Button color="light" size="sm" onClick={() => setShowPromptPreview(false)}>
                {language === 'ja' ? 'キャンセル' : 'Cancel'}
              </Button>
              <Button
                gradientDuoTone="tealToLime"
                size="sm"
                onClick={() => generateAILyrics(true)} // Pass true to use the edited prompt
                disabled={isGeneratingAI || !customPrompt}
                isProcessing={isGeneratingAI}
              >
                {isGeneratingAI ? (
                  <>{language === 'ja' ? '生成中...' : 'Generating...'}</>
                ) : (
                  <>{language === 'ja' ? '編集したプロンプトで生成' : 'Generate with Edited Prompt'}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

<div className="mb-6">
  <Label htmlFor="midiFile" value="MIDIファイルを選択" className="mb-2 block text-lg font-medium" />
  <div className="flex items-center space-x-3">
    <FileInput
      id="midiFile"
      accept=".mid,.midi"
      onChange={handleFileChange}
      ref={fileInputRef}
      className="flex-grow"
      helperText={currentFileName ? `読み込み中: ${currentFileName}` : "MIDIファイル (.mid, .midi) を選択してください"}
    />
    {/* Removed the incorrect closing div and label structure here, FileInput handles its own label association */}
  </div>
</div>