import { useState, useRef, useEffect, useCallback } from 'react';
import OpenAI from 'openai';
import type { MidiAnalysis } from './use-midi-analysis';
// Define types since importing from midi-lyrics-generator would cause circular dependencies
type Language = 'ja' | 'en';

interface LyricsHistory {
  lyrics: string;
  timestamp: number;
}

interface UseLyricsGeneratorProps {
  midiData: MidiAnalysis | null;
  currentFileName: string | null;
  language: Language;
  songTitle: string;
  songMood: string;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  setShowPromptPreview: (show: boolean) => void;
}

export function useLyricsGenerator({
  midiData,
  currentFileName,
  language,
  songTitle,
  songMood,
  customPrompt,
  setCustomPrompt,
  setShowPromptPreview
}: UseLyricsGeneratorProps) {
  const [lyrics, setLyrics] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => {
    try {
      const savedKey = localStorage.getItem('openai_api_key');
      return savedKey || '';
    } catch (error) {
      console.error('APIキーの取得に失敗しました:', error);
      return '';
    }
  });
  const [lyricsHistory, setLyricsHistory] = useState<LyricsHistory[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [isCopied, setIsCopied] = useState(false);
  
  const openaiClientRef = useRef<OpenAI | null>(null);
  
  // Initialize OpenAI client when API key changes
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
  }, [lyrics, lyricsHistory, currentHistoryIndex]);
  
  // Effect to reset history when a new file is loaded
  useEffect(() => {
    if (currentFileName) {
      setLyricsHistory([]);
      setCurrentHistoryIndex(-1);
    }
  }, [currentFileName]);
  
  // Generate prompt for AI based on MIDI data
  const generatePrompt = (midi: MidiAnalysis): { systemPrompt: string; userPrompt: string } => {
    const notesSummary = midi.notes
      .slice(0, 20) // Limit to first 20 notes for brevity
      .map(n => `${n.name}(${n.duration.toFixed(2)}s)`)
      .join(', ');
      
    const moodText = songMood && songMood !== 'none' ? songMood : '指定なし';
    
    const systemPrompt = `あなたはプロの作詞家です。提供されたMIDIファイルの分析情報に基づいて、感情豊かで、メロディに合った歌詞を生成してください。
曲のタイトル: ${songTitle || '指定なし'}
曲の雰囲気: ${moodText}
歌詞の言語: ${language === 'ja' ? '日本語' : 'English'}`;
    
    const userPrompt = `以下のMIDI分析情報に基づいて歌詞を生成してください：

ノート数: ${midi.noteCount}
曲の長さ: ${midi.duration.toFixed(2)}秒
平均ピッチ: ${midi.averagePitch.toFixed(2)}
最初のノートシーケンス (一部): ${notesSummary}

指示:
- メロディのリズムと音符の長さに合わせて、自然な歌詞を作成してください。
- ${songTitle ? `曲のタイトル「${songTitle}」を考慮してください。` : ''}
- ${(songMood && songMood !== 'none') ? `曲の雰囲気「${songMood}」を反映させてください。` : ''}
- 歌詞は${language === 'ja' ? '日本語' : 'English'}で生成してください。
- 歌詞のみを出力し、説明や前置きは不要です。`;
    
    return { systemPrompt, userPrompt };
  };
  
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
  
  // Copy lyrics to clipboard
  const copyLyrics = useCallback(() => {
    if (!lyrics) return;
    
    navigator.clipboard.writeText(lyrics).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }).catch(err => {
      console.error('クリップボードへのコピーに失敗しました:', err);
      setError('歌詞のコピーに失敗しました');
    });
  }, [lyrics]);
  
  // Generate lyrics using AI
  const generateAILyrics = async (useEditedPrompt = false) => {
    if (!midiData) {
      setError('MIDIデータが読み込まれていません');
      return;
    }
    
    const prompts = generatePrompt(midiData);
    const systemContent = useEditedPrompt ? customPrompt : prompts.systemPrompt;
    const userContent = prompts.userPrompt;
    
    // Always show prompt preview when not explicitly using edited prompt
    if (!useEditedPrompt) {
      setCustomPrompt(systemContent); // Set the system prompt for editing
      setShowPromptPreview(true);
      return;
    }
    
    // If using edited prompt, ensure customPrompt is set
    if (useEditedPrompt && !customPrompt) {
      setCustomPrompt(systemContent); // Fallback if customPrompt somehow became empty
    }
    
    if (!openaiClientRef.current) {
      setError('APIキーが設定されていません');
      return;
    }
    
    setIsGeneratingAI(true);
    setError(null);
    
    try {
      console.log('AI生成リクエスト:', { systemContent, userContent });
      const response = await openaiClientRef.current.chat.completions.create({
        model: "gpt-4o", // Using the newest OpenAI model gpt-4o which was released May 13, 2024
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
  
  // Handle API key submission
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      const success = initializeOpenAIClient(apiKey);
      if (success) {
        localStorage.setItem('openai_api_key', apiKey);
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
  
  return {
    lyrics,
    error,
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
  };
}
