import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

/**
 * Minimalist Black & White Splash Screen for EstateFlow CRM
 * Clean, professional, luxury monochrome theme.
 */
export const SplashScreen = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Total display duration: 1.5 seconds, then smooth fade-out
    const timerFade = setTimeout(() => {
      setIsFadingOut(true);
    }, 1500);

    const timerFinish = setTimeout(() => {
      if (onFinish) onFinish();
    }, 1900);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerFinish);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-between py-12 px-6 select-none cursor-pointer transition-opacity duration-400 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top spacer */}
      <div className="w-full flex justify-end">
        <span className="text-[10px] tracking-widest text-zinc-600 uppercase font-mono">
          Tap to skip
        </span>
      </div>

      {/* Center Minimalist Brand Mark & Typography */}
      <div className="flex flex-col items-center justify-center my-auto animate-minimal-in text-center">
        {/* Crisp Monochrome Monogram Icon */}
        <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white shadow-2xl mb-5">
          <Building2 className="w-8 h-8 text-white stroke-[1.8]" />
        </div>

        {/* Brand Name */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-[0.28em] uppercase text-white font-sans">
          ESTATEFLOW
        </h1>

        {/* Minimal Divider */}
        <div className="w-8 h-[1px] bg-zinc-800 my-3.5" />

        {/* Subtitle */}
        <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.24em] uppercase text-zinc-400 font-mono">
          REAL ESTATE CRM &amp; WHATSAPP
        </p>
      </div>

      {/* Bottom Minimalist Progress Bar */}
      <div className="w-full max-w-[140px] flex flex-col items-center">
        <div className="w-full h-[1px] bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-white animate-minimal-line" />
        </div>
        <span className="mt-3 text-[9px] tracking-[0.2em] uppercase text-zinc-600 font-mono">
          v1.0
        </span>
      </div>
    </div>
  );
};
