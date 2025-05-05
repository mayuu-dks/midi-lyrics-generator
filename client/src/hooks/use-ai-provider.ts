import { useState, useEffect, useCallback } from 'react';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { ApiProvider } from '@/components/midi-lyrics-generator/settings-modal';

export interface AIClient {
  openai?: OpenAI;
  google?: GoogleGenerativeAI;
  anthropic?: Anthropic;
  provider: ApiProvider;
}

interface UseAIProviderResult {
  aiClient: AIClient | null;
  apiKey: string;
  apiProvider: ApiProvider;
  setApiKey: (key: string) => void;
  setApiProvider: (provider: ApiProvider) => void;
  handleApiKeySubmit: (e: React.FormEvent) => void;
  handleApiKeyDelete: () => void;
  isClientReady: boolean;
}

export function useAIProvider(): UseAIProviderResult {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiProvider, setApiProvider] = useState<ApiProvider>('openai');
  const [aiClient, setAIClient] = useState<AIClient | null>(null);

  // LocalStorageからAPIキーと設定を読み込み
  useEffect(() => {
    const storedApiKey = localStorage.getItem('ai_api_key');
    const storedProvider = localStorage.getItem('ai_provider') as ApiProvider | null;
    
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    
    if (storedProvider && (storedProvider === 'openai' || storedProvider === 'google' || storedProvider === 'google25' || storedProvider === 'anthropic')) {
      setApiProvider(storedProvider);
    }
  }, []);

  // APIキーとプロバイダーの変更によるクライアント初期化
  useEffect(() => {
    if (!apiKey) {
      setAIClient(null);
      return;
    }

    if (apiProvider === 'openai') {
      const openaiClient = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // ブラウザでの実行を許可
      });
      setAIClient({ openai: openaiClient, provider: 'openai' });
    } else if (apiProvider === 'google' || apiProvider === 'google25') {
      const googleClient = new GoogleGenerativeAI(apiKey);
      setAIClient({ google: googleClient, provider: apiProvider });
    } else if (apiProvider === 'anthropic') {
      const anthropicClient = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // ブラウザでの実行を許可
      });
      setAIClient({ anthropic: anthropicClient, provider: 'anthropic' });
    }
  }, [apiKey, apiProvider]);

  // APIキー設定の保存
  const handleApiKeySubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey) {
      localStorage.setItem('ai_api_key', apiKey);
      localStorage.setItem('ai_provider', apiProvider);
    }
  }, [apiKey, apiProvider]);

  // APIキーの削除
  const handleApiKeyDelete = useCallback(() => {
    setApiKey('');
    localStorage.removeItem('ai_api_key');
    setAIClient(null);
  }, []);

  return {
    aiClient,
    apiKey,
    apiProvider,
    setApiKey,
    setApiProvider,
    handleApiKeySubmit,
    handleApiKeyDelete,
    isClientReady: !!aiClient
  };
}
