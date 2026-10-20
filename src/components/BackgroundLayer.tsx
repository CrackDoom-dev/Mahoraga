import React, { useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { getBackgroundBlob } from '../utils/db';

interface BackgroundLayerProps {
  settings: AppSettings;
  reloadTrigger: number;
}

let cachedBlobUrl: string | null = null;
let cachedBlobType: 'image' | 'video' | null = null;
let cachedBlobTimestamp = 0;

export const BackgroundLayer: React.FC<BackgroundLayerProps> = React.memo(({
  settings,
  reloadTrigger,
}) => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(cachedBlobUrl);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(cachedBlobType);
  const [mediaReady, setMediaReady] = useState<boolean>(Boolean(cachedBlobUrl));

  useEffect(() => {
    let isCurrent = true;

    async function loadBg() {
      if (!settings.hasCustomBg) {
        if (cachedBlobUrl) {
          URL.revokeObjectURL(cachedBlobUrl);
          cachedBlobUrl = null;
          cachedBlobType = null;
        }
        if (isCurrent) {
          setMediaUrl(null);
          setMediaType(null);
          setMediaReady(false);
        }
        return;
      }

      if (cachedBlobUrl && cachedBlobTimestamp === reloadTrigger) {
        if (isCurrent) {
          setMediaUrl(cachedBlobUrl);
          setMediaType(cachedBlobType);
          setMediaReady(true);
        }
        return;
      }

      const res = await getBackgroundBlob();
      if (!isCurrent) return;

      if (res && res.blob) {
        if (cachedBlobUrl) {
          URL.revokeObjectURL(cachedBlobUrl);
        }
        cachedBlobUrl = URL.createObjectURL(res.blob);
        cachedBlobType = res.type;
        cachedBlobTimestamp = reloadTrigger;
        setMediaUrl(cachedBlobUrl);
        setMediaType(res.type);
      } else {
        setMediaUrl(null);
        setMediaType(null);
        setMediaReady(false);
      }
    }

    loadBg();

    return () => {
      isCurrent = false;
    };
  }, [settings.hasCustomBg, reloadTrigger]);

  const overlayOpacityDecimal = settings.overlayOpacity / 100;

  return (
    <div
      className="fixed inset-0 w-full h-full min-h-[100dvh] pointer-events-none z-0 overflow-hidden"
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <div
        className="absolute inset-0 w-full h-full min-h-[100dvh]"
        style={{
          background:
            settings.themeMode === 'light'
              ? 'linear-gradient(180deg, #f8f7fd 0%, #eeedfb 50%, #e4e2f8 100%)'
              : 'linear-gradient(180deg, #1d1850 0%, #15132f 50%, #0e0d22 100%)',
        }}
      />

      {settings.hasCustomBg && !mediaReady && (
        <div className="absolute inset-0 w-full h-full min-h-[100dvh] bg-white/[0.03] animate-pulse" />
      )}

      {mediaUrl && mediaType === 'video' && (
        <video
          key={mediaUrl}
          src={mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setMediaReady(true)}
          className={`absolute inset-0 w-full h-full min-w-full min-h-[100dvh] object-cover object-center transition-opacity duration-300 ${
            mediaReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {mediaUrl && mediaType === 'image' && (
        <img
          key={mediaUrl}
          src={mediaUrl}
          alt="Custom Background"
          decoding="async"
          loading="eager"
          onLoad={() => setMediaReady(true)}
          className={`absolute inset-0 w-full h-full min-w-full min-h-[100dvh] object-cover object-center transition-opacity duration-300 ${
            mediaReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      <div
        className="absolute inset-0 w-full h-full min-h-[100dvh] transition-opacity duration-300"
        style={{
          backgroundColor: '#0e0d22',
          opacity: mediaUrl ? overlayOpacityDecimal : 0,
        }}
      />

      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#7c6cf5]/15 blur-[90px]" />
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 rounded-full bg-[#3fc9b0]/10 blur-[90px]" />
    </div>
  );
});

BackgroundLayer.displayName = 'BackgroundLayer';
