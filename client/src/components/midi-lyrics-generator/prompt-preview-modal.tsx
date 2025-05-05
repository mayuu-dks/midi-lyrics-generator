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

import { ApiProvider } from './settings-modal';

// 言語の型定義
type Language = 'ja' | 'en';

interface PromptPreviewModalProps {
  customPrompt: string;
  userPrompt?: string;
  setCustomPrompt: (prompt: string) => void;
  onGenerate: () => void;
  onClose: () => void;
  apiKey?: string; // APIキーが設定されているかチェックするために追加
  apiProvider?: ApiProvider;
  language?: Language; // 言語設定を追加
}

export default function PromptPreviewModal({
  customPrompt,
  userPrompt,
  setCustomPrompt,
  onGenerate,
  onClose,
  apiKey,
  apiProvider = 'openai',
  language = 'ja' // デフォルトは日本語
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
    const allText = language === 'ja'
      ? `【システムプロンプト】
${customPrompt}

【ユーザープロンプト】
${userPrompt || ''}`
      : `[System Prompt]
${customPrompt}

[User Prompt]
${userPrompt || ''}`;
    copyToClipboard(allText, 'all');
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            {language === 'ja' ? 'AIプロンプト内容の確認' : 'Confirm AI Prompt Contents'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'ja' 
                ? '以下の詳細なプロンプトを使用して歌詞を生成します。システムプロンプトは必要に応じて編集できます。'
                : 'The following detailed prompts will be used to generate lyrics. The system prompt can be edited as needed.'
              }
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-xs inline-flex items-center">
              <span className="font-semibold mr-2">{language === 'ja' ? '現在のAIプロバイダー:' : 'Current AI Provider:'}</span>
              <span className="text-blue-600 dark:text-blue-400">
                {apiProvider === 'openai' ? 'OpenAI (GPT-4o)' : apiProvider === 'google25' ? 'Google (Gemini 2.0 Flash)' : 'Anthropic (Claude 3 Sonnet)'}
              </span>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* システムプロンプト */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="custom_prompt" className="font-semibold text-base">{language === 'ja' ? 'システムプロンプト' : 'System Prompt'}</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-gray-500 hover:text-gray-700"
                  onClick={() => copyToClipboard(customPrompt, 'system')}
                >
                  {copiedSystem ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      {language === 'ja' ? 'コピー済み' : 'Copied'}
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="h-4 w-4 mr-1" />
                      {language === 'ja' ? 'コピー' : 'Copy'}
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                {customPrompt}
              </div>
              <div className="mt-4">
                <Label htmlFor="edit_prompt" className="mb-1 block">{language === 'ja' ? 'システムプロンプトを編集：' : 'Edit System Prompt:'}</Label>
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
                  <Label htmlFor="user_prompt" className="font-semibold text-base">{language === 'ja' ? '詳細で強力なユーザープロンプト' : 'Detailed and Powerful User Prompt'}</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-gray-500 hover:text-gray-700"
                    onClick={() => copyToClipboard(userPrompt, 'user')}
                  >
                    {copiedUser ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        {language === 'ja' ? 'コピー済み' : 'Copied'}
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="h-4 w-4 mr-1" />
                        {language === 'ja' ? 'コピー' : 'Copy'}
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-80 overflow-y-auto">
                  {userPrompt}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {language === 'ja' 
                    ? '注意：この詳細プロンプトはMIDIデータと仮歌詞に基づいて生成され、自動的に使用されます。仮歌詞ではカンマ(,)がメロディと歌詞の文節の区切りを指定するために使用されます。このプロンプトは編集できません。'
                    : 'Note: This detailed prompt is generated based on MIDI data and temporary lyrics, and is used automatically. In temporary lyrics, commas (,) are used to specify breaks between melody and lyric phrases. This prompt cannot be edited.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 border-t pt-2">
          <div className="flex items-center justify-between mb-2">
            <p>
              {language === 'ja' 
                ? `※ ${apiProvider === 'openai' ? 'OpenAI' : apiProvider === 'anthropic' ? 'Anthropic' : 'Google'} APIキーを設定していない場合は、プロンプトをコピーして別のAIサービスで使用できます。`
                : `* If you haven't set up a ${apiProvider === 'openai' ? 'OpenAI' : apiProvider === 'anthropic' ? 'Anthropic' : 'Google'} API key, you can copy the prompts and use them with another AI service.`
              }
            </p>
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
            disabled={!apiKey || apiKey.trim() === ''}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1 rounded-md ${!apiKey || apiKey.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {!apiKey || apiKey.trim() === '' ? `${apiProvider === 'openai' ? 'OpenAI' : apiProvider === 'anthropic' ? 'Anthropic' : 'Google'} APIキーを設定してください` : 'このプロンプトで生成'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
