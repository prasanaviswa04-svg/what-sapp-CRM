import React, { useEffect, useState, useRef } from 'react';
import { Building2, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * Ultra-Professional 5-Second White Minimalist Splash Screen
 * 
 * Features:
 * - Pure White Luxury Architecture Aesthetic
 * - 5-Second Precise Timing Sequence
 * - Smooth Typewriter Animation for "ESTATEFLOW CRM"
 * - Dynamic 60fps Ease-Out Number Percentage Count (00% -> 100%)
 * - Phase-based Status Indicators (Kernel, DB, Workspaces, Secure Session)
 * - Seamless Dissolve Outro Transition into the App
 */
export const SplashScreen = ({ onFinish }) => {
  const [typedText, setTypedText] = useState('');
  const [count, setCount] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [statusMessage, setStatusMessage] = useState('INITIALIZING SECURE KERNEL...');
  const fullText = 'ESTATEFLOW CRM';
  const animationFrameRef = useRef(null);

  // 1. Typewriter Animation (starts at 300ms, types smoothly across ~2 seconds)
  useEffect(() => {
    let index = 0;
    const startDelay = setTimeout(() => {
      const typingInterval = setInterval(() => {
        index++;
        setTypedText(fullText.slice(0, index));
        if (index >= fullText.length) {
          clearInterval(typingInterval);
          setShowSubtitle(true);
        }
      }, 125);

      return () => clearInterval(typingInterval);
    }, 300);

    return () => clearTimeout(startDelay);
  }, []);

  // 2. 5-Second Percentage Count & Outro Sequence
  useEffect(() => {
    const totalDuration = 4500; // Count reaches 100% at 4.5 seconds
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Smooth custom ease-out curve
      const ease = 1 - Math.pow(1 - progress, 2.5);
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

        // At 4.7s (200ms hold at 100%), start smooth fade out
        const fadeTimer = setTimeout(() => {
          setIsFadingOut(true);
        }, 200);

        // At 5.0s, cleanly complete the splash
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
      {/* Top Header: Brand Badge & Skip Button */}
      <div className="w-full max-w-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-semibold">
            ESTATEFLOW OS v2.0
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-[11px] font-mono tracking-widest text-zinc-400 hover:text-zinc-950 transition uppercase px-3 py-1 rounded-full border border-zinc-200 bg-white/90 backdrop-blur shadow-sm hover:border-zinc-300"
        >
          SKIP &rarr;
        </button>
      </div>

      {/* Center: Monogram Emblem, Typewriter Title & Subtitle */}
      <div className="flex flex-col items-center justify-center my-auto text-center px-4">
        {/* Minimalist Jet-Black Luxury Emblem */}
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-2xl bg-zinc-950 flex items-center justify-center text-white shadow-xl border border-zinc-800 transition-all duration-500">
            <Building2 className="w-10 h-10 text-white stroke-[2]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
          </div>
        </div>

        {/* Typewriter Text Heading */}
        <div className="min-h-[50px] flex items-center justify-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.24em] uppercase text-zinc-950 font-sans">
            {typedText}
          </h1>
          <span className="inline-block w-[3.5px] h-7 sm:h-8 bg-zinc-950 ml-1.5 animate-cursor align-middle" />
        </div>

        {/* Minimalist Expanding Separator */}
        <div
          className={`h-[1.5px] bg-zinc-300 my-5 transition-all duration-700 ease-out ${
            showSubtitle ? 'w-16' : 'w-0'
          }`}
        />

        {/* Smooth Subtitle */}
        <p
          className={`text-xs sm:text-sm font-medium tracking-[0.22em] uppercase text-zinc-500 font-mono transition-all duration-700 ${
            showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          NEXT-GEN REAL ESTATE OS & AUTOMATION
        </p>
      </div>

      {/* Bottom: 5-Second Percentage Count & Progress Bar */}
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

        {/* Loading Phase Status */}
        <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-mono tracking-[0.18em] uppercase text-zinc-500">
          {count === 100 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />}
          <span>{statusMessage}</span>
        </div>
      </div>
    </div>
  );
};
