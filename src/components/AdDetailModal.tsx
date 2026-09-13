import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Listing, User } from '../types';
import {
  X,
  MapPin,
  Tag,
  Clock,
  Eye,
  Phone,
  MessageCircle,
  Heart,
  Edit,
  Trash2,
  Share2,
  ShieldCheck,
  Wrench,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
  ArrowLeftRight,
  Download,
  Facebook,
  Check,
} from 'lucide-react';
import { formatLKR } from './ListingsSection';
import { downloadImage } from '../utils/downloadHelper';
import { FacebookFlyerModal } from './FacebookFlyerModal';
import { api } from '../services/api';

interface AdDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  currentUser: User | null;
  isAdminLoggedIn: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onEditListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
  onCopyShareLink: (listing: Listing) => void;
  onStartChat?: (listing: Listing) => void;
  isCompared?: boolean;
  onToggleCompare?: (listing: Listing) => void;
  onRequestOwnerEdit?: (listing: Listing) => void;
  onApproveListing?: (id: string) => void;
}

export const AdDetailModal: React.FC<AdDetailModalProps> = ({
  listing,
  onClose,
  currentUser,
  isAdminLoggedIn,
  isFavorite,
  onToggleFavorite,
  onEditListing,
  onDeleteListing,
  onCopyShareLink,
  onStartChat,
  isCompared = false,
  onToggleCompare,
  onRequestOwnerEdit,
  onApproveListing,
}) => {
  if (!listing) return null;

  // Normalize phone for comparison
  const normalizePhone = (raw?: string): string => {
    if (!raw) return '';
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits.startsWith('94') && digits.length >= 11) return '0' + digits.substring(2);
    if (digits.length === 9) return '0' + digits;
    return digits;
  };

  const userPhone = currentUser?.phone ? normalizePhone(currentUser.phone) : '';
  const userUsernamePhone = currentUser?.username ? normalizePhone(currentUser.username) : '';
  const adPhone = normalizePhone(listing.phone);

  const guestAdIds = api.getGuestListingIds();
  const isGuestAuthor = guestAdIds.includes(listing.id);

  const isOwner = Boolean(
    isGuestAuthor ||
    (currentUser && (
      listing.userId === currentUser.id ||
      (userPhone && adPhone && userPhone === adPhone) ||
      (userUsernamePhone && adPhone && userUsernamePhone === adPhone)
    ))
  );
  const canManage = isOwner || isAdminLoggedIn;

  const [activeIdx, setActiveIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isFacebookFlyerOpen, setIsFacebookFlyerOpen] = useState(false);
  const [isDownloadingPhoto, setIsDownloadingPhoto] = useState(false);

  useEffect(() => {
    setActiveIdx(0);
    setIsZoomOpen(false);
    setIsFacebookFlyerOpen(false);
  }, [listing?.id]);

  const handleDownloadActivePhoto = async () => {
    if (!listing) return;
    setIsDownloadingPhoto(true);
    const safeTitle = (listing.title || 'listing').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25);
    await downloadImage(currentPhoto, `${safeTitle}-photo-${activeIdx + 1}.jpg`);
    setIsDownloadingPhoto(false);
  };

  const gallery = (listing.images && listing.images.length > 0)
    ? listing.images
    : (listing.image ? [listing.image] : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80']);

  const currentPhoto = gallery[activeIdx] || gallery[0];

  // Format Sri Lankan WhatsApp link
  // e.g. 0771234567 -> 94771234567
  const cleanPhone = listing.phone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('94')
    ? cleanPhone
    : cleanPhone.startsWith('0')
    ? '94' + cleanPhone.substring(1)
    : '94' + cleanPhone;

  const isService = listing.category === 'Services' || Boolean(listing.serviceTrade);

  const waServiceMessage = encodeURIComponent(
    `Hello! I saw your service listing on HUTA.lk: "${listing.title}" (${listing.serviceTrade || 'Professional Service'}). I would like to request an inspection / free quote for my location in ${listing.location}. Are you available?`
  );
  const waProductMessage = encodeURIComponent(
    `Hi! I saw your advertisement on HUTA.lk: "${listing.title}" (${formatLKR(listing.price)}). Is this still available?`
  );
  const whatsappUrl = `https://wa.me/${waPhone}?text=${isService ? waServiceMessage : waProductMessage}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative my-8 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-transform hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Pane & Gallery Carousel */}
          <div className="bg-gray-900 flex flex-col justify-between relative overflow-hidden select-none">
            {/* Main Active Photo */}
            <div className="relative h-64 md:h-80 sm:h-72 w-full bg-black/40 flex items-center justify-center overflow-hidden">
              <img
                src={currentPhoto}
                alt={`${listing.title} - Photo ${activeIdx + 1}`}
                className="w-full h-full object-cover transition-all duration-300 cursor-pointer"
                onClick={() => setIsZoomOpen(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {/* Category & Location Tag */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-lg">
                {listing.category} in {listing.location}
              </div>

              {/* Photo Counter Badge */}
              <div className="absolute top-3 right-14 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>{activeIdx + 1} / {gallery.length}</span>
              </div>

              {/* Facebook Flyer / Promo Trigger */}
              <button
                type="button"
                onClick={() => setIsFacebookFlyerOpen(true)}
                className="absolute bottom-3 left-3 bg-black/65 hover:bg-[#1877F2] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
                title="Create Facebook Promo Flyer / Post"
              >
                <Facebook className="w-3.5 h-3.5 fill-current" />
                <span>Facebook Flyer</span>
              </button>

              {/* Direct Image Download Button */}
              <button
                type="button"
                onClick={handleDownloadActivePhoto}
                disabled={isDownloadingPhoto}
                className="absolute bottom-3 right-12 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all hover:scale-105"
                title="Download this image to your device"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Zoom Button */}
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all hover:scale-105"
                title="View Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Navigation Arrows for Multi-Photos */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIdx((prev) => (prev - 1 + gallery.length) % gallery.length);
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIdx((prev) => (prev + 1) % gallery.length);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    title="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip (if multiple images) */}
            {gallery.length > 1 && (
              <div className="p-2.5 bg-gray-950 flex items-center gap-2 overflow-x-auto border-t border-white/10 scrollbar-thin">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeIdx
                        ? 'border-[#FF5A36] scale-105 opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Pane */}
          <div className="p-6 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Header with Title & Favorite */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-[#FF5A36] uppercase tracking-wider">
                      {listing.serviceTrade || listing.category}
                    </span>
                    {listing.isVerifiedPro && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified Pro
                      </span>
                    )}
                    {listing.isEmergency247 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                        ⚡ 24/7 Emergency
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-extrabold text-[#181920] leading-tight">
                    {listing.title}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onCopyShareLink(listing)}
                    title="Share listing"
                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {onToggleCompare && (
                    <button
                      type="button"
                      onClick={() => onToggleCompare(listing)}
                      title={isCompared ? 'Remove from comparison' : 'Compare with other ads'}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isCompared
                          ? 'bg-[#FF5A36] text-white shadow-sm'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(listing.id)}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      isFavorite
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Price / Service Rate Display */}
              <div className="mt-2 mb-3">
                {isService ? (
                  <div>
                    <div className="text-2xl font-black text-[#FF5A36]">
                      {listing.pricingType === 'quote'
                        ? 'Free Estimate / Price on Request'
                        : listing.pricingType === 'hourly'
                        ? `${formatLKR(listing.price)} / hr`
                        : listing.pricingType === 'starting_at'
                        ? `Starting from ${formatLKR(listing.price)}`
                        : formatLKR(listing.price)}
                    </div>
                    {listing.serviceArea && (
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Coverage Area: <strong className="text-gray-900">{listing.serviceArea}</strong></span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-2xl font-black text-[#FF5A36]">
                    {formatLKR(listing.price)}
                  </div>
                )}
              </div>

              {/* Facebook & Social Media Promo Card */}
              <div className="mb-3.5 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-orange-50/50 border border-blue-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Facebook className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span>Post to Facebook & Social Media</span>
                      <span className="text-[10px] bg-[#1877F2] text-white font-extrabold px-1.5 py-0.2 rounded">HD</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Download photos & generate ready-made Facebook flyers</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFacebookFlyerOpen(true)}
                  className="shrink-0 inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#1877F2] border border-blue-200 text-xs font-bold py-1.5 px-3 rounded-xl shadow-2xs transition-all hover:scale-102 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get Flyer</span>
                </button>
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4">
                <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5A36]" />
                  {listing.location}, Sri Lanka
                </span>
                {listing.serviceTrade && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-100 px-2.5 py-1 rounded-md font-medium">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    {listing.serviceTrade}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                  <Tag className="w-3.5 h-3.5 text-gray-500" />
                  {listing.category}
                </span>
                <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  {listing.date}
                </span>
                <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                  {listing.views} views
                </span>
              </div>

              {/* Description */}
              <div className="border-t border-b border-gray-100 py-3.5 my-3">
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1.5">
                  Item Description
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Seller Contact & Actions */}
            <div className="mt-4 pt-2 space-y-2.5">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-center">
                <p className="text-xs text-gray-500 font-medium">
                  {isService ? 'Service Provider Contact' : 'Verified Seller Contact'}
                </p>
                <div className="text-lg font-bold text-gray-900 mt-0.5 tracking-wide flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 text-[#FF5A36]" />
                  <a href={`tel:${listing.phone}`} className="hover:underline text-gray-900">
                    {listing.phone}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <a
                    href={`tel:${listing.phone}`}
                    className="flex items-center justify-center gap-1.5 bg-[#181920] hover:bg-black text-white text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isService ? 'Call Provider' : 'Call Seller'}</span>
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1DA851] text-white text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{isService ? 'Request Quote' : 'WhatsApp'}</span>
                  </a>
                </div>

                {/* Real-time Firebase Chat Button */}
                {onStartChat && (
                  <button
                    type="button"
                    onClick={() => onStartChat(listing)}
                    className="mt-2.5 w-full flex items-center justify-center gap-2 bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg hover:shadow-[#FF5A36]/20 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Live Chat on HUTA</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-medium">
                      Real-time
                    </span>
                  </button>
                )}

                {/* Compare Button */}
                {onToggleCompare && (
                  <button
                    type="button"
                    onClick={() => onToggleCompare(listing)}
                    className={`mt-2 w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-4 rounded-lg border transition-all cursor-pointer ${
                      isCompared
                        ? 'bg-[#FF5A36]/10 text-[#FF5A36] border-[#FF5A36]/40 hover:bg-[#FF5A36]/20'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>{isCompared ? 'Remove from Comparison' : 'Add to Compare (Side-by-Side)'}</span>
                  </button>
                )}
              </div>

              {/* Pending Admin Moderation Notice */}
              {listing.status === 'pending' && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-950 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Pending Administrator Approval</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    This advertisement is awaiting administrator review and confirmation. It will become live on the public marketplace once approved.
                  </p>
                  {isAdminLoggedIn && onApproveListing && (
                    <button
                      type="button"
                      onClick={() => onApproveListing(listing.id)}
                      className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer text-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm & Approve Listing (Go Live Now)</span>
                    </button>
                  )}
                </div>
              )}

              {/* Author / Admin Controls */}
              {canManage ? (
                <div className="pt-2 space-y-2">
                  {isAdminLoggedIn ? (
                    <div className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        Admin Controls Active
                      </span>
                      <span className="font-mono text-[10px] text-gray-500">
                        Status: {listing.status}
                      </span>
                    </div>
                  ) : isGuestAuthor && !currentUser ? (
                    <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center justify-between shadow-2xs">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Your Ad (Posted from this device)</span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black">
                        OWNER
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditListing(listing)}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm cursor-pointer hover:scale-[1.01]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>{isAdminLoggedIn ? 'Edit Listing (Admin)' : 'Edit Ad & Change Price'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteListing(listing.id)}
                      className="px-3.5 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                      title="Delete this advertisement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Customer Self-Service Ad Editing Prompt */
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse" />
                        <span className="text-xs font-bold text-gray-900">Are you the Seller / Owner?</span>
                        <span className="text-[10px] bg-orange-100 text-[#FF5A36] font-bold px-1.5 py-0.2 rounded">Fast Edit</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                        Want to change price, update photos, edit phone number, or mark as sold?
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRequestOwnerEdit && onRequestOwnerEdit(listing)}
                      className="w-full sm:w-auto shrink-0 px-4 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit My Ad & Price</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Lightbox Zoom Modal */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6"
            onClick={() => setIsZoomOpen(false)}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-white z-10 gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold truncate">
                <Camera className="w-4 h-4 text-[#FF5A36] shrink-0" />
                <span className="truncate">
                  Photo {activeIdx + 1} of {gallery.length} • {listing.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadActivePhoto}
                  disabled={isDownloadingPhoto}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer"
                  title="Download this high-resolution photo"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsZoomOpen(false);
                    setIsFacebookFlyerOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  title="Create Facebook Promo Flyer"
                >
                  <Facebook className="w-3.5 h-3.5 fill-current" />
                  <span>Facebook Flyer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Zoom"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Centered Large Image */}
            <div
              className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentPhoto}
                alt={`${listing.title} - Zoomed`}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />

              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveIdx((prev) => (prev - 1 + gallery.length) % gallery.length)}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-[#FF5A36] text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIdx((prev) => (prev + 1) % gallery.length)}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-[#FF5A36] text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                    title="Next photo"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnails Strip */}
            {gallery.length > 1 && (
              <div
                className="flex items-center gap-2 max-w-xl overflow-x-auto p-2 bg-white/10 rounded-2xl backdrop-blur-md z-10"
                onClick={(e) => e.stopPropagation()}
              >
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeIdx
                        ? 'border-[#FF5A36] scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Zoom thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Facebook Promo Flyer & Image Downloader Modal */}
      <FacebookFlyerModal
        listing={listing}
        isOpen={isFacebookFlyerOpen}
        onClose={() => setIsFacebookFlyerOpen(false)}
      />
    </motion.div>
  );
};
