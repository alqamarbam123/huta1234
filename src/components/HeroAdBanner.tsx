import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  Flame,
  Tag,
  Megaphone,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { HeroAd, HeroAdSettings } from '../types';
import { DualToneHeading } from './DualToneHeading';

interface HeroAdBannerProps {
  heroAds?: HeroAd[];
  heroSettings?: HeroAdSettings;
  onSelectCategory?: (category: string) => void;
  onOpenPostAd?: () => void;
  isAdminLoggedIn?: boolean;
  onAdminManage?: () => void;
  isLivePreview?: boolean;
}

const DEFAULT_SLIDE_ID = '__default_hero__';

export const HeroAdBanner: React.FC<HeroAdBannerProps> = ({
  heroAds = [],
  heroSettings = { mode: 'default', rotationIntervalSeconds: 6 },
  onSelectCategory,
  onOpenPostAd,
  isAdminLoggedIn,
  onAdminManage,
  isLivePreview = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeAds = (heroAds || []).filter((ad) => ad.isActive);

  // Determine slides based on mode
  const mode = heroSettings?.mode || 'default';
  const rotationSeconds = Math.max(3, heroSettings?.rotationIntervalSeconds || 6);

  // If mode is 'default' or no active ads exist, show only default slide
  const slides: Array<{ type: 'default' | 'ad'; data?: HeroAd; id: string }> = [];

  if (mode === 'default' || activeAds.length === 0) {
    slides.push({ type: 'default', id: DEFAULT_SLIDE_ID });
  } else if (mode === 'ads_only') {
    activeAds.forEach((ad) => slides.push({ type: 'ad', data: ad, id: ad.id }));
  } else {
    // mode === 'rotate' (Default Hero + Admin Ads)
    slides.push({ type: 'default', id: DEFAULT_SLIDE_ID });
    activeAds.forEach((ad) => slides.push({ type: 'ad', data: ad, id: ad.id }));
  }

  // Ensure current index is within bounds
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  // Auto-rotation timer
  useEffect(() => {
    if (slides.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, rotationSeconds * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, rotationSeconds, isPaused]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleCtaClick = (action?: string) => {
    if (!action) return;

    if (action === 'post_ad' || action === 'post-ad') {
      if (onOpenPostAd) onOpenPostAd();
      return;
    }

    if (action.startsWith('http://') || action.startsWith('https://')) {
      window.open(action, '_blank', 'noopener,noreferrer');
      return;
    }

    // Otherwise treat as a category name or query
    if (onSelectCategory) {
      onSelectCategory(action);
      const el = document.getElementById('marketplace-listings');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const currentSlide = slides[currentIndex] || slides[0] || { type: 'default', id: DEFAULT_SLIDE_ID };

  const getGradientStyles = (theme?: string) => {
    switch (theme) {
      case 'blue':
        return {
          highlight: 'text-sky-400 decoration-sky-400/40',
          badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          button: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20',
          accent: 'from-sky-500/20 to-blue-600/10',
        };
      case 'emerald':
        return {
          highlight: 'text-emerald-400 decoration-emerald-400/40',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          button: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20',
          accent: 'from-emerald-500/20 to-teal-600/10',
        };
      case 'purple':
        return {
          highlight: 'text-purple-400 decoration-purple-400/40',
          badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          button: 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20',
          accent: 'from-purple-500/20 to-indigo-600/10',
        };
      case 'amber':
        return {
          highlight: 'text-amber-400 decoration-amber-400/40',
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          button: 'bg-amber-500 hover:bg-amber-600 text-gray-950 font-black shadow-amber-500/20',
          accent: 'from-amber-500/20 to-orange-600/10',
        };
      default: // orange / brand
        return {
          highlight: 'text-[#FF5A36] decoration-[#FF5A36]/40',
          badge: 'bg-[#FF5A36]/15 text-[#FF5A36] border-[#FF5A36]/30',
          button: 'bg-[#FF5A36] hover:bg-[#E04826] text-white shadow-[#FF5A36]/25',
          accent: 'from-[#FF5A36]/20 to-amber-600/10',
        };
    }
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Admin Quick Settings Indicator */}
      {isAdminLoggedIn && onAdminManage && !isLivePreview && (
        <div className="flex justify-center sm:justify-end mb-2">
          <button
            type="button"
            onClick={onAdminManage}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F222E] hover:bg-[#2A2E3D] text-[11px] font-bold text-gray-300 hover:text-white border border-[#353949] shadow-sm transition-all cursor-pointer"
            title="Open Admin Hero Ad & Banner Manager"
          >
            <Sliders className="w-3 h-3 text-[#FF5A36]" />
            <span>Admin: Hero Ads ({activeAds.length} Active • Mode: {mode})</span>
          </button>
        </div>
      )}

      {/* Main Slide Card Container */}
      <div className="relative min-h-[160px] sm:min-h-[175px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentSlide.type === 'default' ? (
            /* DEFAULT HERO SLIDE (Dual-Tone Animated Heading System) */
            <motion.div
              key="default-slide"
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full text-center"
            >
              <DualToneHeading
                as="h1"
                size="hero"
                theme="dark"
                primaryText="Find Anything in"
                accentText={[
                  'Sri Lanka 🇱🇰',
                  'Colombo & 25 Districts',
                  'Vehicles & Motors 🚗',
                  'Homes & Land Plots 🏡',
                  'Smart Electronics 📱',
                  'Verified Deals 🏷️',
                ]}
                badge={{
                  text: "Sri Lanka's Direct Buyer-Seller Marketplace",
                  icon: <Sparkles className="w-3.5 h-3.5 text-[#FF5A36]" />,
                }}
                subtitle="Properties, Vehicles, Classifieds, Jobs & Local Services across all 25 districts with direct WhatsApp & telephone contact."
                animationType="rotate"
                rotationInterval={3200}
                showUnderline={false}
                align="center"
                id="hero-dual-tone-heading"
              />
            </motion.div>
          ) : (
            /* CUSTOM ADMIN ANIMATED AD SLIDE */
            (() => {
              const ad = currentSlide.data!;
              const styles = getGradientStyles(ad.gradientTheme);

              return (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="w-full relative rounded-3xl p-5 sm:p-7 border border-[#2D303E] bg-gradient-to-b from-[#181A22] via-[#14161D] to-[#101117] text-center overflow-hidden shadow-2xl"
                >
                  {/* Optional Background Image */}
                  {ad.bgImage && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-luminosity filter blur-[1px]"
                      style={{ backgroundImage: `url(${ad.bgImage})` }}
                    />
                  )}

                  {/* Ambient Glow */}
                  <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-32 bg-gradient-to-b ${styles.accent} rounded-full blur-2xl pointer-events-none`} />

                  <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
                    {/* Badge */}
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={
                          ad.animationType === 'pulse'
                            ? { scale: [1, 1.05, 1] }
                            : ad.animationType === 'glow'
                            ? { opacity: [0.9, 1, 0.9] }
                            : {}
                        }
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles.badge} shadow-xs`}
                      >
                        <Megaphone className="w-3.5 h-3.5" />
                        <span>{ad.badge || 'Sponsored Ad'}</span>
                      </motion.div>
                    </div>

                    {/* Headline */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-snug">
                      {ad.title}{' '}
                      {ad.highlightText && (
                        <span className={styles.highlight}>
                          {ad.highlightText}
                        </span>
                      )}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-gray-300 text-xs sm:text-sm font-medium max-w-lg mx-auto leading-relaxed">
                      {ad.subtitle}
                    </p>

                    {/* CTA Button */}
                    {ad.ctaText && (
                      <div className="pt-2 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCtaClick(ad.ctaAction)}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-lg cursor-pointer ${styles.button}`}
                        >
                          <span>{ad.ctaText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Controls (Only if multiple slides exist) */}
      {slides.length > 1 && (
        <div className="flex items-center justify-between mt-3 px-2">
          {/* Previous Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Hero Ad"
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {slides.map((s, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={s.id || idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    isSelected
                      ? 'w-6 bg-[#FF5A36]'
                      : 'w-1.5 bg-gray-600 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Hero Ad"
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
