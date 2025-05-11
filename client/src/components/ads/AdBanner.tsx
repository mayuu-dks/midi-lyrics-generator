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
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (adRef.current && typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  const formatStyle = format === 'horizontal' 
    ? { display: 'block', width: '728px', height: '90px' }
    : format === 'rectangle'
    ? { display: 'inline-block', width: '300px', height: '250px' }
    : format === 'vertical'
    ? { display: 'inline-block', width: '160px', height: '600px' }
    : { display: 'block' };

  return (
    <div className={`ad-container ${className}`} data-testid="ad-container">
      <ins
        ref={adRef as React.RefObject<HTMLModElement>}
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