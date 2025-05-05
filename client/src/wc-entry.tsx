import React from 'react';
import ReactDOM from 'react-dom/client';
import reactToWebComponent from 'react-to-webcomponent';
import MidiLyricsGenerator from './components/midi-lyrics-generator';

// React コンポーネントを Web Component に変換
const WcMidiLyricsGenerator = reactToWebComponent(MidiLyricsGenerator, React, ReactDOM);
customElements.define('midi-lyrics-generator', WcMidiLyricsGenerator);
