import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
// テキストエリアコンポーネントを使用しない
// import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Music, CheckCircle } from 'lucide-react';
import { MidiAnalysis } from '@/hooks/use-midi-analysis';

interface TempLyricsEditorProps {
  midiData: MidiAnalysis | null;
  onTempLyricsUpdate: (tempLyrics: string) => void;
  isVisible: boolean;
  currentFileName: string | null;
}

export default function TempLyricsEditor({
  midiData,
  onTempLyricsUpdate,
  isVisible,
  currentFileName
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

  // MIDIデータが更新されたら仮歌詞を生成
  useEffect(() => {
    if (midiData) {
      // MIDIファイルが変更されたかチェック
      const isMidiChanged = 
        !prevMidiDataRef.current ||
        prevMidiDataRef.current.noteCount !== midiData.noteCount;
      
      // 新しいMIDIデータを記録
      prevMidiDataRef.current = { 
        noteCount: midiData.noteCount,
        fileName: isVisible ? currentFileName : null
      };

      const generatedTemp = generateTempLyrics(midiData);
      
      // MIDIが変更された場合またはユーザーが編集していない場合は更新
      if (isMidiChanged) {
        // MIDI変更時は編集状態をリセット
        setUserHasModifiedLyrics(false);
        setIsUserEditing(false);
        // 仮歌詞を弾く更新
        setTempLyrics(generatedTemp);
        setOriginalTempLyrics(generatedTemp);
        onTempLyricsUpdate(generatedTemp);
      } else if (!userHasModifiedLyrics) {
        // ユーザーが編集していない場合だけ更新
        setTempLyrics(generatedTemp);
        setOriginalTempLyrics(generatedTemp);
        onTempLyricsUpdate(generatedTemp);
      }
    }
  }, [midiData, currentFileName, isVisible, onTempLyricsUpdate, userHasModifiedLyrics]);

  // 音符データに基づいて仮歌詞を生成する関数
  const generateTempLyrics = (midi: MidiAnalysis): string => {
    // 音符の長さに基づく記号表現の配列
    const phrasePatterns: string[] = [];
    
    // 音符を長さに応じて分類
    midi.notes.forEach(note => {
      const duration = note.duration;
      
      if (duration <= 0.125) {
        phrasePatterns.push('ラ');
      } else if (duration <= 0.25) {
        phrasePatterns.push('ラ');
      } else if (duration <= 0.5) {
        phrasePatterns.push('ラ');
      } else if (duration <= 1.0) {
        phrasePatterns.push('ラー');
      } else if (duration <= 2.0) {
        phrasePatterns.push('ラーー');
      } else {
        phrasePatterns.push('ラーー');
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
          <h3 className="text-lg font-semibold">仮歌詞エディタ</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetToOriginal}
          >
            元に戻す
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
            title={userHasModifiedLyrics ? '変更を反映します' : 'カンマを追加してからクリックしてください'}
          >
            {isSuccessful ? (
              <>
                <CheckCircle className="h-4 w-4" />
                反映済み
              </>
            ) : (
              "区切りをプロンプトに反映"
            )}
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="temp_lyrics" className="mb-1 block">
          仮歌詞を編集（必要に応じてカンマ(,)でメロディ・文節の区切りを指定できます）：
        </Label>

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
          placeholder="MIDIファイルをアップロードすると仮歌詞が表示されます (例: ラララ)"
        />
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>
          <span className="font-semibold">使い方：</span> メロディと歌詞の文節の区切りを調整したい場合は、必要に応じてカンマ(,)を手動で入力してください。
        </p>
        <p className="mt-1">
          <span className="font-semibold">例：</span> 「ラララ」 → 「ラ,ララ」 (最初の二つが一つの文節として扱われる)
        </p>
        <p className="mt-1">
          <span className="font-semibold">ヒント：</span> カンマは「ここが文節の区切り」とAIに伝えるためのもので、適切に設定すると歌詞とメロディがより自然に合うようになります。
        </p>
        <p className="mt-1">
          <span className="font-semibold">重要：</span> カンマを追加した後は、「区切りをプロンプトに反映」ボタンをクリックしてから生成を行ってください。これによりAIにメロディと文節の区切りが正しく伝わります。
        </p>
      </div>
    </div>
  );
}
