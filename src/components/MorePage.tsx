import React from 'react';
import { User, ViewTab } from '../types';
import {
  User as UserIcon,
  Shield,
  KeyRound,
  LogOut,
  LayoutGrid,
  Sparkles,
  Heart,
  MessageCircle,
  MessageSquare,
  PlusCircle,
  Phone,
  HelpCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Lock,
  Compass,
  ArrowLeft,
  Sliders,
  Smartphone,
  Download,
} from 'lucide-react';
import { DeviceSettingsPanel } from './DeviceSettingsPanel';

interface MorePageProps {
  currentUser: User | null;
  isAdminLoggedIn: boolean;
  favoritesCount: number;
  onSelectTab: (tab: ViewTab) => void;
  onOpenUserAuth: () => void;
  onOpenAdminLogin: () => void;
  onOpenPostAd: () => void;
  onOpenAppStore?: () => void;
  onOpenChat: () => void;
  onChangePassword: () => void;
  onLogoutUser: () => void;
  onLogoutAdmin: () => void;
  onBackToHome: () => void;
  onToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const MorePage: React.FC<MorePageProps> = ({
  currentUser,
  isAdminLoggedIn,
  favoritesCount,
  onSelectTab,
  onOpenUserAuth,
  onOpenAdminLogin,
  onOpenPostAd,
  onOpenAppStore,
  onOpenChat,
  onChangePassword,
  onLogoutUser,
  onLogoutAdmin,
  onBackToHome,
  onToast,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 animate-in fade-in duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0A2540] text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="p-1.5 -ml-2 rounded-xl text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <h1 className="font-extrabold text-lg sm:text-xl tracking-tight">More Options</h1>
          </div>
          <span className="text-xs text-blue-200 font-medium">HUTA.lk</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quick Actions Panel (Directly Matching Reference Header Action Bar) */}
        <div className="bg-[#181920] border border-[#2D2F39] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          {/* Subtle ambient accent glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5A36]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-3.5">
            {/* Top row: [Login / Register] [🟢 💬] [🛡️ Admin] */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              {/* 1. Login / Register button */}
              {currentUser ? (
                <button
                  type="button"
                  id="more-panel-user-btn"
                  onClick={() => onSelectTab('user_dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22242E] hover:bg-[#2A2D3A] active:scale-95 text-white font-medium text-sm border border-[#333644] transition-all shadow-sm cursor-pointer group"
                >
                  <div className="w-5 h-5 rounded-full bg-[#FF5A36]/20 text-[#FF5A36] flex items-center justify-center font-bold text-xs">
                    {(currentUser.fullname || currentUser.username).charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-white max-w-[130px] truncate">
                    {currentUser.fullname || currentUser.username}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  id="more-panel-login-btn"
                  onClick={onOpenUserAuth}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22242E] hover:bg-[#2A2D3A] active:scale-95 text-white font-medium text-sm border border-[#333644] transition-all shadow-sm cursor-pointer group"
                >
                  <UserIcon className="w-4 h-4 text-[#FF5A36] group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-white">Login / Register</span>
                </button>
              )}

              {/* 2. Real-time Firebase Live Chat Button */}
              <button
                type="button"
                id="more-panel-chat-btn"
                onClick={onOpenChat}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#22242E] hover:bg-[#2A2D3A] active:scale-95 text-white font-medium text-sm border border-[#333644] transition-all shadow-sm cursor-pointer group"
                title="Open Real-time Live Chat"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <MessageSquare className="w-4 h-4 text-[#FF5A36] group-hover:scale-110 transition-transform" />
              </button>

              {/* 3. Administrator Portal Button (Only visible if Admin is already logged in) */}
              {isAdminLoggedIn && (
                <button
                  type="button"
                  id="more-panel-admin-btn"
                  onClick={() => onSelectTab('admin_dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm border bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40 transition-all shadow-sm cursor-pointer group"
                >
                  <Shield className="w-4 h-4 text-emerald-400 transition-transform group-hover:scale-110" />
                  <span className="font-semibold">Admin Panel</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              )}
            </div>

            {/* Bottom row: [⊕ Post Ad] */}
            <div className="pt-0.5">
              <button
                type="button"
                id="more-panel-post-ad-btn"
                onClick={onOpenPostAd}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] active:scale-95 text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(255,90,54,0.35)] hover:shadow-[0_6px_20px_rgba(255,90,54,0.5)] transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-white stroke-[2.5]" />
                <span>Post Ad</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile App Download Card (Google Play & App Store) */}
        {onOpenAppStore && (
          <div className="bg-gradient-to-br from-[#12141A] via-[#1B1D25] to-[#12141A] text-white rounded-3xl p-5 sm:p-6 border border-[#2D2F39] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF5A36]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FF5A36] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-[#FF5A36]/30 shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-[#FF5A36] mb-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Mobile App Ready
                  </div>
                  <h3 className="font-black text-base sm:text-lg text-white">
                    HUTA on Google Play & App Store
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5 max-w-md leading-relaxed">
                    Install directly to your home screen or download Google Play (.aab) and Apple App Store packages.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="more-open-app-store-btn"
                onClick={onOpenAppStore}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] active:scale-95 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Get App / Instructions</span>
              </button>
            </div>
          </div>
        )}

        {/* 1. Account Status Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm">
          {currentUser ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#FF5A36]/15 text-[#FF5A36] flex items-center justify-center font-black text-xl shadow-inner">
                  {(currentUser.fullname || currentUser.username).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-gray-900 text-base sm:text-lg">
                      {currentUser.fullname || currentUser.username}
                    </h2>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Member
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{currentUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogoutUser}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center font-bold">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-base">Guest Visitor</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Sign in to post ads, manage listings & chat with buyers
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="more-member-login-btn"
                onClick={onOpenUserAuth}
                className="px-5 py-2.5 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                <span>Member Sign In / Register</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. ALL LOGINS SECTION (Requested by User: "inside more all login need to add") */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF5A36]" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Logins & Security Access
            </h3>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            {/* Member Login Item */}
            <button
              type="button"
              id="more-menu-member-login"
              onClick={onOpenUserAuth}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5A36] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#FF5A36] transition-colors">
                    {currentUser ? 'Member Account Profile' : 'Member Login & Register'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {currentUser
                      ? `Logged in as @${currentUser.username}`
                      : 'Access your ads, favorites, and seller inquiries'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Admin Controls - ONLY visible when Admin is logged in with password */}
            {isAdminLoggedIn && (
              <>
                <button
                  type="button"
                  id="more-menu-admin-dashboard"
                  onClick={() => onSelectTab('admin_dashboard')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left bg-emerald-50/50 hover:bg-emerald-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-emerald-900">
                          Open Admin Control Dashboard
                        </p>
                        <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700">
                        Edit all ad details, approve pending ads, feature listings, or delete items
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-600" />
                </button>

                <button
                  type="button"
                  id="more-menu-change-admin-pass"
                  onClick={() => onSelectTab('admin_dashboard')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-[#FF5A36] transition-colors">
                        Change Admin Master Password
                      </p>
                      <p className="text-xs text-gray-400">
                        Update administrator credentials inside dashboard
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </>
            )}

            {/* Member Password Change */}
            {currentUser && (
              <button
                type="button"
                id="more-menu-change-member-pass"
                onClick={onChangePassword}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-[#FF5A36] transition-colors">
                      Change Member Password
                    </p>
                    <p className="text-xs text-gray-400">
                      Update your account security password
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </section>

        {/* 3. Multi-Page Navigation Sections */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#FF5A36]" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Explore Multi-Pages
            </h3>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            {/* All Categories Page (Looks like Image 2) */}
            <button
              type="button"
              id="more-menu-all-categories"
              onClick={() => onSelectTab('categories')}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0A2540] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#FF5A36] transition-colors">
                    All Categories & Services Directory
                  </p>
                  <p className="text-xs text-gray-400">
                    Classifieds, automotive, cleaning, AC repair & professional services
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* HUTA in Events Page (Looks like Image 1) */}
            <button
              type="button"
              id="more-menu-huta-in"
              onClick={() => onSelectTab('huta_in')}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5A36] flex items-center justify-center group-hover:scale-105 transition-transform font-black text-xs">
                  IN
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#FF5A36] transition-colors">
                    HUTA in — Events & Happenings
                  </p>
                  <p className="text-xs text-gray-400">
                    Exhibitions, CardCon, auto shows, food festivals & concerts
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* User Dashboard */}
            <button
              type="button"
              id="more-menu-user-dashboard"
              onClick={() => {
                if (!currentUser) {
                  onOpenUserAuth();
                } else {
                  onSelectTab('user_dashboard');
                }
              }}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#FF5A36] transition-colors">
                    My Advertisements Dashboard
                  </p>
                  <p className="text-xs text-gray-400">
                    Manage active ads, view analytics & edit listings
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Saved Favorites */}
            <button
              type="button"
              id="more-menu-saved-favorites"
              onClick={() => onSelectTab('user_dashboard')}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#FF5A36] transition-colors">
                    Saved Favorites ({favoritesCount})
                  </p>
                  <p className="text-xs text-gray-400">
                    Bookmarked listings you want to revisit
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Live Chat */}
            <button
              type="button"
              id="more-menu-live-chat"
              onClick={onOpenChat}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#FF5A36] transition-colors">
                    Live Chat & Messages
                  </p>
                  <p className="text-xs text-gray-400">
                    Real-time conversations with buyers and sellers
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Post Ad Button */}
            <button
              type="button"
              id="more-menu-post-ad"
              onClick={onOpenPostAd}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5A36] flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#FF5A36]">
                    Post a Free Advertisement
                  </p>
                  <p className="text-xs text-gray-400">
                    List items, vehicles, properties or services
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#FF5A36]" />
            </button>
          </div>
        </section>

        {/* 4. Mobile, Tab & Web Page Settings */}
        <section className="space-y-3">
          <DeviceSettingsPanel onToast={onToast} />
        </section>

        {/* 5. Help & Support */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Help & Customer Support
            </h3>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            <a
              href="https://wa.me/94771234567"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    24/7 WhatsApp Hotline
                  </p>
                  <p className="text-xs text-gray-400">+94 77 123 4567</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </a>

            <div className="px-5 py-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>Terms of Service & Privacy Policy</span>
              </div>
              <span className="text-[11px] text-gray-400">HUTA.lk v2.0</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
