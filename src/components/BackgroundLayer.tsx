import React, { useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { getBackgroundBlob } from '../utils/db';

interface BackgroundLayerProps {
  settings: AppSettings;
  reloadTrigger: number;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  settings,
  reloadTrigger,
}) => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  useEffect(() => {
    let activeUrl: string | null = null;

    async function loadBg() {
      if (!settings.hasCustomBg) {
        if (mediaUrl) URL.revokeObjectURL(mediaUrl);
        setMediaUrl(null);
        setMediaType(null);
        return;
      }

      const res = await getBackgroundBlob();
      if (res && res.blob) {
        activeUrl = URL.createObjectURL(res.blob);
        setMediaUrl(activeUrl);
        setMediaType(res.type);
      } else {
        setMediaUrl(null);
        setMediaType(null);
      }
    }

    loadBg();

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [settings.hasCustomBg, reloadTrigger]);

  const overlayOpacityDecimal = settings.overlayOpacity / 100;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Default Navy-Purple Ambient Gradient (always present beneath) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            settings.themeMode === 'light'
              ? 'linear-gradient(180deg, #edeafc 0%, #e1dff7 50%, #d5d1f0 100%)'
              : 'linear-gradient(180deg, #1d1850 0%, #15132f 50%, #0e0d22 100%)',
        }}
      />

      {/* 2. Custom Media (Image/GIF or Video) if provided */}
      {mediaUrl && mediaType === 'video' && (
        <video
          key={mediaUrl}
          src={mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      {mediaUrl && mediaType === 'image' && (
        <img
          key={mediaUrl}
          src={mediaUrl}
          alt="Custom Background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      {/* 3. Dark Overlay Layer for Legibility */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundColor: '#0e0d22',
          opacity: mediaUrl ? overlayOpacityDecimal : 0,
        }}
      />

      {/* 4. Subtle ambient glowing light orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#7c6cf5]/15 blur-[90px]" />
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 rounded-full bg-[#3fc9b0]/10 blur-[90px]" />
    </div>
  );
};
