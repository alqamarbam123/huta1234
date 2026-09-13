import React from 'react';
import { motion } from 'motion/react';
import {
  Search,
  MapPin,
  RotateCcw,
  Sparkles,
  Home,
  Car,
  ShoppingBag,
  Wrench,
  Briefcase,
  Layers,
} from 'lucide-react';
import { HeroAd, HeroAdSettings } from '../types';
import { HeroAdBanner } from './HeroAdBanner';

interface HeroSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  minPrice: string;
  onMinPriceChange: (value: string) => void;
  maxPrice: string;
  onMaxPriceChange: (value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  heroAds?: HeroAd[];
  heroSettings?: HeroAdSettings;
  onOpenPostAd?: () => void;
  isAdminLoggedIn?: boolean;
  onAdminManage?: () => void;
}

const DISTRICTS = [
  'All Sri Lanka',
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
];

const SEARCH_TABS = [
  { id: 'All', label: 'All', icon: Layers },
  { id: 'Property', label: 'Properties', icon: Home },
  { id: 'Vehicles', label: 'Vehicles', icon: Car },
  { id: 'Electronics', label: 'Classifieds', icon: ShoppingBag },
  { id: 'Services', label: 'Services', icon: Wrench },
  { id: 'Jobs', label: 'Jobs', icon: Briefcase },
];

const POPULAR_SEARCHES = [
  'Toyota Land Cruiser',
  'iPhone 16 Pro',
  'Colombo Apartment',
  'Honda Vezel',
  'Land in Kandy',
  'Driver Wanted',
  'MacBook',
  'Living Room Sofa',
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchTerm,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  onResetFilters,
  hasActiveFilters,
  selectedCategory = 'All',
  onSelectCategory,
  heroAds = [],
  heroSettings = { mode: 'default', rotationIntervalSeconds: 6 },
  onOpenPostAd,
  isAdminLoggedIn,
  onAdminManage,
}) => {
  const handleTabClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  const handlePopularClick = (query: string) => {
    onSearchChange(query);
    // Smooth scroll down to listings section
    const el = document.getElementById('marketplace-listings');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-[#111217] text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#2D2F39] overflow-hidden">
      {/* Ambient background glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 -left-20 w-80 h-80 bg-[#FF5A36] rounded-full blur-3xl pointer-events-none -translate-y-1/2"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.18, 0.1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute -top-10 right-0 w-96 h-96 bg-[#FF5A36] rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative max-w-5xl mx-auto space-y-6 text-center">
        {/* Hero Title & Admin Animated Ads Slot */}
        <HeroAdBanner
          heroAds={heroAds}
          heroSettings={heroSettings}
          onSelectCategory={onSelectCategory}
          onOpenPostAd={onOpenPostAd}
          isAdminLoggedIn={isAdminLoggedIn}
          onAdminManage={onAdminManage}
        />

        {/* Qatar Living Signature Tabbed Search Card */}
        <div className="max-w-4xl mx-auto">
          {/* Top Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none px-1">
            {SEARCH_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#181920] text-[#FF5A36] border-t-2 border-[#FF5A36] shadow-sm'
                      : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF5A36]' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Search Bar Box */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-[#181920] border border-[#2D2F39] p-2.5 sm:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch gap-2 text-left"
          >
            {/* Keyword Input */}
            <div className="flex items-center gap-2.5 bg-[#22242F] px-3.5 py-2.5 rounded-xl flex-1 border border-transparent focus-within:border-[#FF5A36] transition-colors">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="What are you looking for? (e.g. Land Cruiser, iPhone, Kandy House...)"
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-gray-400 hover:text-white text-xs px-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Location Selector */}
            <div className="flex items-center gap-2 bg-[#22242F] px-3.5 py-2.5 rounded-xl md:w-52 shrink-0 border border-transparent focus-within:border-[#FF5A36] transition-colors">
              <MapPin className="w-4 h-4 text-[#FF5A36] shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-xs sm:text-sm w-full cursor-pointer"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d} className="bg-[#181920] text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-2 bg-[#22242F] px-3 py-2 rounded-xl md:w-56 shrink-0 border border-transparent focus-within:border-[#FF5A36] transition-colors">
              <span className="text-[11px] text-gray-400 font-bold">Rs</span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="bg-transparent border border-[#3D3F4A] rounded px-2 py-1 text-white text-xs w-full outline-none focus:border-[#FF5A36]"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="bg-transparent border border-[#3D3F4A] rounded px-2 py-1 text-white text-xs w-full outline-none focus:border-[#FF5A36]"
              />
            </div>

            {/* Search Action CTA (Qatar Living Style) */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('marketplace-listings');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>

            {/* Reset Filters CTA if filtered */}
            {hasActiveFilters && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onResetFilters}
                title="Reset Search Filters"
                className="flex items-center justify-center gap-1 px-3 py-2 bg-[#22242F] hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Popular Searches Pills (Qatar Living Style) */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
          <span className="text-gray-400 font-semibold">Popular:</span>
          {POPULAR_SEARCHES.map((query) => (
            <button
              key={query}
              type="button"
              onClick={() => handlePopularClick(query)}
              className="bg-[#181920] hover:bg-[#22242F] hover:text-[#FF5A36] text-gray-300 px-2.5 py-1 rounded-full border border-[#2D2F39] transition-all cursor-pointer"
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};


