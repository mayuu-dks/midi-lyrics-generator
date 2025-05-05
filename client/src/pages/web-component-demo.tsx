import { useEffect } from 'react';
import { Link } from 'wouter';
import '../web-components/midi-lyrics-generator';

// カスタム要素の型宣言を追加
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'midi-lyrics-generator': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export default function WebComponentDemo() {
  useEffect(() => {
    // ページがマウントされたときの初期化
    console.log('Web Component Demo page mounted');
    
    // Web Componentが正常に動作しているか確認
    const wcElement = document.querySelector('midi-lyrics-generator');
    if (!wcElement) {
      console.error('Web Component not found!');
    } else {
      console.log('Web Component found and loaded.');
    }
    
    return () => {
      // クリーンアップ処理
      console.log('Web Component Demo page unmounted');
    };
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">　Web Component化されたMIDI歌詞生成機</h1>
        <Link href="/" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          ホームに戻る
        </Link>
      </div>
      <p className="mb-6">以下はWeb Componentとして実装されたMIDI歌詞生成機です。</p>
      
      {/* Web Componentを表示 */}
      <midi-lyrics-generator></midi-lyrics-generator>
      
      <div className="mt-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">使い方</h2>
        <p className="mb-4">このWeb Componentは他のウェブサイトやアプリケーションに組み込むことができます。</p>
        
        <div className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
          <pre className="text-sm">
            <code>
              {`<!-- Web Componentのスクリプトを読み込む -->
<script src="/path/to/midi-lyrics-generator.js"></script>

<!-- HTML内で使用する -->
<midi-lyrics-generator></midi-lyrics-generator>`}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
