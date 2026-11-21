import React, { useEffect, useState, useRef } from 'react';

/**
 * Pure Minimalist 5-Second White Splash Screen
 * 
 * Upgraded Typewriter Format:
 * - Dual-Tone TitleCase Brand Formatting:
 *   "EstateFlow" (Bold Obsidian Sans) + "CRM" (Refined Slate Monospace)
 * - Two-Stage Organic Keystroke Cadence with Natural Word Pause
 * - Crisp Monospace Blinking Cursor
 * - Minimalist Fade-in Tagline: "Real Estate Intelligence"
 * - Tabular Number Percentage Count (00% -> 100%)
 * - 1.5px Ultra-Thin Hairline Progress Track
 * - Zero Clutter, Pure White Canvas
 */
export const SplashScreen = ({ onFinish }) => {
  const [typedBrand, setTypedBrand] = useState('');
  const [typedCategory, setTypedCategory] = useState('');
  const [showTagline, setShowTagline] = useState(false);
  const [count, setCount] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const brandWord = 'EstateFlow';
  const categoryWord = 'CRM';
  const animationFrameRef = useRef(null);

  // 1. Two-Stage Typewriter Animation: "EstateFlow" -> pause -> "CRM"
  useEffect(() => {
    let isCancelled = false;
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const runTypewriter = async () => {
      // Gentle initial pause before typing starts
      await wait(300);
      if (isCancelled) return;

      // Stage 1: Type "EstateFlow" letter by letter
      for (let i = 1; i <= brandWord.length; i++) {
        if (isCancelled) return;
        setTypedBrand(brandWord.slice(0, i));
        await wait(95);
      }

      if (isCancelled) return;
      // Natural breather before typing the category acronym
      await wait(220);
      if (isCancelled) return;

      // Stage 2: Type "CRM"
      for (let j = 1; j <= categoryWord.length; j++) {
        if (isCancelled) return;
        setTypedCategory(categoryWord.slice(0, j));
        await wait(110);
      }

      if (isCancelled) return;
      // Reveal subtle tagline
      await wait(250);
      if (isCancelled) return;
      setShowTagline(true);
    };

    runTypewriter();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Synchronized 5-Second Percentage Count (00% -> 100%)
  useEffect(() => {
    const totalDuration = 4400; // Counter climbs steadily over 4.4 seconds
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Smooth custom ease-out curve
      const ease = 1 - Math.pow(1 - progress, 2.7);
      const currentCount = Math.min(Math.floor(ease * 100), 100);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setCount(100);

        // At 4.7s (300ms hold at 100%), begin clean dissolve fade out
        const fadeTimer = setTimeout(() => {
          setIsFadingOut(true);
        }, 300);

        // At 5.0s, transition seamlessly into the application
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
      {/* Top Bar: Discreet Skip Action */}
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

      {/* Dead Center: Upgraded Dual-Tone Typewriter Brand Display */}
      <div className="my-auto flex flex-col items-center justify-center text-center">
        <div className="min-h-[48px] flex items-center justify-center whitespace-nowrap">
          {/* Main Brand Word: "EstateFlow" */}
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 font-sans">
            {typedBrand}
          </span>

          {/* Category Acronym: "CRM" */}
          {typedCategory && (
            <span className="text-2xl sm:text-3xl font-medium tracking-wide text-zinc-400 font-mono ml-2">
              {typedCategory}
            </span>
          )}

          {/* Crisp Monospace Blinking Cursor */}
          <span className="inline-block w-[2.5px] h-[1.15em] bg-zinc-950 ml-1.5 align-middle animate-cursor" />
        </div>

        {/* Minimalist Subtitle */}
        <p
          className={`text-[11px] font-mono tracking-[0.28em] uppercase text-zinc-400 mt-2 transition-opacity duration-500 ${
            showTagline ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Real Estate Intelligence
        </p>
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
