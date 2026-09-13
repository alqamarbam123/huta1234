import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Listing, User, ViewTab, EventItem, HeroAd, HeroAdSettings } from './types';
import { api } from './services/api';

// Components
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { CategoryGrid } from './components/CategoryGrid';
import { ListingsSection } from './components/ListingsSection';
import { AdDetailModal } from './components/AdDetailModal';
import { PostAdModal } from './components/PostAdModal';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { AuthModals } from './components/AuthModals';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Footer } from './components/Footer';
import { ChatDrawer } from './components/ChatDrawer';
import { BottomNav } from './components/BottomNav';
import { AllCategoriesPage } from './components/AllCategoriesPage';
import { HutaInPage } from './components/HutaInPage';
import { MorePage } from './components/MorePage';
import { CompareModal } from './components/CompareModal';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { AppStoreModal } from './components/AppStoreModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { testConnection } from './firebase';
import { MapPin, Sparkles, PlusCircle, Calendar, ArrowRight, Star } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<ViewTab>('marketplace');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Data State
  const [listings, setListings] = useState<Listing[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [heroAds, setHeroAds] = useState<HeroAd[]>([]);
  const [heroSettings, setHeroSettings] = useState<HeroAdSettings>({
    mode: 'default',
    rotationIntervalSeconds: 6,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Real-time Chat State (Firebase Firestore)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatTargetListing, setChatTargetListing] = useState<Listing | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Sri Lanka');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modals
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isPostAdOpen, setIsPostAdOpen] = useState<boolean>(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [targetListingForEdit, setTargetListingForEdit] = useState<Listing | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [isAppStoreOpen, setIsAppStoreOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Side-by-Side Comparison State
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('huta_compare_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Save comparison IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('huta_compare_ids', JSON.stringify(compareIds));
    } catch {
      // ignore
    }
  }, [compareIds]);

  // Derive compared listings objects
  const compareListings = useMemo(() => {
    return listings.filter((item) => compareIds.includes(item.id));
  }, [listings, compareIds]);

  const handleToggleCompare = useCallback((listing: Listing) => {
    setCompareIds((prev) => {
      if (prev.includes(listing.id)) {
        showToast(`Removed "${listing.title.substring(0, 24)}..." from comparison`, 'info');
        return prev.filter((id) => id !== listing.id);
      } else {
        if (prev.length >= 4) {
          showToast('You can compare up to 4 ads at once. Remove one to add another.', 'error');
          return prev;
        }
        showToast(`Added "${listing.title.substring(0, 24)}..." to comparison`, 'success');
        return [...prev, listing.id];
      }
    });
  }, [showToast]);

  const handleRemoveFromCompare = useCallback((id: string) => {
    setCompareIds((prev) => prev.filter((item) => item !== id));
  }, []);

  const handleClearCompare = useCallback(() => {
    setCompareIds([]);
    showToast('Comparison cleared', 'info');
  }, [showToast]);

  // Initial Data & Session Load
  useEffect(() => {
    // 1. Session check
    const user = api.getCurrentUser();
    if (user) setCurrentUser(user);

    const adminAuth = api.isAdmin();
    setIsAdminLoggedIn(adminAuth);

    // 2. Favorites check
    try {
      const storedFavs = localStorage.getItem('huta_favorites');
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
    } catch {
      // ignore
    }

    // 3. Fetch listings, events & hero ads
    fetchListings();
    fetchEvents();
    fetchHeroAds();

    // 4. Test Firebase Firestore connection
    testConnection();
  }, []);

  const fetchHeroAds = async () => {
    try {
      const data = await api.getHeroAds();
      if (data) {
        if (data.settings) setHeroSettings(data.settings);
        if (Array.isArray(data.ads)) setHeroAds(data.ads);
      }
    } catch {
      // Graceful fallback
    }
  };

  const handleUpdateHeroSettings = async (newSettings: Partial<HeroAdSettings>) => {
    try {
      const updated = await api.updateHeroAdSettings(newSettings);
      setHeroSettings(updated);
      showToast(
        updated.mode === 'default'
          ? 'Hero set to default marketplace welcome'
          : updated.mode === 'rotate'
          ? 'Hero rotation mode enabled!'
          : 'Hero promotional ads mode enabled!',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update hero settings';
      showToast(msg, 'error');
    }
  };

  const handleCreateHeroAd = async (ad: Partial<HeroAd>) => {
    try {
      const created = await api.createHeroAd(ad);
      setHeroAds((prev) => [created, ...prev]);
      showToast('Hero Animated Ad published successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create hero ad';
      showToast(msg, 'error');
    }
  };

  const handleUpdateHeroAd = async (id: string, ad: Partial<HeroAd>) => {
    try {
      const updated = await api.updateHeroAd(id, ad);
      setHeroAds((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast('Hero Animated Ad updated!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update hero ad';
      showToast(msg, 'error');
    }
  };

  const handleToggleHeroAd = async (id: string) => {
    try {
      const updated = await api.toggleHeroAd(id);
      setHeroAds((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast(
        updated.isActive ? 'Hero Ad is now live on marketplace!' : 'Hero Ad paused (inactive)',
        'info'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle hero ad';
      showToast(msg, 'error');
    }
  };

  const handleDeleteHeroAd = async (id: string) => {
    try {
      await api.deleteHeroAd(id);
      setHeroAds((prev) => prev.filter((a) => a.id !== id));
      showToast('Hero Ad deleted', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete hero ad';
      showToast(msg, 'error');
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents();
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch {
      // Graceful fallback without noisy errors
    }
  };

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getListings({ status: 'all' });
      setListings(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not fetch advertisements';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering & Sorting Logic
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Public marketplace view STRICTLY shows approved listings (pending ads require admin confirmation)
    result = result.filter((item) => item.status === 'approved');

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Location Filter
    if (selectedLocation !== 'All Sri Lanka') {
      result = result.filter(
        (item) => item.location.toLowerCase() === selectedLocation.toLowerCase()
      );
    }

    // Keyword Search
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query)
      );
    }

    // Price Range Filter
    const min = parseFloat(minPrice);
    if (!isNaN(min) && min >= 0) {
      result = result.filter((item) => item.price >= min);
    }

    const max = parseFloat(maxPrice);
    if (!isNaN(max) && max > 0) {
      result = result.filter((item) => item.price <= max);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'views') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      // default: newest first
      result.sort((a, b) => new Date(b.date || (b as any).createdAt || 0).getTime() - new Date(a.date || (a as any).createdAt || 0).getTime());
    }

    // Keep featured ads on top
    result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    return result;
  }, [listings, currentTab, selectedCategory, selectedLocation, searchTerm, minPrice, maxPrice, sortBy]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    selectedCategory !== 'All' ||
    selectedLocation !== 'All Sri Lanka' ||
    minPrice ||
    maxPrice
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLocation('All Sri Lanka');
    setMinPrice('');
    setMaxPrice('');
  };

  // Favorites Toggle
  const handleToggleFavorite = (adId: string) => {
    let updated: string[];
    if (favorites.includes(adId)) {
      updated = favorites.filter((id) => id !== adId);
      showToast('Removed from saved favorites', 'info');
    } else {
      updated = [...favorites, adId];
      showToast('Saved to your favorites!', 'success');
    }
    setFavorites(updated);
    try {
      localStorage.setItem('huta_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Listing Selection (Ad Detail)
  const handleSelectListing = async (listing: Listing) => {
    setSelectedListing(listing);
    // Fetch fresh details (which also increments views count on server)
    try {
      const fresh = await api.getListing(listing.id);
      setSelectedListing(fresh);
      // Update in local list too
      setListings((prev) =>
        prev.map((item) => (item.id === fresh.id ? fresh : item))
      );
    } catch {
      // ignore view error
    }
  };

  // Post / Edit Ad
  const handleOpenPostAd = () => {
    setEditingListing(null);
    setIsPostAdOpen(true);
  };

  const handleEditListing = (listing: Listing) => {
    setSelectedListing(null);
    setEditingListing(listing);
    setIsPostAdOpen(true);
  };

  const handleSubmitAd = async (adData: Partial<Listing>, isEditId?: string): Promise<Listing> => {
    try {
      if (isEditId) {
        const updated = await api.updateListing(isEditId, adData);
        setListings((prev) =>
          prev.map((item) => (item.id === isEditId ? updated : item))
        );
        if (selectedListing?.id === isEditId) {
          setSelectedListing(updated);
        }
        showToast('Advertisement updated successfully!', 'success');
        setIsPostAdOpen(false);
        setEditingListing(null);
        return updated;
      } else {
        const created = await api.createListing({
          ...adData,
          userId: currentUser ? currentUser.id : undefined,
        });
        api.addGuestListingId(created.id);
        setListings((prev) => [created, ...prev]);

        if (created.status === 'approved') {
          showToast('Advertisement published live immediately!', 'success');
        } else {
          showToast(
            'Advertisement submitted! It is now pending admin confirmation and will go live once approved.',
            'info'
          );
        }
        return created;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save advertisement';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Delete Ad
  const handleDeleteListing = async (adId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this advertisement?')) {
      return;
    }

    try {
      await api.deleteListing(adId);
      setListings((prev) => prev.filter((item) => item.id !== adId));
      if (selectedListing?.id === adId) {
        setSelectedListing(null);
      }
      showToast('Advertisement removed successfully.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not delete advertisement';
      showToast(msg, 'error');
    }
  };

  // Admin Actions
  const handleApproveListing = async (adId: string) => {
    try {
      const updated = await api.approveListing(adId);
      setListings((prev) =>
        prev.map((item) => (item.id === adId ? updated : item))
      );
      showToast('Advertisement approved and is now live!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve advertisement';
      showToast(msg, 'error');
    }
  };

  const handleRejectListing = async (adId: string) => {
    try {
      const updated = await api.rejectListing(adId);
      setListings((prev) =>
        prev.map((item) => (item.id === adId ? updated : item))
      );
      showToast('Advertisement marked as rejected.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject advertisement';
      showToast(msg, 'error');
    }
  };

  const handleToggleFeatureListing = async (adId: string) => {
    try {
      const updated = await api.toggleFeatureListing(adId);
      setListings((prev) =>
        prev.map((item) => (item.id === adId ? updated : item))
      );
      showToast(
        updated.isFeatured
          ? 'Featured status enabled! This ad will now appear on top.'
          : 'Featured status removed.',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle featured status';
      showToast(msg, 'error');
    }
  };

  const handleToggleVerifyPro = async (id: string) => {
    try {
      const updated = await api.toggleVerifyPro(id);
      setListings((prev) => prev.map((l) => (l.id === id ? updated : l)));
      showToast(
        updated.isVerifiedPro
          ? 'Service verified as HUTA Verified Pro! 🛡️'
          : 'Service Verified Pro status removed',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle Verified Pro status';
      showToast(msg, 'error');
    }
  };

  // Auth Handlers
  const handleUserAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Logged in as ${user.fullname || user.username}`, 'success');
    // Refresh listings to reflect claimed ownership
    fetchListings();

    // If login was initiated to edit a specific ad:
    if (targetListingForEdit) {
      const adToEdit = targetListingForEdit;
      setTargetListingForEdit(null);
      setIsUserAuthOpen(false);
      handleEditListing(adToEdit);
      showToast(`Ad editing mode enabled for "${adToEdit.title.substring(0, 24)}..."`, 'info');
    }
  };

  const handleLogoutUser = () => {
    api.userLogout();
    setCurrentUser(null);
    if (currentTab === 'user_dashboard') {
      setCurrentTab('marketplace');
    }
    showToast('You have been logged out.', 'info');
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentTab('admin_dashboard');
    showToast('Admin logged in successfully.', 'success');
  };

  const handleLogoutAdmin = () => {
    api.adminLogout();
    setIsAdminLoggedIn(false);
    if (currentTab === 'admin_dashboard') {
      setCurrentTab('marketplace');
    }
    showToast('Admin session ended.', 'info');
  };

  // Share Link
  const handleCopyShareLink = (listing: Listing) => {
    const text = `${listing.title} - ${listing.location} on HUTA Sri Lanka Marketplace. Tel: ${listing.phone}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Listing details copied to clipboard!', 'success');
    } else {
      showToast(text, 'info');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F7] text-[#181920] pb-16 lg:pb-0">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          setCurrentTab('marketplace');
          setTimeout(() => {
            const el = document.getElementById('marketplace-listings');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
        onOpenPostAd={handleOpenPostAd}
        onOpenUserAuth={() => setIsUserAuthOpen(true)}
        currentUser={currentUser}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        activeCategory={selectedCategory}
        onOpenAppStore={() => setIsAppStoreOpen(true)}
      />

      {/* Main Views Container */}
      <main className="flex-1">
        {currentTab === 'marketplace' && (
          <div>
            {/* Search Header Banner */}
            <HeroSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              minPrice={minPrice}
              onMinPriceChange={setMinPrice}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              heroAds={heroAds}
              heroSettings={heroSettings}
              onOpenPostAd={handleOpenPostAd}
              isAdminLoggedIn={isAdminLoggedIn}
              onAdminManage={() => setCurrentTab('admin_dashboard')}
            />

            {/* Category Browser */}
            <CategoryGrid
              currentCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              listings={listings}
              onViewAllCategories={() => setCurrentTab('categories')}
            />

            {/* Qatar Living style Browse Districts Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
              <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
                <span className="flex items-center gap-1.5 text-gray-700 font-bold whitespace-nowrap shrink-0 px-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5A36]" />
                  <span>Popular Districts:</span>
                </span>
                {[
                  'All Sri Lanka',
                  'Colombo',
                  'Gampaha',
                  'Kandy',
                  'Galle',
                  'Kalutara',
                  'Kurunegala',
                  'Jaffna',
                  'Matara',
                  'Anuradhapura',
                  'Negombo',
                ].map((dist) => {
                  const isActive = selectedLocation === dist;
                  return (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => setSelectedLocation(dist)}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#111217] text-[#FF5A36] border border-[#FF5A36] shadow-xs'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                      }`}
                    >
                      {dist}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Classified Advertisements Grid */}
            <ListingsSection
              listings={filteredListings}
              sortBy={sortBy}
              onSortChange={setSortBy}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelectListing={handleSelectListing}
              isLoading={isLoading}
              onOpenPostAd={handleOpenPostAd}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
              currentCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              compareIds={compareIds}
              onToggleCompare={handleToggleCompare}
            />

            {/* HUTA IN Community & Events Hub Teaser Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
              <div className="bg-[#111217] border border-[#2D2F39] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#FF5A36]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-2 text-center md:text-left z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A36]/15 text-[#FF5A36] text-xs font-bold border border-[#FF5A36]/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>HUTA IN • Community & Events Hub</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    Upcoming Expos, Cultural Festivals & Auto Shows in Sri Lanka
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
                    Discover handpicked local events, motor exhibitions, food carnivals, and cultural celebrations across Sri Lanka.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentTab('huta_in')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Explore HUTA IN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Qatar Living style Post-An-Ad Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5A36] uppercase tracking-wider">
                    <span>Direct Buyer-Seller Connection</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    Have something to sell or rent in Sri Lanka?
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-lg">
                    Post your ad for free in 60 seconds with AI assistance. Connect with verified buyers directly via WhatsApp and phone call.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenPostAd}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Post Free Advertisement</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'huta_in' && (
          <HutaInPage
            events={events}
            isAdminLoggedIn={isAdminLoggedIn}
            onNavigateToAdminEvents={() => {
              if (isAdminLoggedIn) {
                setCurrentTab('admin_dashboard');
              } else {
                setIsAdminLoginOpen(true);
              }
            }}
            onBackToHome={() => setCurrentTab('marketplace')}
            onOpenPostAd={handleOpenPostAd}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentTab('marketplace');
            }}
            onToast={showToast}
          />
        )}

        {currentTab === 'categories' && (
          <AllCategoriesPage
            onBack={() => setCurrentTab('marketplace')}
            onSelectCategory={(cat, query) => {
              setSelectedCategory(cat);
              if (query) {
                setSearchTerm(query);
              } else {
                setSearchTerm('');
              }
              setCurrentTab('marketplace');
            }}
            listings={listings}
          />
        )}

        {currentTab === 'more' && (
          <MorePage
            currentUser={currentUser}
            isAdminLoggedIn={isAdminLoggedIn}
            favoritesCount={favorites.length}
            onSelectTab={(tab) => setCurrentTab(tab)}
            onOpenUserAuth={() => setIsUserAuthOpen(true)}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            onOpenPostAd={handleOpenPostAd}
            onOpenAppStore={() => setIsAppStoreOpen(true)}
            onOpenChat={() => {
              setChatTargetListing(null);
              setIsChatOpen(true);
            }}
            onChangePassword={() => setIsChangePasswordOpen(true)}
            onLogoutUser={handleLogoutUser}
            onLogoutAdmin={handleLogoutAdmin}
            onBackToHome={() => setCurrentTab('marketplace')}
            onToast={showToast}
          />
        )}

        {currentTab === 'user_dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            isAdminLoggedIn={isAdminLoggedIn}
            listings={listings}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onEditListing={handleEditListing}
            onDeleteListing={handleDeleteListing}
            onSelectListing={handleSelectListing}
            onOpenPostAd={handleOpenPostAd}
            onOpenAppStore={() => setIsAppStoreOpen(true)}
            onChangePassword={() => setIsChangePasswordOpen(true)}
            onLogoutUser={handleLogoutUser}
            onBackToMarketplace={() => setCurrentTab('marketplace')}
            onOpenUserAuth={() => setIsUserAuthOpen(true)}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            onOpenAdminDashboard={() => setCurrentTab('admin_dashboard')}
            onOpenChat={() => {
              setChatTargetListing(null);
              setIsChatOpen(true);
            }}
            onSelectTab={(tab) => setCurrentTab(tab)}
            onToast={showToast}
          />
        )}

        {currentTab === 'admin_dashboard' && (
          <AdminDashboard
            listings={listings}
            events={events}
            heroAds={heroAds}
            heroSettings={heroSettings}
            onUpdateHeroSettings={handleUpdateHeroSettings}
            onCreateHeroAd={handleCreateHeroAd}
            onUpdateHeroAd={handleUpdateHeroAd}
            onToggleHeroAd={handleToggleHeroAd}
            onDeleteHeroAd={handleDeleteHeroAd}
            onApprove={handleApproveListing}
            onReject={handleRejectListing}
            onToggleFeature={handleToggleFeatureListing}
            onToggleVerifyPro={handleToggleVerifyPro}
            onDelete={handleDeleteListing}
            onBackToMarketplace={() => setCurrentTab('marketplace')}
            onLogoutAdmin={handleLogoutAdmin}
            onSelectListing={handleSelectListing}
            onEditListing={handleEditListing}
            onToast={showToast}
            onUpdateEvent={(updated) => {
              setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
            }}
            onCreateEvent={(created) => {
              setEvents((prev) => [created, ...prev]);
            }}
            onDeleteEvent={(id) => {
              setEvents((prev) => prev.filter((e) => e.id !== id));
            }}
            onToggleSpotlightEvent={async (id) => {
              try {
                const updated = await api.toggleSpotlightEvent(id);
                setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
                showToast(
                  updated.isSpotlight
                    ? `"${updated.title}" added to Upcoming Spotlight banner!`
                    : `"${updated.title}" removed from Upcoming Spotlight`,
                  'success'
                );
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Failed to toggle spotlight';
                showToast(msg, 'error');
              }
            }}
            onClearAllListings={async () => {
              try {
                await api.clearAllListings();
                setListings([]);
                showToast('All advertisements removed. Marketplace is completely fresh!', 'info');
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Failed to clear advertisements';
                showToast(msg, 'error');
              }
            }}
          />
        )}
      </main>

      {/* Modals */}
      <AdDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        currentUser={currentUser}
        isAdminLoggedIn={isAdminLoggedIn}
        isFavorite={Boolean(selectedListing && favorites.includes(selectedListing.id))}
        onToggleFavorite={handleToggleFavorite}
        onEditListing={handleEditListing}
        onDeleteListing={handleDeleteListing}
        onCopyShareLink={handleCopyShareLink}
        isCompared={Boolean(selectedListing && compareIds.includes(selectedListing.id))}
        onToggleCompare={handleToggleCompare}
        onApproveListing={handleApproveListing}
        onRequestOwnerEdit={(listing) => {
          setSelectedListing(null);
          setTargetListingForEdit(listing);
          setIsUserAuthOpen(true);
        }}
        onStartChat={(listing) => {
          setSelectedListing(null);
          setChatTargetListing(listing);
          setIsChatOpen(true);
        }}
      />

      {/* Compare Floating Bottom Action Bar */}
      <CompareFloatingBar
        compareListings={compareListings}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        onRemoveFromCompare={handleRemoveFromCompare}
        onClearCompare={handleClearCompare}
      />

      {/* Side-by-Side Compare Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        compareListings={compareListings}
        onRemoveFromCompare={handleRemoveFromCompare}
        onClearCompare={handleClearCompare}
        onSelectListing={(listing) => {
          setSelectedListing(listing);
          setIsCompareModalOpen(false);
        }}
      />

      {/* Real-time Firebase Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatTargetListing(null);
        }}
        targetListing={chatTargetListing}
        onSelectListing={(listingId) => {
          const found = listings.find((l) => l.id === listingId);
          if (found) {
            setSelectedListing(found);
            setIsChatOpen(false);
          }
        }}
      />

      <PostAdModal
        isOpen={isPostAdOpen}
        onClose={() => {
          setIsPostAdOpen(false);
          setEditingListing(null);
        }}
        onSubmitAd={handleSubmitAd}
        editingListing={editingListing}
        currentUser={currentUser}
        isAdminLoggedIn={isAdminLoggedIn}
        onToast={showToast}
        onSelectListing={(listing) => {
          setSelectedListing(listing);
          setIsPostAdOpen(false);
          setEditingListing(null);
        }}
      />

      <AuthModals
        isAdminLoginOpen={isAdminLoginOpen}
        onCloseAdminLogin={() => setIsAdminLoginOpen(false)}
        onAdminLoginSuccess={handleAdminLoginSuccess}
        isUserAuthOpen={isUserAuthOpen}
        onCloseUserAuth={() => {
          setIsUserAuthOpen(false);
          setTargetListingForEdit(null);
        }}
        onUserAuthSuccess={handleUserAuthSuccess}
        isChangePasswordOpen={isChangePasswordOpen}
        onCloseChangePassword={() => setIsChangePasswordOpen(false)}
        currentUser={currentUser}
        targetListingForEdit={targetListingForEdit}
        onToast={showToast}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentTab('marketplace');
        }}
        onSelectLocation={(loc) => {
          setSelectedLocation(loc);
          setCurrentTab('marketplace');
        }}
        onOpenPostAd={handleOpenPostAd}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAppStore={() => setIsAppStoreOpen(true)}
      />

      {/* Google Play & App Store Modal */}
      <AppStoreModal
        isOpen={isAppStoreOpen}
        onClose={() => setIsAppStoreOpen(false)}
        onToast={showToast}
      />

      {/* Floating Install Prompt Banner for Mobile / PWA */}
      <PWAInstallBanner onOpenAppStore={() => setIsAppStoreOpen(true)} />

      {/* Sticky Bottom Navigation Bar (Image 1 style) */}
      <BottomNav
        currentTab={currentTab}
        isAdminLoggedIn={isAdminLoggedIn}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPostAd={handleOpenPostAd}
      />
    </div>
  );
}
