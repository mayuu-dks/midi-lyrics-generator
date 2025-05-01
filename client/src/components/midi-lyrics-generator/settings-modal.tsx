import { useState, useEffect } from 'react';
import { Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface SettingsModalProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function SettingsModal({
  apiKey,
  setApiKey,
  onSubmit,
  onDelete,
  onClose
}: SettingsModalProps) {
  const [localApiKey, setLocalApiKey] = useState(apiKey);

  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(localApiKey);
    onSubmit(e);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            設定
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="api_key" className="mb-1 block">OpenAI API キー</Label>
            <Input
              type="password"
              id="api_key"
              placeholder="sk-..."
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              className="mb-1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              OpenAI APIキーがなければ、
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                公式サイト
              </a>
              で作成してください。
            </p>
          </div>
          
          <div className="flex items-center">
            <Button 
              type="button" 
              variant="ghost" 
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-0 h-auto"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              キーを削除
            </Button>
          </div>
        </form>
        
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            キャンセル
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
