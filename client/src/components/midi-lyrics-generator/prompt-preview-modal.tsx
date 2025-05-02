import { useState } from 'react';
import { BrainCircuit, ClipboardCopy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface PromptPreviewModalProps {
  customPrompt: string;
  userPrompt?: string;
  setCustomPrompt: (prompt: string) => void;
  onGenerate: () => void;
  onClose: () => void;
}

export default function PromptPreviewModal({
  customPrompt,
  userPrompt,
  setCustomPrompt,
  onGenerate,
  onClose
}: PromptPreviewModalProps) {
  const [copiedSystem, setCopiedSystem] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // プロンプトをクリップボードにコピーする関数
  const copyToClipboard = async (text: string, type: 'system' | 'user' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'system') {
        setCopiedSystem(true);
        setTimeout(() => setCopiedSystem(false), 2000);
      } else if (type === 'user') {
        setCopiedUser(true);
        setTimeout(() => setCopiedUser(false), 2000);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
    }
  };
  
  // 両方のプロンプトを連結してコピーする関数
  const copyAllPrompts = () => {
    const allText = `【システムプロンプト】
${customPrompt}

【ユーザープロンプト】
${userPrompt || ''}`;
    copyToClipboard(allText, 'all');
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            AIプロンプト内容の確認
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            以下の詳細なプロンプトを使用して歌詞を生成します。システムプロンプトは必要に応じて編集できます。
          </p>
          
          <div className="space-y-8">
            {/* システムプロンプト */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="custom_prompt" className="font-semibold text-base">システムプロンプト</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-gray-500 hover:text-gray-700"
                  onClick={() => copyToClipboard(customPrompt, 'system')}
                >
                  {copiedSystem ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="h-4 w-4 mr-1" />
                      コピー
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                {customPrompt}
              </div>
              <div className="mt-4">
                <Label htmlFor="edit_prompt" className="mb-1 block">システムプロンプトを編集：</Label>
                <Textarea
                  id="edit_prompt"
                  rows={5}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="resize-none text-gray-800 dark:text-gray-200 font-mono text-sm"
                />
              </div>
            </div>
            
            {/* ユーザープロンプト */}
            {userPrompt && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="user_prompt" className="font-semibold text-base">詳細で強力なユーザープロンプト</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-gray-500 hover:text-gray-700"
                    onClick={() => copyToClipboard(userPrompt, 'user')}
                  >
                    {copiedUser ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="h-4 w-4 mr-1" />
                        コピー
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-80 overflow-y-auto">
                  {userPrompt}
                </div>
                <p className="mt-2 text-xs text-gray-500">注意：この詳細プロンプトはMIDIデータと仮歌詞に基づいて生成され、自動的に使用されます。仮歌詞ではカンマ(,)がメロディと歌詞の文節の区切りを指定するために使用されます。このプロンプトは編集できません。</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 border-t pt-2">
          <div className="flex items-center justify-between mb-2">
            <p>※ APIキーを設定していない場合は、プロンプトをコピーして別のAIサービスで使用できます。</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50 h-8"
              onClick={copyAllPrompts}
            >
              {copiedAll ? (
                <>
                  <Check className="h-4 w-4" />
                  全てコピー済み
                </>
              ) : (
                <>
                  <ClipboardCopy className="h-4 w-4" />
                  全てまとめてコピー
                </>
              )}
            </Button>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            キャンセル
          </Button>
          <Button 
            type="button" 
            onClick={onGenerate}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1 rounded-md"
          >
            このプロンプトで生成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
