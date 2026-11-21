import React, { useEffect, useState, useRef } from 'react';
import { Building2 } from 'lucide-react';

/**
 * Clean & Professional White Splash Screen
 * Features:
 * - Crisp White Background Theme
 * - Realistic Typewriter Animation for "ESTATEFLOW CRM"
 * - Dynamic Number Percentage Count (0% to 100%)
 * - Minimalist Progress Bar
 * - Smooth Dissolve Transition into the App
 */
export const SplashScreen = ({ onFinish }) => {
  const [typedText, setTypedText] = useState('');
  const [count, setCount] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const fullText = 'ESTATEFLOW CRM';
  const animationFrameRef = useRef(null);

  // 1. Typewriter Animation Effect
  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      index++;
      setTypedText(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(typingInterval);
        setShowSubtitle(true);
      }
    }, 85);

    return () => clearInterval(typingInterval);
  }, []);

  // 2. Smooth Number Count-Up Animation (0% to 100%)
  useEffect(() => {
    const duration = 1600; // 1.6 seconds to reach 100%
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth Ease-Out Cubic Curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOut * 100);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setCount(100);
        // Hold 100% briefly, then smoothly fade out
        const fadeTimer = setTimeout(() => {
          setIsFadingOut(true);
        }, 250);

        const finishTimer = setTimeout(() => {
          if (onFinish) onFinish();
        }, 650);

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
      className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-between py-10 px-6 select-none cursor-pointer transition-opacity duration-400 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Header: Discreet Skip Action */}
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-xs font-mono tracking-widest text-zinc-400 hover:text-zinc-900 transition uppercase px-2.5 py-1 rounded border border-zinc-200 bg-zinc-50"
        >
          SKIP &rarr;
        </button>
      </div>

      {/* Center: Brand Mark, Typewriter Title & Subtitle */}
      <div className="flex flex-col items-center justify-center my-auto text-center px-4">
        {/* Minimalist Black Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center text-white shadow-md border border-zinc-900 mb-6 transition-transform duration-300">
          <Building2 className="w-8 h-8 text-white stroke-[2]" />
        </div>

        {/* Typewriter Text Heading */}
        <div className="min-h-[44px] flex items-center justify-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[0.22em] uppercase text-zinc-950 font-sans">
            {typedText}
          </h1>
          <span className="inline-block w-[3px] h-6 sm:h-7 bg-zinc-950 ml-1.5 animate-cursor align-middle" />
        </div>

        {/* Minimalist Divider */}
        <div className="w-10 h-[1.5px] bg-zinc-200 my-4" />

        {/* Smooth Subtitle */}
        <p
          className={`text-xs font-medium tracking-[0.2em] uppercase text-zinc-500 font-mono transition-opacity duration-500 ${
            showSubtitle ? 'opacity-100' : 'opacity-0'
          }`}
        >
          REAL ESTATE WHATSAPP CRM
        </p>
      </div>

      {/* Bottom: Smooth Number Count & Progress Line */}
      <div className="w-full max-w-xs flex flex-col items-center pb-6">
        {/* Dynamic Percentage Counter */}
        <div className="flex items-baseline font-mono text-zinc-950 font-bold text-3xl sm:text-4xl tracking-tight mb-3">
          <span>{String(count).padStart(2, '0')}</span>
          <span className="text-zinc-400 text-lg sm:text-xl font-normal ml-1">%</span>
        </div>

        {/* Crisp Progress Track */}
        <div className="w-52 sm:w-60 h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/80">
          <div
            className="h-full bg-zinc-950 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${count}%` }}
          />
        </div>

        <span className="mt-3 text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-mono">
          LOADING REAL ESTATE OS
        </span>
      </div>
    </div>
  );
};
