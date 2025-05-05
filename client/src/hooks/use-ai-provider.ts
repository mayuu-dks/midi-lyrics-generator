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

// ローカルストレージをリセットして初期状態に戻す関数
function resetLocalStorage() {
  try {
    console.log('ローカルストレージをリセットします...');
    
    // 以前の設定を消去するための事前確認
    const currentProvider = localStorage.getItem('ai_provider');
    console.log(`現在のAPIプロバイダー設定: ${currentProvider || '未設定'}`);
    
    // APIキーは削除
    localStorage.removeItem('ai_api_key');
    
    // APIプロバイダーには必たanthtropicを設定
    localStorage.setItem('ai_provider', 'anthropic');
    
    // 設定後の確認
    const newProvider = localStorage.getItem('ai_provider');
    console.log(`リセット後のAPIプロバイダー設定: ${newProvider}`);
    
    console.log('✔️ ローカルストレージを正常にリセットしました');
    return true;
  } catch (e) {
    console.error('⚠️ ローカルストレージのリセットに失敗しました:', e);
    return false;
  }
}

// アプリ全体で一貫して使用するデフォルトのAPIプロバイダー値
export const DEFAULT_API_PROVIDER: ApiProvider = 'anthropic';

export function useAIProvider(): UseAIProviderResult {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiProvider, setApiProvider] = useState<ApiProvider>(DEFAULT_API_PROVIDER);
  const [aiClient, setAIClient] = useState<AIClient | null>(null);
  
  // グローバルスコープで初期化（レンダリング前）
  // 開発モードの場合、このコードは2回実行される可能性があるが、localStorageを汚染するわけではないのでOK
  useEffect(() => {
    console.log('初期化: APIプロバイダー設定をチェック・初期化します');
    
    // デフォルトを強制的に設定する場合は次の行のコメントを外す
    // return resetAndForceAnthropicProvider();
    
    const storedProvider = localStorage.getItem('ai_provider');
    console.log(`ローカルストレージ内のAPIプロバイダー設定: ${storedProvider || '未設定'}`);
    
    // ローカルストレージに設定がない場合は必ず「anthropic」を設定
    if (!storedProvider) {
      console.log('✅ APIプロバイダーが未設定のため、デフォルト値「anthropic」を設定します');
      localStorage.setItem('ai_provider', DEFAULT_API_PROVIDER);
      // 状態も即座に更新
      setApiProvider(DEFAULT_API_PROVIDER);
    } else {
      // 有効な値かチェック
      if (storedProvider !== 'openai' && storedProvider !== 'google25' && storedProvider !== 'anthropic') {
        console.log(`❗ 無効なAPIプロバイダー「${storedProvider}」を「${DEFAULT_API_PROVIDER}」に修正します`);
        localStorage.setItem('ai_provider', DEFAULT_API_PROVIDER);
        setApiProvider(DEFAULT_API_PROVIDER);
      } else if (storedProvider !== DEFAULT_API_PROVIDER) {
        // 現在のAPI設定がDEFAULT_API_PROVIDERと異なる場合、設定を変更するか判断
        // console.log(`🚩 現在のAPIプロバイダー「${storedProvider}」をデフォルト値「${DEFAULT_API_PROVIDER}」に更新します`);
        // localStorage.setItem('ai_provider', DEFAULT_API_PROVIDER);
        // setApiProvider(DEFAULT_API_PROVIDER);
        
        // 現在の設定を使用
        console.log(`ℹ️ 現在のAPIプロバイダー設定「${storedProvider}」を使用します`);
        setApiProvider(storedProvider as ApiProvider);
      } else {
        // DEFAULT_API_PROVIDERと同じ場合はそのまま使用
        console.log(`✔️ APIプロバイダーは既にデフォルト値「${DEFAULT_API_PROVIDER}」に設定されています`);
        setApiProvider(DEFAULT_API_PROVIDER);
      }
    }
    
    // 設定を強制的にアップデートする関数
    function resetAndForceAnthropicProvider(): boolean {
      try {
        console.log('🔄 APIプロバイダー設定を強制的にリセットし「anthropic」に設定します');
        localStorage.setItem('ai_provider', DEFAULT_API_PROVIDER);
        setApiProvider(DEFAULT_API_PROVIDER);
        return true;
      } catch (e) {
        console.error('❗ APIプロバイダー設定のリセットに失敗しました:', e);
        return false;
      }
    }
    
    // APIキーの読み込み
    const storedApiKey = localStorage.getItem('ai_api_key');
    if (storedApiKey) {
      console.log('APIキーが設定されています');
      setApiKey(storedApiKey);
    } else {
      console.log('APIキーが設定されていません');
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
    } else if (apiProvider === 'google25') {
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
    // APIプロバイダーをanthropicにリセット
    setApiProvider('anthropic');
    localStorage.setItem('ai_provider', 'anthropic');
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
