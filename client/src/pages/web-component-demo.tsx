import React, { useEffect, useRef } from 'react';

export default function WebComponentDemo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Web Componentが利用可能か確認
    if (customElements.get('midi-lyrics-generator')) {
      console.log('Web Component found and loaded.');
      
      // コンテナ要素にアクセスできる場合、Web Componentを追加
      if (containerRef.current) {
        // ローディングメッセージを削除
        const container = document.getElementById('web-component-container');
        if (container) {
          container.innerHTML = '';
          
          // Web Componentを作成して追加
          const wcElement = document.createElement('midi-lyrics-generator');
          container.appendChild(wcElement);
        }
      }
    } else {
      console.warn('Web Component not registered! Web Component will be loaded from client/src/wc-entry.tsx automatically.');
    }
    
    console.log('Web Component Demo page mounted');
    
    return () => {
      console.log('Web Component Demo page unmounted');
    };
  }, []);

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">MIDI Lyrics Generator (Web Component Demo)</h1>
      
      <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-800/30 rounded border border-yellow-300 dark:border-yellow-700">
        <h2 className="font-semibold mb-2">使い方</h2>
        <p>
          このコンポーネントは Web Component として使用できます。
          ビルド後に生成される JavaScript ファイルを任意のウェブページに追加し、
          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">&lt;midi-lyrics-generator&gt;&lt;/midi-lyrics-generator&gt;</code>
          として使用できます。
        </p>
      </div>
      
      <div className="border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4 bg-white dark:bg-gray-900" ref={containerRef}>
        {/* Web Componentの使用例 */}
        <div id="web-component-container">
          {/* レンダリング後にWeb Componentがロードされるのでエラーにならないようにこのように表示 */}
          <div>Loading MIDI Lyrics Generator Web Component...</div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h2 className="font-semibold mb-2">HTML 使用例</h2>
        <pre className="overflow-x-auto">
          {`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MIDI Lyrics Generator</title>
  <script src="/midi-lyrics-generator.js"></script>
</head>
<body>
  <midi-lyrics-generator></midi-lyrics-generator>
</body>
</html>`}
        </pre>
      </div>
    </div>
  );
}
