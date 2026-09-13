import React from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  MapPin,
  Sparkles,
  User,
  LayoutGrid,
  Car,
  Home,
  Briefcase,
  Wrench,
  ShoppingBag,
  Smartphone,
} from 'lucide-react';
import { ViewTab } from '../types';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onSelectCategory?: (category: string) => void;
  onOpenPostAd?: () => void;
  onOpenUserAuth?: () => void;
  onOpenAppStore?: () => void;
  currentUser?: { name: string; email: string } | null;
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
  activeCategory?: string;
}

const DISTRICTS_POPULAR = [
  'All Sri Lanka',
  'Colombo',
  'Gampaha',
  'Kandy',
  'Galle',
  'Kalutara',
  'Kurunegala',
  'Jaffna',
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onSelectCategory,
  onOpenPostAd,
  onOpenUserAuth,
  onOpenAppStore,
  currentUser,
  selectedLocation = 'All Sri Lanka',
  onLocationChange,
  activeCategory = 'All',
}) => {
  const handleVerticalClick = (catName: string) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    onSelectTab('marketplace');
  };

  return (
    <header className="bg-[#111217] border-b border-[#2D2F39] sticky top-0 z-40 shadow-md">
      {/* 1. Qatar Living Style Top Utility Bar */}
      <div className="border-b border-[#22242F] bg-[#0C0D11] text-xs text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3">
          {/* Location & Slogan */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
              <MapPin className="w-3.5 h-3.5 text-[#FF5A36] shrink-0" />
              {onLocationChange ? (
                <select
                  value={selectedLocation}
                  onChange={(e) => onLocationChange(e.target.value)}
                  className="bg-transparent text-xs text-gray-200 font-semibold outline-none cursor-pointer hover:text-white border-none pr-1"
                >
                  {DISTRICTS_POPULAR.map((loc) => (
                    <option key={loc} value={loc} className="bg-[#181920] text-white">
                      {loc}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-semibold">{selectedLocation}</span>
              )}
            </div>

            <span className="hidden sm:inline text-[#2D2F39]">|</span>
            <span className="hidden sm:inline text-[11px] text-gray-400">
              Sri Lanka's #1 Classifieds Portal
            </span>
          </div>

          {/* Quick Links & Account */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onSelectTab('huta_in')}
              className="inline-flex items-center gap-1 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#FF5A36]" />
              <span className="hidden xs:inline">Community:</span>
              <span className="text-[#FF5A36] font-bold">HUTA IN</span>
            </button>

            {onOpenAppStore && (
              <>
                <span className="text-[#2D2F39]">|</span>
                <button
                  type="button"
                  onClick={onOpenAppStore}
                  className="inline-flex items-center gap-1 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  title="Google Play and App Store"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#FF5A36]" />
                  <span className="hidden sm:inline">Get Mobile App</span>
                  <span className="sm:hidden text-[11px] font-bold text-[#FF5A36]">App</span>
                </button>
              </>
            )}

            <span className="text-[#2D2F39]">|</span>

            {currentUser ? (
              <button
                type="button"
                onClick={() => onSelectTab('user_dashboard')}
                className="flex items-center gap-1.5 text-gray-200 hover:text-white transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-[#FF5A36]/20 text-[#FF5A36] flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{currentUser.name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenUserAuth}
                className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#FF5A36]" />
                <span>Log In / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Brand & Actions Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (onSelectCategory) onSelectCategory('All');
            onSelectTab('marketplace');
          }}
          className="flex items-center gap-3 cursor-pointer group select-none py-1"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#181920] border-2 border-[#2D2F39] flex items-center justify-center p-1.5 shadow-lg group-hover:border-[#FF5A36] group-hover:shadow-[#FF5A36]/20 transition-all duration-300">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
              <rect width="100" height="100" rx="20" fill="#181920" />
              <rect x="20" y="16" width="18" height="68" rx="9" fill="#FF5A36" />
              <rect x="62" y="16" width="18" height="68" rx="9" fill="#FF5A36" />
              <path d="M 24 64 L 76 28 L 76 42 L 24 78 Z" fill="#FFFFFF" />
              <polygon points="66,16 88,26 74,28" fill="#FFFFFF" />
            </svg>
          </div>
          <div className="flex flex-col leading-none justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                HUTA
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#FF5A36] tracking-tight">
                .lk
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Sri Lanka Marketplace
            </span>
          </div>
        </motion.div>

        {/* Center: Qatar Living Style Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            type="button"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('Property');
              onSelectTab('marketplace');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'marketplace' && activeCategory === 'Property'
                ? 'bg-[#FF5A36] text-white shadow-xs'
                : 'text-gray-300 hover:text-white hover:bg-[#181920]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Properties</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('Vehicles');
              onSelectTab('marketplace');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'marketplace' && activeCategory === 'Vehicles'
                ? 'bg-[#FF5A36] text-white shadow-xs'
                : 'text-gray-300 hover:text-white hover:bg-[#181920]'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Vehicles</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('Electronics');
              onSelectTab('marketplace');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'marketplace' && activeCategory === 'Electronics'
                ? 'bg-[#FF5A36] text-white shadow-xs'
                : 'text-gray-300 hover:text-white hover:bg-[#181920]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Classifieds</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('Services');
              onSelectTab('marketplace');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'marketplace' && activeCategory === 'Services'
                ? 'bg-[#FF5A36] text-white shadow-xs'
                : 'text-gray-300 hover:text-white hover:bg-[#181920]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Services</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('Jobs');
              onSelectTab('marketplace');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'marketplace' && activeCategory === 'Jobs'
                ? 'bg-[#FF5A36] text-white shadow-xs'
                : 'text-gray-300 hover:text-white hover:bg-[#181920]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Jobs</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('huta_in')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              currentTab === 'huta_in'
                ? 'bg-[#FF5A36] text-white shadow-xs'
                : 'text-gray-300 hover:text-white hover:bg-[#181920]'
            }`}
          >
            <span>HUTA</span>
            <span className="bg-[#FF5A36] text-white text-[10px] px-1 py-0.5 rounded font-black leading-none">
              IN
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('categories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'categories'
                ? 'bg-[#FF5A36] text-white shadow-xs'
                : 'text-gray-300 hover:text-white hover:bg-[#181920]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </button>
        </nav>

        {/* Right: Post an Ad button (Iconic Qatar Living feature) */}
        <div className="flex items-center gap-2">
          {onOpenAppStore && (
            <button
              type="button"
              onClick={onOpenAppStore}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
              title="Google Play and App Store"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>Get App</span>
            </button>
          )}

          {onOpenPostAd && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenPostAd}
              className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Post an Ad</span>
            </motion.button>
          )}

          {/* User Dashboard / More Quick Icon */}
          <button
            type="button"
            onClick={() => onSelectTab('more')}
            className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#181920] transition-colors"
            aria-label="Open menu"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

