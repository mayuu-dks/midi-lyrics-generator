import { useEffect } from 'react';
import '../web-components/midi-lyrics-generator';

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
      <h1 className="text-2xl font-bold mb-4">　Web Component化されたMIDI歌詞生成機</h1>
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
