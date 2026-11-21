import React, { useEffect, useState } from 'react';

/**
 * Netflix-Inspired Cinematic Splash Screen for EstateFlow CRM
 * Features:
 * - Deep luxury cinematic universe & ambient radial aura
 * - Animated multi-ribbon architectural emblem
 * - Anamorphic lens flare sweep
 * - Expanding typography with metallic sheen
 * - Native Web Audio API cinematic "Ta-Dum" sound
 * - Smooth zoom-through dissolve transition into the app
 */
export const SplashScreen = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [statusText, setStatusText] = useState('Initializing AI Real Estate Engine...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Play signature cinematic "Ta-Dum" sound via Web Audio API
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Note 1: Sub-bass cinematic boom ("Ta")
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(85, now);
        osc1.frequency.exponentialRampToValueAtTime(38, now + 0.4);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.45);

        // Note 2: Cinematic luxury chord strike ("Dum")
        const chord = [130.81, 196.0, 261.63, 392.0]; // Rich C-minor resonance
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + 0.16);
          gain.gain.setValueAtTime(0.0001, now + 0.16);
          gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.26);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + 0.16);
          osc.stop(now + 1.7);
        });
      }
    } catch (e) {
      // Audio autoplay restrictions handled silently
    }

    // 2. Micro Status ticker updates
    const t1 = setTimeout(() => {
      setStatusText('Connecting WhatsApp CRM Gateway...');
      setProgress(55);
    }, 700);

    const t2 = setTimeout(() => {
      setStatusText('Welcome to EstateFlow CRM');
      setProgress(100);
    }, 1500);

    // 3. Initiate cinematic fade out at 2.2s
    const t3 = setTimeout(() => {
      setIsFadingOut(true);
    }, 2200);

    // 4. Unmount after fade out animation completes (2.7s)
    const t4 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2700);

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
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between select-none overflow-hidden transition-all duration-500 ease-out cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, #13141f 0%, #08080c 55%, #020203 100%)',
      }}
    >
      {/* Cinematic Ambient Glow Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-splash-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-teal-400/15 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Bar: Skip Action */}
      <div className="w-full flex justify-end p-5 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-[11px] font-semibold tracking-widest text-zinc-500 hover:text-white transition uppercase px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm"
        >
          Skip &rarr;
        </button>
      </div>

      {/* Centerpiece: Cinematic Netflix-Style Ribbon Monogram & Typography */}
      <div className="flex flex-col items-center justify-center my-auto z-10 px-4 text-center">
        {/* Animated Multi-Ribbon Architectural Emblem */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6 flex items-center justify-center">
          {/* Anamorphic Lens Flare Beam */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-10">
            <div className="w-16 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent blur-sm animate-flare" />
          </div>

          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-transform duration-700 hover:scale-105"
          >
            {/* Background Shield Prism */}
            <rect x="10" y="10" width="100" height="100" rx="26" fill="#09090b" stroke="#27272a" strokeWidth="2" />
            <rect x="12" y="12" width="96" height="96" rx="24" fill="url(#prismGrad)" />

            {/* Left Tower Ribbon */}
            <path
              d="M32 88V46L46 36V88H32Z"
              fill="url(#leftRibbon)"
              className="origin-bottom transition-all duration-700"
              style={{ animation: 'towerGrow 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            />

            {/* Center High Spire (Highest Tower with Diamond Head) */}
            <path
              d="M52 88V28L68 18V88H52Z"
              fill="url(#centerRibbon)"
              className="origin-bottom transition-all duration-700"
              style={{ animation: 'towerGrow 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.12s forwards' }}
            />

            {/* Right Tower Ribbon */}
            <path
              d="M74 88V46L88 56V88H74Z"
              fill="url(#rightRibbon)"
              className="origin-bottom transition-all duration-700"
              style={{ animation: 'towerGrow 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.24s forwards' }}
            />

            {/* Architectural Connecting Modern Beams */}
            <path d="M46 54L74 38" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            <path d="M46 72L74 56" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

            {/* Shimmer Light Dot at Spire Peak */}
            <circle cx="68" cy="18" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)" />

            <defs>
              <linearGradient id="prismGrad" x1="12" y1="12" x2="108" y2="108" gradientUnits="userSpaceOnUse">
                <stop stopColor="#18181b" />
                <stop offset="0.5" stopColor="#09090b" />
                <stop offset="1" stopColor="#040405" />
              </linearGradient>
              <linearGradient id="leftRibbon" x1="32" y1="36" x2="46" y2="88" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34d399" />
                <stop offset="1" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="centerRibbon" x1="52" y1="18" x2="68" y2="88" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6ee7b7" />
                <stop offset="0.4" stopColor="#10b981" />
                <stop offset="1" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="rightRibbon" x1="74" y1="46" x2="88" y2="88" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10b981" />
                <stop offset="1" stopColor="#065f46" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Cinematic Title with Expanding Letter Spacing */}
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase font-sans animate-title-reveal bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(255,255,255,0.15)]">
          EstateFlow
        </h1>

        {/* Subtitle / Category Badge */}
        <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/90 font-mono">
          <span>AI Real Estate CRM</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
          <span>WhatsApp Automation</span>
        </div>
      </div>

      {/* Bottom: Luxury Razor Progress Beam & Status Ticker */}
      <div className="w-full max-w-sm px-8 pb-10 flex flex-col items-center z-10">
        <p className="text-[11px] text-zinc-400 font-mono tracking-wider mb-2.5 transition-all duration-300">
          {statusText}
        </p>

        {/* Razor-thin glowing progress bar */}
        <div className="w-full h-[2px] bg-zinc-800/80 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-white shadow-[0_0_12px_rgba(52,211,153,0.9)] transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="mt-3 text-[9px] uppercase tracking-[0.25em] text-zinc-600 font-semibold">
          Elite Real Estate OS • v1.0
        </span>
      </div>
    </div>
  );
};
