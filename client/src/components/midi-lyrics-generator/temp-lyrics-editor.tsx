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
  const [tempLyrics, setTempLyrics] = useState<string>('');
  const [originalTempLyrics, setOriginalTempLyrics] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // MIDIデータが更新されたら仮歌詞を生成
  useEffect(() => {
    if (midiData) {
      const generatedTemp = generateTempLyrics(midiData);
      setTempLyrics(generatedTemp);
      setOriginalTempLyrics(generatedTemp);
      onTempLyricsUpdate(generatedTemp);
      
      // refがある場合は、テキストエリアの値も直接更新
      if (textareaRef.current) {
        textareaRef.current.value = generatedTemp;
      }
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

  // スラッシュキーを処理するためのキーダウンハンドラー
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // スラッシュキーが押された場合
    if (e.key === '/' || e.code === 'Slash') {
      e.preventDefault(); // デフォルトの動作をキャンセル
      
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // 現在の値を直接取得
      const currentValue = textarea.value;
      
      // 現在のテキストにスラッシュを挿入
      const newValue = currentValue.substring(0, start) + '/' + currentValue.substring(end);
      
      // 状態を更新
      setTempLyrics(newValue);
      onTempLyricsUpdate(newValue);
      
      // DOMを直接操作して値を設定
      textarea.value = newValue;
      
      // カーソル位置を更新 (スラッシュの後に移動)
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 1);
      }, 0);
      
      return;
    }
  };
  
  // テキストエリアの変更を処理する関数
  const handleTempLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // テキストエリアの値の変更を直接取得
    const newValue = e.target.value;
    console.log('入力されたテキスト:', newValue);
    
    // 縦棒をスラッシュに変換
    const processedValue = newValue.replace(/\|/g, '/');
    
    // 状態を更新
    setTempLyrics(processedValue);
    onTempLyricsUpdate(processedValue);
    
    // 縦棒が含まれていた場合は、DOMも直接更新
    if (newValue !== processedValue && textareaRef.current) {
      // カーソル位置を保存
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      // 直接DOMを操作して値を設定
      textareaRef.current.value = processedValue;
      
      // カーソル位置を元に戻す
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(start, end);
      }, 0);
    }
  };

  // 元の仮歌詞に戻す関数
  const resetToOriginal = () => {
    // 状態を更新
    setTempLyrics(originalTempLyrics);
    onTempLyricsUpdate(originalTempLyrics);
    
    // DOMを直接操作してテキストエリアの値を設定
    if (textareaRef.current) {
      textareaRef.current.value = originalTempLyrics;
    }
  };

  // 仮歌詞にスラッシュで音節区切りを追加する関数
  const addSyllableDividers = () => {
    if (!textareaRef.current) return;

    // 直接テキストエリアから値を取得
    const currentText = textareaRef.current.value;
    console.log('現在のテキスト:', currentText);
    
    // 特殊文字を一旦置き換える方法
    let result = '';
    
    for (let i = 0; i < currentText.length; i++) {
      // 現在の文字がスペースならスラッシュに変換
      if (currentText[i] === ' ') {
        result += '/';
      } else {
        result += currentText[i];
      }
    }
    
    console.log('変換後のテキスト:', result);
    
    // 複数のスペースがある場合はスラッシュが複数になるので単一にする
    const finalResult = result.replace(/\/+/g, '/');
    
    // 状態を更新
    setTempLyrics(finalResult);
    onTempLyricsUpdate(finalResult);
    
    // 直接DOMを操作してテキストエリアの値を設定
    textareaRef.current.value = finalResult;
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // カーソル位置にスラッシュを挿入する機能を追加
              if (textareaRef.current) {
                const textarea = textareaRef.current;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                
                // 現在の値を直接取得
                const currentValue = textarea.value;
                const newValue = currentValue.substring(0, start) + '/' + currentValue.substring(end);
                
                // 状態を更新
                setTempLyrics(newValue);
                onTempLyricsUpdate(newValue);
                
                // DOMを直接操作して値を設定
                textarea.value = newValue;
                
                // カーソル位置を更新
                setTimeout(() => {
                  textarea.focus();
                  textarea.setSelectionRange(start + 1, start + 1);
                }, 0);
              }
            }}
          >
            / 挿入
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="temp_lyrics" className="mb-1 block">
          仮歌詞を編集（スラッシュ(/)で音節を区切ることができます）：
        </Label>
        {/* 純粋なHTMLテキストエリアを使用してuncontrolled componentとして実装 */}
        <textarea
          id="temp_lyrics"
          ref={textareaRef}
          rows={4}
          defaultValue={tempLyrics}
          onChange={handleTempLyricsChange}
          onKeyDown={handleKeyDown}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
          placeholder="MIDIファイルをアップロードすると仮歌詞が表示されます (例: ラ/ラ/ラ)"
        />
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>
          <span className="font-semibold">使い方：</span> 音節の区切りを調整したい場合は、スペースの代わりにスラッシュ(/)を挿入してください。「区切り追加」ボタンを押すと全てのスペースをスラッシュに置き換えます。
        </p>
        <p className="mt-1">
          <span className="font-semibold">例：</span> 「ラ ラ ラ ラ」→「ラ/ラ/ラ/ラ」
        </p>
        <p className="mt-1">
          <span className="font-semibold">注意：</span> スラッシュ(/) が入力しにくい場合は、縦棒 (|) を使用することもできます。自動的にスラッシュに変換されます。
        </p>
        <p className="mt-1">
          <span className="font-semibold">ヒント：</span> 音節の区切りをより細かく設定すると、AIが音節を正確にマッチさせやすくなります。
        </p>
      </div>
    </div>
  );
}
