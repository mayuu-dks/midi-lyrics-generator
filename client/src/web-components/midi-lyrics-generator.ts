// Web Componentとして実装するためのコード
import { MidiAnalysis } from '../hooks/use-midi-analysis';
import { ApiProvider } from '../components/midi-lyrics-generator/settings-modal';

// スタイルをシャドウDOMに適用するためのスタイルシート
const styles = `
  :host {
    display: block;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    color: #333;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .header {
    margin-bottom: 2rem;
  }

  .title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .button {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
  }

  .button:hover {
    background-color: #2563eb;
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button-outline {
    background-color: transparent;
    color: #3b82f6;
    border: 1px solid #3b82f6;
  }

  .button-outline:hover {
    background-color: #dbeafe;
  }
`;

// Web Component定義
class MidiLyricsGenerator extends HTMLElement {
  private shadow: ShadowRoot;
  private container: HTMLDivElement;

  constructor() {
    super();
    
    // シャドウDOMを作成
    this.shadow = this.attachShadow({ mode: 'open' });
    
    // スタイルを追加
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    this.shadow.appendChild(styleElement);
    
    // コンテナを作成
    this.container = document.createElement('div');
    this.container.className = 'container';
    this.shadow.appendChild(this.container);
    
    // 初期コンテンツをレンダリング
    this.render();
  }

  // コンポーネントがDOMに追加されたときのコールバック
  connectedCallback() {
    console.log('MidiLyricsGenerator Web Component connected');
  }

  // コンポーネントがDOMから削除されたときのコールバック
  disconnectedCallback() {
    console.log('MidiLyricsGenerator Web Component disconnected');
    // イベントリスナーなどのクリーンアップ
  }

  // 初期レンダリング
  private render() {
    // メインのコンテナにコンテンツを設定
    this.container.innerHTML = `
      <div class="header">
        <h1 class="title">MIDI から歌詞生成</h1>
        <p>MIDIファイルをアップロードして、AIを使って曲に合った歌詞を自動生成します。</p>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-bottom: 1rem;">
          <button id="language-btn" class="button button-outline">🇺🇸 English</button>
          <button id="settings-btn" class="button button-outline">⚙️ 設定</button>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;">
          <h2 style="margin-top: 0; margin-bottom: 1rem;">MIDI ファイル</h2>
          <div style="margin-bottom: 1rem;">
            <label for="midi-file" style="display: block; margin-bottom: 0.5rem;">MIDI ファイルをアップロード</label>
            <input id="midi-file" type="file" accept=".mid,.midi" style="width: 100%; padding: 0.5rem;">
          </div>
          <button id="reset-btn" class="button button-outline" style="width: 100%;">リセット</button>
        </div>

        <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;">
          <h2 style="margin-top: 0; margin-bottom: 1rem;">曲の詳細</h2>
          <div style="margin-bottom: 1rem;">
            <label for="song-title" style="display: block; margin-bottom: 0.5rem;">タイトル (オプション)</label>
            <input id="song-title" type="text" placeholder="曲のタイトル" style="width: 100%; padding: 0.5rem;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label for="song-mood" style="display: block; margin-bottom: 0.5rem;">雰囲気 (オプション)</label>
            <select id="song-mood" style="width: 100%; padding: 0.5rem;">
              <option value="none">雰囲気を選択</option>
              <option value="明るい">明るい</option>
              <option value="切ない">切ない</option>
              <option value="激しい">激しい</option>
              <option value="穏やか">穏やか</option>
              <option value="ロマンティック">ロマンティック</option>
            </select>
          </div>
          <button id="generate-btn" class="button" style="width: 100%;" disabled>プロンプトを生成</button>
        </div>

        <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;">
          <h2 style="margin-top: 0; margin-bottom: 1rem;">生成された歌詞</h2>
          <div id="lyrics-display" style="min-height: 200px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.25rem;">
            <div style="text-align: center; padding: 2rem 0;">
              <p>MIDIファイルをアップロードして、歌詞生成を開始してください。</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // ボタンにイベントリスナーを追加
    this.setupEventListeners();
  }

  // イベントリスナーのセットアップ
  private setupEventListeners() {
    // 言語切り替えボタン
    const languageBtn = this.shadow.getElementById('language-btn');
    if (languageBtn) {
      languageBtn.addEventListener('click', () => this.toggleLanguage());
    }

    // 設定ボタン
    const settingsBtn = this.shadow.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettings());
    }

    // MIDIファイル入力
    const midiFileInput = this.shadow.getElementById('midi-file') as HTMLInputElement;
    if (midiFileInput) {
      midiFileInput.addEventListener('change', (e) => this.handleFileChange(e));
    }

    // リセットボタン
    const resetBtn = this.shadow.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetState());
    }

    // プロンプト生成ボタン
    const generateBtn = this.shadow.getElementById('generate-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generatePrompt());
    }
  }

  // 言語切り替え
  private toggleLanguage() {
    const languageBtn = this.shadow.getElementById('language-btn');
    const currentLanguage = languageBtn?.textContent?.includes('English') ? 'ja' : 'en';
    
    if (languageBtn) {
      languageBtn.textContent = currentLanguage === 'ja' ? '🇯🇵 日本語' : '🇺🇸 English';
    }
    
    // ここで言語に応じてUIのテキストを切り替える処理を実装
    this.updateLanguage(currentLanguage === 'ja' ? 'en' : 'ja');
  }

  // 言語に応じてUIテキストを更新
  private updateLanguage(language: 'ja' | 'en') {
    const titleElement = this.shadow.querySelector('.title');
    if (titleElement) {
      titleElement.textContent = language === 'ja' ? 'MIDI から歌詞生成' : 'Generate Lyrics from MIDI';
    }
    
    // その他の要素も同様に更新...
    // 実際には、すべてのテキスト要素を日英両方で更新する必要がある
  }

  // 設定モーダルを開く
  private openSettings() {
    // 設定モーダルを表示する処理
    alert('設定モーダルは実装中です');
  }

  // ファイル変更時の処理
  private handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      console.log(`選択されたファイル: ${file.name}`);
      
      // ファイルを読み込んで処理する処理を実装
      // 実際には、MIDIファイルの解析と表示の更新を行う
      
      // 仮の処理: 生成ボタンを有効化
      const generateBtn = this.shadow.getElementById('generate-btn') as HTMLButtonElement;
      if (generateBtn) {
        generateBtn.disabled = false;
      }
      
      // MIDI情報を表示
      this.displayMidiInfo(file.name);
    }
  }

  // MIDI情報を表示
  private displayMidiInfo(fileName: string) {
    const lyricsDisplay = this.shadow.getElementById('lyrics-display');
    if (lyricsDisplay) {
      lyricsDisplay.innerHTML = `
        <div>
          <p><strong>ファイル名:</strong> ${fileName}</p>
          <p><strong>ノート数:</strong> 124</p>
          <p><strong>長さ:</strong> 45.2秒</p>
          <p><strong>平均ピッチ:</strong> 62.8</p>
        </div>
      `;
    }
  }

  // 状態をリセット
  private resetState() {
    // 入力と表示をリセット
    const midiFileInput = this.shadow.getElementById('midi-file') as HTMLInputElement;
    const songTitleInput = this.shadow.getElementById('song-title') as HTMLInputElement;
    const songMoodSelect = this.shadow.getElementById('song-mood') as HTMLSelectElement;
    const generateBtn = this.shadow.getElementById('generate-btn') as HTMLButtonElement;
    const lyricsDisplay = this.shadow.getElementById('lyrics-display');
    
    if (midiFileInput) midiFileInput.value = '';
    if (songTitleInput) songTitleInput.value = '';
    if (songMoodSelect) songMoodSelect.value = 'none';
    if (generateBtn) generateBtn.disabled = true;
    
    if (lyricsDisplay) {
      lyricsDisplay.innerHTML = `
        <div style="text-align: center; padding: 2rem 0;">
          <p>MIDIファイルをアップロードして、歌詞生成を開始してください。</p>
        </div>
      `;
    }
  }

  // プロンプトを生成
  private generatePrompt() {
    const songTitleInput = this.shadow.getElementById('song-title') as HTMLInputElement;
    const songMoodSelect = this.shadow.getElementById('song-mood') as HTMLSelectElement;
    
    const title = songTitleInput?.value || '未設定';
    const mood = songMoodSelect?.value !== 'none' ? songMoodSelect?.value : '未設定';
    
    // プロンプトを生成して表示
    const lyricsDisplay = this.shadow.getElementById('lyrics-display');
    if (lyricsDisplay) {
      lyricsDisplay.innerHTML = `
        <div>
          <p><strong>システムプロンプト:</strong></p>
          <pre style="background-color: #f3f4f6; padding: 0.5rem; border-radius: 0.25rem; white-space: pre-wrap;">あなたはプロの作詞家です。提供されたMIDIファイルの分析情報に基づいて、メロディに完全に合った歌詞を生成してください。
曲のタイトル: ${title}
曲の雰囲気: ${mood}
歌詞の言語: 日本語</pre>
          
          <p style="margin-top: 1rem;"><strong>ユーザープロンプト:</strong></p>
          <pre style="background-color: #f3f4f6; padding: 0.5rem; border-radius: 0.25rem; white-space: pre-wrap;">音符パターンに完全に一致する歌詞を生成してください。

曲の設定:
タイトル: ${title}
イメージ: ${mood}

音符パターンの詳細:
32分音符以下: 5個
16分音符: 12個
8分音符: 45個
4分音符: 52個
2分音符: 10個
全音符以上: 0個</pre>
        </div>
      `;
    }
  }
}

// カスタム要素としてWeb Componentを登録
customElements.define('midi-lyrics-generator', MidiLyricsGenerator);
