import React, { useEffect, useState } from 'react';

/**
 * Minimalist Luxury Monochrome Splash Screen for EstateFlow CRM
 * Professional Animations:
 * - Architectural line-draw SVG animation
 * - Specular monochrome sheen sweep
 * - Expanding letter-tracking title reveal
 * - Horizon line expansion & status progression
 * - Cinematic zoom-through dissolve into the app
 */
export const SplashScreen = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [statusText, setStatusText] = useState('INITIALIZING WORKSPACE');

  useEffect(() => {
    // Stage 1 -> Stage 2
    const t1 = setTimeout(() => {
      setStatusText('CONNECTING GATEWAY');
    }, 700);

    // Stage 2 -> Stage 3
    const t2 = setTimeout(() => {
      setStatusText('WORKSPACE READY');
    }, 1400);

    // Fade out initiated at 2.0s
    const t3 = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Unmount after smooth dissolve (2.5s)
    const t4 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 250);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-between py-10 px-6 select-none cursor-pointer transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top Bar: Discreet Minimalist Skip Action */}
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-[10px] font-mono tracking-[0.2em] text-zinc-600 hover:text-white transition uppercase px-2.5 py-1 rounded border border-zinc-900 bg-zinc-950/80"
        >
          SKIP &rarr;
        </button>
      </div>

      {/* Center: Luxury Architectural Monogram & Typography */}
      <div className="flex flex-col items-center justify-center my-auto text-center px-4">
        {/* Emblem Badge Container with Sheen Reflection */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-2xl mb-6 overflow-hidden">
          {/* Subtle Monochrome Specular Sheen Sweep */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-10 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-sheen" />
          </div>

          {/* Architectural Line-Drawing SVG Emblem */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 sm:w-14 sm:h-14"
          >
            {/* Outer Architectural Framing Lines */}
            <path
              d="M16 84V26L30 16H70L84 26V84"
              stroke="#27272a"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Left High-Rise Tower (Animated Stroke) */}
            <path
              d="M26 84V46L38 38V84H26Z"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-emblem-draw"
            />

            {/* Center Landmark Spire (Highest Tower) */}
            <path
              d="M44 84V28L56 18V84H44Z"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-emblem-draw"
            />

            {/* Right High-Rise Tower */}
            <path
              d="M62 84V46L74 54V84H62Z"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-emblem-draw"
            />

            {/* Precision Crossbeams */}
            <line x1="38" y1="52" x2="62" y2="38" stroke="#71717a" strokeWidth="1.5" strokeDasharray="2 3" />
            <line x1="38" y1="66" x2="62" y2="52" stroke="#71717a" strokeWidth="1.5" strokeDasharray="2 3" />

            {/* Spire Summit Beacon Star */}
            <circle cx="56" cy="18" r="2.5" fill="#ffffff" className="animate-beacon" />
          </svg>
        </div>

        {/* Animated Expanding Letter-Spacing Title */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-[0.32em] uppercase text-white font-sans animate-text-reveal">
          ESTATEFLOW
        </h1>

        {/* Minimalist Expanding Horizon Divider */}
        <div className="w-12 h-[1px] bg-zinc-800 my-3.5 animate-horizon-expand" />

        {/* Animated Subtitle */}
        <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.24em] uppercase text-zinc-400 font-mono animate-subtitle-fade">
          REAL ESTATE CRM &amp; WHATSAPP
        </p>
      </div>

      {/* Bottom: Minimalist Horizon Progress Line & Monospace Ticker */}
      <div className="w-full max-w-[160px] flex flex-col items-center pb-4">
        <p className="text-[9px] text-zinc-500 font-mono tracking-[0.2em] uppercase mb-2.5 transition-all duration-300">
          {statusText}
        </p>

        {/* 1px Precision Horizon Line */}
        <div className="w-full h-[1px] bg-zinc-900 rounded-full overflow-hidden relative">
          <div className="h-full bg-white animate-horizon-expand shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        </div>

        <span className="mt-3 text-[9px] tracking-[0.2em] uppercase text-zinc-700 font-mono">
          v1.0 • SYSTEM ACTIVE
        </span>
      </div>
    </div>
  );
};
