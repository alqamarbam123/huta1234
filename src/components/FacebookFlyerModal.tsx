import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Copy,
  Check,
  Facebook,
  MessageCircle,
  Share2,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { Listing } from '../types';
import {
  downloadImage,
  generateFacebookCaption,
  renderAndDownloadFacebookFlyer,
  FlyerOptions,
  formatLKRForPromo,
} from '../utils/downloadHelper';

interface FacebookFlyerModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FacebookFlyerModal: React.FC<FacebookFlyerModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !listing) return null;

  const gallery =
    listing.images && listing.images.length > 0
      ? listing.images
      : [listing.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'];

  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<'square' | 'landscape'>('square');
  const [theme, setTheme] = useState<'orange' | 'dark' | 'navy'>('orange');
  const [showPrice, setShowPrice] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [showLocation, setShowLocation] = useState(true);

  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isGeneratingFlyer, setIsGeneratingFlyer] = useState(false);
  const [isDownloadingPhoto, setIsDownloadingPhoto] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentPhoto = gallery[selectedPhotoIdx] || gallery[0];

  const handleCopyCaption = async () => {
    const caption = generateFacebookCaption(listing);
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = caption;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    }
  };

  const handleDownloadOriginalPhoto = async () => {
    setIsDownloadingPhoto(true);
    const safeTitle = (listing.title || 'photo').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25);
    const filename = `${safeTitle}-photo-${selectedPhotoIdx + 1}.jpg`;
    await downloadImage(currentPhoto, filename);
    setIsDownloadingPhoto(false);
    setDownloadSuccess('Original photo saved to downloads!');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleDownloadFlyer = async () => {
    if (!canvasRef.current) return;
    setIsGeneratingFlyer(true);

    const options: FlyerOptions = {
      aspectRatio,
      theme,
      showPrice,
      showPhone,
      showLocation,
    };

    const ok = await renderAndDownloadFacebookFlyer(
      canvasRef.current,
      currentPhoto,
      listing,
      options
    );

    setIsGeneratingFlyer(false);
    if (ok) {
      setDownloadSuccess('Facebook Promo Flyer downloaded!');
    } else {
      setDownloadSuccess('Image saved to downloads!');
    }
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleShareToFacebook = () => {
    const url = encodeURIComponent(window.location.origin);
    const quote = encodeURIComponent(
      `🔥 For Sale: ${listing.title} • ${formatLKRForPromo(listing.price)} in ${listing.location} (Call: ${listing.phone})`
    );
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`,
      '_blank',
      'width=600,height=500'
    );
  };

  const handleShareToWhatsApp = () => {
    const caption = generateFacebookCaption(listing);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative my-6 border border-gray-100 flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hidden Canvas for High-Resolution Export */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Modal Header */}
          <div className="bg-gradient-to-r from-gray-950 via-[#181920] to-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shadow-md">
                <Facebook className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight flex items-center gap-2">
                  <span>Facebook Promo & Image Downloader</span>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-[#FF5A36] text-white px-2 py-0.5 rounded-full">
                    HD
                  </span>
                </h3>
                <p className="text-xs text-gray-300">
                  Save high-res photos & generate branded promo flyers for Facebook Groups & Marketplace.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Download feedback toast */}
          {downloadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{downloadSuccess}</span>
            </motion.div>
          )}

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Live Flyer Preview */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF5A36]" />
                  Live Facebook Card Preview
                </span>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('square')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      aspectRatio === 'square' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'hover:text-gray-900'
                    }`}
                  >
                    1:1 Square
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('landscape')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      aspectRatio === 'landscape' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'hover:text-gray-900'
                    }`}
                  >
                    16:9 Feed
                  </button>
                </div>
              </div>

              {/* Flyer Preview Box */}
              <div
                className={`w-full max-w-[460px] rounded-2xl overflow-hidden shadow-xl relative select-none border border-gray-200 bg-gray-900 flex flex-col justify-between transition-all ${
                  aspectRatio === 'square' ? 'aspect-square' : 'aspect-[12/8]'
                }`}
              >
                {/* Background Image */}
                <img
                  src={currentPhoto}
                  alt={listing.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-black/40 to-black/60 pointer-events-none" />

                {/* Top Badge Header */}
                <div className="relative z-10 p-3.5 sm:p-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 bg-[#FF5A36] text-white px-3 py-1 rounded-full text-xs font-black tracking-wide shadow-md">
                    <span>🇱🇰 HUTA.LK</span>
                  </div>
                  <span className="text-[11px] font-bold text-white/90 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                    Verified Seller Ad
                  </span>
                </div>

                {/* Bottom Content Bar */}
                <div className="relative z-10 p-4 sm:p-5 text-white flex flex-col justify-end">
                  <span className="text-[11px] font-extrabold text-[#FF8A65] uppercase tracking-wider mb-0.5">
                    {listing.category}
                  </span>

                  <h4 className="text-base sm:text-lg font-black text-white line-clamp-2 leading-snug drop-shadow-md">
                    {listing.title}
                  </h4>

                  {/* Price & Location Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {showPrice && (
                      <span className="bg-[#FF5A36] text-white font-black text-sm sm:text-base px-3 py-1 rounded-xl shadow-md">
                        {formatLKRForPromo(listing.price)}
                      </span>
                    )}
                    {showLocation && listing.location && (
                      <span className="bg-white/20 backdrop-blur-xs text-white font-bold text-xs px-2.5 py-1 rounded-xl border border-white/20 flex items-center gap-1">
                        <span>📍 {listing.location}</span>
                      </span>
                    )}
                  </div>

                  {/* Seller Phone Footer */}
                  {showPhone && listing.phone && (
                    <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <span>📞 {listing.phone}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-white/75">
                        Direct Deal • HUTA.lk
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo selector (if multiple photos available) */}
              {gallery.length > 1 && (
                <div className="w-full max-w-[460px] mt-3">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Select Photo to Use ({gallery.length} Available):
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {gallery.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhotoIdx(idx)}
                        className={`relative shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          idx === selectedPhotoIdx
                            ? 'border-[#FF5A36] scale-105 shadow-sm'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === selectedPhotoIdx && (
                          <div className="absolute inset-0 bg-[#FF5A36]/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Customization & Instant Download Tools */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {/* Tool 1: Download Original Photo Directly */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      Original Listing Photo
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Download the raw, full-resolution photo without any overlays.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadOriginalPhoto}
                  disabled={isDownloadingPhoto}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold py-2.5 px-3 rounded-xl border border-gray-300 shadow-2xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                  <span>{isDownloadingPhoto ? 'Downloading...' : 'Download Original Photo (JPG)'}</span>
                </button>
              </div>

              {/* Tool 2: Download Branded Facebook Flyer */}
              <div className="bg-gradient-to-br from-orange-50/50 to-orange-100/30 rounded-2xl p-4 border border-orange-200">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#FF5A36]" />
                      Facebook Promo Flyer (HD)
                    </h4>
                    <p className="text-[11px] text-orange-900/70 mt-0.5">
                      Ready-to-post graphic formatted with title, price sticker, and your phone number.
                    </p>
                  </div>
                </div>

                {/* Badges Toggle Switches */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-[11px] font-semibold text-gray-700">
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white/80 p-1.5 rounded-lg border border-orange-200/60">
                    <input
                      type="checkbox"
                      checked={showPrice}
                      onChange={(e) => setShowPrice(e.target.checked)}
                      className="rounded accent-[#FF5A36]"
                    />
                    <span>Price</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white/80 p-1.5 rounded-lg border border-orange-200/60">
                    <input
                      type="checkbox"
                      checked={showPhone}
                      onChange={(e) => setShowPhone(e.target.checked)}
                      className="rounded accent-[#FF5A36]"
                    />
                    <span>Phone</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white/80 p-1.5 rounded-lg border border-orange-200/60">
                    <input
                      type="checkbox"
                      checked={showLocation}
                      onChange={(e) => setShowLocation(e.target.checked)}
                      className="rounded accent-[#FF5A36]"
                    />
                    <span>Location</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadFlyer}
                  disabled={isGeneratingFlyer}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-[#FF5A36]/25 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isGeneratingFlyer ? 'Rendering HD Flyer...' : 'Download Facebook Flyer (PNG)'}
                  </span>
                </button>
              </div>

              {/* Tool 3: Copy Facebook Caption Text */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5 text-gray-600" />
                    Ready Facebook Caption
                  </h4>
                  <span className="text-[10px] text-gray-500">Auto-formatted with emojis</span>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-gray-200 text-[11px] font-mono text-gray-600 max-h-24 overflow-y-auto mb-2.5 select-all leading-relaxed">
                  {generateFacebookCaption(listing)}
                </div>

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-3 rounded-xl border transition-all cursor-pointer ${
                    copiedCaption
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white hover:bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                >
                  {copiedCaption ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Caption Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-gray-600" />
                      <span>Copy Caption for Facebook</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tool 4: Direct Share Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShareToFacebook}
                  className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Facebook className="w-4 h-4 fill-current" />
                  <span>Post to Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareToWhatsApp}
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Guide Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span>
                <strong>Tip for Facebook Marketplace:</strong> Download the flyer, copy caption, then paste directly into buy/sell groups in Colombo, Kandy, or your local district!
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-gray-700 hover:text-black"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
