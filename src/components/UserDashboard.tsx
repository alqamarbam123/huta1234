import React, { useState } from 'react';
import { Listing, User, ViewTab } from '../types';
import {
  User as UserIcon,
  KeyRound,
  LogOut,
  ArrowLeft,
  PlusCircle,
  Clock,
  Heart,
  Edit,
  Trash2,
  Inbox,
  Eye,
  ShieldCheck,
  Sparkles,
  LogIn,
  UserPlus,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  ExternalLink,
  Calendar,
  LayoutDashboard,
  Layers,
  ChevronRight,
  Smartphone,
  Download,
  Facebook,
} from 'lucide-react';
import { formatLKR } from './ListingsSection';
import { FacebookFlyerModal } from './FacebookFlyerModal';
import { api } from '../services/api';

interface UserDashboardProps {
  currentUser: User | null;
  isAdminLoggedIn?: boolean;
  listings: Listing[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onEditListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenPostAd: () => void;
  onOpenAppStore?: () => void;
  onChangePassword: () => void;
  onLogoutUser: () => void;
  onBackToMarketplace: () => void;
  onOpenUserAuth?: (mode: 'login' | 'register') => void;
  onOpenAdminLogin?: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenChat?: () => void;
  onSelectTab?: (tab: ViewTab) => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  isAdminLoggedIn = false,
  listings,
  favorites,
  onToggleFavorite,
  onEditListing,
  onDeleteListing,
  onSelectListing,
  onOpenPostAd,
  onOpenAppStore,
  onChangePassword,
  onLogoutUser,
  onBackToMarketplace,
  onOpenUserAuth,
  onOpenAdminLogin,
  onOpenAdminDashboard,
  onOpenChat,
  onSelectTab,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'myads' | 'favorites' | 'sellertips'>('myads');
  const [promoListing, setPromoListing] = useState<Listing | null>(null);

  // Helper to normalize phone numbers
  const normalizePhone = (raw?: string): string => {
    if (!raw) return '';
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits.startsWith('94') && digits.length >= 11) return '0' + digits.substring(2);
    if (digits.length === 9) return '0' + digits;
    return digits;
  };

  const userPhone = currentUser?.phone ? normalizePhone(currentUser.phone) : '';
  const userUsernamePhone = currentUser?.username ? normalizePhone(currentUser.username) : '';

  const myAds = currentUser
    ? listings.filter((l) => {
        if (l.userId === currentUser.id) return true;
        const adPhone = normalizePhone(l.phone);
        if (userPhone && adPhone === userPhone) return true;
        if (userUsernamePhone && adPhone === userUsernamePhone) return true;
        return false;
      })
    : [];
  const pendingAds = myAds.filter((l) => l.status === 'pending');
  const approvedAds = myAds.filter((l) => l.status === 'approved');
  const totalViews = myAds.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const favoriteAds = listings.filter((l) => favorites.includes(l.id));

  // If user is a Guest (not logged in)
  if (!currentUser) {
    const guestListingIds = api.getGuestListingIds();
    const guestAds = listings.filter((l) => guestListingIds.includes(l.id));

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
        {/* Guest Welcome Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#12141A] via-[#1A1C24] to-[#0D0E12] text-white rounded-3xl p-6 sm:p-10 border border-[#2D2F39] shadow-2xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#FF5A36]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A36]/20 border border-[#FF5A36]/30 text-[#FF5A36] text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HUTA Member Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Manage Your Classifieds, Leads & Bookmarks
            </h1>

            <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              Sign in to your member account to publish free advertisements, monitor buyer inquiries, 
              track live view metrics, and manage your saved favorites across Sri Lanka.
            </p>

            {/* Main Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                id="dashboard-guest-login-btn"
                onClick={() => onOpenUserAuth && onOpenUserAuth('login')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#FF5A36]/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Member Account</span>
              </button>

              <button
                type="button"
                id="dashboard-guest-register-btn"
                onClick={() => onOpenUserAuth && onOpenUserAuth('register')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-bold border border-white/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Free Account</span>
              </button>

              <button
                type="button"
                id="dashboard-guest-postad-btn"
                onClick={onOpenPostAd}
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Ad as Guest</span>
              </button>

              {onOpenAppStore && (
                <button
                  type="button"
                  id="dashboard-guest-appstore-btn"
                  onClick={onOpenAppStore}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-[#FF5A36]" />
                  <span>Get App (Play Store & App Store)</span>
                </button>
              )}

              {isAdminLoggedIn ? (
                <button
                  type="button"
                  id="dashboard-guest-admin-portal-btn"
                  onClick={onOpenAdminDashboard}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer ml-auto"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Moderation Portal</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="dashboard-guest-admin-login-btn"
                  onClick={onOpenAdminLogin}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer ml-auto"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Guest Ads on this Device (Self-Service Edit) */}
        {guestAds.length > 0 && (
          <div className="bg-white rounded-3xl border-2 border-orange-200/90 p-6 sm:p-8 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-black text-gray-900">Your Advertisements on this Device</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-100 text-[#FF5A36]">
                    {guestAds.length} {guestAds.length === 1 ? 'Ad' : 'Ads'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Posted in Guest Mode. You have full edit access on this browser to update prices, photos, and descriptions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenUserAuth && onOpenUserAuth('login')}
                className="text-xs font-bold text-[#FF5A36] hover:text-[#E04826] flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Sync to Mobile Account</span>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {guestAds.map((ad) => (
                <div
                  key={ad.id}
                  className="border border-gray-200 rounded-2xl p-4 hover:border-[#FF5A36]/50 transition-all flex flex-col sm:flex-row gap-4 bg-gray-50/50 hover:bg-white"
                >
                  <img
                    src={ad.image || 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=300&q=80'}
                    alt={ad.title}
                    className="w-full sm:w-28 h-28 object-cover rounded-xl shrink-0 cursor-pointer"
                    onClick={() => onSelectListing(ad)}
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                          {ad.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ad.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {ad.status === 'approved' ? 'Live on Site' : 'Pending Approval'}
                        </span>
                      </div>
                      <h3
                        onClick={() => onSelectListing(ad)}
                        className="font-bold text-sm text-gray-900 hover:text-[#FF5A36] transition-colors mt-1.5 line-clamp-1 cursor-pointer"
                      >
                        {ad.title}
                      </h3>
                      <p className="text-[#FF5A36] font-black text-sm mt-0.5">
                        {ad.pricingType === 'quote' ? 'Call for Quote' : formatLKR(ad.price)}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200/80 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditListing(ad)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Ad & Price</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectListing(ad)}
                        className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        title="View listing"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteListing(ad.id)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        title="Delete ad"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Edit Ad Banner for Existing Advertisers */}
        <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5A36] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-gray-950">
                Need to change or update an advertisement from another phone or PC?
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Enter your <strong className="text-[#FF5A36]">Mobile Phone Number</strong> to verify via instant SMS OTP code and update prices or details anytime.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenUserAuth && onOpenUserAuth('login')}
            className="shrink-0 px-4 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Verify Phone & Edit Ad</span>
          </button>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center mb-4">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">Free Ad Posting</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              List vehicles, smartphones, laptops, lands, and rentals with up to 5 photos in under 2 minutes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">Track Live Ad Views</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              See how many buyers clicked and inspected your advertisements in Colombo, Kandy, Galle, and islandwide.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">Verified Seller Trust</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Earn HUTA Verified badges to boost buyer confidence and close sales up to 3x faster.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">Saved Bookmarks</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Keep track of dream cars and favorite listings. Currently saved on this device: <span className="font-bold text-rose-600">{favorites.length} items</span>.
            </p>
          </div>
        </div>

        {/* Guest Bookmarks Preview (if user has saved items) */}
        {favoriteAds.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-rose-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Your Saved Bookmarks</h2>
                  <p className="text-xs text-gray-500">Stored on this browser session ({favoriteAds.length} items)</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onBackToMarketplace}
                className="text-xs font-bold text-[#FF5A36] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Browse More</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favoriteAds.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectListing(item)}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-[#FF5A36] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="w-full h-36 bg-gray-100 overflow-hidden relative">
                    <img
                      src={item.image || 'https://via.placeholder.com/300x200'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                        if (onToast) onToast('Removed from saved items', 'info');
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-rose-600 hover:bg-white transition-colors shadow-xs"
                      title="Remove from favorites"
                    >
                      <Heart className="w-4 h-4 fill-rose-600" />
                    </button>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#FF5A36] uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mt-0.5">
                        {item.title}
                      </h4>
                      <div className="text-base font-extrabold text-gray-900 mt-1">
                        {formatLKR(item.price)}
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span>{item.location}</span>
                      <span className="text-[#FF5A36] font-semibold group-hover:underline">View Ad</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Marketplace Action Center */}
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl border border-gray-200 p-6 sm:p-8">
          <h3 className="text-lg font-black text-gray-900 mb-2">Explore Marketplace Shortcuts</h3>
          <p className="text-xs text-gray-500 mb-6">Need quick access to marketplace features? Jump right in:</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onOpenPostAd}
              className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#FF5A36] text-left transition-all group cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5A36] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-gray-900">Post Free Ad</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Sell vehicles or gadgets</div>
            </button>

            <button
              type="button"
              onClick={onBackToMarketplace}
              className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#FF5A36] text-left transition-all group cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-gray-900">Browse Listings</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{listings.length} verified items</div>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('huta_in')}
              className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#FF5A36] text-left transition-all group cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-gray-900">HUTA IN Events</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Exhibitions & festivals</div>
            </button>

            <button
              type="button"
              onClick={() => onOpenChat && onOpenChat()}
              className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#FF5A36] text-left transition-all group cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-gray-900">Live Chat</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Ask questions directly</div>
            </button>

            {onOpenAppStore && (
              <button
                type="button"
                id="dashboard-guest-app-grid-btn"
                onClick={onOpenAppStore}
                className="p-4 rounded-2xl bg-gradient-to-br from-[#181920] to-[#252835] text-white text-left transition-all group cursor-pointer shadow-xs hover:shadow-md border border-[#2D2F39]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF5A36] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md shadow-[#FF5A36]/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Mobile App</span>
                  <span className="text-[10px] bg-[#FF5A36] px-1.5 py-0.2 rounded font-black">APP</span>
                </div>
                <div className="text-[11px] text-gray-300 mt-0.5">Google Play & iOS</div>
              </button>
            )}
          </div>
        </div>

        {/* Safety & Selling Advisory */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-950 text-sm">Safe Buying & Selling Tips</h4>
              <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                Always meet sellers in populated public places (like banks or commercial centers). 
                Inspect vehicles and electronics thoroughly before making payments. Never transfer advance deposits to unknown parties.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBackToMarketplace}
            className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Start Browsing
          </button>
        </div>
      </div>
    );
  }

  // If user IS Logged In (`currentUser` exists)
  const displayAds = activeTab === 'myads' ? myAds : activeTab === 'favorites' ? favoriteAds : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* User Header Banner */}
      <div className="bg-[#111217] text-white rounded-3xl p-6 sm:p-8 border border-[#2D2F39] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-[#FF7A50] text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-[#FF5A36]/30">
            {currentUser.fullname ? currentUser.fullname[0].toUpperCase() : currentUser.username[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">
                {currentUser.fullname || currentUser.username}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified Member
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenAppStore && (
            <button
              type="button"
              id="dashboard-user-appstore-btn"
              onClick={onOpenAppStore}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/15 transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#FF5A36]" />
              <span>Get Mobile App</span>
            </button>
          )}
          <button
            type="button"
            id="dashboard-user-postad-btn"
            onClick={onOpenPostAd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Ad</span>
          </button>
          <button
            type="button"
            id="dashboard-user-changepw-btn"
            onClick={onChangePassword}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-gray-200 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Password</span>
          </button>
          <button
            type="button"
            id="dashboard-user-logout-btn"
            onClick={onLogoutUser}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
          <button
            type="button"
            onClick={onBackToMarketplace}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          onClick={() => setActiveTab('myads')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'myads'
              ? 'bg-white border-[#FF5A36] shadow-lg -translate-y-1'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            My Posted Ads
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{myAds.length}</div>
          <p className="text-xs text-gray-400 mt-1">{approvedAds.length} live • {pendingAds.length} pending</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved & Live</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{approvedAds.length}</div>
          <p className="text-xs text-emerald-600/70 mt-1">Visible to all buyers</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{pendingAds.length}</div>
          <p className="text-xs text-amber-600/70 mt-1">Moderator approval in progress</p>
        </div>

        <div
          onClick={() => setActiveTab('favorites')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'favorites'
              ? 'bg-white border-[#FF5A36] shadow-lg -translate-y-1'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" />
            <span>Saved Favorites</span>
          </div>
          <div className="text-3xl font-extrabold text-rose-600">{favoriteAds.length}</div>
          <p className="text-xs text-rose-600/70 mt-1">Bookmarked listings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('myads')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'myads'
                ? 'bg-[#FF5A36] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            My Ads ({myAds.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-[#FF5A36] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Saved Favorites ({favoriteAds.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sellertips')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sellertips'
                ? 'bg-[#FF5A36] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Seller Toolkit & Growth
          </button>
        </div>

        {/* Tab 1 & 2: Ads Listings */}
        {activeTab !== 'sellertips' && (
          <>
            {displayAds.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF5A36] flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {activeTab === 'myads' ? "You haven't posted any advertisements yet" : 'No saved favorites'}
                </h3>
                <p className="text-sm text-gray-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                  {activeTab === 'myads'
                    ? 'Start selling today! List vehicles, electronic devices, property, or fashion items in front of thousands of daily Sri Lankan buyers.'
                    : 'Click the heart icon on any vehicle, gadget, or house listing to bookmark it here for quick comparison.'}
                </p>

                {activeTab === 'myads' && (
                  <div className="mt-8 max-w-xl mx-auto">
                    <button
                      type="button"
                      onClick={onOpenPostAd}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FF5A36] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#FF5A36]/30 hover:bg-[#E04826] transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Post Your First Ad Now</span>
                    </button>

                    {/* 3 Step Selling Guide */}
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left border-t border-gray-100 pt-8">
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-7 h-7 rounded-lg bg-[#FF5A36] text-white font-black text-xs flex items-center justify-center mb-2">1</div>
                        <h5 className="font-bold text-gray-900 text-xs">Take Clear Photos</h5>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Daylight shots from multiple angles get 3x more replies.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-7 h-7 rounded-lg bg-[#FF5A36] text-white font-black text-xs flex items-center justify-center mb-2">2</div>
                        <h5 className="font-bold text-gray-900 text-xs">Set Competitive Price</h5>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Check similar ads to price fairly and attract serious buyers.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-7 h-7 rounded-lg bg-[#FF5A36] text-white font-black text-xs flex items-center justify-center mb-2">3</div>
                        <h5 className="font-bold text-gray-900 text-xs">Receive Direct Calls</h5>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Buyers contact you via phone, WhatsApp, or instant chat.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayAds.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectListing(item)}
                    className="group bg-white rounded-2xl border border-gray-200 hover:border-[#FF5A36] overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col"
                  >
                    <div className="w-full h-40 bg-gray-100 overflow-hidden relative">
                      <img
                        src={item.image || 'https://via.placeholder.com/300x200'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 ${
                            item.status === 'approved'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {item.status === 'approved' ? '✓ Live' : '⏳ Pending Review'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-[#FF5A36] uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mt-0.5">
                          {item.title}
                        </h4>
                        <div className="text-base font-extrabold text-gray-900 mt-1">
                          {formatLKR(item.price)}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {item.views || 0} views
                        </span>

                        {activeTab === 'myads' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPromoListing(item);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#1877F2] bg-blue-50 hover:bg-[#1877F2] hover:text-white transition-all cursor-pointer shadow-2xs"
                              title="Download photos or generate Facebook Promo Flyer"
                            >
                              <Facebook className="w-3.5 h-3.5 fill-current" />
                              <span>Facebook Promo</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditListing(item);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-[#FF5A36] hover:text-white transition-all cursor-pointer shadow-2xs"
                              title="Make changes to price, photos, contact, or description"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Ad</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteListing(item.id);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Ad"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(item.id);
                            }}
                            className="text-xs text-rose-600 hover:underline font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab 3: Seller Toolkit & Growth */}
        {activeTab === 'sellertips' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2.5 mb-3 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <h4 className="font-extrabold text-gray-900 text-base">How to Sell Faster in Sri Lanka</h4>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF5A36] font-black">•</span>
                    <span><strong>Add your WhatsApp number:</strong> Over 70% of local inquiries in Colombo, Gampaha, and Kandy prefer direct WhatsApp chats.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF5A36] font-black">•</span>
                    <span><strong>Accurate mileage & condition:</strong> For vehicles, clearly state the true registered year, engine capacity, and transmission.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF5A36] font-black">•</span>
                    <span><strong>Include original accessories:</strong> For mobile phones and laptops, mention box, charger, battery health, and warranty status.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2.5 mb-3 text-blue-700">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="font-extrabold text-gray-900 text-base">HUTA Verified Seller Guidelines</h4>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-black">•</span>
                    <span><strong>Zero tolerance for duplicate spam:</strong> Keep your listings clean and update existing ones rather than creating duplicates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-black">•</span>
                    <span><strong>Genuine Sri Lankan contact numbers:</strong> Ensure phone numbers are reachable during standard daytime business hours.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-black">•</span>
                    <span><strong>Instant removal upon sale:</strong> Mark your item as sold or delete the ad as soon as the transaction is finalized.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h5 className="font-extrabold text-gray-900 text-sm">Need help or want to boost your ad?</h5>
                <p className="text-xs text-gray-600 mt-0.5">Our moderation team reviews listings within 15 minutes during business hours.</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChat && onOpenChat()}
                className="px-5 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer shrink-0"
              >
                Contact Support Team
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Facebook Promo Flyer & Image Downloader Modal */}
      <FacebookFlyerModal
        listing={promoListing}
        isOpen={Boolean(promoListing)}
        onClose={() => setPromoListing(null)}
      />
    </div>
  );
};
