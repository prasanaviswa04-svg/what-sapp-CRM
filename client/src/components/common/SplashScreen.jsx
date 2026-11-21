import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Ultra-Professional 5-Second White Minimalist Splash Screen
 * 
 * Features:
 * - Pure White Luxury Typography (Building icon completely removed)
 * - Dual-Phase Organic Typewriter Animation (Title & Tagline)
 * - Natural Keystroke Timing with Micro-Pauses
 * - Synchronized 60fps Number Percentage Count (00% -> 100%)
 * - Elegant Minimalist Progress Track & Phase Indicators
 * - Smooth Dissolve Outro into the App
 */
export const SplashScreen = ({ onFinish }) => {
  const [typedTitle, setTypedTitle] = useState('');
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [activeCursor, setActiveCursor] = useState('title'); // 'title' | 'subtitle' | 'idle'
  const [count, setCount] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState('INITIALIZING SECURE KERNEL...');

  const fullTitle = 'ESTATEFLOW CRM';
  const fullSubtitle = 'INTELLIGENT REAL ESTATE AUTOMATION';
  const animationFrameRef = useRef(null);

  // 1. Natural Humanized Typewriter Animation Effect
  useEffect(() => {
    let isCancelled = false;

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const runTypewriter = async () => {
      // Small initial breath before typing
      await wait(220);
      if (isCancelled) return;

      // Phase 1: Type the Brand Title "ESTATEFLOW CRM"
      for (let i = 1; i <= fullTitle.length; i++) {
        if (isCancelled) return;
        setTypedTitle(fullTitle.slice(0, i));

        // Natural typing rhythm: slightly longer pause before words
        const char = fullTitle[i - 1];
        const delay = char === ' ' ? 210 : 90 + Math.floor(Math.random() * 30);
        await wait(delay);
      }

      if (isCancelled) return;
      // Pause between title completion and subtitle start
      await wait(320);
      if (isCancelled) return;

      setActiveCursor('subtitle');

      // Phase 2: Type the Tagline "INTELLIGENT REAL ESTATE AUTOMATION"
      for (let j = 1; j <= fullSubtitle.length; j++) {
        if (isCancelled) return;
        setTypedSubtitle(fullSubtitle.slice(0, j));

        const subChar = fullSubtitle[j - 1];
        const subDelay = subChar === ' ' ? 90 : 42 + Math.floor(Math.random() * 20);
        await wait(subDelay);
      }

      if (isCancelled) return;
      setActiveCursor('subtitle'); // Keep cursor gently blinking at the end of the tagline
    };

    runTypewriter();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. 5-Second Percentage Count (00% -> 100%) & Phase State
  useEffect(() => {
    const totalDuration = 4500; // Counter completes at 4.5 seconds
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Smooth custom ease-out curve (steady progression that gently decelerates near 100%)
      const ease = 1 - Math.pow(1 - progress, 2.6);
      const currentCount = Math.min(Math.floor(ease * 100), 100);
      setCount(currentCount);

      // Dynamic Real-time Status updates based on loading phase
      if (currentCount < 25) {
        setStatusMessage('INITIALIZING SECURE KERNEL...');
      } else if (currentCount < 50) {
        setStatusMessage('SYNCHRONIZING CRM PIPELINE...');
      } else if (currentCount < 75) {
        setStatusMessage('LOADING WORKSPACES & DATA...');
      } else if (currentCount < 99) {
        setStatusMessage('FINALIZING ENCRYPTED SESSION...');
      } else {
        setStatusMessage('SYSTEM READY');
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setCount(100);
        setStatusMessage('SYSTEM READY');

        // At 4.7s (200ms hold at 100%), trigger smooth fade out
        const fadeTimer = setTimeout(() => {
          setIsFadingOut(true);
        }, 200);

        // At 5.0s, cleanly unmount and transition into the app
        const finishTimer = setTimeout(() => {
          if (onFinish) onFinish();
        }, 500);

        return () => {
          clearTimeout(fadeTimer);
          clearTimeout(finishTimer);
        };
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
      className={`fixed inset-0 z-[9999] bg-white text-zinc-900 flex flex-col items-center justify-between py-10 px-6 select-none cursor-pointer transition-opacity duration-300 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage: 'radial-gradient(#e4e4e7 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Header: Brand Live Badge & Instant Skip Action */}
      <div className="w-full max-w-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-zinc-400 uppercase font-semibold">
            ESTATEFLOW OS v2.0
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-[11px] font-mono tracking-widest text-zinc-400 hover:text-zinc-950 transition uppercase px-3.5 py-1 rounded-full border border-zinc-200 bg-white/95 backdrop-blur shadow-sm hover:border-zinc-300"
        >
          SKIP &rarr;
        </button>
      </div>

      {/* Center: Pure Minimalist Typography & Typewriter Showcase */}
      <div className="flex flex-col items-center justify-center my-auto text-center px-4 max-w-2xl">
        {/* Subtle Category Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-zinc-200/90 bg-zinc-50/90 mb-7 text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-zinc-500 uppercase shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          ENTERPRISE REAL ESTATE CRM
        </div>

        {/* Main Typewriter Heading */}
        <div className="min-h-[52px] sm:min-h-[64px] flex items-center justify-center flex-wrap">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.22em] uppercase text-zinc-950 font-sans inline-block">
            {typedTitle}
          </h1>
          {activeCursor === 'title' && (
            <span className="inline-block w-[3.5px] sm:w-[4px] h-7 sm:h-9 md:h-11 bg-zinc-950 ml-2 animate-cursor align-middle rounded-full shadow-[0_0_8px_rgba(0,0,0,0.15)]" />
          )}
        </div>

        {/* Minimalist Expanding Architectural Divider */}
        <div
          className={`h-[1.5px] bg-zinc-300 my-6 transition-all duration-700 ease-out ${
            typedTitle.length >= 10 ? 'w-24' : 'w-0'
          }`}
        />

        {/* Subtitle Typewriter Stream */}
        <div className="min-h-[30px] flex items-center justify-center flex-wrap">
          <p className="text-xs sm:text-sm font-medium tracking-[0.24em] uppercase text-zinc-500 font-mono">
            {typedSubtitle}
          </p>
          {activeCursor === 'subtitle' && (
            <span className="inline-block w-[2.5px] sm:w-[3px] h-4 sm:h-5 bg-zinc-800 ml-1.5 animate-cursor align-middle rounded-full" />
          )}
        </div>
      </div>

      {/* Bottom: Synchronized 5-Second Percentage Count & Minimalist Progress Track */}
      <div className="w-full max-w-sm flex flex-col items-center pb-6">
        {/* Dynamic Percentage Counter */}
        <div className="flex items-baseline font-mono text-zinc-950 font-extrabold text-4xl sm:text-5xl tracking-tight mb-4">
          <span>{String(count).padStart(2, '0')}</span>
          <span className="text-zinc-400 text-xl sm:text-2xl font-light ml-1">%</span>
        </div>

        {/* High-Definition Progress Track */}
        <div className="w-64 sm:w-72 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/90 shadow-inner p-0.5">
          <div
            className="h-full bg-zinc-950 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${count}%` }}
          />
        </div>

        {/* Real-time Status Message */}
        <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-mono tracking-[0.18em] uppercase text-zinc-500">
          {count === 100 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />}
          <span>{statusMessage}</span>
        </div>
      </div>
    </div>
  );
};
