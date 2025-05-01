import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const [tempLyrics, setTempLyrics] = useState<string>('');
  const [originalTempLyrics, setOriginalTempLyrics] = useState<string>('');

  // MIDIデータが更新されたら仮歌詞を生成
  useEffect(() => {
    if (midiData) {
      const generatedTemp = generateTempLyrics(midiData);
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
        phrasesGrouped.push(currentPhrase.join(' '));
        currentPhrase = [];
      }
    });
    
    // 最終的なフレーズパターン文字列を生成
    return phrasesGrouped.join('  ');
  };

  // テキストエリアの変更を処理する関数
  const handleTempLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTempLyrics(newValue);
    onTempLyricsUpdate(newValue);
  };

  // 元の仮歌詞に戻す関数
  const resetToOriginal = () => {
    setTempLyrics(originalTempLyrics);
    onTempLyricsUpdate(originalTempLyrics);
  };

  // 仮歌詞にスラッシュで音節区切りを追加する関数
  const addSyllableDividers = () => {
    // スペースの代わりにスラッシュを使用
    const withDividers = tempLyrics
      .replace(/ /g, '/') // スペースをスラッシュに変換
      .replace(/\/{2,}/g, ' '); // 連続するスラッシュをスペースに戻す
    
    setTempLyrics(withDividers);
    onTempLyricsUpdate(withDividers);
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
            variant="outline" 
            size="sm"
            onClick={addSyllableDividers}
          >
            区切り追加
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="temp_lyrics" className="mb-1 block">
          仮歌詞を編集（スラッシュ(/)で音節を区切ることができます）：
        </Label>
        <Textarea
          id="temp_lyrics"
          rows={4}
          value={tempLyrics}
          onChange={handleTempLyricsChange}
          className="font-mono text-sm"
          placeholder="MIDIファイルをアップロードすると仮歌詞が表示されます"
        />
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>
          <span className="font-semibold">使い方：</span> 音節の区切りを調整したい場合は、スペースの代わりにスラッシュ(/)を挿入してください。「区切り追加」ボタンで一括変換することもできます。
        </p>
        <p className="mt-1">
          <span className="font-semibold">例：</span> 「ラ ラ ラ ラ」→「ラ/ラ/ラ/ラ」
        </p>
      </div>
    </div>
  );
}
