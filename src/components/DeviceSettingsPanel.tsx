import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Layout,
  Globe,
  Bell,
  Volume2,
  Wifi,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Moon,
  Sun,
  ShieldCheck,
  Download,
  Share2
} from 'lucide-react';
import { AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  deviceLayout: 'auto',
  density: 'comfortable',
  theme: 'light',
  language: 'en',
  currency: 'LKR',
  dataSaver: false,
  hapticFeedback: true,
  browserTabBadges: true,
  pushNotifications: true,
  soundEffects: true,
};

const SETTINGS_STORAGE_KEY = 'huta_app_device_settings';

export function getStoredSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

interface DeviceSettingsPanelProps {
  onToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
  onSettingsChange?: (newSettings: AppSettings) => void;
}

export const DeviceSettingsPanel: React.FC<DeviceSettingsPanelProps> = ({
  onToast,
  onSettingsChange,
}) => {
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const [activeSubTab, setActiveSubTab] = useState<'device' | 'display' | 'network' | 'notifications'>('device');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Sync browser tab badge setting
    if (settings.browserTabBadges) {
      document.title = 'HUTA Marketplace — Sri Lanka';
    }
  }, [settings.browserTabBadges]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveStoredSettings(updated);
    if (onSettingsChange) onSettingsChange(updated);

    // Trigger slight haptic if enabled and supported
    if (updated.hapticFeedback && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore
      }
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    saveStoredSettings(DEFAULT_SETTINGS);
    if (onSettingsChange) onSettingsChange(DEFAULT_SETTINGS);
    if (onToast) onToast('Settings reset to recommended defaults', 'info');
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('huta_recent_searches');
      if (onToast) onToast('Local browser cache cleared successfully', 'success');
    } catch {
      if (onToast) onToast('Could not clear local cache', 'error');
    }
  };

  return (
    <div id="device-settings-container" className="bg-white rounded-3xl border border-gray-100 shadow-md p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Mobile, Tab & Web Settings
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Customize layout, device modes, browser tab behaviors, and network settings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-in fade-in duration-200">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          <button
            type="button"
            onClick={resetToDefaults}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-2xl overflow-x-auto scrollbar-none text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveSubTab('device')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'device'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#FF5A36]" />
          <span>Device & Layout</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('display')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'display'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-blue-600" />
          <span>Display & Density</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('network')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'network'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          <span>Data & Network</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-amber-600" />
          <span>Tab & Alerts</span>
        </button>
      </div>

      {/* 1. Device & Layout Tab */}
      {activeSubTab === 'device' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
              Device Layout Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'auto', label: 'Auto Detect', desc: 'Adapts to screen', icon: Sparkles },
                { id: 'mobile', label: 'Mobile View', desc: 'Compact bottom bar', icon: Smartphone },
                { id: 'tablet', label: 'Tablet / Tab', desc: 'Dual-column fluid', icon: Tablet },
                { id: 'desktop', label: 'Desktop Web', desc: 'Widescreen header', icon: Monitor },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = settings.deviceLayout === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateSetting('deviceLayout', opt.id as any)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FF5A36] bg-orange-50/50 shadow-xs ring-1 ring-[#FF5A36]/40'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-[#FF5A36]' : 'text-gray-500'}`} />
                      {isSelected && <Check className="w-4 h-4 text-[#FF5A36]" />}
                    </div>
                    <div>
                      <p className={`text-xs font-black ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add to Home Screen / Mobile App Instructions */}
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-gray-900">
                  Add HUTA.lk to Mobile & Tablet Home Screen
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Install as a standalone web app for instant 1-tap browsing and full offline access
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onToast) onToast('To install: Tap your browser menu (⋮ or Share) then select "Add to Home Screen"', 'info');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer text-center"
            >
              Installation Guide
            </button>
          </div>
        </div>
      )}

      {/* 2. Display & Density Tab */}
      {activeSubTab === 'display' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
              Listing Cards Grid Density
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateSetting('density', 'comfortable')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  settings.density === 'comfortable'
                    ? 'border-[#FF5A36] bg-orange-50/40 ring-1 ring-[#FF5A36]/40'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-900">Comfortable (Spacious)</p>
                  {settings.density === 'comfortable' && <Check className="w-4 h-4 text-[#FF5A36]" />}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Large photography and generous card padding. Recommended for tablets & desktop.
                </p>
              </button>

              <button
                type="button"
                onClick={() => updateSetting('density', 'compact')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  settings.density === 'compact'
                    ? 'border-[#FF5A36] bg-orange-50/40 ring-1 ring-[#FF5A36]/40'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-900">Compact (Dense)</p>
                  {settings.density === 'compact' && <Check className="w-4 h-4 text-[#FF5A36]" />}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Higher information density. Fits more listings per screen on mobile phones.
                </p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Currency Selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                Display Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => updateSetting('currency', e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FF5A36]"
              >
                <option value="LKR">LKR — Sri Lankan Rupee (Rs.)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
              </select>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                Interface Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FF5A36]"
              >
                <option value="en">English (Official)</option>
                <option value="si">සිංහල (Sinhala)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 3. Data & Network Tab */}
      {activeSubTab === 'network' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
            {/* Data Saver Mode */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">
                  Mobile Data Saver (3G / 4G Cellular)
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Optimizes image compression for mobile data connections (Dialog, Mobitel, SLT, Airtel)
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('dataSaver', !settings.dataSaver)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.dataSaver ? 'bg-[#FF5A36]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-0.5 ${
                    settings.dataSaver ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Haptic Feedback */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">
                  Haptic Touch Vibration
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Subtle vibration feedback when tapping buttons on mobile and tablet devices
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('hapticFeedback', !settings.hapticFeedback)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.hapticFeedback ? 'bg-[#FF5A36]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-0.5 ${
                    settings.hapticFeedback ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-gray-400">Need to refresh device data?</span>
            <button
              type="button"
              onClick={handleClearCache}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              Clear Local Cache
            </button>
          </div>
        </div>
      )}

      {/* 4. Browser Tab & Notifications */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
            {/* Browser Tab Badge Notification */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">
                  Browser Tab Live Badges
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Show notification indicators and message alerts in browser tab title
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('browserTabBadges', !settings.browserTabBadges)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.browserTabBadges ? 'bg-[#FF5A36]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-0.5 ${
                    settings.browserTabBadges ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* In-App Sound Effects */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">
                  In-App Sound Chimes
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Play gentle chime audio when receiving new live chat responses
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('soundEffects', !settings.soundEffects)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.soundEffects ? 'bg-[#FF5A36]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-0.5 ${
                    settings.soundEffects ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Push Notifications */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">
                  Push Alerts & Inquiries
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Receive notifications when potential buyers make inquiries on your advertisements
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!settings.pushNotifications && typeof window !== 'undefined' && 'Notification' in window) {
                    Notification.requestPermission();
                  }
                  updateSetting('pushNotifications', !settings.pushNotifications);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.pushNotifications ? 'bg-[#FF5A36]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-0.5 ${
                    settings.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
