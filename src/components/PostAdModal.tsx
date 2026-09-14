import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Listing, User } from '../types';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  Wrench,
  ShieldCheck,
  Plus,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Info,
  Images,
  CheckCircle2,
  Check
} from 'lucide-react';
import { api } from '../services/api';

const MAX_IMAGES = 8;

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.70));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAd: (data: Partial<Listing>, isEditId?: string) => Promise<Listing | void>;
  editingListing: Listing | null;
  currentUser: User | null;
  isAdminLoggedIn?: boolean;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onSelectListing?: (listing: Listing) => void;
}

const CATEGORIES = [
  'Electronics',
  'Vehicles',
  'Property',
  'Motorcycles',
  'Home & Garden',
  'Fashion',
  'Services',
  'Jobs',
];

const SERVICE_TRADES = [
  'AC Repair & Servicing',
  'Automotive Services & Breakdown',
  'Cleaning Services (Home & Office)',
  'Furniture Moving & Transport',
  'Plumbing & Sanitary Works',
  'Electrician & Electrical Wiring',
  'Pest Control & Extermination',
  'Maintenance Services & Handyman',
  'Events, DJ & Photography',
  'Education, Tuition & Coaching',
  'Fashion, Tailoring & Styling',
  'Health & Wellness',
  'Legal, Financial & Consultancy',
  'Pet Care & Veterinary Services',
  'Painting & Waterproofing',
  'Carpentry & Masonry',
  'IT, Laptop & Phone Repair',
  'Other Professional Services',
];

const SERVICE_AREAS = [
  'Colombo & Greater Suburbs',
  'All Western Province (Colombo, Gampaha, Kalutara)',
  'Kandy & Central Province',
  'Galle & Southern Coastal District',
  'Islandwide (All 25 Districts)',
  'Local District Only',
];

const DISTRICTS = [
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

export const PostAdModal: React.FC<PostAdModalProps> = ({
  isOpen,
  onClose,
  onSubmitAd,
  editingListing,
  currentUser,
  isAdminLoggedIn,
  onToast,
  onSelectListing,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('Colombo');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  // Multiple Images State
  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Specialized Service Fields
  const [serviceTrade, setServiceTrade] = useState('AC Repair & Servicing');
  const [pricingType, setPricingType] = useState<'fixed' | 'starting_at' | 'hourly' | 'quote'>('starting_at');
  const [serviceArea, setServiceArea] = useState('Colombo & Greater Suburbs');
  const [isEmergency247, setIsEmergency247] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    id: string;
    title: string;
    phone: string;
    price: number;
    listing?: Listing;
  } | null>(null);

  useEffect(() => {
    setSubmittedResult(null);
    if (editingListing) {
      setTitle(editingListing.title);
      setCategory(editingListing.category);
      setLocation(editingListing.location);
      setPrice(editingListing.price.toString());
      setPhone(editingListing.phone);
      setDescription(editingListing.description);

      // Load multiple images
      const initialImgs: string[] = [];
      if (Array.isArray(editingListing.images) && editingListing.images.length > 0) {
        initialImgs.push(...editingListing.images.filter(Boolean));
      } else if (editingListing.image) {
        initialImgs.push(editingListing.image);
      }
      setImages(initialImgs);
      setUrlInput('');

      setServiceTrade(editingListing.serviceTrade || 'AC Repair & Servicing');
      setPricingType(editingListing.pricingType || (editingListing.category === 'Services' ? 'starting_at' : 'fixed'));
      setServiceArea(editingListing.serviceArea || 'Colombo & Greater Suburbs');
      setIsEmergency247(Boolean(editingListing.isEmergency247));
    } else {
      // Defaults
      setTitle('');
      setCategory('Electronics');
      setLocation('Colombo');
      setPrice('');
      setPhone('');
      setDescription('');
      setImages([]);
      setUrlInput('');
      setServiceTrade('AC Repair & Servicing');
      setPricingType('starting_at');
      setServiceArea('Colombo & Greater Suburbs');
      setIsEmergency247(false);
    }
  }, [editingListing, isOpen]);

  if (!isOpen) return null;

  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      onToast(`Maximum of ${MAX_IMAGES} photos reached. Remove some photos to add new ones.`, 'error');
      return;
    }

    const filesToProcess = (Array.from(files) as File[]).slice(0, remainingSlots);
    setIsUploadingImages(true);

    try {
      const newImages: string[] = [];
      for (const file of filesToProcess) {
        if (file.size > 15 * 1024 * 1024) {
          onToast(`File "${file.name}" exceeds 15MB. Please choose a smaller photo.`, 'error');
          continue;
        }
        const compressed = await compressImage(file);
        newImages.push(compressed);
      }

      if (newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages]);
        onToast(`Added ${newImages.length} photo${newImages.length > 1 ? 's' : ''}!`, 'success');
      }
    } catch (err) {
      console.error('Error processing photos', err);
      onToast('Could not process some photos. Please try again.', 'error');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (images.length >= MAX_IMAGES) {
      onToast(`Maximum of ${MAX_IMAGES} photos reached.`, 'error');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
      onToast('Please enter a valid image URL starting with http:// or https://', 'error');
      return;
    }

    setImages((prev) => [...prev, trimmed]);
    setUrlInput('');
    onToast('Image added to listing photos!', 'success');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
    onToast('Set as main cover photo!', 'success');
  };

  const handleMoveImage = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[fromIndex];
      copy[fromIndex] = copy[toIndex];
      copy[toIndex] = temp;
      return copy;
    });
  };

  const handleGenerateAIDescription = async () => {
    if (!title.trim()) {
      onToast('Please type an ad title first so AI knows what to write!', 'error');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res = await api.suggestDescription({
        title: title.trim(),
        category,
        location,
        price: price ? parseFloat(price) : undefined,
      });

      if (res.description) {
        setDescription(res.description);
        onToast(
          res.source === 'gemini'
            ? '✨ AI description generated with Gemini!'
            : '✨ Smart description drafted!',
          'success'
        );
      }
    } catch {
      onToast('Could not generate description automatically. Please write manually.', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isService = category === 'Services';
    if (!title.trim() || (!price && pricingType !== 'quote') || !phone.trim() || !description.trim()) {
      onToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const fallbackImage = category === 'Services'
        ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80';
      const primaryImage = images.length > 0 ? images[0] : fallbackImage;
      const finalImages = images.length > 0 ? images : [primaryImage];

      const cleanPriceStr = price ? String(price).replace(/[^0-9.]/g, '') : '0';
      const parsedPrice = isService && pricingType === 'quote' ? 0 : (parseFloat(cleanPriceStr) || 0);

      const payload: Partial<Listing> = {
        title: title.trim(),
        category,
        location,
        district: location,
        price: parsedPrice,
        phone: phone.trim(),
        description: description.trim(),
        image: primaryImage,
        images: finalImages,
        userId: editingListing ? editingListing.userId : (currentUser ? currentUser.id : 'guest'),
        pricingType: isService ? pricingType : 'fixed',
        ...(isService && serviceTrade ? { serviceTrade } : {}),
        ...(isService && serviceArea ? { serviceArea } : {}),
        ...(isService ? { isEmergency247: Boolean(isEmergency247) } : {}),
        ...(editingListing ? {
          status: editingListing.status,
          isFeatured: editingListing.isFeatured,
          isVerifiedPro: editingListing.isVerifiedPro,
        } : {}),
      };

      const created = await onSubmitAd(payload, editingListing ? editingListing.id : undefined);
      if (!editingListing) {
        setSubmittedResult({
          id: (created as Listing)?.id || 'new',
          title: payload.title || 'Your advertisement',
          phone: payload.phone || '',
          price: payload.price || 0,
          listing: (created as Listing) || undefined,
        });
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save listing';
      onToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative my-8 border border-gray-100 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {submittedResult ? (
          /* Submission Confirmation & Edit Guide */
          <div className="py-2 space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2.5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/80 shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                Advertisement Submitted!
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                <strong className="text-gray-900 font-semibold">"{submittedResult.title}"</strong> has been saved and is ready for buyers.
              </p>
            </div>

            {/* How to edit your ad or price anytime */}
            <div className="bg-gradient-to-br from-orange-50/90 via-amber-50/60 to-orange-50/90 border border-orange-200/80 rounded-2xl p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF5A36]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                  How can you change price or details later?
                </h4>
              </div>

              <div className="space-y-3 text-xs text-gray-700">
                <div className="flex items-start gap-3 bg-white/70 p-2.5 rounded-xl border border-orange-100">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-gray-900 font-bold">On this device (Instant Edit):</strong>
                    <p className="text-gray-600 mt-0.5 leading-snug">
                      Your ad is automatically remembered on this browser! Just open your ad anytime and click <span className="text-[#FF5A36] font-bold">"Edit Ad & Change Price"</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/70 p-2.5 rounded-xl border border-orange-100">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-black flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-gray-900 font-bold">From any other phone or PC:</strong>
                    <p className="text-gray-600 mt-0.5 leading-snug">
                      Open your listing, tap <span className="text-blue-700 font-bold">"Edit My Ad & Price"</span>, and confirm via SMS verification code sent to your phone (<strong>{submittedResult.phone}</strong>).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/70 p-2.5 rounded-xl border border-orange-100">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 font-black flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-gray-900 font-bold">Quick Price Updates:</strong>
                    <p className="text-gray-600 mt-0.5 leading-snug">
                      Drop your price or add a negotiable tag anytime to boost your listing's visibility to buyers across Sri Lanka.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              {submittedResult.listing && onSelectListing ? (
                <button
                  type="button"
                  onClick={() => {
                    if (submittedResult.listing && onSelectListing) {
                      onSelectListing(submittedResult.listing);
                    }
                    onClose();
                  }}
                  className="w-full sm:flex-1 py-3.5 px-4 bg-[#FF5A36] hover:bg-[#E04826] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <span>View My Advertisement</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Done / Marketplace
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-[#181920]">
                    {isAdminLoggedIn && editingListing
                      ? 'Admin: Edit Listing Details'
                      : (editingListing ? 'Edit Your Advertisement' : 'Post an Ad on HUTA.lk')}
                  </h3>
                  {isAdminLoggedIn && (
                    <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                      Admin Master
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isAdminLoggedIn && editingListing
                    ? `Administrator Mode — Modify any listing parameter • ID: ${editingListing.id}`
                    : 'Reach thousands of prospective buyers across Sri Lanka'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Guest Posting & Edit Guarantee Notice */}
            {!currentUser && !isAdminLoggedIn && !editingListing && (
              <div className="mt-4 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/90 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
                <div className="w-7 h-7 rounded-xl bg-[#FF5A36]/15 text-[#FF5A36] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">Posting without login</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Zero Password Needed</span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                    You can edit your price, photos, or details anytime directly from this device, or from any phone using SMS verification.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Ad Title <span className="text-[#FF5A36]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Toyota Vitz 2018 or iPhone 15 Pro Max 256GB"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 outline-none transition-all"
            />
          </div>

          {/* Category and District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Category <span className="text-[#FF5A36]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none bg-white cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                District / Base City <span className="text-[#FF5A36]">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none bg-white cursor-pointer"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Specialized Fields for Services */}
          {category === 'Services' && (
            <div className="p-3.5 sm:p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 rounded-2xl border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0A2540] flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#FF5A36]" />
                  Professional Service Details
                </span>
                <span className="text-[10px] text-blue-700 bg-blue-100/80 font-bold px-2 py-0.5 rounded-md">
                  Service Directory
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Specialized Trade / Profession <span className="text-[#FF5A36]">*</span>
                  </label>
                  <select
                    value={serviceTrade}
                    onChange={(e) => setServiceTrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#FF5A36] outline-none bg-white cursor-pointer"
                  >
                    {SERVICE_TRADES.map((trade) => (
                      <option key={trade} value={trade}>
                        {trade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Service Area Coverage <span className="text-[#FF5A36]">*</span>
                  </label>
                  <select
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#FF5A36] outline-none bg-white cursor-pointer"
                  >
                    {SERVICE_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Model Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Pricing Model
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'starting_at', label: 'Starting From' },
                    { id: 'hourly', label: 'Per Hour' },
                    { id: 'fixed', label: 'Fixed Job' },
                    { id: 'quote', label: 'Free Estimate / Quote' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPricingType(p.id as any);
                        if (p.id === 'quote') setPrice('0');
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                        pricingType === p.id
                          ? 'bg-[#0A2540] text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 24/7 Emergency Service Toggle */}
              <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none bg-white/70 p-2.5 rounded-xl border border-blue-100">
                <input
                  type="checkbox"
                  checked={isEmergency247}
                  onChange={(e) => setIsEmergency247(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF5A36] focus:ring-[#FF5A36] border-gray-300 accent-[#FF5A36]"
                />
                <div className="text-xs">
                  <span className="font-bold text-gray-900">⚡ 24/7 Emergency Service</span>
                  <span className="text-gray-500 block text-[10px]">
                    Available for urgent callouts (e.g. breakdown, plumbing leak, power fault)
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Price and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {category === 'Services' && pricingType === 'quote'
                  ? 'Pricing'
                  : category === 'Services' && pricingType === 'starting_at'
                  ? 'Starting Rate (LKR) *'
                  : category === 'Services' && pricingType === 'hourly'
                  ? 'Hourly Rate (LKR/hr) *'
                  : 'Price (LKR) *'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-xs">Rs</span>
                <input
                  type="number"
                  required={!(category === 'Services' && pricingType === 'quote')}
                  disabled={category === 'Services' && pricingType === 'quote'}
                  value={category === 'Services' && pricingType === 'quote' ? '' : price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={
                    category === 'Services' && pricingType === 'quote'
                      ? 'Free Estimate on Request'
                      : '2500'
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Contact Phone / WhatsApp <span className="text-[#FF5A36]">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="077 XXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
              />
            </div>
          </div>

          {/* Multiple Advertisement Photos Manager */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <Images className="w-3.5 h-3.5 text-[#FF5A36]" />
                <span>Photos ({images.length}/{MAX_IMAGES})</span>
              </label>
              <span className="text-[11px] text-gray-500 font-medium">
                First photo is the main cover
              </span>
            </div>

            {/* Upload Buttons & URL Input */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <label className="cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-[#FF5A36] rounded-xl py-2.5 px-4 text-xs font-bold text-gray-700 hover:text-[#FF5A36] transition-colors bg-gray-50 hover:bg-orange-50/50">
                {isUploadingImages ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF5A36]" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                <span>{isUploadingImages ? 'Compressing & Adding...' : 'Upload Photos (Multi-Select)'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={isUploadingImages || images.length >= MAX_IMAGES}
                  onChange={handleMultipleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1 flex items-center gap-1.5">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  disabled={images.length >= MAX_IMAGES}
                  placeholder="Or paste photo link (https://...)"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#FF5A36] outline-none disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => handleAddUrl()}
                  disabled={!urlInput.trim() || images.length >= MAX_IMAGES}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Thumbnails Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative group rounded-xl overflow-hidden aspect-4/3 bg-gray-200 border-2 transition-all ${
                      idx === 0 ? 'border-[#FF5A36] shadow-sm ring-1 ring-[#FF5A36]/30' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Cover Photo Badge */}
                    {idx === 0 ? (
                      <div className="absolute top-1.5 left-1.5 bg-[#FF5A36] text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-1 z-10">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>Cover</span>
                      </div>
                    ) : (
                      <div className="absolute top-1.5 left-1.5 bg-black/50 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md z-10">
                        #{idx + 1}
                      </div>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 text-white z-20">
                      <div className="flex items-center justify-between">
                        {idx > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleSetCover(idx)}
                            className="text-[9px] font-bold bg-white text-gray-900 px-1.5 py-0.5 rounded-md hover:bg-orange-50 hover:text-[#FF5A36] transition-colors cursor-pointer"
                            title="Make this photo the main cover image"
                          >
                            Set Cover
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-300">★ Main Cover</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="w-6 h-6 rounded-md bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, 'left')}
                          className="w-6 h-6 rounded-md bg-black/50 hover:bg-black/80 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-white cursor-pointer"
                          title="Move earlier"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-semibold text-gray-200">
                          {idx + 1}/{images.length}
                        </span>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => handleMoveImage(idx, 'right')}
                          className="w-6 h-6 rounded-md bg-black/50 hover:bg-black/80 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-white cursor-pointer"
                          title="Move later"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add More Slot if below MAX_IMAGES */}
                {images.length < MAX_IMAGES && (
                  <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#FF5A36] rounded-xl flex flex-col items-center justify-center gap-1 aspect-4/3 text-gray-400 hover:text-[#FF5A36] transition-colors bg-white hover:bg-orange-50/30">
                    <Plus className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Add Photo</span>
                    <span className="text-[9px] text-gray-400">({MAX_IMAGES - images.length} left)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={isUploadingImages}
                      onChange={handleMultipleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  No photos added yet. Upload up to {MAX_IMAGES} photos of your item (front, back, details) or paste image links.
                </p>
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-1">
              Buyers look at multiple angles. You can add up to {MAX_IMAGES} photos, change the cover photo, or reorder anytime.
            </p>
          </div>

          {/* Description with AI Assistant */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Description <span className="text-[#FF5A36]">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={isGeneratingAI}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5A36] hover:text-[#E04826] bg-[#FF5A36]/10 hover:bg-[#FF5A36]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Drafting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>AI Enhance Description</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, features, warranty, usage, reason for selling, and inspection details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 outline-none leading-relaxed"
            />
          </div>

          {/* Admin Quality Review Notice */}
          {!editingListing && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900">Admin Quality Review: </span>
                <span className="text-amber-800">
                  To protect buyers across Sri Lanka and maintain trusted, spam-free listings, all advertisements are reviewed and approved by our admin team before appearing live on the marketplace.
                </span>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#FF5A36]/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Advertisement...</span>
                </>
              ) : (
                <span>
                  {editingListing
                    ? 'Save & Update Advertisement'
                    : 'Submit Advertisement for Approval'}
                </span>
              )}
            </button>
          </div>
        </form>
        </>
      )}
      </motion.div>
    </motion.div>
  );
};
