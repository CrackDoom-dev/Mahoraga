import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  appName?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  appName = 'Core Mahoraga',
}) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Keep splash for at least 1.2s, then fade out 300ms
    const timer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => {
        onFinish();
      }, 300);
    }, 1200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, #1d1850 0%, #15132f 50%, #0e0d22 100%)',
      }}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Drawing Ring Logo */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background faint track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="8"
            />
            {/* Animated drawing purple ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#splashGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset="251.2"
              className="animate-[splashRingDraw_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            />
            <defs>
              <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8f81ff" />
                <stop offset="100%" stopColor="#7c6cf5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center glowing logo mark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7c6cf5] to-[#8f81ff] shadow-[0_0_20px_#7c6cf5] animate-pulse" />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="mt-6 text-center animate-[fadeInScale_0.6s_ease-out_0.4s_both]">
          <h1 className="text-2xl font-bold tracking-tight text-[#f2f0ff]">
            {appName}
          </h1>
          <p className="text-xs text-[#a7a3c9] mt-1 tracking-wide uppercase font-medium">
            Pencatatan Keuangan Mingguan
          </p>
        </div>

        {/* Loading Indicator dots */}
        <div className="mt-8 flex gap-1.5 items-center">
          <span className="w-2 h-2 rounded-full bg-[#7c6cf5] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-[#8f81ff] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-[#3fc9b0] animate-bounce" />
        </div>
      </div>

      <style>{`
        @keyframes splashRingDraw {
          to {
            stroke-dashoffset: 50;
          }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
