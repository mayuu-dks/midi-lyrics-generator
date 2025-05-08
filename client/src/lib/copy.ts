// copy.ts - クロスブラウザでのコピー機能をサポートするユーティリティ
export async function copy(text: string) {
  // ① Clipboard API（同一オリジンの場合のみ成功）
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* fall‑through */
    }
  }

  // ② フォールバック（execCommand）
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}