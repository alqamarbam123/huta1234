import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeftRight, X, Layers } from 'lucide-react';
import { Listing } from '../types';

interface CompareFloatingBarProps {
  compareListings: Listing[];
  onOpenCompareModal: () => void;
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  compareListings,
  onOpenCompareModal,
  onRemoveFromCompare,
  onClearCompare,
}) => {
  if (compareListings.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-40"
      >
        <div className="bg-[#111217] text-white border border-[#2D2F39] rounded-2xl p-2.5 sm:p-3 shadow-2xl flex items-center gap-3 backdrop-blur-md">
          {/* Thumbnails Row */}
          <div className="flex items-center -space-x-2 overflow-hidden px-1">
            {compareListings.map((item) => (
              <div
                key={item.id}
                className="relative group w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-[#181920] bg-gray-800 shadow-sm shrink-0"
              >
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromCompare(item.id);
                  }}
                  title={`Remove ${item.title}`}
                  className="absolute inset-0 bg-black/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Empty slots placeholders if less than 4 */}
            {Array.from({ length: Math.max(0, 2 - compareListings.length) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-dashed border-gray-600 flex items-center justify-center text-gray-500 text-[10px] shrink-0 bg-white/5"
              >
                +
              </div>
            ))}
          </div>

          {/* Action text & CTA */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCompareModal}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Compare ({compareListings.length}/4)</span>
            </button>

            <button
              type="button"
              onClick={onClearCompare}
              className="w-8 h-8 rounded-xl bg-[#22242F] hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Clear all comparisons"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
