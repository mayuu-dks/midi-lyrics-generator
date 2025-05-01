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
  setCustomPrompt: (prompt: string) => void;
  onGenerate: () => void;
  onClose: () => void;
}

export default function PromptPreviewModal({
  customPrompt,
  setCustomPrompt,
  onGenerate,
  onClose
}: PromptPreviewModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            AIプロンプトの編集
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            AIに指示するプロンプトをカスタマイズできます。歌詞の生成方法や特定のスタイルについての指示を記述できます。
          </p>
          
          <div>
            <Label htmlFor="custom_prompt" className="mb-1 block">カスタムプロンプト</Label>
            <Textarea
              id="custom_prompt"
              rows={8}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="resize-none text-gray-800 dark:text-gray-200"
            />
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
