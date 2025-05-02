import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
// テキストエリアコンポーネントを使用しない
// import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Music } from 'lucide-react';
import { MidiAnalysis } from '@/hooks/use-midi-analysis';

interface TempLyricsEditorProps {
  midiData: MidiAnalysis | null;
  onTempLyricsUpdate: (tempLyrics: string) => void;
  isVisible: boolean;
}

export default function TempLyricsEditor({
  midiData,
  onTempLyricsUpdate,
  isVisible
}: TempLyricsEditorProps) {
  // Reactの状態として仮歌詞を管理（単一の情報源）
  const [tempLyrics, setTempLyrics] = useState<string>('');
  const [originalTempLyrics, setOriginalTempLyrics] = useState<string>('');
  // フォーカス制御のためだけにrefを使用
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // MIDIデータが更新されたら仮歌詞を生成
  useEffect(() => {
    if (midiData) {
      const generatedTemp = generateTempLyrics(midiData);
      // ステートのみを更新（DOMの直接操作は行わない）
      setTempLyrics(generatedTemp);
      setOriginalTempLyrics(generatedTemp);
      onTempLyricsUpdate(generatedTemp);
    }
  }, [midiData, onTempLyricsUpdate]);

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
        phrasesGrouped.push(currentPhrase.join(','));
        currentPhrase = [];
      }
    });
    
    // 最終的なフレーズパターン文字列を生成
    return phrasesGrouped.join('  ');
  };

  // テキストエリアの変更を処理する関数
  const handleTempLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 新しい値をステートにのみ設定（DOMの直接操作は行わない）
    const newValue = e.target.value;
    setTempLyrics(newValue);
    onTempLyricsUpdate(newValue);
  };

  // 元の仮歌詞に戻す関数
  const resetToOriginal = () => {
    // ステートを更新（DOMの直接操作は行わない）
    setTempLyrics(originalTempLyrics);
    onTempLyricsUpdate(originalTempLyrics);
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
        </div>
      </div>

      <div>
        <Label htmlFor="temp_lyrics" className="mb-1 block">
          仮歌詞を編集（カンマ(,)で音節を区切ることができます）：
        </Label>

        {/* 重要な変更: defaultValueの代わりにvalueを使用して完全なcontrolled componentにする */}
        <textarea
          id="temp_lyrics"
          ref={textareaRef}
          rows={4}
          value={tempLyrics} // defaultValueからvalueに変更
          onChange={handleTempLyricsChange}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
          placeholder="MIDIファイルをアップロードすると仮歌詞が表示されます (例: ラ,ラ,ラ)"
        />
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>
          <span className="font-semibold">使い方：</span> 音節の区切りを調整したい場合は、カンマ(,)を手動で入力してください。
        </p>
        <p className="mt-1">
          <span className="font-semibold">例：</span> 「ラ,ラ,ラ,ラ」
        </p>
        <p className="mt-1">
          <span className="font-semibold">ヒント：</span> 音節の区切りをより細かく設定すると、AIが音節を正確にマッチさせやすくなります。
        </p>
      </div>
    </div>
  );
}
