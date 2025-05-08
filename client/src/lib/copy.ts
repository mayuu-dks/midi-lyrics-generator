// copy.ts - クロスブラウザでのコピー機能をサポートするユーティリティ
// client/src/lib/copy.ts

export async function copy(text: string) {
  // ① Clipboard API（同一オリジンかつ許可されていれば成功）
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // 失敗したら下のフォールバックへフォールスルー
    }
  }

  // ② フォールバック (document.execCommand を使った旧API)
  const ta = document.createElement('textarea');
  ta.value = text;
  // 画面外に隠して
  ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
  document.body.appendChild(ta);
  ta.select();
  // ここの execCommand は多くの場合動いてくれます
  document.execCommand('copy');
  document.body.removeChild(ta);
}
