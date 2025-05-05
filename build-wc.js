#!/usr/bin/env node

import { spawn } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Web Componentビルド用のコマンド実行
console.log('Building Web Component...');

// NODE_ENVを明示的に指定して実行
process.env.NODE_ENV = 'production';

const buildProcess = spawn('vite', ['build', '--config', 'wc-vite.config.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'production' }
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n\u2705 Web Component build successful!');
    console.log('Output files are in the ./docs directory');
    console.log('Usage instructions:');
    console.log('1. Upload the midi-lyrics-generator.js file to your web server');
    console.log('2. Include it in your HTML:');
    console.log(`   <script src="midi-lyrics-generator.js"></script>`);
    console.log('3. Use the Web Component in your HTML:');
    console.log(`   <midi-lyrics-generator></midi-lyrics-generator>`);
  } else {
    console.error(`\n\u274C Build failed with code ${code}`);
  }
});
