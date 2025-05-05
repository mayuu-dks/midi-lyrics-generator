import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
// テキストエリアコンポーネントを使用しない
// import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Music, CheckCircle } from 'lucide-react';
import { MidiAnalysis } from '@/hooks/use-midi-analysis';

type Language = 'ja' | 'en';

interface TempLyricsEditorProps {
  midiData: MidiAnalysis | null;
  onTempLyricsUpdate: (tempLyrics: string) => void;
  isVisible: boolean;
  currentFileName: string | null;
  language?: Language;
}

export default function TempLyricsEditor({
  midiData,
  onTempLyricsUpdate,
  isVisible,
  currentFileName,
  language = 'ja' // デフォルトは日本語
}: TempLyricsEditorProps) {
  // Reactの状態として仮歌詞を管理（単一の情報源）
  const [tempLyrics, setTempLyrics] = useState<string>('');
  const [originalTempLyrics, setOriginalTempLyrics] = useState<string>('');
  // ユーザーが編集中かどうかの状態管理
  const [isUserEditing, setIsUserEditing] = useState<boolean>(false);
  // ユーザーがカンマを追加したかどうかを追跡
  const [userHasModifiedLyrics, setUserHasModifiedLyrics] = useState<boolean>(false);
  // ボタンクリック時の成功状態を管理
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  // フォーカス制御のためだけにrefを使用
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 前回のMIDIデータを記録するリファレンス
  const prevMidiDataRef = useRef<{ noteCount?: number; fileName?: string | null } | null>(null);

  // 言語が変更された場合のために前回の言語を記録
  const prevLanguageRef = useRef<string>(language);

  // MIDIデータまたは言語が更新されたら仮歌詞を生成
  useEffect(() => {
    if (midiData) {
      // MIDIファイルが変更されたかチェック
      const isMidiChanged = 
        !prevMidiDataRef.current ||
        prevMidiDataRef.current.noteCount !== midiData.noteCount;
      
      // 言語が変更されたかチェック
      const isLanguageChanged = prevLanguageRef.current !== language;
      
      // 新しいMIDIデータを記録
      prevMidiDataRef.current = { 
        noteCount: midiData.noteCount,
        fileName: isVisible ? currentFileName : null
      };
      
      // 現在の言語を記録
      prevLanguageRef.current = language;

      const generatedTemp = generateTempLyrics(midiData);
      
      // MIDIが変更された場合、言語が変更された場合、またはユーザーが編集していない場合は更新
      if (isMidiChanged) {
        // MIDI変更時は編集状態をリセット
        setUserHasModifiedLyrics(false);
        setIsUserEditing(false);
        // 仮歌詞を更新
        setTempLyrics(generatedTemp);
        setOriginalTempLyrics(generatedTemp);
        onTempLyricsUpdate(generatedTemp);
      } else if (isLanguageChanged) {
        // 言語変更時は、ユーザーが編集していない場合のみ更新
        if (!userHasModifiedLyrics) {
          setTempLyrics(generatedTemp);
          setOriginalTempLyrics(generatedTemp);
          onTempLyricsUpdate(generatedTemp);
        }
      } else if (!userHasModifiedLyrics) {
        // ユーザーが編集していない場合だけ更新
        setTempLyrics(generatedTemp);
        setOriginalTempLyrics(generatedTemp);
        onTempLyricsUpdate(generatedTemp);
      }
    }
  }, [midiData, currentFileName, isVisible, onTempLyricsUpdate, userHasModifiedLyrics, language]);

  // 音符データに基づいて仮歌詞を生成する関数
  const generateTempLyrics = (midi: MidiAnalysis): string => {
    // 音符の長さに基づく記号表現の配列
    const phrasePatterns: string[] = [];
    
    // 使用する音節を言語に合わせて設定
    const syllable = language === 'ja' ? 'ラ' : 'La';
    const longSyllable = language === 'ja' ? 'ラー' : 'La-';
    const extraLongSyllable = language === 'ja' ? 'ラーー' : 'La--';
    
    // 音符を長さに応じて分類
    midi.notes.forEach(note => {
      const duration = note.duration;
      
      if (duration <= 0.125) {
        phrasePatterns.push(syllable);
      } else if (duration <= 0.25) {
        phrasePatterns.push(syllable);
      } else if (duration <= 0.5) {
        phrasePatterns.push(syllable);
      } else if (duration <= 1.0) {
        phrasePatterns.push(longSyllable);
      } else if (duration <= 2.0) {
        phrasePatterns.push(extraLongSyllable);
      } else {
        phrasePatterns.push(extraLongSyllable);
      }
    });
    
    // フレーズのまとまりを作成（4音符ごとにグループ化）
    const phrasesGrouped: string[] = [];
    let currentPhrase: string[] = [];
    
    phrasePatterns.forEach((pattern, index) => {
      currentPhrase.push(pattern);
      if ((index + 1) % 4 === 0 || index === phrasePatterns.length - 1) {
        phrasesGrouped.push(currentPhrase.join('')); // スペースを入れずに結合
        currentPhrase = [];
      }
    });
    
    // 最終的なフレーズパターン文字列を生成
    return phrasesGrouped.join('');  // スペースを入れずに結合
  };

  // テキストエリアの変更を処理する関数
  const handleTempLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // ユーザーが編集を開始したことを記録
    setIsUserEditing(true);
    
    // ユーザーがカンマを追加したかチェック
    const newValue = e.target.value;
    // 元の文字列と異なり、カンマを含む場合はユーザーが編集したと見なす
    if (newValue.includes(',')) {
      setUserHasModifiedLyrics(true);
    }
    
    // 新しい値をステートにのみ設定（DOMの直接操作は行わない）
    setTempLyrics(newValue);
  };
  
  // フォーカスイベントハンドラ
  const handleFocus = () => {
    setIsUserEditing(true);
  };
  
  // フォーカスが外れた時のイベントハンドラ
  const handleBlur = () => {
    // フォーカスが外れた場合、編集状態をリセット
    // オプション: 非編集状態に戻すまでの時間差を置くことも検討可能
    setIsUserEditing(false);
  };

  // 元の仮歌詞に戻す関数
  const resetToOriginal = () => {
    // ステートを更新（DOMの直接操作は行わない）
    setTempLyrics(originalTempLyrics);
    onTempLyricsUpdate(originalTempLyrics);
    
    // 編集状態をリセット
    setIsUserEditing(false);
  };

  // フォーカス制御用の関数（オプション）
  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  if (!isVisible || !midiData) return null;

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold">
            {language === 'ja' ? '仮歌詞エディタ' : 'Temporary Lyrics Editor'}
          </h3>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetToOriginal}
          >
            {language === 'ja' ? '元に戻す' : 'Reset'}
          </Button>
          <Button 
            variant="default" 
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-1"
            onClick={() => {
              // 更新した値を親コンポーネントに通知
              onTempLyricsUpdate(tempLyrics);
              // 一時的にチェックマークを表示する状態を設定
              setIsSuccessful(true);
              // 2秒後にチェックマークを消す
              setTimeout(() => {
                setIsSuccessful(false);
              }, 2000);
            }}
            disabled={!userHasModifiedLyrics} // ユーザーがカンマを追加していない場合はボタンを無効化
            title={userHasModifiedLyrics 
              ? (language === 'ja' ? '変更を反映します' : 'Apply changes') 
              : (language === 'ja' ? 'カンマを追加してからクリックしてください' : 'Please add commas before clicking')}
          >
            {isSuccessful ? (
              <>
                <CheckCircle className="h-4 w-4" />
                {language === 'ja' ? '反映済み' : 'Applied'}
              </>
            ) : (
              language === 'ja' ? "区切りをプロンプトに反映" : "Apply Breaks to Prompt"
            )}
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="temp_lyrics" className="mb-1 block">
          {language === 'ja' 
            ? '仮歌詞を編集（必要に応じてカンマ(,)でメロディ・文節の区切りを指定できます）：'
            : 'Edit temporary lyrics (use commas (,) to mark melody and phrase breaks as needed):'
          }
        </Label>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 pl-1">
          <span className="font-semibold">{language === 'ja' ? '仮歌詞の表記ルール：' : 'Notation rules:'}</span> 
          {language === 'ja' ? (
            <>8分音符以下の短い音符: 「ラ」 / 4分音符: 「ラー」 / 2分音符以上: 「ラーー」 / 1拍以上の休符: 「ッ」（前のフレーズの後に配置）</>
          ) : (
            <>Short notes (eighth notes and shorter): "La" / Quarter notes: "La-" / Half notes and longer: "La--" / Rests longer than one beat: "_" (placed after the previous phrase)</>
          )}
        </div>

        {/* 重要な変更: defaultValueの代わりにvalueを使用して完全なcontrolled componentにする */}
        <textarea
          id="temp_lyrics"
          ref={textareaRef}
          rows={4}
          value={tempLyrics} // defaultValueからvalueに変更
          onChange={handleTempLyricsChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
          placeholder={language === 'ja' 
            ? "MIDIファイルをアップロードすると仮歌詞が表示されます (例: ラララ)" 
            : "Temporary lyrics will appear when you upload a MIDI file (e.g., LaLaLa)"}
        />
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>
          <span className="font-semibold">{language === 'ja' ? '使い方：' : 'How to use:'}</span> 
          {language === 'ja' 
            ? 'メロディと歌詞の文節の区切りを調整したい場合は、必要に応じてカンマ(,)を手動で入力してください。'
            : 'To adjust breaks between melody and lyric phrases, manually add commas (,) as needed.'}
        </p>
        <p className="mt-1">
          <span className="font-semibold">{language === 'ja' ? '例：' : 'Example:'}</span> 
          {language === 'ja' 
            ? '「ラララ」→一文節として扱われます。「ララ,ラ」→二文節として扱われます。'
            : '"LaLaLa" → treated as one phrase. "LaLa,La" → treated as two phrases.'}
        </p>
        <p className="mt-1">
          <span className="font-semibold">{language === 'ja' ? 'ヒント：' : 'Tip:'}</span> 
          {language === 'ja' 
            ? 'カンマは「ここが文節の区切り」とAIに伝えるためのもので、適切に設定すると歌詞とメロディがより自然に合うようになります。'
            : 'Commas tell the AI "this is a phrase break" - setting them appropriately helps lyrics match the melody more naturally.'}
        </p>
        <p className="mt-2 bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded border border-yellow-200 dark:border-yellow-700 font-medium">
          <span className="font-semibold">{language === 'ja' ? '重要：' : 'Important:'}</span> 
          {language === 'ja' 
            ? 'カンマを追加した後は、「区切りをプロンプトに反映」ボタンをクリックしてから生成を行ってください。これによりAIにメロディと文節の区切りが正しく伝わります。'
            : 'After adding commas, click the "Apply Breaks to Prompt" button before generating lyrics. This ensures the AI correctly understands melody and phrase breaks.'}
        </p>
      </div>
    </div>
  );
}
