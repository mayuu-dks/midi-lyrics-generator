import { useState, useEffect, useCallback } from 'react';
import type { MidiAnalysis } from './use-midi-analysis';
import { useAIProvider } from './use-ai-provider';
import { ApiProvider } from '@/components/midi-lyrics-generator/settings-modal';

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
  customTempLyrics?: string;
}

export function useLyricsGenerator({
  midiData,
  currentFileName,
  language,
  songTitle,
  songMood,
  customPrompt,
  setCustomPrompt,
  setShowPromptPreview,
  customTempLyrics = ''
}: UseLyricsGeneratorProps) {
  const [lyrics, setLyrics] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lyricsHistory, setLyricsHistory] = useState<LyricsHistory[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [isCopied, setIsCopied] = useState(false);
  const [currentUserPrompt, setCurrentUserPrompt] = useState<string>('');
  
  // AI Providerの設定を使用
  const {
    aiClient,
    apiKey,
    apiProvider,
    setApiKey,
    setApiProvider,
    handleApiKeySubmit,
    handleApiKeyDelete,
    isClientReady
  } = useAIProvider();
  
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
  const generatePrompt = useCallback((midi: MidiAnalysis): { systemPrompt: string; userPrompt: string } => {
    // 詳細な音符分析を行う
    const notesSummary = midi.notes
      .slice(0, 20) // Limit to first 20 notes for brevity
      .map(n => `${n.name}(${n.duration.toFixed(2)}s)`)
      .join(', ');
    
    // 音符の長さごとに分類
    const notesByDuration = {
      veryShort: 0, // 32分音符以下 (0.125秒以下)
      short: 0,     // 16分音符 (0.125秒〜0.25秒)
      eighth: 0,    // 8分音符 (0.25秒〜0.5秒)
      quarter: 0,   // 4分音符 (0.5秒〜1.0秒)
      half: 0,      // 2分音符 (1.0秒〜2.0秒)
      whole: 0      // 全音符以上 (2.0秒以上)
    };
    
    // 音符の長さに基づく記号表現の配列
    const phrasePatterns: string[] = [];
    
    // 音符を長さに応じて分類
    midi.notes.forEach(note => {
      const duration = note.duration;
      
      if (duration <= 0.125) {
        notesByDuration.veryShort++;
        phrasePatterns.push('ラ');
      } else if (duration <= 0.25) {
        notesByDuration.short++;
        phrasePatterns.push('ラ');
      } else if (duration <= 0.5) {
        notesByDuration.eighth++;
        phrasePatterns.push('ラ');
      } else if (duration <= 1.0) {
        notesByDuration.quarter++;
        phrasePatterns.push('ラー');
      } else if (duration <= 2.0) {
        notesByDuration.half++;
        phrasePatterns.push('ラーー');
      } else {
        notesByDuration.whole++;
        phrasePatterns.push('ラーー');
      }
    });
    
    // フレーズのまとまりを作成（4音符ごとにグループ化）
    const phrasesGrouped: string[] = [];
    let currentPhrase: string[] = [];
    
    phrasePatterns.forEach((pattern, index) => {
      currentPhrase.push(pattern);
      if ((index + 1) % 4 === 0 || index === phrasePatterns.length - 1) {
        phrasesGrouped.push(currentPhrase.join(','));
        currentPhrase = [];
      }
    });
    
    // 最終的なフレーズパターン文字列を生成
    let fullPhrasePattern = phrasesGrouped.join('  ');
    
    // カスタム仮歌詞が指定されている場合はそちらを使用
    if (customTempLyrics && customTempLyrics.trim()) {
      fullPhrasePattern = customTempLyrics;
    }
    
    const moodText = songMood && songMood !== 'none' ? songMood : '指定なし';
    
    const systemPrompt = `あなたはプロの作詞家です。提供されたMIDIファイルの分析情報に基づいて、メロディに完全に合った歌詞を生成してください。
曲のタイトル: ${songTitle || '指定なし'}
曲の雰囲気: ${moodText}
歌詞の言語: ${language === 'ja' ? '日本語' : 'English'}`;
    
    const userPrompt = `音符パターンに完全に一致する歌詞を生成してください。

曲の設定:
タイトル: ${songTitle || '指定なし'}
イメージ: ${moodText}

音符パターンの詳細:
32分音符以下: ${notesByDuration.veryShort}個
16分音符: ${notesByDuration.short}個
8分音符: ${notesByDuration.eighth}個
4分音符: ${notesByDuration.quarter}個
2分音符: ${notesByDuration.half}個
全音符以上: ${notesByDuration.whole}個

絶対に守るべき制約：
1. 音符数の厳密な一致:
   - ${midi.noteCount}個の音符に対応する音節を生成すること
   - 音符数の差異は許容しない
   - 1音符に対して1音節を基本とする
   - 音符の長さに応じて最大音節数が変化する

2. 音符の長さと音節数の厳密な対応:
   - 32分音符以下: 1音節のみ
   - 16分音符: 1音節のみ
   - 8分音符: 1音節のみ
   - 4分音符: 最大2音節
   - 2分音符: 最大2音節
   - 全音符以上: 最大2音節

3. 表現とフォーマット:
   - 余計な説明や前置き、コメントを含めないこと
   - 余分な文字や空白を追加しないこと
   - 自然な${language === 'ja' ? '日本語' : '英語'}の流れを維持すること
   - 前回の生成結果は考慮しないこと
   - タイトルと曲調に合った内容にすること

4. 音符パターンの順序と文節のまとまり:
   以下の音符パターンに従って歌詞を生成してください。
   カンマ(,)で区切られている場合、それらは一つの文節として扱ってください。

仮歌詞の表記ルール:
- 8分音符以下の短い音符: 「ラ」
- 4分音符: 「ラー」
- 2分音符以上: 「ラーー」
- 1拍以上の休符: 「ッ」（前のフレーズの後に配置）
- カンマ(,)はメロディと歌詞の文節の区切りを示し、カンマで区切られた音符は一つの文節として扱われます

現在のフレーズのまとまり:
${fullPhrasePattern}

最初のノートシーケンス (一部): ${notesSummary}

指示:
- メロディのリズムと音符の長さに合わせて、自然な歌詞を作成してください。
- ${songTitle ? `曲のタイトル「${songTitle}」を考慮してください。` : ''}
- ${(songMood && songMood !== 'none') ? `曲の雰囲気「${songMood}」を反映させてください。` : ''}
- 歌詞は${language === 'ja' ? '日本語' : 'English'}で生成してください。
- 歌詞のみを出力し、説明や前置きは不要です。`;
    
    return { systemPrompt, userPrompt };
  }, [language, songTitle, songMood, customTempLyrics]);
  
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
    
    if (!aiClient) {
      setError('APIキーが設定されていません');
      return;
    }
    
    setIsGeneratingAI(true);
    setError(null);
    
    try {
      console.log('AI生成リクエスト:', { 
        provider: apiProvider,
        systemContent, 
        userContent 
      });
      
      let generatedLyrics = '';
      
      // APIプロバイダーに応じて処理を分岐
      if (apiProvider === 'openai' && aiClient.openai) {
        // OpenAI APIを使用
        const response = await aiClient.openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
        
        console.log('OpenAI応答:', response);
        generatedLyrics = response.choices[0].message.content || '';
      } 
      else if ((apiProvider === 'google' || apiProvider === 'google25') && aiClient.google) {
        // Google AIを使用
        const modelName = apiProvider === 'google' ? "gemini-1.5-pro" : "gemini-2.5-pro";
        const model = aiClient.google.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent({
          contents: [
            { role: 'user', parts: [{ text: `${systemContent}\n\n${userContent}` }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
          },
        });
        
        const response = result.response;
        console.log('Google AI応答:', response);
        generatedLyrics = response.text() || '';
      }
      
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
  
  // ユーザープロンプトを更新する関数
  const updateCurrentUserPrompt = useCallback((midi: MidiAnalysis) => {
    if (midi) {
      const prompts = generatePrompt(midi);
      setCurrentUserPrompt(prompts.userPrompt);
    }
  }, [generatePrompt]);
  
  // MIDIデータまたはカスタム仮歌詞が変更されたときにユーザープロンプトを更新
  useEffect(() => {
    if (midiData) {
      updateCurrentUserPrompt(midiData);
    }
  }, [midiData, updateCurrentUserPrompt]);
  
  // 公開する値とメソッド
  return {
    lyrics,
    error,
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
  };
}
