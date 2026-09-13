import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Search,
  Wrench,
  Sparkles,
  Truck,
  Wind,
  ShieldAlert,
  HardHat,
  PartyPopper,
  GraduationCap,
  Shirt,
  HeartPulse,
  Scale,
  Dog,
  Laptop,
  Plane,
  Car,
  Bike,
  Smartphone,
  Home,
  Sofa,
  Briefcase,
  PackageCheck,
  ChevronRight
} from 'lucide-react';
import { Listing } from '../types';

interface AllCategoriesPageProps {
  onBack: () => void;
  onSelectCategory: (category: string, query?: string) => void;
  listings: Listing[];
}

interface ServiceItem {
  id: string;
  name: string;
  categoryFilter: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  badge?: string;
}

const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'automotive',
    name: 'Automotive Services',
    categoryFilter: 'Services',
    icon: Car,
    gradient: 'from-amber-50 to-orange-50 border-amber-200/60',
    iconColor: 'text-amber-600',
  },
  {
    id: 'cleaning',
    name: 'Cleaning Services',
    categoryFilter: 'Services',
    icon: Sparkles,
    gradient: 'from-sky-50 to-blue-50 border-sky-200/60',
    iconColor: 'text-sky-600',
  },
  {
    id: 'moving',
    name: 'Furniture Moving',
    categoryFilter: 'Services',
    icon: Truck,
    gradient: 'from-amber-50 to-yellow-50 border-amber-200/60',
    iconColor: 'text-amber-700',
  },
  {
    id: 'ac_repair',
    name: 'AC Repair',
    categoryFilter: 'Services',
    icon: Wind,
    gradient: 'from-cyan-50 to-teal-50 border-cyan-200/60',
    iconColor: 'text-cyan-600',
  },
  {
    id: 'pest_control',
    name: 'Pest Control',
    categoryFilter: 'Services',
    icon: ShieldAlert,
    gradient: 'from-emerald-50 to-green-50 border-emerald-200/60',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'maintenance',
    name: 'Maintenance Services',
    categoryFilter: 'Services',
    icon: HardHat,
    gradient: 'from-yellow-50 to-amber-50 border-yellow-200/60',
    iconColor: 'text-yellow-600',
  },
  {
    id: 'events',
    name: 'Events Services',
    categoryFilter: 'Services',
    icon: PartyPopper,
    gradient: 'from-pink-50 to-rose-50 border-pink-200/60',
    iconColor: 'text-pink-600',
  },
  {
    id: 'education',
    name: 'Education & Coaching',
    categoryFilter: 'Services',
    icon: GraduationCap,
    gradient: 'from-indigo-50 to-violet-50 border-indigo-200/60',
    iconColor: 'text-indigo-600',
  },
  {
    id: 'fashion',
    name: 'Fashion & Styling',
    categoryFilter: 'Fashion & Preloved',
    icon: Shirt,
    gradient: 'from-red-50 to-rose-50 border-red-200/60',
    iconColor: 'text-red-600',
  },
  {
    id: 'wellness',
    name: 'Health & Wellness',
    categoryFilter: 'Services',
    icon: HeartPulse,
    gradient: 'from-teal-50 to-emerald-50 border-teal-200/60',
    iconColor: 'text-teal-600',
  },
  {
    id: 'legal',
    name: 'Legal & Consultancy',
    categoryFilter: 'Services',
    icon: Scale,
    gradient: 'from-amber-50 to-orange-50 border-amber-200/60',
    iconColor: 'text-amber-800',
  },
  {
    id: 'pets',
    name: 'Pet Services',
    categoryFilter: 'Services',
    icon: Dog,
    gradient: 'from-blue-50 to-indigo-50 border-blue-200/60',
    iconColor: 'text-blue-600',
  },
  {
    id: 'tech',
    name: 'Tech Services',
    categoryFilter: 'Electronics',
    icon: Laptop,
    gradient: 'from-slate-50 to-gray-100 border-slate-200/60',
    iconColor: 'text-slate-700',
  },
  {
    id: 'travel',
    name: 'Travel & Transport',
    categoryFilter: 'Services',
    icon: Plane,
    gradient: 'from-sky-50 to-cyan-50 border-sky-200/60',
    iconColor: 'text-sky-700',
  },
];

const CLASSIFIEDS_LIST = [
  { id: 'preloved', name: 'Preloved & Fashion', categoryFilter: 'Fashion & Preloved', icon: PackageCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'vehicles', name: 'Vehicles & Cars', categoryFilter: 'Vehicles', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'motorcycles', name: 'Motorcycles & Bikes', categoryFilter: 'Motorcycles', icon: Bike, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'electronics', name: 'Electronics & Mobiles', categoryFilter: 'Electronics', icon: Smartphone, color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'property', name: 'Property & Houses', categoryFilter: 'Property', icon: Home, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'furniture', name: 'Home & Furniture', categoryFilter: 'Home & Garden', icon: Sofa, color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'jobs', name: 'Jobs & Careers', categoryFilter: 'Jobs', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

export const AllCategoriesPage: React.FC<AllCategoriesPageProps> = ({
  onBack,
  onSelectCategory,
  listings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate live item counts per category
  const categoryCounts = listings.reduce((acc, item) => {
    if (item.status === 'approved') {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredServices = SERVICES_LIST.filter((srv) =>
    srv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClassifieds = CLASSIFIEDS_LIST.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryClick = (categoryFilter: string, searchKeyword?: string) => {
    onSelectCategory(categoryFilter, searchKeyword);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 animate-in fade-in duration-200">
      {/* 1. Deep Navy Header Bar (Exactly matching Image 2 IMG_5248.png) */}
      <header className="sticky top-0 z-30 bg-[#0A2540] text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button
            type="button"
            id="categories-back-btn"
            onClick={onBack}
            className="flex items-center gap-2 p-1.5 -ml-2 rounded-xl text-white hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            <span className="font-bold text-lg sm:text-xl tracking-tight">All Categories</span>
          </button>

          <span className="text-xs text-blue-200 font-medium hidden sm:inline">
            HUTA.lk Marketplace
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-7">
        {/* Quick Search in Categories */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            id="category-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories & services..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm text-sm focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* 2. Top Classifieds & Preloved Section */}
        {filteredClassifieds.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-[#0A2540]">
                Classifieds & Preloved
              </h2>
              <span className="text-xs text-gray-400">Sri Lanka</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filteredClassifieds.map((cat) => {
                const Icon = cat.icon;
                const count = categoryCounts[cat.categoryFilter] || 0;
                return (
                  <motion.div
                    key={cat.id}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleCategoryClick(cat.categoryFilter)}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-3 group"
                  >
                    <div className={`w-11 h-11 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-800 truncate group-hover:text-[#FF5A36] transition-colors">
                        {cat.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {count} {count === 1 ? 'Ad' : 'Ads'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Services Grid Section (Matching Image 2 IMG_5248.png exactly) */}
        {filteredServices.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-[#0A2540]">
                Services
              </h2>
              <span className="text-xs text-gray-400">Professional Directory</span>
            </div>

            {/* Exact 4-column layout as seen in Image 2 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-3 sm:gap-4">
              {filteredServices.map((service) => {
                const Icon = service.icon;
                const matchCount = listings.filter(
                  (l) =>
                    l.status === 'approved' &&
                    (l.category.toLowerCase() === 'services' || l.serviceTrade?.toLowerCase() === service.name.toLowerCase()) &&
                    (l.title.toLowerCase().includes(service.name.toLowerCase()) ||
                     l.description.toLowerCase().includes(service.name.toLowerCase()) ||
                     l.serviceTrade?.toLowerCase().includes(service.name.toLowerCase()))
                ).length;

                return (
                  <motion.div
                    key={service.id}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleCategoryClick('Services', service.name)}
                    className="flex flex-col items-center text-center cursor-pointer group relative"
                  >
                    {/* White squircle container with soft drop shadow */}
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-center p-3 relative group-hover:shadow-lg transition-all group-hover:border-blue-100 bg-gradient-to-b ${service.gradient}`}
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${service.iconColor} stroke-[1.75]`} />
                      </div>

                      {matchCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-[#FF5A36] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                          {matchCount}
                        </span>
                      )}
                    </div>

                    {/* Category Label underneath */}
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-[#0A2540] mt-2 max-w-[100px] sm:max-w-[110px] leading-tight line-clamp-2 transition-colors">
                      {service.name}
                    </span>
                    <span className="text-[10px] text-gray-400 group-hover:text-[#FF5A36] mt-0.5 transition-colors">
                      {matchCount > 0 ? `${matchCount} Available` : 'Browse & Quote'}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Need custom help banner */}
        <div className="mt-8 p-5 bg-gradient-to-r from-[#0A2540] to-[#143B64] text-white rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-extrabold text-base sm:text-lg">Are you a service provider?</h3>
            <p className="text-xs text-blue-200">
              Post your business or service ad on HUTA for free and reach thousands across Sri Lanka.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleCategoryClick('Services')}
            className="px-5 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold rounded-xl text-xs sm:text-sm whitespace-nowrap shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>Browse All Services</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
