import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EventItem } from '../types';
export type { EventItem };
import { DualToneHeading } from './DualToneHeading';
import {
  Calendar,
  MapPin,
  Ticket,
  Share2,
  Users,
  Search,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  X,
  Heart,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  SlidersHorizontal,
  Check,
  Car,
  Bike,
  Home,
  Smartphone,
  Sofa,
  PackageCheck,
  Briefcase,
  Wrench,
  Truck,
  Wind,
  ShieldAlert,
  HardHat,
  PartyPopper,
  GraduationCap,
  HeartPulse,
  Scale,
  Dog,
  Laptop,
  Plane,
  Layers,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export interface HutaCategoryItem {
  id: string;
  name: string;
  categoryFilter: string;
  group: 'all' | 'marketplace' | 'services' | 'lifestyle';
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  tag: string;
  popular?: boolean;
}

export const HUTA_ALL_CATEGORIES: HutaCategoryItem[] = [
  {
    id: 'cat_vehicles',
    name: 'Vehicles & Cars',
    categoryFilter: 'Vehicles',
    group: 'marketplace',
    icon: Car,
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-600',
    tag: 'Cars & Vans',
    popular: true,
  },
  {
    id: 'cat_motorcycles',
    name: 'Motorcycles & Bikes',
    categoryFilter: 'Motorcycles',
    group: 'marketplace',
    icon: Bike,
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
    tag: 'Bikes & Scooters',
    popular: true,
  },
  {
    id: 'cat_property',
    name: 'Property & Real Estate',
    categoryFilter: 'Property',
    group: 'marketplace',
    icon: Home,
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-600',
    tag: 'Houses & Lands',
    popular: true,
  },
  {
    id: 'cat_electronics',
    name: 'Electronics & Gadgets',
    categoryFilter: 'Electronics',
    group: 'marketplace',
    icon: Smartphone,
    iconBg: 'bg-purple-50 border-purple-100',
    iconColor: 'text-purple-600',
    tag: 'Phones & Laptops',
    popular: true,
  },
  {
    id: 'cat_home_living',
    name: 'Home & Living',
    categoryFilter: 'Home & Garden',
    group: 'marketplace',
    icon: Sofa,
    iconBg: 'bg-teal-50 border-teal-100',
    iconColor: 'text-teal-600',
    tag: 'Furniture & Decor',
  },
  {
    id: 'cat_preloved',
    name: 'Preloved & Fashion',
    categoryFilter: 'Fashion & Preloved',
    group: 'marketplace',
    icon: PackageCheck,
    iconBg: 'bg-rose-50 border-rose-100',
    iconColor: 'text-rose-600',
    tag: 'Clothing & Styles',
  },
  {
    id: 'cat_jobs',
    name: 'Jobs & Careers',
    categoryFilter: 'Jobs',
    group: 'marketplace',
    icon: Briefcase,
    iconBg: 'bg-indigo-50 border-indigo-100',
    iconColor: 'text-indigo-600',
    tag: 'Vacancies',
    popular: true,
  },
  {
    id: 'cat_automotive_services',
    name: 'Automotive Services',
    categoryFilter: 'Services',
    group: 'services',
    icon: Wrench,
    iconBg: 'bg-orange-50 border-orange-100',
    iconColor: 'text-orange-600',
    tag: 'Mechanics & Tires',
    popular: true,
  },
  {
    id: 'cat_cleaning',
    name: 'Cleaning Services',
    categoryFilter: 'Services',
    group: 'services',
    icon: Sparkles,
    iconBg: 'bg-sky-50 border-sky-100',
    iconColor: 'text-sky-600',
    tag: 'Deep & Sofa Clean',
    popular: true,
  },
  {
    id: 'cat_moving',
    name: 'Furniture Moving',
    categoryFilter: 'Services',
    group: 'services',
    icon: Truck,
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-700',
    tag: 'Lorry & Logistics',
  },
  {
    id: 'cat_ac_repair',
    name: 'AC Repair & Cooling',
    categoryFilter: 'Services',
    group: 'services',
    icon: Wind,
    iconBg: 'bg-cyan-50 border-cyan-100',
    iconColor: 'text-cyan-600',
    tag: 'Gas & Service',
    popular: true,
  },
  {
    id: 'cat_pest_control',
    name: 'Pest Control',
    categoryFilter: 'Services',
    group: 'services',
    icon: ShieldAlert,
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-700',
    tag: 'Termites & Insects',
  },
  {
    id: 'cat_maintenance',
    name: 'Maintenance & Repairs',
    categoryFilter: 'Services',
    group: 'services',
    icon: HardHat,
    iconBg: 'bg-yellow-50 border-yellow-100',
    iconColor: 'text-yellow-700',
    tag: 'Plumbing & Wiring',
    popular: true,
  },
  {
    id: 'cat_events',
    name: 'Events & Photography',
    categoryFilter: 'Services',
    group: 'lifestyle',
    icon: PartyPopper,
    iconBg: 'bg-pink-50 border-pink-100',
    iconColor: 'text-pink-600',
    tag: 'DJs, Photos & Decor',
  },
  {
    id: 'cat_education',
    name: 'Education & Tuition',
    categoryFilter: 'Services',
    group: 'lifestyle',
    icon: GraduationCap,
    iconBg: 'bg-violet-50 border-violet-100',
    iconColor: 'text-violet-600',
    tag: 'Classes & Coaching',
  },
  {
    id: 'cat_health',
    name: 'Health & Wellness',
    categoryFilter: 'Services',
    group: 'lifestyle',
    icon: HeartPulse,
    iconBg: 'bg-red-50 border-red-100',
    iconColor: 'text-red-600',
    tag: 'Fitness & Ayurvedic',
  },
  {
    id: 'cat_legal',
    name: 'Legal & Consultancy',
    categoryFilter: 'Services',
    group: 'lifestyle',
    icon: Scale,
    iconBg: 'bg-stone-50 border-stone-100',
    iconColor: 'text-stone-700',
    tag: 'Notaries & Advisory',
  },
  {
    id: 'cat_pets',
    name: 'Pet Services & Care',
    categoryFilter: 'Services',
    group: 'lifestyle',
    icon: Dog,
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-700',
    tag: 'Vet & Grooming',
  },
  {
    id: 'cat_tech',
    name: 'Tech & IT Solutions',
    categoryFilter: 'Electronics',
    group: 'lifestyle',
    icon: Laptop,
    iconBg: 'bg-slate-50 border-slate-100',
    iconColor: 'text-slate-700',
    tag: 'CCTV & PC Repair',
  },
  {
    id: 'cat_travel',
    name: 'Travel & Transport',
    categoryFilter: 'Services',
    group: 'lifestyle',
    icon: Plane,
    iconBg: 'bg-sky-50 border-sky-100',
    iconColor: 'text-sky-800',
    tag: 'Tours & Rentals',
  },
];

const EVENTS_DATA: EventItem[] = [];

interface HutaInPageProps {
  onBackToHome: () => void;
  onOpenPostAd: () => void;
  onSelectCategory?: (category: string) => void;
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  events?: EventItem[];
  isAdminLoggedIn?: boolean;
  onNavigateToAdminEvents?: () => void;
}

export const HutaInPage: React.FC<HutaInPageProps> = ({
  onBackToHome,
  onOpenPostAd,
  onSelectCategory,
  onToast,
  events = [],
  isAdminLoggedIn = false,
  onNavigateToAdminEvents,
}) => {
  const allEvents = events;
  const displaySpotlight = allEvents.filter((e) => e.isSpotlight);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [rsvpIds, setRsvpIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedEventModal, setSelectedEventModal] = useState<EventItem | null>(null);

  // Category Grid State
  const [categoryTab, setCategoryTab] = useState<'all' | 'marketplace' | 'services' | 'lifestyle'>('all');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const filteredCategories = HUTA_ALL_CATEGORIES.filter((cat) => {
    const matchesTab = categoryTab === 'all' || cat.group === categoryTab;
    const matchesSearch =
      cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
      cat.tag.toLowerCase().includes(categorySearchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCategoryClick = (cat: HutaCategoryItem) => {
    if (onToast) onToast(`Viewing ${cat.name} on Marketplace`, 'info');
    if (onSelectCategory) {
      onSelectCategory(cat.categoryFilter);
    } else {
      onBackToHome();
    }
  };

  const categories = ['All', 'Entertainment', 'Exhibitions', 'Food & Culture', 'Sports', 'Tech'];
  const districts = ['All', 'Colombo', 'Galle', 'Kandy', 'Jaffna', 'Negombo'];

  const filteredEvents = allEvents.filter((evt) => {
    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesDistrict = selectedDistrict === 'All' || evt.district === selectedDistrict;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDistrict && matchesSearch;
  });

  const handleToggleRSVP = (evt: EventItem) => {
    if (rsvpIds.includes(evt.id)) {
      setRsvpIds(rsvpIds.filter((id) => id !== evt.id));
      if (onToast) onToast(`Pass cancelled for ${evt.title}`, 'info');
    } else {
      setRsvpIds([...rsvpIds, evt.id]);
      if (onToast) onToast(`Pass confirmed for ${evt.title}! See you there.`, 'success');
    }
  };

  const handleToggleBookmark = (evtId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (bookmarkedIds.includes(evtId)) {
      setBookmarkedIds(bookmarkedIds.filter((id) => id !== evtId));
      if (onToast) onToast('Removed from saved events', 'info');
    } else {
      setBookmarkedIds([...bookmarkedIds, evtId]);
      if (onToast) onToast('Saved to your event shortlist!', 'success');
    }
  };

  const handleShare = (evt: EventItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({
          title: evt.title,
          text: `Check out ${evt.title} at ${evt.venue} on HUTA IN!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      if (onToast) onToast('Event link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] pb-32 animate-in fade-in duration-200">
      {/* 1. Header Hero Banner */}
      <div className="bg-[#111217] text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-[#2D2F39] relative overflow-hidden">
        {/* Ambient background aura */}
        <div className="absolute -top-10 right-10 w-96 h-96 bg-[#FF5A36]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              type="button"
              id="huta-in-back-btn"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A36]/15 border border-[#FF5A36]/30 text-[#FF5A36] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Events Hub</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                  HUTA
                </span>
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white bg-[#FF5A36] px-2.5 py-0.5 rounded-2xl tracking-tight leading-none shadow-lg shadow-[#FF5A36]/30">
                  IN
                </span>
              </div>
              <div className="mt-3">
                <DualToneHeading
                  as="h1"
                  size="lg"
                  theme="dark"
                  primaryText="Discover"
                  accentText={[
                    'Festivals & Expos 🎪',
                    'Weekend Happenings 🎉',
                    'Community Meetups 🤝',
                    'Live Island Events 🇱🇰',
                  ]}
                  suffixText="in Sri Lanka"
                  animationType="rotate"
                  rotationInterval={3500}
                  align="left"
                  showUnderline={false}
                  subtitle="Connect with local communities, reserve free and paid event passes, and explore weekend exhibitions across Colombo, Kandy, Galle, and beyond."
                  id="huta-in-dual-tone-heading"
                />
              </div>
            </div>

            {/* Event Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                id="huta-in-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event, venue or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181920] border border-[#2D2F39] text-white placeholder:text-gray-400 text-xs sm:text-sm focus:border-[#FF5A36] focus:ring-1 focus:ring-[#FF5A36] outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Upcoming Events Spotlight Banner (Horizontal Highlights) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${displaySpotlight.length > 0 ? 'bg-[#FF5A36] animate-pulse' : 'bg-gray-300'}`} />
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                Upcoming Spotlight
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400">
                {displaySpotlight.length} In Spotlight • {allEvents.length} Events
              </span>
              {isAdminLoggedIn && onNavigateToAdminEvents && (
                <button
                  type="button"
                  onClick={onNavigateToAdminEvents}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5A36] hover:text-[#E04826] bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-orange-200/60"
                  title="Manage and publish spotlight banners in Admin Portal"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Admin: Add Banner</span>
                </button>
              )}
            </div>
          </div>

          {displaySpotlight.length > 0 ? (
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
              {displaySpotlight.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventModal(evt)}
                  className="min-w-[260px] sm:min-w-[320px] rounded-2xl overflow-hidden relative shadow-sm hover:shadow-md border border-gray-100 group flex-shrink-0 cursor-pointer bg-gray-900"
                >
                  <div className="h-40 w-full relative">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Left Date Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1 text-center shadow-md">
                      <span className="block text-[9px] font-black text-[#FF5A36] uppercase leading-none">
                        {evt.month}
                      </span>
                      <span className="block text-sm font-black text-gray-900 leading-tight">
                        {evt.day}
                      </span>
                    </div>

                    {/* Price Tag */}
                    <div className="absolute top-3 right-3 bg-[#0A2540]/85 backdrop-blur-sm text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-white/15">
                      {evt.price}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-extrabold text-sm sm:text-base leading-tight line-clamp-1 group-hover:text-[#FF5A36] transition-colors">
                        {evt.title}
                      </h3>
                      <p className="text-[11px] text-gray-300 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 text-[#FF5A36] shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 p-6 sm:p-8 rounded-2xl bg-gray-50/60 border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-100/70 text-[#FF5A36] flex items-center justify-center mb-2.5 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-gray-900">
                No Spotlight Banners Featured Yet
              </h3>
              <p className="text-xs text-gray-500 max-w-md mt-1 leading-relaxed">
                Featured festivals, major expos, and premium event highlights will be pinned here.
              </p>
              {isAdminLoggedIn ? (
                <button
                  type="button"
                  onClick={onNavigateToAdminEvents}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Spotlight Banner in Admin Portal</span>
                </button>
              ) : (
                <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                  <span>Curated by HUTA Marketplace • Admin Managed</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Our Categories all in GRID view */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-gray-100">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center font-black shadow-xs">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Our Categories
                </h2>
                <span className="text-xs font-black bg-orange-100 text-[#FF5A36] px-2.5 py-0.5 rounded-full">
                  {filteredCategories.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                Browse verified marketplace classifieds, home repairs, and professional services across Sri Lanka in one place.
              </p>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Filter Tabs */}
              <div className="flex items-center bg-gray-100/90 p-1 rounded-2xl text-xs font-bold overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  id="huta-cat-tab-all"
                  onClick={() => setCategoryTab('all')}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    categoryTab === 'all'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  All ({HUTA_ALL_CATEGORIES.length})
                </button>
                <button
                  type="button"
                  id="huta-cat-tab-marketplace"
                  onClick={() => setCategoryTab('marketplace')}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    categoryTab === 'marketplace'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Marketplace
                </button>
                <button
                  type="button"
                  id="huta-cat-tab-services"
                  onClick={() => setCategoryTab('services')}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    categoryTab === 'services'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Home Services
                </button>
                <button
                  type="button"
                  id="huta-cat-tab-lifestyle"
                  onClick={() => setCategoryTab('lifestyle')}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    categoryTab === 'lifestyle'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Professional
                </button>
              </div>

              {/* Category Search */}
              <div className="relative w-full sm:w-52">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  id="huta-cat-search"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Filter categories..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#FF5A36] focus:bg-white outline-none transition-all shadow-xs"
                />
                {categorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCategorySearchQuery('')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* GRID View */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
            {filteredCategories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  id={`huta-cat-card-${cat.id}`}
                  whileHover={{ y: -3, scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategoryClick(cat)}
                  className="group bg-white rounded-2xl p-4 border border-gray-200/80 hover:border-[#FF5A36]/40 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Subtle hover top border line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-[#FF5A36] transition-colors" />

                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-12 h-12 rounded-2xl border ${cat.iconBg} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                      <IconComp className={`w-6 h-6 ${cat.iconColor}`} />
                    </div>
                    {cat.popular && (
                      <span className="text-[10px] font-black uppercase text-[#FF5A36] bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100/60">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="mt-3.5">
                    <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 group-hover:text-[#FF5A36] transition-colors leading-snug line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-1 truncate">
                      {cat.tag}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400 group-hover:text-[#FF5A36] transition-colors">
                    <span>View ads</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-gray-600">No categories found matching "{categorySearchQuery}"</p>
              <button
                type="button"
                onClick={() => {
                  setCategorySearchQuery('');
                  setCategoryTab('all');
                }}
                className="mt-3 px-4 py-2 text-xs font-extrabold text-[#FF5A36] bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Upcoming Events & Community Exhibitions Directory */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FF5A36]" />
              <span>Upcoming Festivals & Events</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Explore scheduled expos, concerts, beach festivals, and weekend gatherings
            </p>
          </div>
          {isAdminLoggedIn && onNavigateToAdminEvents && (
            <button
              type="button"
              onClick={onNavigateToAdminEvents}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Admin: Add Event</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Filter Controls & View Switcher Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-4">
        {/* District and Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0A2540] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Mode Toggle & Results Count */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <span className="text-xs font-bold text-gray-500">
              Showing <span className="text-gray-900 font-extrabold">{filteredEvents.length}</span> events
            </span>

            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                type="button"
                id="view-grid-btn"
                onClick={() => setViewMode('grid')}
                title="Cards Grid View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#0A2540] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="view-compact-btn"
                onClick={() => setViewMode('compact')}
                title="Compact List View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-[#0A2540] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* District Quick Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-gray-400 font-bold flex items-center gap-1 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>Region:</span>
          </span>
          {districts.map((dist) => (
            <button
              key={dist}
              type="button"
              onClick={() => setSelectedDistrict(dist)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedDistrict === dist
                  ? 'bg-[#FF5A36] text-white shadow-xs'
                  : 'bg-white/80 hover:bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {dist}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Events Display Grid (Crafted for High Visibility & Aesthetics) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {filteredEvents.length === 0 ? (
          allEvents.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-dashed border-gray-200 shadow-sm max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF5A36] flex items-center justify-center mx-auto shadow-xs">
                <Calendar className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-black text-gray-900">No Upcoming Festivals & Events</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
                There are currently no events or festivals scheduled. As soon as community exhibitions, expos, and festivals are announced, they will appear here.
              </p>
              {isAdminLoggedIn ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onNavigateToAdminEvents}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Event via Admin Portal</span>
                  </button>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Logged in as Admin • Only admins can create and publish events
                  </p>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Curated & verified by HUTA Marketplace Admin</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF5A36] flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">No matching events found</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                We couldn't find events matching your selected filters. Try choosing "All" or clear your search term.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedDistrict('All');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0A2540] text-white text-xs font-bold hover:bg-[#112f50] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )
        ) : viewMode === 'grid' ? (
          /* High-Visibility Card Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredEvents.map((evt) => {
              const hasRsvp = rsvpIds.includes(evt.id);
              const isBookmarked = bookmarkedIds.includes(evt.id);

              return (
                <motion.article
                  key={evt.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedEventModal(evt)}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group"
                >
                  {/* Event Cover Image with Ticket Date Stamp & Badges */}
                  <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Ticket Date Stamp Box (Classic event pass format) */}
                    <div className="absolute top-3.5 left-3.5 bg-white rounded-2xl shadow-lg border border-gray-100/80 p-1.5 min-w-[50px] text-center z-10">
                      <span className="block text-[10px] font-black text-[#FF5A36] uppercase tracking-wider leading-none">
                        {evt.month}
                      </span>
                      <span className="block text-base font-black text-gray-900 leading-none mt-1">
                        {evt.day}
                      </span>
                    </div>

                    {/* Category & Badge */}
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(evt.id, e)}
                        title="Bookmark event"
                        className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                          isBookmarked
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-black/40 hover:bg-black/60 text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom overlay: Price Tag & District */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white z-10">
                      <span
                        className={`text-[11px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm ${
                          evt.isFree
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#0A2540]/90 text-white border border-white/20'
                        }`}
                      >
                        {evt.price}
                      </span>

                      <span className="text-[11px] font-bold text-gray-200 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md">
                        {evt.district}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Timing & Category */}
                      <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                        <span className="text-[#FF5A36] font-bold uppercase tracking-wider text-[11px]">
                          {evt.category}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{evt.time.split('-')[0].trim()}</span>
                        </div>
                      </div>

                      {/* Event Title */}
                      <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-snug group-hover:text-[#FF5A36] transition-colors line-clamp-2">
                        {evt.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>

                      {/* Venue & Expected Crowd */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate font-medium">{evt.venue}</span>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-gray-700 shrink-0">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span>{evt.attendees}+</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        id={`rsvp-btn-${evt.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRSVP(evt);
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          hasRsvp
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-extrabold shadow-sm'
                            : 'bg-[#FF5A36] hover:bg-[#E04826] active:scale-95 text-white shadow-md shadow-[#FF5A36]/20'
                        }`}
                      >
                        {hasRsvp ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                            <span>RSVP Confirmed</span>
                          </>
                        ) : (
                          <>
                            <Ticket className="w-4 h-4 stroke-[2.5]" />
                            <span>Get Passes / RSVP</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShare(evt, e)}
                        title="Share event"
                        className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          /* Compact List View */
          <div className="space-y-3.5">
            {filteredEvents.map((evt) => {
              const hasRsvp = rsvpIds.includes(evt.id);

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventModal(evt)}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Date Badge */}
                    <div className="bg-[#111217] text-white rounded-xl p-2.5 min-w-[56px] text-center shrink-0">
                      <span className="block text-[10px] font-black text-[#FF5A36] uppercase leading-none">
                        {evt.month}
                      </span>
                      <span className="block text-base font-black leading-none mt-1">
                        {evt.day}
                      </span>
                    </div>

                    <div className="h-16 w-20 sm:w-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      <img
                        src={evt.image}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#FF5A36] uppercase">
                          {evt.category}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs font-bold text-gray-500">{evt.district}</span>
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base text-gray-900 truncate group-hover:text-[#FF5A36] transition-colors">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {evt.venue} • {evt.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        evt.isFree ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {evt.price}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRSVP(evt);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        hasRsvp
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-[#FF5A36] hover:bg-[#E04826] text-white shadow-sm'
                      }`}
                    >
                      {hasRsvp ? 'RSVP Confirmed' : 'Get Pass'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Interactive Event Details Modal */}
      <AnimatePresence>
        {selectedEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl overflow-hidden max-w-xl w-full shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col"
            >
              {/* Modal Cover Image */}
              <div className="relative h-60 w-full shrink-0">
                <img
                  src={selectedEventModal.image}
                  alt={selectedEventModal.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                <button
                  type="button"
                  onClick={() => setSelectedEventModal(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute top-4 left-4 bg-white rounded-xl px-2.5 py-1 shadow-md text-center">
                  <span className="block text-[10px] font-black text-[#FF5A36] uppercase leading-none">
                    {selectedEventModal.month}
                  </span>
                  <span className="block text-base font-black text-gray-900 leading-none mt-0.5">
                    {selectedEventModal.day}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-bold text-[#FF5A36] uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded">
                    {selectedEventModal.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-1 leading-tight">
                    {selectedEventModal.title}
                  </h2>
                  <p className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5A36]" />
                    <span>{selectedEventModal.venue}, {selectedEventModal.location}</span>
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                {/* Event Highlights Grid */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">Date & Schedule</span>
                    <span className="font-extrabold text-gray-900 block mt-0.5">
                      {selectedEventModal.date}
                    </span>
                    <span className="text-gray-500 font-medium block">
                      {selectedEventModal.time}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Pass Pricing</span>
                    <span className="font-extrabold text-[#FF5A36] text-sm block mt-0.5">
                      {selectedEventModal.price}
                    </span>
                    <span className="text-gray-500 font-medium block">
                      Expected {selectedEventModal.attendees}+ visitors
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-1.5">
                    About This Event
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedEventModal.description}
                  </p>
                </div>

                {/* Organizer Info */}
                <div className="flex items-center justify-between text-xs py-3 border-t border-b border-gray-100">
                  <div>
                    <span className="text-gray-400 block">Organized By</span>
                    <span className="font-bold text-gray-800">{selectedEventModal.organizer}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block">District</span>
                    <span className="font-bold text-[#0A2540]">{selectedEventModal.district}</span>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleToggleRSVP(selectedEventModal)}
                    className={`flex-1 py-3 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      rsvpIds.includes(selectedEventModal.id)
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-[#FF5A36] hover:bg-[#E04826] text-white shadow-lg shadow-[#FF5A36]/30'
                    }`}
                  >
                    {rsvpIds.includes(selectedEventModal.id) ? (
                      <>
                        <Check className="w-5 h-5 stroke-[3]" />
                        <span>Pass Confirmed & Saved</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-5 h-5 stroke-[2.5]" />
                        <span>Confirm RSVP / Get Free Pass</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(selectedEventModal)}
                    className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                    title="Share with friends"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
