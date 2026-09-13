import { Listing, User, EventItem, HeroAd, HeroAdSettings } from '../types';

const API_BASE = '/api';

export const api = {
  // Listings
  async getListings(params?: {
    status?: string;
    category?: string;
    location?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    userId?: string;
  }): Promise<Listing[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.location) searchParams.set('location', params.location);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.minPrice !== undefined) searchParams.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) searchParams.set('maxPrice', params.maxPrice.toString());
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.userId) searchParams.set('userId', params.userId);

    const res = await fetch(`${API_BASE}/listings?${searchParams.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch listings: ${res.statusText}`);
    }
    return res.json();
  },

  async getListingById(id: string): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings/${id}`);
    if (!res.ok) {
      throw new Error('Listing not found');
    }
    return res.json();
  },

  async getListing(id: string): Promise<Listing> {
    return this.getListingById(id);
  },

  async createListing(data: Partial<Listing>): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create listing');
    }
    const created: Listing = await res.json();
    // If user is guest or creating an ad, remember on this device so they can easily edit
    if (!this.getCurrentUser()) {
      this.addGuestListingId(created.id);
    }
    return created;
  },

  getGuestListingIds(): string[] {
    try {
      const stored = localStorage.getItem('huta_guest_ad_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  addGuestListingId(id: string): void {
    try {
      const current = this.getGuestListingIds();
      if (!current.includes(id)) {
        current.unshift(id);
        localStorage.setItem('huta_guest_ad_ids', JSON.stringify(current));
      }
    } catch {
      // ignore
    }
  },

  removeGuestListingId(id: string): void {
    try {
      const current = this.getGuestListingIds().filter((adId) => adId !== id);
      localStorage.setItem('huta_guest_ad_ids', JSON.stringify(current));
    } catch {
      // ignore
    }
  },

  async updateListing(id: string, data: Partial<Listing>): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update listing');
    }
    return res.json();
  },

  async approveListing(id: string): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings/${id}/approve`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to approve listing');
    return res.json();
  },

  async rejectListing(id: string): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings/${id}/reject`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to reject listing');
    return res.json();
  },

  async toggleFeatureListing(id: string): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings/${id}/feature`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to toggle feature');
    return res.json();
  },

  async toggleVerifyPro(id: string): Promise<Listing> {
    const res = await fetch(`${API_BASE}/listings/${id}/verify-pro`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to toggle verified pro status');
    return res.json();
  },

  async incrementView(id: string): Promise<{ views: number }> {
    const res = await fetch(`${API_BASE}/listings/${id}/view`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to increment view');
    return res.json();
  },

  async deleteListing(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete listing');
    this.removeGuestListingId(id);
    return res.json();
  },

  // Auth
  async adminLogin(password: string): Promise<{ success: boolean; role: string }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Admin login failed');
    }
    const data = await res.json();
    try {
      localStorage.setItem('huta_admin', 'true');
    } catch {
      // ignore
    }
    return data;
  },

  isAdmin(): boolean {
    try {
      return localStorage.getItem('huta_admin') === 'true';
    } catch {
      return false;
    }
  },

  adminLogout(): void {
    try {
      localStorage.removeItem('huta_admin');
    } catch {
      // ignore
    }
  },

  async changeAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to change admin password');
    }
    return res.json();
  },

  async getAdminConfig(): Promise<{ autoApprove: boolean }> {
    const res = await fetch(`${API_BASE}/admin/config`);
    if (!res.ok) {
      return { autoApprove: true };
    }
    return res.json();
  },

  async updateAdminConfig(config: { autoApprove: boolean }): Promise<{ success: boolean; autoApprove: boolean }> {
    const res = await fetch(`${API_BASE}/admin/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update admin configuration');
    }
    return res.json();
  },

  async clearAllListings(): Promise<{ success: boolean; message: string; count: number }> {
    const res = await fetch(`${API_BASE}/admin/clear-all-listings`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to clear listings');
    }
    return res.json();
  },

  async userRegister(data: {
    username: string;
    fullname?: string;
    email?: string;
    phone?: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
  }): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    const user: User = await res.json();
    try {
      localStorage.setItem('huta_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    return user;
  },

  async userLogin(identifier: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: identifier, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const user: User = await res.json();
    try {
      localStorage.setItem('huta_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    return user;
  },

  async sendMobileOtp(phone: string): Promise<{ success: boolean; message: string; phone: string; devOtp?: string }> {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send OTP code');
    }
    return res.json();
  },

  async verifyMobileOtp(phone: string, otp: string, fullname?: string): Promise<{ success: boolean; message: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, fullname }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid or expired OTP code');
    }
    const data = await res.json();
    if (data.user) {
      try {
        localStorage.setItem('huta_user', JSON.stringify(data.user));
      } catch {
        // ignore
      }
    }
    return data;
  },

  async verifyAdOwnerOtp(listingId: string, phone: string, otp: string, fullname?: string): Promise<{ success: boolean; message: string; user: User; listing: Listing }> {
    const res = await fetch(`${API_BASE}/auth/verify-ad-owner-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, phone, otp, fullname }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Verification failed');
    }
    const data = await res.json();
    if (data.user) {
      try {
        localStorage.setItem('huta_user', JSON.stringify(data.user));
      } catch {
        // ignore
      }
    }
    return data;
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem('huta_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  userLogout(): void {
    try {
      localStorage.removeItem('huta_user');
    } catch {
      // ignore
    }
  },

  async getSecurityQuestion(username: string): Promise<{ question: string }> {
    const res = await fetch(`${API_BASE}/auth/get-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'User not found');
    }
    return res.json();
  },

  async resetPassword(username: string, answer: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, answer, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Password reset failed');
    }
    return res.json();
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Password update failed');
    }
    return res.json();
  },

  // AI Assistant
  async suggestDescription(params: {
    title: string;
    category: string;
    price?: number;
    location?: string;
    condition?: string;
    notes?: string;
  }): Promise<{ description: string; source: string }> {
    const res = await fetch(`${API_BASE}/ai/suggest-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate description');
    }
    return res.json();
  },

  // Events & Upcoming Spotlight
  async getEvents(params?: { category?: string; district?: string; spotlight?: boolean }): Promise<EventItem[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.district) searchParams.set('district', params.district);
      if (params?.spotlight !== undefined) searchParams.set('spotlight', String(params.spotlight));

      const res = await fetch(`${API_BASE}/events?${searchParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          try {
            localStorage.setItem('huta_cached_events', JSON.stringify(data));
          } catch {
            // ignore
          }
          return data;
        }
      }
    } catch {
      // Ignore network errors and try local cache
    }

    try {
      const cached = localStorage.getItem('huta_cached_events');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    return [];
  },

  async createEvent(data: Partial<EventItem>): Promise<EventItem> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create event');
    }
    return res.json();
  },

  async updateEvent(id: string, data: Partial<EventItem>): Promise<EventItem> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update event');
    }
    return res.json();
  },

  async toggleSpotlightEvent(id: string): Promise<EventItem> {
    const res = await fetch(`${API_BASE}/events/${id}/spotlight`, {
      method: 'PUT',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to toggle spotlight');
    }
    return res.json();
  },

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete event');
    }
    return res.json();
  },

  // Hero Ads & Banners
  async getHeroAds(): Promise<{ settings: HeroAdSettings; ads: HeroAd[] }> {
    try {
      const res = await fetch(`${API_BASE}/hero-ads`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.ads)) {
          try {
            localStorage.setItem('huta_hero_ads_cache', JSON.stringify(data));
          } catch {
            // ignore
          }
          return data;
        }
      }
    } catch {
      // ignore network error
    }

    try {
      const cached = localStorage.getItem('huta_hero_ads_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.ads)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    return {
      settings: {
        mode: 'default',
        rotationIntervalSeconds: 6,
      },
      ads: [
        {
          id: 'hero-ad-1',
          badge: '🌟 Exclusive Promotion',
          title: 'Sell Your Vehicle or Property in 24 Hours',
          highlightText: 'with HUTA Turbo Ad',
          subtitle: 'Direct WhatsApp inquiries from thousands of verified buyers across all 25 districts with zero broker fees.',
          ctaText: 'Post Free Ad Now',
          ctaAction: 'post_ad',
          gradientTheme: 'orange',
          animationType: 'pulse',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'hero-ad-2',
          badge: '🏢 Featured Developer',
          title: 'Discover Luxury Beachside Apartments & Land',
          highlightText: 'in Colombo, Galle & Kandy',
          subtitle: 'Explore 1,200+ verified listings with clear deeds, video walkthroughs, and direct developer contacts.',
          ctaText: 'Explore Properties',
          ctaAction: 'Property',
          gradientTheme: 'blue',
          animationType: 'slide',
          isActive: true,
          createdAt: new Date().toISOString(),
        }
      ],
    };
  },

  async updateHeroAdSettings(settings: Partial<HeroAdSettings>): Promise<HeroAdSettings> {
    const res = await fetch(`${API_BASE}/admin/hero-ads/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update hero ad settings');
    }
    return res.json();
  },

  async createHeroAd(data: Partial<HeroAd>): Promise<HeroAd> {
    const res = await fetch(`${API_BASE}/admin/hero-ads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create hero ad');
    }
    return res.json();
  },

  async updateHeroAd(id: string, data: Partial<HeroAd>): Promise<HeroAd> {
    const res = await fetch(`${API_BASE}/admin/hero-ads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update hero ad');
    }
    return res.json();
  },

  async toggleHeroAd(id: string): Promise<HeroAd> {
    const res = await fetch(`${API_BASE}/admin/hero-ads/${id}/toggle`, {
      method: 'PUT',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to toggle hero ad');
    }
    return res.json();
  },

  async deleteHeroAd(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/hero-ads/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete hero ad');
    }
    return res.json();
  }
};
