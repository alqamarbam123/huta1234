import React, { useState, useEffect } from 'react';
import { Listing, EventItem, HeroAd, HeroAdSettings } from '../types';
import {
  ShieldCheck,
  Clock,
  Star,
  Check,
  X,
  Trash2,
  ArrowLeft,
  LogOut,
  Layers,
  Sparkles,
  KeyRound,
  Lock,
  Loader2,
  CheckCircle2,
  Wrench,
  DollarSign,
  TrendingUp,
  Briefcase,
  Pencil,
  Search,
  Calendar,
  Plus,
  MapPin,
  Ticket,
  Eye,
  Tag,
  Users,
  AlertCircle,
  UploadCloud,
  Image as ImageIcon,
  Megaphone,
} from 'lucide-react';
import { formatLKR } from './ListingsSection';
import { api } from '../services/api';
import { AdminHeroAdsManager } from './AdminHeroAdsManager';

const compressBannerImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1400; // High resolution for widescreen banners
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
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const BANNER_PRESETS = [
  { label: '🎪 Festival & Concert', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80' },
  { label: '🏢 Tech & Business Expo', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80' },
  { label: '🏏 Sports & Cricket', url: 'https://images.unsplash.com/photo-1531415074868-036b1c57e32b?w=800&auto=format&fit=crop&q=80' },
  { label: '🍜 Food & Night Market', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80' },
  { label: '🎨 Art & Cultural Gala', url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&auto=format&fit=crop&q=80' },
  { label: '🛍️ Shopping Mega Sale', url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80' },
];

interface AdminDashboardProps {
  listings: Listing[];
  events?: EventItem[];
  heroAds?: HeroAd[];
  heroSettings?: HeroAdSettings;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onToggleFeature: (id: string) => Promise<void>;
  onToggleVerifyPro?: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBackToMarketplace: () => void;
  onLogoutAdmin: () => void;
  onSelectListing: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onUpdateEvent?: (updated: EventItem) => void;
  onCreateEvent?: (created: EventItem) => void;
  onDeleteEvent?: (id: string) => void;
  onToggleSpotlightEvent?: (id: string) => Promise<void>;
  onClearAllListings?: () => Promise<void>;
  onUpdateHeroSettings?: (settings: Partial<HeroAdSettings>) => Promise<void>;
  onCreateHeroAd?: (ad: Partial<HeroAd>) => Promise<void>;
  onUpdateHeroAd?: (id: string, ad: Partial<HeroAd>) => Promise<void>;
  onToggleHeroAd?: (id: string) => Promise<void>;
  onDeleteHeroAd?: (id: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  listings,
  events,
  heroAds = [],
  heroSettings = { mode: 'default', rotationIntervalSeconds: 6 },
  onApprove,
  onReject,
  onToggleFeature,
  onToggleVerifyPro,
  onDelete,
  onBackToMarketplace,
  onLogoutAdmin,
  onSelectListing,
  onEditListing,
  onToast,
  onUpdateEvent,
  onCreateEvent,
  onDeleteEvent,
  onToggleSpotlightEvent,
  onClearAllListings,
  onUpdateHeroSettings,
  onCreateHeroAd,
  onUpdateHeroAd,
  onToggleHeroAd,
  onDeleteHeroAd,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'featured' | 'services' | 'spotlight' | 'hero_ads'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [showMonetizationGuide, setShowMonetizationGuide] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');

  // Live Launch & Auto-Approve state
  const [autoApprove, setAutoApprove] = useState(false);
  const [isUpdatingAutoApprove, setIsUpdatingAutoApprove] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  useEffect(() => {
    api.getAdminConfig().then((cfg) => {
      setAutoApprove(Boolean(cfg.autoApprove));
    }).catch(() => {});
  }, []);

  const handleToggleAutoApprove = async () => {
    const next = !autoApprove;
    setIsUpdatingAutoApprove(true);
    try {
      await api.updateAdminConfig({ autoApprove: next });
      setAutoApprove(next);
      if (onToast) {
        onToast(
          next
            ? 'Auto-Approval enabled: Customer ads go live immediately!'
            : 'Manual Review enabled: Customer ads require admin approval first.',
          'success'
        );
      }
    } catch {
      if (onToast) onToast('Failed to update approval setting', 'error');
    } finally {
      setIsUpdatingAutoApprove(false);
    }
  };

  // Events & Spotlight state
  const [localEvents, setLocalEvents] = useState<EventItem[]>(events || []);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [eventFormError, setEventFormError] = useState('');

  // Event search & filters
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('All');
  const [eventSpotlightFilter, setEventSpotlightFilter] = useState<'all' | 'spotlight' | 'standard'>('all');

  // Event form fields
  const [evtTitle, setEvtTitle] = useState('');
  const [evtCategory, setEvtCategory] = useState<'Entertainment' | 'Exhibitions' | 'Food & Culture' | 'Sports' | 'Tech'>('Entertainment');
  const [evtDistrict, setEvtDistrict] = useState<'Colombo' | 'Galle' | 'Kandy' | 'Jaffna' | 'Negombo' | 'Other'>('Colombo');
  const [evtDate, setEvtDate] = useState('');
  const [evtMonth, setEvtMonth] = useState('OCT');
  const [evtDay, setEvtDay] = useState('18');
  const [evtTime, setEvtTime] = useState('10:00 AM - 08:00 PM');
  const [evtLocation, setEvtLocation] = useState('Colombo 07');
  const [evtVenue, setEvtVenue] = useState('');
  const [evtImage, setEvtImage] = useState('');
  const [evtBadge, setEvtBadge] = useState('Featured');
  const [evtPrice, setEvtPrice] = useState('Free Entry');
  const [evtIsFree, setEvtIsFree] = useState(true);
  const [evtAttendees, setEvtAttendees] = useState(1500);
  const [evtDescription, setEvtDescription] = useState('');
  const [evtOrganizer, setEvtOrganizer] = useState('');
  const [evtIsSpotlight, setEvtIsSpotlight] = useState(true);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      if (onToast) onToast('Image exceeds 15MB. Please choose a smaller photo.', 'error');
      return;
    }

    setIsUploadingBanner(true);
    try {
      const compressed = await compressBannerImage(file);
      setEvtImage(compressed);
      if (onToast) onToast('Banner image uploaded & optimized successfully!', 'success');
    } catch (err) {
      console.error('Failed to process banner image', err);
      if (onToast) onToast('Failed to process image file.', 'error');
    } finally {
      setIsUploadingBanner(false);
      e.target.value = '';
    }
  };

  // Sync events from prop or fetch if not provided
  useEffect(() => {
    if (events !== undefined) {
      setLocalEvents(events);
    } else {
      api.getEvents().then((data) => setLocalEvents(data)).catch(console.error);
    }
  }, [events]);

  const spotlightEventsCount = localEvents.filter((e) => e.isSpotlight).length;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');
    setChangeSuccess('');

    if (newPass !== confirmNewPass) {
      setChangeError('New password and confirmation do not match.');
      return;
    }
    if (newPass.length < 6) {
      setChangeError('New password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.changeAdminPassword(currentPass, newPass);
      setChangeSuccess(res.message || 'Admin password updated successfully!');
      if (onToast) onToast(res.message || 'Admin password updated successfully!', 'success');
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setCurrentPass('');
        setNewPass('');
        setConfirmNewPass('');
        setChangeSuccess('');
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update admin password';
      setChangeError(msg);
      if (onToast) onToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = listings.length;
  const pending = listings.filter((l) => l.status === 'pending').length;
  const featured = listings.filter((l) => l.isFeatured).length;
  const servicesCount = listings.filter((l) => l.category === 'Services').length;
  const verifiedProsCount = listings.filter((l) => l.category === 'Services' && l.isVerifiedPro).length;

  const filteredListings = listings.filter((item) => {
    if (filterTab === 'pending' && item.status !== 'pending') return false;
    if (filterTab === 'featured' && !item.isFeatured) return false;
    if (filterTab === 'services' && item.category !== 'Services') return false;
    if (selectedDistrict !== 'all' && item.location !== selectedDistrict) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchPhone = item.phone.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchTrade = (item.serviceTrade || '').toLowerCase().includes(q);
      const matchUserId = (item.userId || '').toLowerCase().includes(q);
      const matchId = (item.id || '').toLowerCase().includes(q);
      if (!matchTitle && !matchPhone && !matchLoc && !matchTrade && !matchUserId && !matchId) {
        return false;
      }
    }
    return true;
  });

  // Event handlers
  const openAddEvent = () => {
    setEditingEvent(null);
    setEvtTitle('');
    setEvtCategory('Entertainment');
    setEvtDistrict('Colombo');
    setEvtDate('NOV 15 - 18, 2026');
    setEvtMonth('NOV');
    setEvtDay('15');
    setEvtTime('10:00 AM - 08:00 PM');
    setEvtLocation('Colombo 07');
    setEvtVenue('');
    setEvtImage('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80');
    setEvtBadge('Featured');
    setEvtPrice('Free Entry');
    setEvtIsFree(true);
    setEvtAttendees(2500);
    setEvtDescription('');
    setEvtOrganizer('HUTA Community');
    setEvtIsSpotlight(true);
    setEventFormError('');
    setIsEventModalOpen(true);
  };

  const openEditEvent = (evt: EventItem) => {
    setEditingEvent(evt);
    setEvtTitle(evt.title);
    setEvtCategory(evt.category);
    setEvtDistrict(evt.district);
    setEvtDate(evt.date);
    setEvtMonth(evt.month);
    setEvtDay(evt.day);
    setEvtTime(evt.time);
    setEvtLocation(evt.location);
    setEvtVenue(evt.venue);
    setEvtImage(evt.image);
    setEvtBadge(evt.badge || 'Featured');
    setEvtPrice(evt.price);
    setEvtIsFree(evt.isFree);
    setEvtAttendees(evt.attendees);
    setEvtDescription(evt.description);
    setEvtOrganizer(evt.organizer);
    setEvtIsSpotlight(Boolean(evt.isSpotlight));
    setEventFormError('');
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) {
      setEventFormError('Event title is required.');
      return;
    }
    if (!evtVenue.trim()) {
      setEventFormError('Event venue is required.');
      return;
    }

    setIsSubmittingEvent(true);
    setEventFormError('');

    const eventPayload = {
      title: evtTitle.trim(),
      category: evtCategory,
      district: evtDistrict,
      date: evtDate.trim() || `${evtMonth} ${evtDay}, 2026`,
      month: evtMonth.trim().toUpperCase(),
      day: evtDay.trim(),
      time: evtTime.trim(),
      location: evtLocation.trim(),
      venue: evtVenue.trim(),
      image: evtImage.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      badge: evtBadge.trim(),
      price: evtIsFree ? 'Free Entry' : evtPrice.trim(),
      isFree: evtIsFree,
      attendees: Number(evtAttendees) || 1000,
      description: evtDescription.trim(),
      organizer: evtOrganizer.trim() || 'HUTA Community',
      isSpotlight: evtIsSpotlight,
    };

    try {
      if (editingEvent) {
        const updated = await api.updateEvent(editingEvent.id, eventPayload);
        setLocalEvents((prev) => prev.map((ev) => (ev.id === editingEvent.id ? updated : ev)));
        if (onUpdateEvent) onUpdateEvent(updated);
        if (onToast) onToast(`"${updated.title}" updated successfully!`, 'success');
      } else {
        const created = await api.createEvent(eventPayload);
        setLocalEvents((prev) => [created, ...prev]);
        if (onCreateEvent) onCreateEvent(created);
        if (onToast) onToast(`"${created.title}" added to events!`, 'success');
      }
      setIsEventModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save event';
      setEventFormError(msg);
      if (onToast) onToast(msg, 'error');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleToggleSpotlightAction = async (evt: EventItem) => {
    if (onToggleSpotlightEvent) {
      await onToggleSpotlightEvent(evt.id);
      setLocalEvents((prev) =>
        prev.map((e) => (e.id === evt.id ? { ...e, isSpotlight: !e.isSpotlight } : e))
      );
    } else {
      try {
        const updated = await api.toggleSpotlightEvent(evt.id);
        setLocalEvents((prev) => prev.map((e) => (e.id === evt.id ? updated : e)));
        if (onToast) {
          onToast(
            updated.isSpotlight
              ? `"${updated.title}" added to Upcoming Spotlight!`
              : `"${updated.title}" removed from Upcoming Spotlight`,
            'success'
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to toggle spotlight';
        if (onToast) onToast(msg, 'error');
      }
    }
  };

  const handleDeleteEventAction = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteEvent(id);
      setLocalEvents((prev) => prev.filter((e) => e.id !== id));
      if (onDeleteEvent) onDeleteEvent(id);
      if (onToast) onToast(`"${title}" deleted successfully`, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete event';
      if (onToast) onToast(msg, 'error');
    }
  };

  const filteredEventsList = localEvents.filter((item) => {
    if (selectedDistrict !== 'all' && item.district !== selectedDistrict) return false;
    if (eventSpotlightFilter === 'spotlight' && !item.isSpotlight) return false;
    if (eventSpotlightFilter === 'standard' && item.isSpotlight) return false;
    if (eventCategoryFilter !== 'All' && item.category !== eventCategoryFilter) return false;

    const query = (searchTerm || eventSearchTerm).trim().toLowerCase();
    if (query) {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchVenue = item.venue.toLowerCase().includes(query);
      const matchDist = item.district.toLowerCase().includes(query);
      const matchOrg = item.organizer.toLowerCase().includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      if (!matchTitle && !matchVenue && !matchDist && !matchOrg && !matchCat) return false;
    }
    return true;
  });

  const spotlightEventsList = localEvents.filter((e) => e.isSpotlight);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#111217] text-white rounded-3xl p-6 sm:p-8 border border-[#2D2F39] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#FF5A36] font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Administrator Portal</span>
            {/* Edit / Add Spotlight Event Modal */}
      {isEventModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto"
          onClick={() => setIsEventModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5A36] flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 leading-none">
                    {editingEvent ? 'Edit Spotlight Event' : 'Create Spotlight Event'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {editingEvent
                      ? 'Update event details and upcoming spotlight banner settings'
                      : 'Add a new community gathering or expo to the spotlight directory'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {eventFormError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{eventFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="mt-5 space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  placeholder="e.g. CARDCON & Collectibles Expo 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none font-medium"
                />
              </div>

              {/* Category & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={evtCategory}
                    onChange={(e) => setEvtCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none bg-white font-medium"
                  >
                    <option value="Entertainment">Entertainment</option>
                    <option value="Exhibitions">Exhibitions</option>
                    <option value="Food & Culture">Food & Culture</option>
                    <option value="Sports">Sports</option>
                    <option value="Tech">Tech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    District
                  </label>
                  <select
                    value={evtDistrict}
                    onChange={(e) => setEvtDistrict(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none bg-white font-medium"
                  >
                    <option value="Colombo">Colombo</option>
                    <option value="Galle">Galle</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Jaffna">Jaffna</option>
                    <option value="Negombo">Negombo</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Venue & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={evtVenue}
                    onChange={(e) => setEvtVenue(e.target.value)}
                    placeholder="e.g. BMICH Exhibition Centre, Hall A"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    City / Suburb
                  </label>
                  <input
                    type="text"
                    value={evtLocation}
                    onChange={(e) => setEvtLocation(e.target.value)}
                    placeholder="e.g. Colombo 07"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none font-medium"
                  />
                </div>
              </div>

              {/* Date Inputs (Month, Day, Full Date String) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Month Badge (3 letters)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={evtMonth}
                    onChange={(e) => setEvtMonth(e.target.value.toUpperCase())}
                    placeholder="e.g. OCT"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none font-bold text-center uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Day Badge
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={evtDay}
                    onChange={(e) => setEvtDay(e.target.value)}
                    placeholder="e.g. 18"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Date Display
                  </label>
                  <input
                    type="text"
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    placeholder="e.g. OCT 18 - 20, 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none font-medium"
                  />
                </div>
              </div>

              {/* Time & Organizer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Event Time
                  </label>
                  <input
                    type="text"
                    value={evtTime}
                    onChange={(e) => setEvtTime(e.target.value)}
                    placeholder="e.g. 10:00 AM - 08:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Organizer Name
                  </label>
                  <input
                    type="text"
                    value={evtOrganizer}
                    onChange={(e) => setEvtOrganizer(e.target.value)}
                    placeholder="e.g. Lanka Comic Con / BMICH"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none font-medium"
                  />
                </div>
              </div>

              {/* Admission / Price & Free Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Admission Price
                  </label>
                  <input
                    type="text"
                    disabled={evtIsFree}
                    value={evtIsFree ? 'Free Entry' : evtPrice}
                    onChange={(e) => setEvtPrice(e.target.value)}
                    placeholder="e.g. LKR 1,500 or Free Entry"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:border-[#FF5A36] outline-none font-medium ${
                      evtIsFree ? 'bg-gray-100 border-gray-200 text-gray-500' : 'border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 bg-gray-50">
                  <input
                    id="free-entry-check"
                    type="checkbox"
                    checked={evtIsFree}
                    onChange={(e) => {
                      setEvtIsFree(e.target.checked);
                      if (e.target.checked) setEvtPrice('Free Entry');
                    }}
                    className="w-4 h-4 rounded text-[#FF5A36] focus:ring-[#FF5A36] border-gray-300 cursor-pointer"
                  />
                  <label htmlFor="free-entry-check" className="text-xs font-bold text-gray-800 cursor-pointer">
                    Free Entry for Attendees
                  </label>
                </div>
              </div>

              {/* Badge & Expected Attendees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Highlight Badge Tag
                  </label>
                  <input
                    type="text"
                    value={evtBadge}
                    onChange={(e) => setEvtBadge(e.target.value)}
                    placeholder="e.g. Popular, Featured, Tech Summit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Expected Attendees
                  </label>
                  <input
                    type="number"
                    value={evtAttendees}
                    onChange={(e) => setEvtAttendees(Number(e.target.value))}
                    placeholder="e.g. 2500"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none font-medium"
                  />
                </div>
              </div>

              {/* Banner Image: Upload File, Presets & URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <ImageIcon className="w-3.5 h-3.5 text-[#FF5A36]" />
                    <span>Banner Image (Upload or URL)</span>
                  </label>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Upload from device or paste link
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                  {/* Dedicated "Add Image" Button with File Input */}
                  <label className="cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-[#FF5A36] rounded-xl py-2.5 px-4 text-xs font-bold text-gray-700 hover:text-[#FF5A36] transition-colors bg-gray-50 hover:bg-orange-50/50 shrink-0">
                    {isUploadingBanner ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#FF5A36]" />
                    ) : (
                      <UploadCloud className="w-4 h-4 text-[#FF5A36]" />
                    )}
                    <span>{isUploadingBanner ? 'Uploading Photo...' : 'Add Image (Upload File)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingBanner}
                      onChange={handleBannerFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={evtImage}
                      onChange={(e) => setEvtImage(e.target.value)}
                      placeholder="Or paste banner image URL (https://...)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#FF5A36] outline-none font-mono"
                    />
                    {evtImage && (
                      <button
                        type="button"
                        onClick={() => setEvtImage('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs font-bold p-1 cursor-pointer"
                        title="Clear banner image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick 1-Click Banner Presets */}
                <div className="mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Quick Preset Banners:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {BANNER_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setEvtImage(preset.url);
                          if (onToast) onToast(`Loaded ${preset.label} banner!`, 'info');
                        }}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          evtImage === preset.url
                            ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner Preview Card */}
                {evtImage ? (
                  <div className="rounded-2xl overflow-hidden border border-gray-200 relative bg-gray-900 shadow-inner group">
                    <div className="h-36 sm:h-44 w-full relative">
                      <img
                        src={evtImage}
                        alt="Banner Preview"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      {/* Live Badge Preview */}
                      <div className="absolute top-2.5 left-2.5 bg-[#FF5A36] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs">
                        {evtBadge || 'Featured'}
                      </div>

                      {/* Live Details Preview */}
                      <div className="absolute bottom-2.5 left-3 right-28 text-white">
                        <p className="text-xs font-bold truncate">
                          {evtTitle || 'Event / Spotlight Title'}
                        </p>
                        <p className="text-[10px] text-gray-300 truncate">
                          {evtVenue || evtLocation || 'Venue'} • {evtDate || `${evtMonth} ${evtDay}`}
                        </p>
                      </div>

                      {/* Action buttons on banner */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <label className="cursor-pointer bg-white/95 hover:bg-white text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md shadow-xs transition-colors flex items-center gap-1">
                          <UploadCloud className="w-3 h-3 text-[#FF5A36]" />
                          <span>Change</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingBanner}
                            onChange={handleBannerFileUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setEvtImage('')}
                          className="bg-black/70 hover:bg-red-600 text-white p-1 rounded-md transition-colors cursor-pointer"
                          title="Remove Banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-center">
                    <p className="text-xs text-gray-500 font-medium">
                      No banner image selected yet. Click <strong>"Add Image (Upload File)"</strong> to pick a photo from your computer or phone, or choose one of the quick presets above.
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={evtDescription}
                  onChange={(e) => setEvtDescription(e.target.value)}
                  placeholder="Provide an engaging description of what attendees can expect..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none resize-none font-medium"
                />
              </div>

              {/* Spotlight Toggle */}
              <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                    <Star className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">
                      Feature in "Upcoming Spotlight" Banner
                    </h4>
                    <p className="text-[11px] text-gray-600">
                      When enabled, this event is showcased in the prominent horizontal carousel on the Huta In homepage.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={evtIsSpotlight}
                  onChange={(e) => setEvtIsSpotlight(e.target.checked)}
                  className="w-5 h-5 rounded text-[#FF5A36] focus:ring-[#FF5A36] border-gray-300 cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="w-2/3 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  {isSubmittingEvent ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Event...</span>
                    </>
                  ) : (
                    <span>{editingEvent ? 'Save Changes' : 'Publish Spotlight Event'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Admin Control Dashboard
          </h2>
          <p className="text-sm text-[#9CA3AF] max-w-xl">
            Review submitted advertisements, verify listing details, feature high-priority ads, or remove spam from HUTA Marketplace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Auto-Approve Toggle */}
          <button
            type="button"
            onClick={handleToggleAutoApprove}
            disabled={isUpdatingAutoApprove}
            title="Toggle whether customer advertisements go live immediately without admin moderation"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors border cursor-pointer ${
              autoApprove
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoApprove ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
            <span>{autoApprove ? 'Auto-Approve Ads: ON' : 'Admin Approval Required: ON'}</span>
          </button>

          {/* Fresh Launch Clear Ads */}
          {onClearAllListings && (
            <button
              type="button"
              onClick={() => setIsClearConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-red-500/30 cursor-pointer"
              title="Remove all listings for a clean live launch"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clean Ads (Live Launch)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setChangeError('');
              setChangeSuccess('');
              setIsChangePasswordOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-xl text-sm font-semibold transition-colors border border-amber-500/30 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </button>
          <button
            type="button"
            onClick={onBackToMarketplace}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Marketplace</span>
          </button>
          <button
            type="button"
            onClick={onLogoutAdmin}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        <div
          onClick={() => setFilterTab('all')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'all'
              ? 'bg-white border-[#FF5A36] shadow-lg -translate-y-1'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Advertisements</span>
            <Layers className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-extrabold text-[#111217]">{total}</div>
          <p className="text-xs text-gray-400 mt-1">Across all categories & districts</p>
        </div>

        <div
          onClick={() => setFilterTab('pending')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'pending'
              ? 'bg-white border-[#FF5A36] shadow-lg -translate-y-1'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{pending}</div>
          <p className="text-xs text-amber-600/70 mt-1">Requires approval to go live</p>
        </div>

        <div
          onClick={() => setFilterTab('featured')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'featured'
              ? 'bg-white border-[#FF5A36] shadow-lg -translate-y-1'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-[#FF5A36] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Featured Ads</span>
            <Star className="w-5 h-5 text-[#FF5A36]" />
          </div>
          <div className="text-3xl font-extrabold text-[#FF5A36]">{featured}</div>
          <p className="text-xs text-[#FF5A36]/70 mt-1">Highlighted on homepage</p>
        </div>

        <div
          onClick={() => setFilterTab('services')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'services'
              ? 'bg-white border-blue-600 shadow-lg -translate-y-1'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Services & Trades</span>
            <Wrench className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600">{servicesCount}</div>
          <p className="text-xs text-blue-600/80 mt-1 font-medium">
            {verifiedProsCount} Verified Pro badges active
          </p>
        </div>

        <div
          id="admin-metric-spotlight"
          onClick={() => setFilterTab('spotlight')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'spotlight'
              ? 'bg-white border-[#FF5A36] shadow-lg -translate-y-1 ring-2 ring-[#FF5A36]/20'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-[#FF5A36] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Upcoming Spotlight</span>
            <Sparkles className="w-5 h-5 text-[#FF5A36]" />
          </div>
          <div className="text-3xl font-extrabold text-[#FF5A36]">{spotlightEventsCount}</div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {localEvents.length} events • Click to manage
          </p>
        </div>

        <div
          id="admin-metric-hero-ads"
          onClick={() => setFilterTab('hero_ads')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'hero_ads'
              ? 'bg-white border-[#FF5A36] shadow-lg -translate-y-1 ring-2 ring-[#FF5A36]/20'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-orange-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Hero Animated Ads</span>
            <Megaphone className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-extrabold text-orange-600">{heroAds.length}</div>
          <p className="text-xs text-gray-500 mt-1 font-medium capitalize">
            Mode: {heroSettings.mode.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Admin Strategy: How Admin Benefits from Services */}
      <div className="bg-gradient-to-br from-[#0A2540] to-[#123962] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/50">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                Admin Monetization Strategy: Services Section
              </h3>
              <p className="text-xs text-blue-200">
                Four proven revenue streams for the platform administrator from the Services directory
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMonetizationGuide(!showMonetizationGuide)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 transition-colors cursor-pointer"
          >
            {showMonetizationGuide ? 'Collapse Guide' : 'View Revenue Streams'}
          </button>
        </div>

        {showMonetizationGuide && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>1. Verified Pro Fee</span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1">
                  Monthly / Annual Verification
                </h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Charge service providers <strong>Rs. 2,500 – 5,000 / month</strong> (or Rs. 15,000 / yr) to review their NIC & trade licenses and award the official <em>HUTA Verified Pro</em> trust badge.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] text-emerald-300 font-semibold">
                ✓ 5x higher consumer trust & conversion
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>2. Sponsored Category Spot</span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1">
                  Top-of-Trade Placement
                </h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Technicians gladly pay to be pinned as the <strong>#1 or #2 spot</strong> for high-intent searches (e.g. <em>AC Repair Colombo</em> or <em>Plumber Kandy</em>).
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] text-amber-300 font-semibold">
                ✓ Recurring monthly sponsorship
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-orange-300 text-xs font-extrabold uppercase tracking-wider mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>3. 24/7 Emergency Upgrade</span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1">
                  Urgent Callout Priority
                </h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Charge an emergency priority surcharge for towing, breakdown repair, plumbing leaks, and electrical technicians to highlight their 24/7 availability banner.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] text-orange-300 font-semibold">
                ✓ High-margin immediate listing boost
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-sky-300 text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Briefcase className="w-4 h-4" />
                  <span>4. Direct Lead Routing</span>
                </div>
                <h4 className="font-bold text-sm text-white mb-1">
                  WhatsApp Quote Inquiries
                </h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Consumers use the integrated WhatsApp quote button. The admin can package verified homeowner repair leads and sell bulk lead credits (e.g. 25 client inquiries).
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] text-sky-300 font-semibold">
                ✓ Scalable B2B lead generation
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table & Management Section */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab Filters & Search */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'all'
                  ? 'bg-[#181920] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Ads ({total})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Pending Review ({pending})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('featured')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'featured'
                  ? 'bg-[#FF5A36] text-white'
                  : 'bg-orange-50 text-[#FF5A36] hover:bg-orange-100'
              }`}
            >
              Featured ({featured})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('services')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'services'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Services & Trades ({servicesCount})
            </button>
            <button
              id="admin-filter-spotlight-tab"
              type="button"
              onClick={() => setFilterTab('spotlight')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterTab === 'spotlight'
                  ? 'bg-[#FF5A36] text-white shadow-sm'
                  : 'bg-orange-50 text-[#FF5A36] hover:bg-orange-100 border border-orange-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upcoming Spotlight ({spotlightEventsCount})</span>
            </button>
            <button
              id="admin-filter-hero-ads-tab"
              type="button"
              onClick={() => setFilterTab('hero_ads')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterTab === 'hero_ads'
                  ? 'bg-[#FF5A36] text-white shadow-sm'
                  : 'bg-orange-50 text-[#FF5A36] hover:bg-orange-100 border border-orange-200/60'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Hero Ads & Banners ({heroAds.length})</span>
            </button>
          </div>

          {filterTab === 'spotlight' && (
            <button
              id="admin-add-event-btn"
              type="button"
              onClick={openAddEvent}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Event / Spotlight</span>
            </button>
          )}

          {filterTab !== 'hero_ads' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search title, phone, author..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-gray-200 text-xs focus:border-[#FF5A36] outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white outline-none focus:border-[#FF5A36]"
              >
                <option value="all">All Districts</option>
                <option value="Colombo">Colombo</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
                <option value="Kalutara">Kalutara</option>
                <option value="Kurunegala">Kurunegala</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Section */}
        {filterTab === 'hero_ads' ? (
          <div className="p-4 sm:p-6">
            <AdminHeroAdsManager
              heroAds={heroAds}
              heroSettings={heroSettings}
              onUpdateHeroSettings={onUpdateHeroSettings}
              onCreateHeroAd={onCreateHeroAd}
              onUpdateHeroAd={onUpdateHeroAd}
              onToggleHeroAd={onToggleHeroAd}
              onDeleteHeroAd={onDeleteHeroAd}
              onToast={onToast}
            />
          </div>
        ) : (
        <div className="overflow-x-auto">
          {filterTab === 'spotlight' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Event Details & Banner</th>
                  <th className="py-3.5 px-4 font-bold">Category & District</th>
                  <th className="py-3.5 px-4 font-bold">Date & Venue</th>
                  <th className="py-3.5 px-4 font-bold">Price</th>
                  <th className="py-3.5 px-4 font-bold">Spotlight Banner</th>
                  <th className="py-3.5 px-4 font-bold text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEventsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100/80 text-[#FF5A36] flex items-center justify-center">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h4 className="font-extrabold text-gray-900 text-sm">
                          {localEvents.length === 0
                            ? 'No Events or Spotlight Banners Created'
                            : 'No events match your current search'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {localEvents.length === 0
                            ? 'The events list is currently empty. As Admin, click below to publish your first festival, expo, or spotlight banner.'
                            : 'Try clearing the search query or selecting All Districts.'}
                        </p>
                        <button
                          type="button"
                          onClick={openAddEvent}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Event / Spotlight</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEventsList.map((evt) => (
                    <tr key={evt.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Item */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.image || 'https://via.placeholder.com/60'}
                            alt={evt.title}
                            className="w-16 h-11 rounded-xl object-cover border border-gray-200 shrink-0 bg-gray-100 shadow-xs"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-gray-900 line-clamp-1 text-xs sm:text-sm">
                              {evt.title}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              Org: {evt.organizer || 'HUTA Community'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & District */}
                      <td className="py-3 px-4">
                        <span className="inline-block text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                          {evt.category}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-0.5">{evt.district}</p>
                      </td>

                      {/* Date & Venue */}
                      <td className="py-3 px-4">
                        <p className="text-xs font-bold text-gray-900">{evt.date || `${evt.month} ${evt.day}`}</p>
                        <p className="text-[11px] text-gray-500 truncate max-w-[180px]">{evt.venue}</p>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md ${
                            evt.isFree
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {evt.price}
                        </span>
                      </td>

                      {/* Spotlight Banner Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleSpotlightAction(evt)}
                          title={evt.isSpotlight ? 'Click to remove from Spotlight banner' : 'Click to feature in Spotlight banner'}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                            evt.isSpotlight
                              ? 'bg-[#FF5A36] text-white shadow-xs hover:bg-[#E04826]'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{evt.isSpotlight ? 'In Spotlight' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditEvent(evt)}
                            title="Edit Event & Banner details"
                            className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors border border-amber-200 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEventAction(evt.id, evt.title)}
                            title="Delete Event permanently"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 font-bold">Item Details</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Location</th>
                <th className="py-3.5 px-4 font-bold">Price</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No advertisements in this category.
                  </td>
                </tr>
              ) : (
                filteredListings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Item */}
                    <td className="py-3 px-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => onSelectListing(item)}
                      >
                        <img
                          src={item.image || 'https://via.placeholder.com/60'}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-[#FF5A36] transition-colors line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">Tel: {item.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-gray-700 font-medium">{item.category}</td>

                    {/* Location */}
                    <td className="py-3 px-4 text-gray-700">{item.location}</td>

                    {/* Price */}
                    <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {formatLKR(item.price)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                            item.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF5A36] text-white">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {item.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onApprove(item.id)}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onReject(item.id)}
                              className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleFeature(item.id)}
                            className={`inline-flex items-center gap-1 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${
                              item.isFeatured
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>{item.isFeatured ? 'Unfeature' : 'Feature'}</span>
                          </button>
                        )}

                        {onToggleVerifyPro && (item.category === 'Services' || item.serviceTrade) && (
                          <button
                            type="button"
                            onClick={() => onToggleVerifyPro(item.id)}
                            title={item.isVerifiedPro ? 'Revoke Verified Pro Badge' : 'Award Verified Pro Badge'}
                            className={`inline-flex items-center gap-1 text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors ${
                              item.isVerifiedPro
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                            }`}
                          >
                            <ShieldCheck className={`w-3.5 h-3.5 ${item.isVerifiedPro ? 'text-emerald-600' : 'text-blue-600'}`} />
                            <span>{item.isVerifiedPro ? 'Verified Pro' : 'Verify Pro'}</span>
                          </button>
                        )}

                        {onEditListing && (
                          <button
                            type="button"
                            onClick={() => onEditListing(item)}
                            title="Edit advertisement details (Title, Price, Trade, Location, Status, etc.)"
                            className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors border border-amber-200 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-600" />
                            <span>Edit</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          title="Delete permanently"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </div>
        )}
      </div>

      {/* Change Admin Password Modal */}
      {isChangePasswordOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsChangePasswordOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 leading-none">
                    Change Admin Password
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Update the master administrator credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {changeError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {changeError}
              </div>
            )}

            {changeSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{changeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Current Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password (default admin123)"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  New Admin Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save New Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fresh Launch Clear All Ads Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Fresh Live Launch Reset
            </h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Are you sure you want to remove all advertisements? This will completely clear all demo/test ads so your website starts 100% fresh for incoming customers.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                disabled={isClearingAll}
                className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isClearingAll}
                onClick={async () => {
                  if (!onClearAllListings) return;
                  setIsClearingAll(true);
                  try {
                    await onClearAllListings();
                    setIsClearConfirmOpen(false);
                  } finally {
                    setIsClearingAll(false);
                  }
                }}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {isClearingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <span>Yes, Clear All Ads</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
