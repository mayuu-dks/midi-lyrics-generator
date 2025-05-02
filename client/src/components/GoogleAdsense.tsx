import { useEffect } from 'react';

interface GoogleAdProps {
  className?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  slot?: string;
}

// Googleアドセンス広告を表示するコンポーネント
export default function GoogleAdsense({ 
  className = '', 
  format = 'auto',
  slot = ''
}: GoogleAdProps) {
  useEffect(() => {
    // コンポーネントがマウントされた時に広告をロード
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // あなたのアドセンスID
        data-ad-slot={slot || undefined}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
