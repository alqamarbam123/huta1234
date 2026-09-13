import React from 'react';
import { Home, Plus, LayoutGrid, MoreHorizontal, Sparkles } from 'lucide-react';
import { ViewTab } from '../types';

interface BottomNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenPostAd: () => void;
  unreadChatCount?: number;
  isAdminLoggedIn?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenPostAd,
  isAdminLoggedIn,
}) => {
  const isHomeActive = currentTab === 'marketplace';
  const isHutaInActive = currentTab === 'huta_in';
  const isDashboardActive = currentTab === 'user_dashboard' || currentTab === 'admin_dashboard';
  const isMoreActive = currentTab === 'more';

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-pb lg:hidden"
    >
      <div className="max-w-md md:max-w-lg lg:max-w-2xl mx-auto px-4 flex items-center justify-between relative h-16 sm:h-[68px]">
        {/* 1. Home */}
        <button
          type="button"
          id="nav-tab-home"
          onClick={() => onSelectTab('marketplace')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${
            isHomeActive ? 'text-[#FF5A36]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <div className="relative">
            <Home
              className={`w-6 h-6 transition-transform group-active:scale-90 ${
                isHomeActive ? 'stroke-[2.5]' : 'stroke-[2]'
              }`}
            />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#FF5A36] rounded-full" />
            )}
          </div>
          <span
            className={`text-[11px] mt-1 font-bold tracking-tight ${
              isHomeActive ? 'text-[#FF5A36]' : 'text-gray-600'
            }`}
          >
            Home
          </span>
        </button>

        {/* 2. HUTA IN */}
        <button
          type="button"
          id="nav-tab-huta-in"
          onClick={() => onSelectTab('huta_in')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${
            isHutaInActive ? 'text-[#FF5A36]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <div className="relative">
            <Sparkles
              className={`w-6 h-6 transition-transform group-active:scale-90 ${
                isHutaInActive ? 'stroke-[2.5]' : 'stroke-[2]'
              }`}
            />
            {isHutaInActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#FF5A36] rounded-full" />
            )}
          </div>
          <span
            className={`text-[11px] mt-1 font-bold tracking-tight ${
              isHutaInActive ? 'text-[#FF5A36]' : 'text-gray-700'
            }`}
          >
            HUTA <span className="text-[#FF5A36] font-black">in</span>
          </span>
        </button>

        {/* 3. Center Elevated Create Ad Button (Matching Image 1) */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-6 sm:-mt-7 z-10">
          <button
            type="button"
            id="nav-create-ad-btn"
            onClick={onOpenPostAd}
            title="Create an Advertisement"
            aria-label="Create Advertisement"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#FF5A36] to-[#FF7A50] text-white shadow-[0_8px_20px_rgba(255,90,54,0.4)] flex items-center justify-center border-4 border-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-8 h-8 sm:w-9 sm:h-9 stroke-[3]" />
          </button>
          <span className="text-[11px] font-bold text-gray-700 mt-1 whitespace-nowrap">
            Create Ad
          </span>
        </div>

        {/* 4. Dashboard */}
        <button
          type="button"
          id="nav-tab-dashboard"
          onClick={() => onSelectTab(isAdminLoggedIn ? 'admin_dashboard' : 'user_dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${
            isDashboardActive ? 'text-[#FF5A36]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <div className="relative">
            <LayoutGrid
              className={`w-6 h-6 transition-transform group-active:scale-90 ${
                isDashboardActive ? 'stroke-[2.5]' : 'stroke-[2]'
              }`}
            />
            {isDashboardActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#FF5A36] rounded-full" />
            )}
          </div>
          <span
            className={`text-[11px] mt-1 font-bold tracking-tight ${
              isDashboardActive ? 'text-[#FF5A36]' : 'text-gray-600'
            }`}
          >
            Dashboard
          </span>
        </button>

        {/* 5. More (Houses all logins as requested) */}
        <button
          type="button"
          id="nav-tab-more"
          onClick={() => onSelectTab('more')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${
            isMoreActive ? 'text-[#FF5A36]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <div className="relative">
            <MoreHorizontal
              className={`w-6 h-6 transition-transform group-active:scale-90 ${
                isMoreActive ? 'stroke-[2.5]' : 'stroke-[2]'
              }`}
            />
            {isMoreActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#FF5A36] rounded-full" />
            )}
          </div>
          <span
            className={`text-[11px] mt-1 font-bold tracking-tight ${
              isMoreActive ? 'text-[#FF5A36]' : 'text-gray-600'
            }`}
          >
            More
          </span>
        </button>
      </div>
    </nav>
  );
};
