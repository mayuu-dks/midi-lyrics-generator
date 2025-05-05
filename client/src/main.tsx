import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// アプリケーション起動時にデフォルト設定を確認するグローバル処理
(function initializeAppSettings() {
  try {
    console.log('アプリケーション初期化: デフォルト設定を確認します');
    
    // APIプロバイダーが設定されていない場合や無効な値の場合はデフォルトを設定
    const currentProvider = localStorage.getItem('ai_provider');
    const validProviders = ['openai', 'google25', 'anthropic'];
    
    if (!currentProvider || !validProviders.includes(currentProvider)) {
      console.log(`アプリ初期化: APIプロバイダーが未設定か無効（${currentProvider}）のため、デフォルト値「anthropic」を設定します`);
      localStorage.setItem('ai_provider', 'anthropic');
    } else {
      console.log(`アプリ初期化: 既存のAPIプロバイダー設定を確認: ${currentProvider}`);
    }
  } catch (err) {
    console.error('アプリケーション設定初期化エラー:', err);
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
