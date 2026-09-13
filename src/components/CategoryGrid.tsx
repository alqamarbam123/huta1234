import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutGrid,
  Car,
  Bike,
  Home,
  Smartphone,
  Sofa,
  Briefcase,
  Wrench,
  LucideIcon,
} from 'lucide-react';
import { Listing } from '../types';
import { DualToneHeading } from './DualToneHeading';

interface CategoryGridProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  listings: Listing[];
  onViewAllCategories?: () => void;
}

interface CategoryMeta {
  key: string;
  label: string;
  displayLabel?: string;
  icon: LucideIcon;
}

const CATEGORIES_META: CategoryMeta[] = [
  { key: 'All', label: 'All Items', icon: LayoutGrid },
  { key: 'Vehicles', label: 'Vehicles', icon: Car },
  { key: 'Motorcycles', label: 'Motorcycles', icon: Bike },
  { key: 'Property', label: 'Property', icon: Home },
  { key: 'Electronics', label: 'Electronics', icon: Smartphone },
  { key: 'Home & Garden', label: 'Home & Garden', displayLabel: 'Home &...', icon: Sofa },
  { key: 'Jobs', label: 'Jobs', icon: Briefcase },
  { key: 'Services', label: 'Services', icon: Wrench },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  currentCategory,
  onSelectCategory,
  listings,
  onViewAllCategories,
}) => {
  // Calculate live ads count per category
  const counts: Record<string, number> = { All: 0 };
  CATEGORIES_META.forEach((cat) => {
    counts[cat.key] = 0;
  });

  listings.forEach((item) => {
    if (item.status === 'approved') {
      counts.All = (counts.All || 0) + 1;
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    }
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
      {/* Dual-Tone Title & Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <DualToneHeading
          as="h2"
          size="xl"
          theme="light"
          primaryText="Explore Our"
          accentText={['Popular Categories', 'Top Sectors', 'Marketplace Hubs']}
          animationType="rotate"
          rotationInterval={3600}
          align="center"
          showUnderline={false}
          subtitle="Everything Sri Lanka needs to buy and sell — all in one place."
          id="categories-dual-tone-heading"
        />
      </motion.div>

      {/* Grid matching the screenshot (6 columns on desktop so 1st row has 6 items, 2nd row has 2 items) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5"
      >
        {CATEGORIES_META.map((cat) => {
          const Icon = cat.icon;
          const isActive = currentCategory === cat.key;
          const count = counts[cat.key] || 0;

          return (
            <motion.button
              key={cat.key}
              type="button"
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectCategory(cat.key)}
              className={`relative flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl sm:rounded-[22px] border transition-all duration-300 text-center cursor-pointer select-none group min-h-[162px] ${
                isActive
                  ? 'bg-[#121319] border-[#E54D2E] text-white shadow-xl shadow-[#E54D2E]/10 ring-1 ring-[#E54D2E]/60'
                  : 'bg-white border-[#E5E7EB] text-[#111217] hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50'
              }`}
            >
              {/* Active ambient glow */}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryGlow"
                  className="absolute inset-0 rounded-2xl sm:rounded-[22px] bg-[#E54D2E]/5 pointer-events-none"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* Icon Container */}
              <div
                className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                  isActive
                    ? 'bg-[#2E1D1E] text-[#FF5A36] shadow-xs'
                    : 'bg-[#F4F5F7] text-[#111217] group-hover:bg-[#FF5A36]/10 group-hover:text-[#FF5A36] group-hover:scale-108'
                }`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'stroke-[2.2]' : 'stroke-2'}`} />
              </div>

              {/* Category Title */}
              <span
                className={`font-bold text-sm sm:text-base tracking-tight mb-1.5 transition-colors line-clamp-1 ${
                  isActive ? 'text-white font-extrabold' : 'text-[#111217] group-hover:text-[#FF5A36]'
                }`}
              >
                {cat.displayLabel || cat.label}
              </span>

              {/* Bullet status with live ads counter matching image */}
              <div
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  isActive ? 'text-gray-400' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              >
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full border-[1.5px] transition-colors shrink-0 ${
                    isActive ? 'border-gray-400' : 'border-gray-300 group-hover:border-gray-400'
                  }`}
                />
                <span>
                  {count} live ads
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {onViewAllCategories && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            id="view-all-categories-banner-btn"
            onClick={onViewAllCategories}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-gray-50 text-[#0A2540] hover:text-[#FF5A36] text-xs sm:text-sm font-bold border border-gray-200 shadow-sm hover:shadow transition-all cursor-pointer group"
          >
            <LayoutGrid className="w-4 h-4 text-[#FF5A36] group-hover:scale-110 transition-transform" />
            <span>Explore All Categories & Professional Services Directory</span>
            <span className="text-[#FF5A36] font-extrabold ml-1">→</span>
          </button>
        </div>
      )}
    </section>
  );
};

