import React, { useState } from 'react';
import { Smartphone, Download, X, Sparkles, Play, Apple } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenAppStore: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenAppStore }) => {
  const { isInstalled, isInstallable, isIOS } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  // If already installed or user dismissed it in this session, don't show
  if (isInstalled || dismissed) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 max-w-sm animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#111217] text-white p-3.5 sm:p-4 rounded-2xl border border-[#2D2F39] shadow-2xl flex items-center gap-3 backdrop-blur-md">
        {/* App Icon */}
        <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-[#181920] to-[#252835] border border-[#2D2F39] flex items-center justify-center p-1 shrink-0">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
            <rect width="100" height="100" rx="20" fill="#181920" />
            <rect x="20" y="16" width="18" height="68" rx="9" fill="#FF5A36" />
            <rect x="62" y="16" width="18" height="68" rx="9" fill="#FF5A36" />
            <path d="M 24 64 L 76 28 L 76 42 L 24 78 Z" fill="#FFFFFF" />
            <polygon points="66,16 88,26 74,28" fill="#FFFFFF" />
          </svg>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#111217]" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white truncate">HUTA Mobile App</span>
            <span className="bg-[#FF5A36]/20 text-[#FF5A36] text-[9px] font-extrabold px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
              Fast
            </span>
          </div>
          <p className="text-[11px] text-gray-300 truncate">Google Play & App Store Ready</p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onOpenAppStore}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Get App</span>
        </button>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
