import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeftRight,
  X,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Clock,
  Eye,
  Star,
  Trash2,
  Check,
  Zap,
} from 'lucide-react';
import { Listing } from '../types';
import { formatLKR } from './ListingsSection';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareListings: Listing[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  onSelectListing: (listing: Listing) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  compareListings,
  onRemoveFromCompare,
  onClearCompare,
  onSelectListing,
}) => {
  if (!isOpen) return null;

  // Calculate lowest price if multiple items have prices > 0
  const validPrices = compareListings
    .map((l) => l.price)
    .filter((p) => typeof p === 'number' && p > 0);
  const lowestPrice = validPrices.length > 1 ? Math.min(...validPrices) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#111217] text-white px-5 py-4 flex items-center justify-between border-b border-[#2D2F39] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#181920] border border-[#2D2F39] flex items-center justify-center text-[#FF5A36] shadow-sm">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    Side-by-Side Ad Comparison
                  </h3>
                  <span className="bg-[#FF5A36]/20 border border-[#FF5A36]/40 text-[#FF5A36] text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {compareListings.length} {compareListings.length === 1 ? 'Ad' : 'Ads'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Compare specifications, pricing, location, and seller trust side by side
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {compareListings.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCompare}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  title="Clear all from comparison"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-[#22242F] hover:bg-[#2D2F39] text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close comparison"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8F9FA]">
            {compareListings.length === 0 ? (
              <div className="py-16 text-center max-w-md mx-auto space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mx-auto">
                  <ArrowLeftRight className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-800">No Advertisements in Comparison</h4>
                <p className="text-xs text-gray-500">
                  Click the Compare icon on any ad card to select up to 4 items and view their differences here.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 px-5 py-2.5 rounded-xl bg-[#FF5A36] text-white text-xs font-bold shadow hover:bg-[#E04826] transition-all cursor-pointer"
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {compareListings.length === 1 && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-center justify-between">
                    <span>
                      💡 Select at least <strong>1 more ad</strong> from the marketplace to compare them side by side.
                    </span>
                    <button
                      type="button"
                      onClick={onClose}
                      className="font-bold underline ml-2 hover:text-amber-950 cursor-pointer"
                    >
                      Browse more ads
                    </button>
                  </div>
                )}

                {/* Comparison Grid Table */}
                <div className="overflow-x-auto pb-4">
                  <div
                    className="grid gap-4 min-w-[640px]"
                    style={{
                      gridTemplateColumns: `repeat(${compareListings.length}, minmax(240px, 1fr))`,
                    }}
                  >
                    {compareListings.map((item) => {
                      const isBestPrice =
                        lowestPrice !== null &&
                        item.price === lowestPrice &&
                        compareListings.length > 1;

                      // Format WhatsApp URL
                      const cleanPhone = item.phone.replace(/[^0-9]/g, '');
                      const waPhone = cleanPhone.startsWith('94')
                        ? cleanPhone
                        : cleanPhone.startsWith('0')
                        ? '94' + cleanPhone.substring(1)
                        : '94' + cleanPhone;
                      const waMsg = encodeURIComponent(
                        `Hi! I saw your advertisement on HUTA.lk: "${item.title}" (${formatLKR(item.price)}). Is this still available?`
                      );
                      const waUrl = `https://wa.me/${waPhone}?text=${waMsg}`;

                      return (
                        <div
                          key={item.id}
                          className={`bg-white rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                            isBestPrice
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Top Action & Image */}
                          <div className="relative">
                            {/* Best price indicator badge */}
                            {isBestPrice && (
                              <div className="absolute top-2.5 left-2.5 z-10 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Lowest Price</span>
                              </div>
                            )}

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => onRemoveFromCompare(item.id)}
                              className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Remove from comparison"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            <div
                              onClick={() => {
                                onSelectListing(item);
                                onClose();
                              }}
                              className="w-full h-44 overflow-hidden rounded-t-2xl bg-gray-100 cursor-pointer group"
                            >
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          </div>

                          {/* Details & Specs */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <span className="text-[11px] font-bold text-[#FF5A36] uppercase tracking-wider block">
                                {item.serviceTrade || item.category}
                              </span>
                              <h4
                                onClick={() => {
                                  onSelectListing(item);
                                  onClose();
                                }}
                                className="font-bold text-gray-900 text-sm mt-1 line-clamp-2 hover:text-[#FF5A36] cursor-pointer"
                              >
                                {item.title}
                              </h4>

                              {/* Price */}
                              <div className="mt-2 flex items-baseline gap-1.5">
                                <span className="text-lg font-black text-[#111217]">
                                  {formatLKR(item.price)}
                                </span>
                                {item.pricingType && item.pricingType !== 'fixed' && (
                                  <span className="text-[10px] text-gray-500 font-medium capitalize">
                                    ({item.pricingType.replace('_', ' ')})
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Key Spec Comparison Rows */}
                            <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                              {/* Location */}
                              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-400 font-medium">District</span>
                                <span className="font-semibold text-gray-800 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#FF5A36]" />
                                  {item.location}
                                </span>
                              </div>

                              {/* Category */}
                              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-400 font-medium">Category</span>
                                <span className="font-semibold text-gray-800">{item.category}</span>
                              </div>

                              {/* Date Posted */}
                              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-400 font-medium">Posted</span>
                                <span className="font-semibold text-gray-800 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  {item.date}
                                </span>
                              </div>

                              {/* Views */}
                              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                                <span className="text-gray-400 font-medium">Views</span>
                                <span className="font-semibold text-gray-800 flex items-center gap-1">
                                  <Eye className="w-3 h-3 text-gray-400" />
                                  {item.views || 0}
                                </span>
                              </div>

                              {/* Seller Verification */}
                              <div className="flex items-center justify-between py-1">
                                <span className="text-gray-400 font-medium">Seller Trust</span>
                                <span className="font-semibold text-gray-800 flex items-center gap-1">
                                  {item.isVerifiedPro ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      Verified Pro
                                    </span>
                                  ) : item.isEmergency247 ? (
                                    <span className="text-amber-600 font-bold text-[11px]">
                                      ⚡ 24/7 Available
                                    </span>
                                  ) : (
                                    <span className="text-gray-600 font-medium text-[11px]">
                                      Standard Seller
                                    </span>
                                  )}
                                </span>
                              </div>

                              {/* Highlights / Description snippet */}
                              <div className="pt-2">
                                <span className="text-gray-400 font-medium block text-[11px] mb-1">
                                  Overview
                                </span>
                                <p className="text-[11px] text-gray-600 line-clamp-3 bg-gray-50 p-2 rounded-lg leading-relaxed">
                                  {item.description || 'No additional description provided.'}
                                </p>
                              </div>
                            </div>

                            {/* Direct Contact Actions */}
                            <div className="space-y-2 pt-2">
                              <div className="grid grid-cols-2 gap-2">
                                <a
                                  href={`tel:${item.phone}`}
                                  className="flex items-center justify-center gap-1.5 bg-[#181920] hover:bg-black text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>Call</span>
                                </a>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1DA851] text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  onSelectListing(item);
                                  onClose();
                                }}
                                className="w-full flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>View Full Listing</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="bg-white px-5 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
            <span>
              Tip: You can compare up to <strong>4 advertisements</strong> at a time.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
