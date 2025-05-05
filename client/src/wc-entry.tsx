import React from 'react';
import ReactDOM from 'react-dom/client';
import reactToWebComponent from 'react-to-webcomponent';
import MidiLyricsGenerator from './components/midi-lyrics-generator';

// windowにglobalThisを追加
// @ts-ignore
if (typeof window !== 'undefined' && !window.process) {
  // @ts-ignore
  window.process = { env: { NODE_ENV: 'production' } };
}

// React コンポーネントを Web Component に変換
const WcMidiLyricsGenerator = reactToWebComponent(MidiLyricsGenerator, React, ReactDOM);

// 既に登録済みの場合はエラーになるので回避
if (!customElements.get('midi-lyrics-generator')) {
  console.log('Registering Web Component: midi-lyrics-generator');
  customElements.define('midi-lyrics-generator', WcMidiLyricsGenerator);
} else {
  console.log('Web Component already registered: midi-lyrics-generator');
}
