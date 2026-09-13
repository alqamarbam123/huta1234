export interface Listing {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  phone: string;
  image: string;
  images?: string[];
  description: string;
  status: 'approved' | 'pending' | 'rejected';
  isFeatured: boolean;
  date: string;
  userId: string;
  views: number;
  serviceTrade?: string;
  pricingType?: 'fixed' | 'starting_at' | 'hourly' | 'quote';
  serviceArea?: string;
  isVerifiedPro?: boolean;
  isEmergency247?: boolean;
}

export interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  phone?: string;
  password?: string;
  securityQuestion: string;
  securityAnswer?: string;
  created: string;
}

export interface CategoryInfo {
  key: string;
  label: string;
  iconName: string;
}

export type ViewTab =
  | 'marketplace'
  | 'huta_in'
  | 'categories'
  | 'user_dashboard'
  | 'admin_dashboard'
  | 'more'
  | 'admin'
  | 'dashboard';

export interface ChatConversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice?: number;
  listingImage?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface AppSettings {
  deviceLayout: 'auto' | 'mobile' | 'tablet' | 'desktop';
  density: 'comfortable' | 'compact';
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'si' | 'ta';
  currency: 'LKR' | 'USD' | 'EUR';
  dataSaver: boolean;
  hapticFeedback: boolean;
  browserTabBadges: boolean;
  pushNotifications: boolean;
  soundEffects: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  district: string;
  date: string;
  month: string;
  day: string;
  time: string;
  location: string;
  venue: string;
  image: string;
  badge?: string;
  price: string;
  isFree: boolean;
  attendees: number;
  description: string;
  organizer: string;
  isSpotlight?: boolean;
}

export type HeroAnimationType = 'slide' | 'fade' | 'pulse' | 'glow';

export interface HeroAd {
  id: string;
  badge: string; // e.g. "Special Promotion", "Featured Partner"
  title: string; // e.g. "Find Premium Vehicles & Parts"
  highlightText?: string; // e.g. "with Zero Commission"
  subtitle: string; // e.g. "Direct contact with verified vehicle owners across Sri Lanka"
  ctaText?: string; // e.g. "Explore Vehicles" or "Post Ad Now"
  ctaAction?: string; // e.g. "Vehicles" (category) | "post_ad" | "https://..."
  bgImage?: string; // optional background graphic
  gradientTheme?: 'orange' | 'blue' | 'emerald' | 'purple' | 'amber';
  animationType?: HeroAnimationType;
  isActive: boolean;
  createdAt: string;
}

export interface HeroAdSettings {
  mode: 'default' | 'rotate' | 'ads_only';
  rotationIntervalSeconds: number;
}


