import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export type DualToneSize = 'hero' | 'xl' | 'lg' | 'md' | 'sm';
export type DualToneTheme = 'dark' | 'light';
export type DualToneAccent = 'orange' | 'emerald' | 'blue' | 'purple' | 'amber';
export type DualToneAnimation = 'rotate' | 'shimmer' | 'typewriter' | 'pulse' | 'wave';

export interface DualToneHeadingProps {
  /** The first part of the heading, rendered in Tone 1 (anchor neutral) */
  primaryText: string;
  /** The second part of the heading, rendered in Tone 2 (dynamic accent). Can be string or array of strings to rotate through. */
  accentText: string | string[];
  /** Optional suffix text after the accent, rendered in Tone 1 */
  suffixText?: string;
  /** Optional subtitle or description text below the heading */
  subtitle?: string | React.ReactNode;
  /** Optional top badge or pill (e.g., "Live Deals" or with icon) */
  badge?: string | { text: string; icon?: React.ReactNode };
  /** Semantic HTML tag to render */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  /** Typographic scale */
  size?: DualToneSize;
  /** Color theme of the enclosing container */
  theme?: DualToneTheme;
  /** Accent color palette */
  accentColor?: DualToneAccent;
  /** Visual animation style for the accent tone */
  animationType?: DualToneAnimation;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Milliseconds between rotating words when accentText is an array */
  rotationInterval?: number;
  /** Whether to show a stylized decorative underline under the accent */
  showUnderline?: boolean;
  /** Underline style */
  underlineStyle?: 'wavy' | 'glow-bar' | 'dots' | 'none';
  /** Additional CSS class names */
  className?: string;
  /** HTML element ID for targeting */
  id?: string;
}

const ACCENT_COLOR_MAP: Record<
  DualToneAccent,
  {
    textDark: string;
    textLight: string;
    shimmerGradientDark: string;
    shimmerGradientLight: string;
    borderGlow: string;
    underline: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  orange: {
    textDark: 'text-[#FF5A36]',
    textLight: 'text-[#FF5A36]',
    shimmerGradientDark: 'from-[#FF5A36] via-[#FF8A65] to-[#FF5A36]',
    shimmerGradientLight: 'from-[#E04826] via-[#FF7A59] to-[#E04826]',
    borderGlow: 'shadow-[#FF5A36]/30',
    underline: 'decoration-[#FF5A36]/50',
    badgeBg: 'bg-[#FF5A36]/15 border-[#FF5A36]/30',
    badgeText: 'text-[#FF5A36]',
  },
  emerald: {
    textDark: 'text-emerald-400',
    textLight: 'text-emerald-600',
    shimmerGradientDark: 'from-emerald-400 via-teal-300 to-emerald-400',
    shimmerGradientLight: 'from-emerald-600 via-teal-500 to-emerald-600',
    borderGlow: 'shadow-emerald-500/30',
    underline: 'decoration-emerald-500/50',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    badgeText: 'text-emerald-400',
  },
  blue: {
    textDark: 'text-sky-400',
    textLight: 'text-sky-600',
    shimmerGradientDark: 'from-sky-400 via-indigo-300 to-sky-400',
    shimmerGradientLight: 'from-sky-600 via-indigo-500 to-sky-600',
    borderGlow: 'shadow-sky-500/30',
    underline: 'decoration-sky-500/50',
    badgeBg: 'bg-sky-500/15 border-sky-500/30',
    badgeText: 'text-sky-400',
  },
  purple: {
    textDark: 'text-purple-400',
    textLight: 'text-purple-600',
    shimmerGradientDark: 'from-purple-400 via-pink-300 to-purple-400',
    shimmerGradientLight: 'from-purple-600 via-pink-500 to-purple-600',
    borderGlow: 'shadow-purple-500/30',
    underline: 'decoration-purple-500/50',
    badgeBg: 'bg-purple-500/15 border-purple-500/30',
    badgeText: 'text-purple-400',
  },
  amber: {
    textDark: 'text-amber-400',
    textLight: 'text-amber-600',
    shimmerGradientDark: 'from-amber-400 via-yellow-200 to-amber-400',
    shimmerGradientLight: 'from-amber-600 via-yellow-500 to-amber-600',
    borderGlow: 'shadow-amber-500/30',
    underline: 'decoration-amber-500/50',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    badgeText: 'text-amber-400',
  },
};

const SIZE_STYLES: Record<DualToneSize, { heading: string; subtitle: string }> = {
  hero: {
    heading: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight',
    subtitle: 'text-xs sm:text-sm md:text-base max-w-2xl mt-3 font-medium leading-relaxed',
  },
  xl: {
    heading: 'text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug',
    subtitle: 'text-xs sm:text-sm max-w-xl mt-2 font-medium leading-relaxed',
  },
  lg: {
    heading: 'text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-snug',
    subtitle: 'text-xs sm:text-sm max-w-lg mt-1.5 font-medium leading-relaxed',
  },
  md: {
    heading: 'text-lg sm:text-xl font-bold tracking-tight leading-snug',
    subtitle: 'text-xs sm:text-sm max-w-md mt-1 font-medium leading-normal',
  },
  sm: {
    heading: 'text-base sm:text-lg font-bold tracking-tight leading-snug',
    subtitle: 'text-xs max-w-sm mt-1 font-medium leading-normal',
  },
};

export const DualToneHeading: React.FC<DualToneHeadingProps> = ({
  primaryText,
  accentText,
  suffixText,
  subtitle,
  badge,
  as: Component = 'h2',
  size = 'lg',
  theme = 'dark',
  accentColor = 'orange',
  animationType = 'rotate',
  align = 'center',
  rotationInterval = 3400,
  showUnderline = false,
  underlineStyle = 'none',
  className = '',
  id,
}) => {
  // Convert accentText to array
  const words = Array.isArray(accentText) ? accentText : [accentText];
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const colors = ACCENT_COLOR_MAP[accentColor] || ACCENT_COLOR_MAP.orange;
  const sizeConfig = SIZE_STYLES[size] || SIZE_STYLES.lg;

  // Auto-rotate through words if array has > 1 items and animationType is 'rotate' or 'wave'
  useEffect(() => {
    if (words.length <= 1 || animationType === 'typewriter') return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, rotationInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [words.length, rotationInterval, animationType]);

  // Typewriter effect
  useEffect(() => {
    if (animationType !== 'typewriter') return;

    const currentWord = words[index % words.length];
    let typeTimer: NodeJS.Timeout;

    if (!isDeleting) {
      if (typewriterText.length < currentWord.length) {
        typeTimer = setTimeout(() => {
          setTypewriterText(currentWord.slice(0, typewriterText.length + 1));
        }, 110);
      } else {
        // Pause at complete word before deleting
        typeTimer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (typewriterText.length > 0) {
        typeTimer = setTimeout(() => {
          setTypewriterText(currentWord.slice(0, typewriterText.length - 1));
        }, 60);
      } else {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(typeTimer);
  }, [typewriterText, isDeleting, index, words, animationType]);

  const handleManualCycle = () => {
    if (words.length > 1) {
      setIndex((prev) => (prev + 1) % words.length);
    }
  };

  const currentAccentWord = words[index % words.length];

  // Align classes
  const alignClass =
    align === 'center'
      ? 'text-center items-center justify-center'
      : align === 'right'
      ? 'text-right items-end justify-end'
      : 'text-left items-start justify-start';

  const primaryToneColor = theme === 'dark' ? 'text-white' : 'text-[#111217]';
  const subtitleToneColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const accentToneColor = theme === 'dark' ? colors.textDark : colors.textLight;

  return (
    <div
      id={id}
      className={`flex flex-col ${alignClass} ${className} select-none`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Optional Top Badge */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`inline-flex items-center gap-1.5 px-3 py-1 mb-2.5 rounded-full text-xs font-bold border shadow-xs ${colors.badgeBg} ${colors.badgeText}`}
        >
          {typeof badge === 'object' && badge.icon ? (
            badge.icon
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
            </span>
          )}
          <span>{typeof badge === 'string' ? badge : badge.text}</span>
        </motion.div>
      )}

      {/* 2. Main Dual-Tone Headline */}
      <Component className={`${sizeConfig.heading} ${primaryToneColor} flex flex-wrap items-baseline gap-x-2 gap-y-1 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {/* Tone 1: Primary Anchor Neutral */}
        <span className="inline-block transition-colors duration-200">
          {primaryText}
        </span>

        {/* Tone 2: Dynamic Accent */}
        <span
          onClick={handleManualCycle}
          title={words.length > 1 ? 'Click to see next keyword' : undefined}
          className={`relative inline-flex items-baseline cursor-pointer group ${
            words.length > 1 ? 'active:scale-95' : ''
          } transition-transform`}
        >
          {animationType === 'rotate' ? (
            <span className="relative inline-block overflow-hidden py-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentAccentWord}
                  initial={{ y: 24, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -24, opacity: 0, filter: 'blur(4px)' }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 26,
                  }}
                  className={`inline-block ${accentToneColor} font-black`}
                >
                  {currentAccentWord}
                </motion.span>
              </AnimatePresence>

              {/* Shimmer Light Sweep on Hover or Auto */}
              <motion.span
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: 'easeInOut',
                  repeatDelay: 2,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
              />
            </span>
          ) : animationType === 'typewriter' ? (
            <span
              className={`inline-flex items-center ${accentToneColor} font-black`}
            >
              <span>{typewriterText}</span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-0.5 h-6 sm:h-8 md:h-10 ml-1 bg-current"
              />
            </span>
          ) : animationType === 'shimmer' ? (
            <span
              className={`relative inline-block font-black bg-gradient-to-r ${
                theme === 'dark' ? colors.shimmerGradientDark : colors.shimmerGradientLight
              } bg-clip-text text-transparent animate-pulse`}
            >
              {currentAccentWord}
            </span>
          ) : animationType === 'wave' ? (
            <span className={`inline-flex ${accentToneColor} font-black`}>
              {currentAccentWord.split('').map((char, i) => (
                <motion.span
                  key={`${char}-${i}`}
                  animate={{
                    y: isHovered ? [0, -6, 0] : [0, -3, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.06,
                    ease: 'easeInOut',
                  }}
                  className="inline-block"
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </span>
          ) : (
            /* Default pulse animation */
            <motion.span
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`inline-block ${accentToneColor} font-black`}
            >
              {currentAccentWord}
            </motion.span>
          )}
        </span>

        {/* Optional Suffix Text in Tone 1 */}
        {suffixText && (
          <span className="inline-block transition-colors duration-200">
            {suffixText}
          </span>
        )}
      </Component>

      {/* 3. Subtitle / Description */}
      {subtitle && (
        <p className={`${sizeConfig.subtitle} ${subtitleToneColor}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
