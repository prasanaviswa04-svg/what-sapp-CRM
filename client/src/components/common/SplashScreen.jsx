import React, { useEffect, useState, useRef } from 'react';

/**
 * Pure Minimalist 5-Second White Splash Screen
 * 
 * Design Philosophy:
 * - Pure flat white background (zero noise, zero patterns, zero clutter)
 * - Single-focus, steady typewriter animation for "ESTATEFLOW CRM"
 * - Crisp razor-thin blinking cursor
 * - Monospaced minimalist number count (00% -> 100%)
 * - Ultra-thin 1.5px hairline progress indicator
 */
export const SplashScreen = ({ onFinish }) => {
  const [typedText, setTypedText] = useState('');
  const [count, setCount] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const fullText = 'ESTATEFLOW CRM';
  const animationFrameRef = useRef(null);

  // 1. Clean, Steady Typewriter Animation
  useEffect(() => {
    let index = 0;
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        index++;
        setTypedText(fullText.slice(0, index));
        if (index >= fullText.length) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }, 250);

    return () => clearTimeout(startTimeout);
  }, []);

  // 2. 5-Second Percentage Count (00% -> 100%)
  useEffect(() => {
    const totalDuration = 4400; // Counter climbs steadily over 4.4 seconds
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Smooth custom ease-out curve
      const ease = 1 - Math.pow(1 - progress, 2.8);
      const currentCount = Math.min(Math.floor(ease * 100), 100);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setCount(100);

        // At 4.7s (300ms hold at 100%), start clean dissolve fade out
        const fadeTimer = setTimeout(() => {
          setIsFadingOut(true);
        }, 300);

        // At 5.0s, transition into the application
        const finishTimer = setTimeout(() => {
          if (onFinish) onFinish();
        }, 600);

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
      className={`fixed inset-0 z-[9999] bg-white text-zinc-950 flex flex-col items-center justify-between py-12 px-6 select-none cursor-pointer transition-opacity duration-300 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Bar: Minimalist Skip Action */}
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-[11px] font-mono tracking-widest text-zinc-300 hover:text-zinc-600 transition uppercase px-2 py-1"
        >
          SKIP
        </button>
      </div>

      {/* Dead Center: Single-Focus Brand Typewriter */}
      <div className="my-auto flex items-center justify-center text-center">
        <div className="min-h-[40px] flex items-center justify-center">
          <span className="text-xl sm:text-2xl font-bold tracking-[0.24em] uppercase text-zinc-950 font-sans whitespace-nowrap">
            {typedText}
          </span>
          <span className="inline-block w-[2px] h-[1.15em] bg-zinc-950 ml-1.5 align-middle animate-cursor" />
        </div>
      </div>

      {/* Bottom: Minimalist Number Count & Hairline Progress Track */}
      <div className="flex flex-col items-center pb-4">
        {/* Monospaced Percentage Count */}
        <span className="font-mono text-xs tracking-[0.25em] text-zinc-400 font-medium">
          {String(count).padStart(2, '0')}%
        </span>

        {/* Ultra-Thin Hairline Progress Track */}
        <div className="w-32 h-[1.5px] bg-zinc-100 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-zinc-950 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${count}%` }}
          />
        </div>
      </div>
    </div>
  );
};
