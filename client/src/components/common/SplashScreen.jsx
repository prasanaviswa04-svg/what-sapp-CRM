import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLottie } from 'lottie-react';
import lottieLoaderData from '../../assets/lottie-loader-bw.json';

/**
 * Professional Black & White Splash Screen
 * Featuring Lottie Animation (0d4bbda3-e800-4367-aea8-0526c3bf2fd0)
 * 
 * Features:
 * - Pure White Minimalist Canvas (Zero clutter)
 * - Exact Lottie Geometric Orbiting Loader converted to Black & White
 * - Dual-Tone Typewriter Effect: "EstateFlow" (Bold Obsidian) + "CRM" (Muted Monospace)
 * - Razor-thin Blinking Cursor
 * - Smooth 5-Second Percentage Count (00% -> 100%)
 * - 1.5px Hairline Progress Bar
 * - Seamless Dissolve Transition into the App
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

  const lottieOptions = useMemo(() => ({
    animationData: lottieLoaderData,
    loop: true,
    autoplay: true,
  }), []);

  const { View: LottieView } = useLottie(lottieOptions, {
    width: '100%',
    height: '100%',
  });

  // 1. Two-Stage Typewriter Animation: "EstateFlow" -> pause -> "CRM"
  useEffect(() => {
    let isCancelled = false;
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const runTypewriter = async () => {
      // Small pause before typing starts
      await wait(350);
      if (isCancelled) return;

      // Stage 1: Type "EstateFlow"
      for (let i = 1; i <= brandWord.length; i++) {
        if (isCancelled) return;
        setTypedBrand(brandWord.slice(0, i));
        await wait(95);
      }

      if (isCancelled) return;
      // Brief pause between brand and category
      await wait(200);
      if (isCancelled) return;

      // Stage 2: Type "CRM"
      for (let j = 1; j <= categoryWord.length; j++) {
        if (isCancelled) return;
        setTypedCategory(categoryWord.slice(0, j));
        await wait(110);
      }

      if (isCancelled) return;
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
    const totalDuration = 4400; // Counter reaches 100% at 4.4 seconds
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

        // Hold at 100% briefly, then start smooth dissolve
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
      className={`fixed inset-0 z-[9999] bg-white text-zinc-950 flex flex-col items-center justify-between py-10 px-6 select-none cursor-pointer transition-opacity duration-300 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Bar: Discreet Minimalist Skip Button */}
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

      {/* Center: Lottie Geometric Loader & Brand Typewriter */}
      <div className="my-auto flex flex-col items-center justify-center text-center">
        {/* Black & White Lottie Geometric Orbiting Loader */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-2">
          {LottieView}
        </div>

        {/* Dual-Tone Brand Typewriter */}
        <div className="min-h-[44px] flex items-center justify-center whitespace-nowrap">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 font-sans">
            {typedBrand}
          </span>
          {typedCategory && (
            <span className="text-2xl sm:text-3xl font-medium tracking-wide text-zinc-400 font-mono ml-2">
              {typedCategory}
            </span>
          )}
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
