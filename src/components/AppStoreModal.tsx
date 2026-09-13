import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  Copy,
  Layers,
  Sparkles,
  Apple,
  Play
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AppStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AppStoreModal: React.FC<AppStoreModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'googleplay' | 'appstore'>('install');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://huta.lk';
  const pwaBuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(currentAppUrl)}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    if (onToast) onToast(`${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      const installed = await install();
      if (installed && onToast) {
        onToast('HUTA App installed successfully!', 'success');
      }
    } else if (isIOS) {
      setActiveTab('install');
    } else {
      if (onToast) onToast('Use your browser menu (⋮ or Share) and select "Install App" or "Add to Home Screen"', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Header Gradient */}
        <div className="relative bg-gradient-to-r from-[#12141A] via-[#1A1C24] to-[#12141A] text-white p-6 sm:p-7 shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5A36]/15 rounded-full blur-2xl pointer-events-none" />
          
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5A36] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-[#FF5A36]/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-[#FF5A36]">
                <Sparkles className="w-3 h-3" />
                Mobile App & Store Suite
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                Get HUTA on Google Play & App Store
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
            Install HUTA directly onto your home screen today, or export the production-ready packages for the Google Play Store and Apple App Store.
          </p>

          {/* Navigation Pill Tabs */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('install')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'install'
                  ? 'bg-[#FF5A36] text-white shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instant Install (Mobile)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('googleplay')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'googleplay'
                  ? 'bg-[#FF5A36] text-white shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Google Play Store (Android)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('appstore')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'appstore'
                  ? 'bg-[#FF5A36] text-white shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>Apple App Store (iOS)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-gray-800 text-sm">
          {/* TAB 1: Instant Direct Install */}
          {activeTab === 'install' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Primary Direct Action Banner */}
              <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5A36] bg-white px-2 py-0.5 rounded-full border border-orange-200">
                    Recommended
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900 mt-1">
                    Instant Zero-Store Installation
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    Install HUTA as a native standalone app on Android or iPhone in 5 seconds without waiting for app store downloads.
                  </p>
                </div>

                {isInstalled ? (
                  <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Already Installed!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTriggerInstall}
                    className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold shadow-lg shadow-[#FF5A36]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App Now</span>
                  </button>
                )}
              </div>

              {/* iOS Step by Step */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-900 font-bold mb-3">
                  <Apple className="w-4 h-4" />
                  <h4>How to Install on iPhone / iPad (Safari)</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF5A36] font-extrabold text-xs flex items-center justify-center mb-2">1</div>
                    <p className="text-xs text-gray-600">Open this website in <strong>Safari</strong> on your iPhone or iPad.</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF5A36] font-extrabold text-xs flex items-center justify-center mb-2">2</div>
                    <p className="text-xs text-gray-600">Tap the <strong>Share</strong> icon (<Share2 className="w-3 h-3 inline text-blue-600" />) at the bottom bar.</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF5A36] font-extrabold text-xs flex items-center justify-center mb-2">3</div>
                    <p className="text-xs text-gray-600">Select <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3 h-3 inline text-gray-700" />) and tap <strong>Add</strong>.</p>
                  </div>
                </div>
              </div>

              {/* Android Step by Step */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-900 font-bold mb-3">
                  <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <h4>How to Install on Android (Chrome / Samsung Internet)</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center mb-2">A</div>
                    <p className="text-xs text-gray-600">Tap the <strong>"Install App Now"</strong> button above, or click the pop-up banner at the bottom.</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center mb-2">B</div>
                    <p className="text-xs text-gray-600">Alternatively, tap Chrome's three dots (<strong className="text-gray-900">⋮</strong>) and tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                  </div>
                </div>
              </div>

              {/* Features of the installed app */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-gray-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Full screen experience with no browser URL bar</span>
                </div>
                <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-gray-100">
                  <Zap className="w-4 h-4 text-[#FF5A36] shrink-0 mt-0.5" />
                  <span>Instant cold-starts with offline caching service worker</span>
                </div>
                <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-gray-100">
                  <Layers className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Automatic background updates whenever new ads post</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Google Play Store (Android APK / AAB) */}
          {activeTab === 'googleplay' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <h3 className="text-base font-extrabold text-emerald-950">
                    Publish to Google Play Store
                  </h3>
                </div>
                <p className="text-xs text-emerald-900/80 leading-relaxed">
                  Your website now contains a valid Web App Manifest (<code>/manifest.json</code>), service worker, 
                  and high-resolution 512x512 maskable icons. You can package it into a Google Play <code>.aab</code> package in under 2 minutes.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={pwaBuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                  >
                    <span>Build Android APK/AAB on PWABuilder</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(currentAppUrl, 'Live Web App URL')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText === 'Live Web App URL' ? 'Copied!' : 'Copy App URL'}</span>
                  </button>
                </div>
              </div>

              {/* 3 Step Google Play Guide */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">
                  Quick Packaging Steps
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                    <div>
                      <p className="font-bold text-gray-900">Visit PWABuilder or Bubblewrap</p>
                      <p className="text-gray-500 mt-0.5">
                        Open <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">pwabuilder.com</a> and paste your app URL: <code className="bg-gray-200 px-1 py-0.5 rounded text-[11px] text-gray-800">{currentAppUrl}</code>
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                    <div>
                      <p className="font-bold text-gray-900">Select "Package for Android"</p>
                      <p className="text-gray-500 mt-0.5">
                        PWABuilder verifies your manifest score (100% compliant) and generates a signed <strong>Android App Bundle (.aab)</strong> and <strong>APK</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                    <div>
                      <p className="font-bold text-gray-900">Upload to Google Play Console</p>
                      <p className="text-gray-500 mt-0.5">
                        Go to <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">play.google.com/console</a>, create your app listing, and drop the generated <code>.aab</code> file into Production or Closed Testing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer Command Line Alternative */}
              <div className="p-4 rounded-xl bg-gray-900 text-gray-200 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-gray-400 text-[11px]">
                  <span>Developer CLI Alternative (Google Bubblewrap TWA)</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`npm i -g @bubblewrap/cli && bubblewrap init --manifest=${currentAppUrl}/manifest.json && bubblewrap build`, 'CLI Command')}
                    className="hover:text-white cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-emerald-400 overflow-x-auto whitespace-pre">
                  npm i -g @bubblewrap/cli{'\n'}
                  bubblewrap init --manifest={currentAppUrl}/manifest.json{'\n'}
                  bubblewrap build
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Apple App Store (iOS) */}
          {activeTab === 'appstore' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-gray-900 text-white flex items-center justify-center">
                    <Apple className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-blue-950">
                    Publish to Apple App Store (iOS)
                  </h3>
                </div>
                <p className="text-xs text-blue-900/80 leading-relaxed">
                  Apple requires iOS apps to be packaged via an Xcode project wrapper using <strong>Capacitor</strong> or <strong>PWABuilder iOS package</strong>, signed with an Apple Developer Account ($99/year).
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={pwaBuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                  >
                    <span>Generate iOS Xcode Project (PWABuilder)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://developer.apple.com/account"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-blue-300 text-blue-900 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <span>Apple Developer Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 3 Step Apple App Store Guide */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">
                  iOS Packaging Workflow
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                    <div>
                      <p className="font-bold text-gray-900">Generate Xcode Project with Capacitor</p>
                      <p className="text-gray-500 mt-0.5">
                        Run standard Capacitor commands to wrap the web app into a native Swift / WebKit container.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                    <div>
                      <p className="font-bold text-gray-900">Open in Xcode on macOS</p>
                      <p className="text-gray-500 mt-0.5">
                        Open the generated <code>ios/App</code> folder in Xcode, select your Apple Developer Team, and build for Any iOS Device (arm64).
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                    <div>
                      <p className="font-bold text-gray-900">Submit via App Store Connect</p>
                      <p className="text-gray-500 mt-0.5">
                        In Xcode, click <strong>Product → Archive → Distribute App → App Store Connect</strong> to submit your app for review.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacitor CLI snippet */}
              <div className="p-4 rounded-xl bg-gray-900 text-gray-200 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-gray-400 text-[11px]">
                  <span>Capacitor iOS Setup Commands</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`npm i @capacitor/core @capacitor/cli @capacitor/ios\nnpx cap init "HUTA Marketplace" "lk.huta.app"\nnpx cap add ios\nnpx cap open ios`, 'Capacitor Commands')}
                    className="hover:text-white cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-blue-400 overflow-x-auto whitespace-pre">
                  npm i @capacitor/core @capacitor/cli @capacitor/ios{'\n'}
                  npx cap init "HUTA Marketplace" "lk.huta.app"{'\n'}
                  npx cap add ios{'\n'}
                  npx cap open ios
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PWA & Store Compliant (192x192, 512x512 maskable, Service Worker active)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
            >
              Done
            </button>

            <button
              type="button"
              onClick={handleTriggerInstall}
              className="px-4 py-2 bg-[#FF5A36] hover:bg-[#E04826] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Install Mobile App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
