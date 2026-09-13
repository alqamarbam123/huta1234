import React from 'react';
import { motion } from 'motion/react';
import { Listing } from '../types';
import { DualToneHeading } from './DualToneHeading';
import {
  Star,
  Zap,
  Heart,
  MapPin,
  Clock,
  Eye,
  Inbox,
  ArrowUpDown,
  ShieldCheck,
  Wrench,
  PlusCircle,
  Sparkles,
  RotateCcw,
  Images,
  ArrowLeftRight
} from 'lucide-react';

interface ListingsSectionProps {
  listings: Listing[];
  sortBy: string;
  onSortChange: (sort: string) => void;
  favorites: string[];
  onToggleFavorite: (adId: string) => void;
  onSelectListing: (listing: Listing) => void;
  isLoading: boolean;
  onOpenPostAd?: () => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  currentCategory?: string;
  onSelectCategory?: (category: string) => void;
  compareIds?: string[];
  onToggleCompare?: (listing: Listing) => void;
}

export function formatLKR(amount: number): string {
  return 'Rs ' + Number(amount).toLocaleString('en-LK');
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 24,
    },
  },
};

export const ListingsSection: React.FC<ListingsSectionProps> = ({
  listings,
  sortBy,
  onSortChange,
  favorites,
  onToggleFavorite,
  onSelectListing,
  isLoading,
  onOpenPostAd,
  hasActiveFilters,
  onResetFilters,
  currentCategory = 'All',
  onSelectCategory,
  compareIds = [],
  onToggleCompare,
}) => {
  const isNewAd = (dateStr: string) => {
    try {
      const created = new Date(dateStr).getTime();
      const now = new Date().getTime();
      return (now - created) / (1000 * 60 * 60 * 24) <= 1.5;
    } catch {
      return false;
    }
  };

  return (
    <section id="marketplace-listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20">
      {/* Qatar Living style Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-5 scrollbar-none border-b border-gray-200">
        {[
          { id: 'All', label: 'All Ads' },
          { id: 'Property', label: 'Properties' },
          { id: 'Vehicles', label: 'Vehicles' },
          { id: 'Electronics', label: 'Classifieds' },
          { id: 'Home & Garden', label: 'Home & Garden' },
          { id: 'Jobs', label: 'Jobs' },
          { id: 'Services', label: 'Services' },
        ].map((cat) => {
          const isActive = (currentCategory || 'All') === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#FF5A36] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-3 border-b border-gray-200"
      >
        <div>
          <DualToneHeading
            as="h2"
            size="lg"
            theme="light"
            primaryText="Available"
            accentText={['Advertisements', 'Verified Ads', 'Classified Deals']}
            animationType="rotate"
            rotationInterval={4200}
            align="left"
            showUnderline={false}
            subtitle="Verified marketplace listings with seller telephone & direct WhatsApp"
            id="listings-dual-tone-heading"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-gray-500 font-medium">
            Showing <strong className="text-gray-900">{listings.length}</strong> ad(s)
          </span>

          <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 shadow-xs text-xs sm:text-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent border-none outline-none font-medium text-gray-700 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-200 w-full" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded w-4/5" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-14 px-6 bg-white rounded-3xl border border-dashed border-gray-300 shadow-xs max-w-2xl mx-auto"
        >
          {hasActiveFilters ? (
            <>
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No advertisements match your filters</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                We couldn't find any listings matching your active filters. Try adjusting your search keyword, category, or district.
              </p>
              {onResetFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF5A36] mx-auto flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                Fresh Marketplace Launch
              </h3>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed font-medium">
                The marketplace is live, clean, and ready! Be the first seller to list your vehicle, property, electronics, or trade service across Sri Lanka.
              </p>
              {onOpenPostAd && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={onOpenPostAd}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5A36] hover:bg-[#E04826] text-white font-extrabold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post The First Advertisement</span>
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {listings.map((item) => {
            const isFav = favorites.includes(item.id);
            const isCompared = compareIds?.includes(item.id) || false;
            const isNew = isNewAd(item.date);

            return (
              <motion.div
                key={item.id}
                variants={cardItemVariants}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                onClick={() => onSelectListing(item)}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-[#FF5A36] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col relative"
              >
                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
                  {item.isFeatured && (
                    <span className="inline-flex items-center gap-1 bg-[#FF5A36] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-md animate-pulse">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </span>
                  )}
                  {item.isVerifiedPro && (
                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Pro
                    </span>
                  )}
                  {item.isEmergency247 && (
                    <span className="inline-flex items-center gap-0.5 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                      ⚡ 24/7
                    </span>
                  )}
                  {isNew && !item.isVerifiedPro && !item.isEmergency247 && (
                    <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
                      <Zap className="w-3 h-3 fill-current" />
                      New
                    </span>
                  )}
                </div>

                {/* Top Action Buttons (Compare & Favorite) */}
                <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                  {onToggleCompare && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompare(item);
                      }}
                      title={isCompared ? 'Remove from compare' : 'Compare this ad'}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isCompared
                          ? 'bg-[#FF5A36] text-white shadow-md scale-105 ring-2 ring-white'
                          : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </motion.button>
                  )}

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isFav
                        ? 'bg-rose-50 text-rose-600 shadow-sm scale-110'
                        : 'bg-black/40 text-white hover:bg-black/60'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>

                {/* Card Image */}
                <div className="w-full h-44 sm:h-48 overflow-hidden bg-gray-100 relative">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  {item.images && item.images.length > 1 && (
                    <div className="absolute bottom-2.5 right-2.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs pointer-events-none">
                      <Images className="w-3 h-3" />
                      <span>{item.images.length}</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#FF5A36] uppercase tracking-wider line-clamp-1">
                      {item.serviceTrade || item.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base mt-1 line-clamp-2 leading-snug group-hover:text-[#FF5A36] transition-colors">
                      {item.title}
                    </h3>
                    <div className="text-base sm:text-lg font-extrabold text-[#111217] mt-1.5">
                      {item.category === 'Services' && item.pricingType === 'quote'
                        ? 'Quote on Request'
                        : item.category === 'Services' && item.pricingType === 'hourly'
                        ? `${formatLKR(item.price)}/hr`
                        : item.category === 'Services' && item.pricingType === 'starting_at'
                        ? `From ${formatLKR(item.price)}`
                        : formatLKR(item.price)}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 font-medium text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-[#FF5A36]" />
                        {item.location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views || 0} views
                      </span>
                      <span className="font-medium text-gray-500">
                        {item.userId === 'system' ? 'Verified Seller' : 'HUTA Member'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
};
