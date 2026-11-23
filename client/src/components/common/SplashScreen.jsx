import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLottie } from 'lottie-react';
import lottieLoaderData from '../../assets/lottie-loader-bw.json';

/**
 * Bulletproof Lottie Error Boundary
 * Ensures that if Lottie encounters any issue (e.g. WebView eval policy, null ref),
 * it seamlessly falls back to a pristine geometric SVG orbit loader without crashing the app.
 */
class LottieErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('Lottie render issue, falling back to SVG orbit loader:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

/**
 * Safe Lottie Subcomponent
 */
const LottiePlayer = ({ animationData }) => {
  const options = useMemo(() => ({
    animationData,
    loop: true,
    autoplay: true,
  }), [animationData]);

  const { View } = useLottie(options, {
    width: '100%',
    height: '100%',
  });

  return View;
};

/**
 * Clean Geometric Orbit SVG Fallback Loader
 */
const FallbackOrbitLoader = () => (
  <div className="w-36 h-36 flex items-center justify-center">
    <svg className="w-28 h-28 animate-spin" viewBox="0 0 100 100" style={{ animationDuration: '3s' }}>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#fef3c7" strokeWidth="2.5" />
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="#d4af37"
        strokeWidth="3"
        strokeDasharray="60 180"
        strokeLinecap="round"
      />
      <circle cx="50" cy="12" r="5" fill="#c5a059" />
    </svg>
  </div>
);

/**
 * Professional Black & White Splash Screen
 * Features:
 * - Pure White Minimalist Canvas (Zero clutter)
 * - Exact Lottie Geometric Orbiting Loader with Error Boundary & SVG fallback
 * - Dual-Tone Typewriter Effect: "EstateFlow" (Bold Obsidian) + "CRM" (Muted Monospace)
 * - Razor-thin Blinking Cursor
 * - Smooth 5-Second Percentage Count (00% -> 100%)
 * - 1.5px Hairline Progress Bar
 * - Hard Safety Timer (Guaranteed transition even if WebView sleeps or lags)
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
  const finishedRef = useRef(false);

  const safeFinish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 250);
  };

  // 1. Hard Safety Timeout: Guaranteed dismissal after 5.2s max under ALL conditions
  useEffect(() => {
    const hardTimer = setTimeout(() => {
      safeFinish();
    }, 5200);

    return () => clearTimeout(hardTimer);
  }, []);

  // 2. Two-Stage Typewriter Animation: "EstateFlow" -> pause -> "CRM"
  useEffect(() => {
    let isCancelled = false;
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const runTypewriter = async () => {
      await wait(300);
      if (isCancelled) return;

      // Stage 1: Type "EstateFlow"
      for (let i = 1; i <= brandWord.length; i++) {
        if (isCancelled) return;
        setTypedBrand(brandWord.slice(0, i));
        await wait(95);
      }

      if (isCancelled) return;
      await wait(200);
      if (isCancelled) return;

      // Stage 2: Type "CRM"
      for (let j = 1; j <= categoryWord.length; j++) {
        if (isCancelled) return;
        setTypedCategory(categoryWord.slice(0, j));
        await wait(110);
      }

      if (isCancelled) return;
      await wait(220);
      if (isCancelled) return;
      setShowTagline(true);
    };

    runTypewriter();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 3. Synchronized 5-Second Percentage Count (00% -> 100%)
  useEffect(() => {
    const totalDuration = 4400;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      const ease = 1 - Math.pow(1 - progress, 2.7);
      const currentCount = Math.min(Math.floor(ease * 100), 100);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setCount(100);

        const fadeTimer = setTimeout(() => {
          safeFinish();
        }, 300);

        return () => clearTimeout(fadeTimer);
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleSkip = () => {
    safeFinish();
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

      {/* Center: Safe Lottie Geometric Loader & Brand Typewriter with Light Golden Accents */}
      <div className="my-auto flex flex-col items-center justify-center text-center relative">
        {/* Subtle Warm Light Golden Radial Aura */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-amber-100/40 blur-3xl pointer-events-none -z-10" />

        {/* Black & White Lottie Geometric Orbiting Loader with Safe Error Boundary */}
        <div className="w-40 h-40 sm:w-52 sm:h-52 flex items-center justify-center mb-3">
          <LottieErrorBoundary fallback={<FallbackOrbitLoader />}>
            <LottiePlayer animationData={lottieLoaderData} />
          </LottieErrorBoundary>
        </div>

        {/* Dual-Tone Brand Typewriter with High-Contrast Typography & Light Gold Accent */}
        <div className="min-h-[52px] sm:min-h-[64px] flex items-center justify-center whitespace-nowrap">
          <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-950 font-sans">
            {typedBrand}
          </span>
          {typedCategory && (
            <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#ffe066] to-[#d4af37] font-mono ml-2.5">
              {typedCategory}
            </span>
          )}
          <span className="inline-block w-[3px] sm:w-[3.5px] h-[1.15em] bg-gradient-to-b from-[#ffe066] to-[#ffd700] ml-2 align-middle animate-cursor shadow-2xs" />
        </div>

        {/* Minimalist Subtitle */}
        <p
          className={`text-xs sm:text-sm font-mono tracking-[0.28em] uppercase text-amber-800/80 font-medium mt-3 transition-opacity duration-500 ${
            showTagline ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Real Estate Intelligence
        </p>
      </div>

      {/* Bottom: Minimalist Number Count & Hairline Progress Track */}
      <div className="flex flex-col items-center pb-4">
        {/* Monospaced Percentage Count with Light Golden Warmth */}
        <span className="font-mono text-sm sm:text-base tracking-[0.25em] text-amber-700/90 font-semibold">
          {String(count).padStart(2, '0')}%
        </span>

        {/* Ultra-Thin Hairline Progress Track with Light Gold Fill */}
        <div className="w-36 sm:w-44 h-[2.5px] bg-amber-100/60 rounded-full overflow-hidden mt-3 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#ffe066] via-[#ffd700] to-[#d4af37] rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(255,215,0,0.5)]"
            style={{ width: `${count}%` }}
          />
        </div>
      </div>
    </div>
  );
};
