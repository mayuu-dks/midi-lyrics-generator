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

  // テキストエリアの変更を処理する関数
  const handleTempLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // テキストエリアの値の変更を直接取得
    const newValue = e.target.value;
    
    // デバッグログ追加
    console.log('入力された原文:', newValue);
    console.log('入力に含まれる特殊文字:', newValue.split('').map(char => `${char}:${char.charCodeAt(0)}`).join(', '));
    
    // 縦棒をスラッシュに変換
    const processedValue = newValue.replace(/\|/g, '/');
    console.log('処理後の文字列:', processedValue);
    
    // 状態を更新
    setTempLyrics(processedValue);
    onTempLyricsUpdate(processedValue);
    
    // 元の値と処理後の値を比較してログ出力
    if (newValue !== processedValue) {
      console.log('変換が行われました:', { 元の値: newValue, 変換後: processedValue });
    }
    
    // 縦棒が含まれていた場合は、DOMも直接更新
    if (newValue !== processedValue && textareaRef.current) {
      // カーソル位置を保存
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      console.log('カーソル位置:', { start, end });
      
      // 直接DOMを操作して値を設定
      textareaRef.current.value = processedValue;
      console.log('DOM直接更新完了');
      
      // カーソル位置を元に戻す
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start, end);
          console.log('カーソル位置を復元しました');
        }
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
            onClick={() => {
              // デバッグとトラブルシューティング用のボタン
              if (textareaRef.current) {
                const textarea = textareaRef.current;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                
                // 現在のテキストにスラッシュを挿入
                const currentValue = textarea.value;
                const newValue = currentValue.substring(0, start) + '/' + currentValue.substring(end);
                
                console.log('手動挿入前:', currentValue);
                console.log('手動挿入後:', newValue);
                
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
            / 文字挿入
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (!textareaRef.current) return;

              // 直接テキストエリアから値を取得
              const currentText = textareaRef.current.value;
              console.log('スペース置換前:', currentText);
              
              // スペースをスラッシュに置換
              const newText = currentText.replace(/ /g, '/');
              
              // 複数のスラッシュがあれば単一にする
              const finalResult = newText.replace(/\/+/g, '/');
              
              console.log('スペース置換後:', finalResult);
              
              // 状態を更新
              setTempLyrics(finalResult);
              onTempLyricsUpdate(finalResult);
              
              // DOMを直接操作してテキストエリアの値を設定
              textareaRef.current.value = finalResult;
            }}
          >
            スペース→/変換
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="temp_lyrics" className="mb-1 block">
          仮歌詞を編集（スラッシュ(/)で音節を区切ることができます）：
        </Label>

        {/* 非常にシンプルなプレーンHTMLテキストエリアを使用 */}
        <div className="relative">
          <textarea
            id="temp_lyrics"
            ref={textareaRef}
            rows={4}
            defaultValue={tempLyrics}
            onChange={handleTempLyricsChange}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
            placeholder="MIDIファイルをアップロードすると仮歌詞が表示されます (例: ラ/ラ/ラ)"
          />

          {/* クイックアクションボタン - テキストエリア内に配置 */}
          <div className="absolute bottom-3 right-3 flex gap-1 z-10">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => {
                if (textareaRef.current) {
                  const textarea = textareaRef.current;
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  
                  // 現在のテキストにスラッシュを挿入
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
              /
            </button>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>
          <span className="font-semibold">使い方：</span> 音節の区切りを調整したい場合は、次の方法があります：
        </p>
        <p className="mt-1">
          <span className="font-semibold">1. インラインボタン：</span> テキストエリア内の右下にある <span className="inline-block px-2 py-1 rounded-full bg-primary text-white text-xs">/</span> ボタンをクリックすると、カーソル位置にスラッシュが挿入されます。
        </p>
        <p className="mt-1">
          <span className="font-semibold">2. 一括変換：</span> 「スペース→/変換」ボタンをクリックすると、すべてのスペースがスラッシュに変換されます。
        </p>
        <p className="mt-1">
          <span className="font-semibold">例：</span> 「ラ ラ ラ ラ」→「ラ/ラ/ラ/ラ」
        </p>
        <p className="mt-1">
          <span className="font-semibold">注意：</span> スラッシュ(/) の代わりに縦棒 (|) を入力すると自動的にスラッシュに変換されます。
        </p>
        <p className="mt-1">
          <span className="font-semibold">ヒント：</span> 音節の区切りをより細かく設定すると、AIが音節を正確にマッチさせやすくなります。
        </p>
      </div>
    </div>
  );
}
