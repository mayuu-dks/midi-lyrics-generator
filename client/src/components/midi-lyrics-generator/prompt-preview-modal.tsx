import { BrainCircuit } from 'lucide-react';
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
              <Label htmlFor="custom_prompt" className="mb-1 block font-semibold text-base">システムプロンプト</Label>
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
                <Label htmlFor="user_prompt" className="mb-1 block font-semibold text-base">詳細で強力なユーザープロンプト</Label>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-80 overflow-y-auto">
                  {userPrompt}
                </div>
                <p className="mt-2 text-xs text-gray-500">注意：この詳細プロンプトはMIDIデータと仮歌詞に基づいて生成され、自動的に使用されます。仮歌詞ではカンマ(,)が音節の区切りとして使用されています。このプロンプトは編集できません。</p>
              </div>
            )}
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
          <Button type="button" onClick={onGenerate}>
            このプロンプトで生成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
