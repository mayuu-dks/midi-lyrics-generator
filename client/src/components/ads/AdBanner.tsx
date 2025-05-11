import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdBanner({ 
  className = '', 
  slot, 
  format = 'auto',
  responsive = true
}: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (containerRef.current && typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  const formatStyle = format === 'horizontal' 
    ? { display: 'block', maxWidth: '100%', height: '90px', overflow: 'hidden' }
    : format === 'rectangle'
    ? { display: 'inline-block', maxWidth: '100%', height: '250px', overflow: 'hidden' }
    : format === 'vertical'
    ? { display: 'inline-block', maxWidth: '100%', height: '600px', overflow: 'hidden' }
    : { display: 'block', maxWidth: '100%', overflow: 'hidden' };

  return (
    <div ref={containerRef} className={`ad-container p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`} data-testid="ad-container">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Advertisement</div>
      <ins
        className="adsbygoogle"
        style={formatStyle}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}