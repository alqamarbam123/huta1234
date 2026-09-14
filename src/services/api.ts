import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Listing, User, EventItem, HeroAd, HeroAdSettings } from '../types';

const API_BASE = '/api';

// Sri Lankan phone normalizer
function normalizeSriLankanPhone(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.startsWith('94') && digits.length >= 11) {
    return '0' + digits.substring(2);
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return digits;
  }
  if (digits.length === 9) {
    return '0' + digits;
  }
  return digits;
}

// Local OTP store for client-side SMS verification fallback
interface LocalOtpRecord {
  code: string;
  expiresAt: number;
}
const localOtpMap = new Map<string, LocalOtpRecord>();

export const api = {
  // -------------------------------------------------------------
  // Real-Time Marketplace Listings (backed by Cloud Firestore)
  // -------------------------------------------------------------

  /**
   * Subscribe to live real-time listing updates across all devices & deployments
   */
  subscribeToListings(callback: (listings: Listing[]) => void): () => void {
    try {
      const colRef = collection(db, 'listings');
      return onSnapshot(
        colRef,
        (snapshot) => {
          const items: Listing[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as Listing);
          });
          // Sort newest first
          items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          callback(items);
        },
        (err) => {
          console.warn('Firestore real-time subscription error, using polling fallback:', err);
        }
      );
    } catch {
      return () => {};
    }
  },

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
    let listings: Listing[] = [];

    // 1. Primary Source: Cloud Firestore (shared across Vercel and Cloud Run)
    try {
      const colRef = collection(db, 'listings');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        snap.forEach((d) => {
          listings.push(d.data() as Listing);
        });
      }
    } catch (firestoreErr) {
      console.warn('Direct Firestore fetch error, trying backend API:', firestoreErr);
    }

    // 2. Fallback to backend API if Firestore returned empty or failed
    if (listings.length === 0) {
      try {
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
        if (res.ok) {
          const apiListings = await res.json();
          if (Array.isArray(apiListings) && apiListings.length > 0) {
            listings = apiListings;
          }
        }
      } catch {
        // Backend not available (e.g. running standalone on Vercel)
      }
    }

    // 3. Client-side filtering
    let filtered = [...listings];

    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((l) => l.status === params.status);
    }

    if (params?.category && params.category !== 'All') {
      filtered = filtered.filter((l) => l.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params?.location && params.location !== 'All') {
      filtered = filtered.filter(
        (l) =>
          (l.district && l.district.toLowerCase() === params.location!.toLowerCase()) ||
          (l.location && l.location.toLowerCase().includes(params.location!.toLowerCase()))
      );
    }

    if (params?.search) {
      const queryStr = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(queryStr) ||
          l.description.toLowerCase().includes(queryStr) ||
          l.location.toLowerCase().includes(queryStr) ||
          (l.district && l.district.toLowerCase().includes(queryStr))
      );
    }

    if (params?.minPrice !== undefined) {
      filtered = filtered.filter((l) => l.price >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      filtered = filtered.filter((l) => l.price <= params.maxPrice!);
    }

    if (params?.userId) {
      filtered = filtered.filter((l) => l.userId === params.userId);
    }

    // Sort
    if (params?.sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (params?.sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return filtered;
  },

  async getListingById(id: string): Promise<Listing> {
    // Check Firestore directly
    try {
      const docRef = doc(db, 'listings', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Listing;
      }
    } catch {
      // ignore and try fallback
    }

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
    const adminConfig = await this.getAdminConfig();
    const autoApprove = adminConfig.autoApprove;

    const id = data.id || `ad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newListing: Listing = {
      id,
      title: String(data.title || '').trim(),
      category: String(data.category || 'Other').trim(),
      price: Number(data.price) || 0,
      pricingType: data.pricingType || (data.category === 'Services' ? 'starting_at' : 'fixed'),
      phone: String(data.phone || '').trim(),
      location: String(data.location || 'Colombo').trim(),
      district: String(data.district || 'Colombo').trim(),
      description: String(data.description || '').trim(),
      image: data.image || (data.images && data.images[0]) || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
      images: data.images && data.images.length > 0 ? data.images : [data.image || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80'],
      status: data.status || (autoApprove ? 'approved' : 'pending'),
      isFeatured: Boolean(data.isFeatured),
      views: Number(data.views) || 0,
      isVerifiedPro: Boolean(data.isVerifiedPro),
      userId: data.userId || 'guest',
      sellerName: data.sellerName || 'Direct Seller',
      createdAt: data.createdAt || now,
      updatedAt: now,
      itemCondition: data.itemCondition,
      brand: data.brand,
      model: data.model,
      date: now.split('T')[0],
      serviceTrade: data.serviceTrade,
      serviceArea: data.serviceArea,
      isEmergency247: data.isEmergency247,
    };

    // 1. Write to shared Cloud Firestore (reflects on Vercel + Cloud Run immediately)
    try {
      await setDoc(doc(db, 'listings', id), newListing);
    } catch (fsErr) {
      console.warn('Failed to write listing to Firestore directly:', fsErr);
    }

    // 2. Also notify backend API if running
    try {
      await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing),
      });
    } catch {
      // Backend not reached (Vercel standalone)
    }

    // If user is guest or creating an ad, remember on this device so they can easily edit
    if (!this.getCurrentUser()) {
      this.addGuestListingId(newListing.id);
    }

    return newListing;
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
    const updatedAt = new Date().toISOString();
    const updates = { ...data, updatedAt };

    // 1. Update in Firestore
    try {
      await setDoc(doc(db, 'listings', id), updates, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore update listing error:', fsErr);
    }

    // 2. Also update backend API if reachable
    try {
      const res = await fetch(`${API_BASE}/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Standalone
    }

    return this.getListingById(id);
  },

  async approveListing(id: string): Promise<Listing> {
    return this.updateListing(id, { status: 'approved' });
  },

  async rejectListing(id: string): Promise<Listing> {
    return this.updateListing(id, { status: 'rejected' });
  },

  async toggleFeatureListing(id: string): Promise<Listing> {
    const current = await this.getListingById(id);
    return this.updateListing(id, { isFeatured: !current.isFeatured });
  },

  async toggleVerifyPro(id: string): Promise<Listing> {
    const current = await this.getListingById(id);
    return this.updateListing(id, { verifiedPro: !current.verifiedPro });
  },

  async incrementView(id: string): Promise<{ views: number }> {
    try {
      const current = await this.getListingById(id);
      const views = (current.views || 0) + 1;
      await updateDoc(doc(db, 'listings', id), { views });
      return { views };
    } catch {
      return { views: 1 };
    }
  },

  async deleteListing(id: string): Promise<{ success: boolean }> {
    try {
      await deleteDoc(doc(db, 'listings', id));
    } catch (fsErr) {
      console.warn('Firestore delete error:', fsErr);
    }

    try {
      await fetch(`${API_BASE}/listings/${id}`, { method: 'DELETE' });
    } catch {
      // Standalone
    }

    this.removeGuestListingId(id);
    return { success: true };
  },

  async clearAllListings(): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const snap = await getDocs(collection(db, 'listings'));
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      console.warn('Firestore clear error:', e);
    }

    try {
      await fetch(`${API_BASE}/admin/clear-all-listings`, { method: 'POST' });
    } catch {
      // Standalone
    }

    return { success: true, message: 'All listings removed for fresh launch', count: 0 };
  },

  // -------------------------------------------------------------
  // Administrative Management & Unified Password Storage
  // -------------------------------------------------------------

  async getAdminConfig(): Promise<{ autoApprove: boolean; password?: string }> {
    try {
      const docRef = doc(db, 'admin_config', 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          autoApprove: data.autoApprove !== undefined ? Boolean(data.autoApprove) : false,
          password: data.password || 'admin123',
        };
      } else {
        // Initialize default in Firestore
        const defaultCfg = { autoApprove: false, password: 'admin123', updatedAt: new Date().toISOString() };
        await setDoc(docRef, defaultCfg);
        return defaultCfg;
      }
    } catch {
      // Fallback to server API
      try {
        const res = await fetch(`${API_BASE}/admin/config`);
        if (res.ok) return res.json();
      } catch {
        // ignore
      }
    }
    return { autoApprove: false, password: 'admin123' };
  },

  async adminLogin(password: string): Promise<{ success: boolean; role: string }> {
    const config = await this.getAdminConfig();
    const expectedPassword = config.password || 'admin123';

    if (password === expectedPassword) {
      try {
        localStorage.setItem('huta_admin', 'true');
      } catch {
        // ignore
      }
      return { success: true, role: 'admin' };
    }

    // Secondary check with server if password didn't match local cache
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        localStorage.setItem('huta_admin', 'true');
        return { success: true, role: 'admin' };
      }
    } catch {
      // ignore
    }

    throw new Error('Invalid admin credentials');
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
    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required.');
    }
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }

    const config = await this.getAdminConfig();
    const activeAdminPassword = config.password || 'admin123';

    if (currentPassword !== activeAdminPassword) {
      throw new Error('Incorrect current admin password.');
    }

    // 1. Update in shared Cloud Firestore (reflects on Vercel + Cloud Run simultaneously)
    const docRef = doc(db, 'admin_config', 'main');
    await setDoc(docRef, { password: newPassword, updatedAt: new Date().toISOString() }, { merge: true });

    // 2. Sync to server file if reachable
    try {
      await fetch(`${API_BASE}/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch {
      // Standalone
    }

    return { success: true, message: 'Admin password updated successfully in Cloud Firestore!' };
  },

  async updateAdminConfig(config: { autoApprove: boolean }): Promise<{ success: boolean; autoApprove: boolean }> {
    const docRef = doc(db, 'admin_config', 'main');
    await setDoc(docRef, { autoApprove: config.autoApprove, updatedAt: new Date().toISOString() }, { merge: true });

    try {
      await fetch(`${API_BASE}/admin/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch {
      // Standalone
    }

    return { success: true, autoApprove: config.autoApprove };
  },

  // -------------------------------------------------------------
  // User Authentication & Account Management (Shared Firestore)
  // -------------------------------------------------------------

  async userRegister(data: {
    username: string;
    fullname?: string;
    email?: string;
    phone?: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
  }): Promise<User> {
    const cleanUsername = String(data.username).trim().toLowerCase();
    const cleanPhone = data.phone ? normalizeSriLankanPhone(String(data.phone)) : undefined;

    if (!cleanUsername || !data.password || !data.securityQuestion || !data.securityAnswer) {
      throw new Error('Username, password, and security question are required.');
    }
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Check if user exists in Firestore
    try {
      const snap = await getDocs(collection(db, 'users'));
      let exists = false;
      snap.forEach((d) => {
        const u = d.data() as User;
        if (
          u.username.toLowerCase() === cleanUsername ||
          (cleanPhone && u.phone && normalizeSriLankanPhone(u.phone) === cleanPhone)
        ) {
          exists = true;
        }
      });
      if (exists) {
        throw new Error('Username or mobile phone already registered.');
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('already registered')) throw e;
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      username: cleanUsername,
      fullname: data.fullname ? String(data.fullname).trim() : cleanUsername,
      email: data.email ? String(data.email).trim() : `${cleanUsername}@huta.lk`,
      phone: cleanPhone,
      password: String(data.password),
      securityQuestion: String(data.securityQuestion),
      securityAnswer: String(data.securityAnswer).trim().toLowerCase(),
      created: new Date().toISOString(),
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } catch (fsErr) {
      console.warn('Firestore user register error:', fsErr);
    }

    // Sync to server API if reachable
    try {
      await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // Standalone
    }

    try {
      localStorage.setItem('huta_user', JSON.stringify(newUser));
    } catch {
      // ignore
    }

    return newUser;
  },

  async userLogin(identifier: string, password: string): Promise<User> {
    const cleanId = String(identifier).trim().toLowerCase();
    const cleanPhone = normalizeSriLankanPhone(identifier);

    // 1. Check in Cloud Firestore
    try {
      const snap = await getDocs(collection(db, 'users'));
      let foundUser: User | null = null;
      snap.forEach((d) => {
        const u = d.data() as User;
        if (
          u.username.toLowerCase() === cleanId ||
          (u.email && u.email.toLowerCase() === cleanId) ||
          (cleanPhone && u.phone && normalizeSriLankanPhone(u.phone) === cleanPhone)
        ) {
          if (u.password === password) {
            foundUser = u;
          }
        }
      });

      if (foundUser) {
        localStorage.setItem('huta_user', JSON.stringify(foundUser));
        return foundUser;
      }
    } catch {
      // Check server API fallback
    }

    // 2. Check server API fallback
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: identifier, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid username or password');
    }
    const user: User = await res.json();
    try {
      localStorage.setItem('huta_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    return user;
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
    const clean = String(username).trim().toLowerCase();
    try {
      const snap = await getDocs(collection(db, 'users'));
      let q = '';
      snap.forEach((d) => {
        const u = d.data() as User;
        if (u.username.toLowerCase() === clean || (u.phone && normalizeSriLankanPhone(u.phone) === normalizeSriLankanPhone(clean))) {
          q = u.securityQuestion || '';
        }
      });
      if (q) return { question: q };
    } catch {
      // fallback
    }

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
    const clean = String(username).trim().toLowerCase();
    const cleanAns = String(answer).trim().toLowerCase();

    try {
      const snap = await getDocs(collection(db, 'users'));
      let targetUser: User | null = null;
      snap.forEach((d) => {
        const u = d.data() as User;
        if (u.username.toLowerCase() === clean || (u.phone && normalizeSriLankanPhone(u.phone) === normalizeSriLankanPhone(clean))) {
          targetUser = u;
        }
      });

      if (targetUser) {
        const u = targetUser as User;
        if ((u.securityAnswer || '').trim().toLowerCase() === cleanAns) {
          await updateDoc(doc(db, 'users', u.id), { password: newPassword });
          return { success: true, message: 'Password reset successfully in Firestore!' };
        } else {
          throw new Error('Incorrect answer to security question.');
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('Incorrect answer')) throw e;
    }

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
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const u = snap.data() as User;
        if (u.password === currentPassword) {
          await updateDoc(userRef, { password: newPassword });
          return { success: true, message: 'Password updated successfully!' };
        } else {
          throw new Error('Incorrect current password.');
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('Incorrect current')) throw e;
    }

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

  // -------------------------------------------------------------
  // Mobile OTP Verification (Works on Vercel & Cloud Run)
  // -------------------------------------------------------------

  async sendMobileOtp(phone: string): Promise<{ success: boolean; message: string; phone: string; devOtp?: string }> {
    const cleanPhone = normalizeSriLankanPhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      throw new Error('Please enter a valid 10-digit Sri Lankan phone number (e.g. 0771234567)');
    }

    // Try server API first
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Standalone Vercel fallback
    }

    // Client-side OTP generator fallback (e.g. on Vercel)
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    localOtpMap.set(cleanPhone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return {
      success: true,
      message: `OTP Code sent to ${cleanPhone}. In development/preview mode, use code: ${code}`,
      phone: cleanPhone,
      devOtp: code,
    };
  },

  async verifyMobileOtp(phone: string, otp: string, fullname?: string): Promise<{ success: boolean; message: string; user: User }> {
    const cleanPhone = normalizeSriLankanPhone(phone);

    // Try server API first
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp, fullname }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem('huta_user', JSON.stringify(data.user));
        }
        return data;
      }
    } catch {
      // Standalone Vercel fallback
    }

    // Verify against local OTP map or master dev code '1234'
    const record = localOtpMap.get(cleanPhone);
    const isValid = (record && record.code === otp.trim() && Date.now() < record.expiresAt) || otp.trim() === '1234';

    if (!isValid) {
      throw new Error('Invalid or expired OTP code. Please try again.');
    }

    // Find or create user in Firestore
    let existingUser: User | null = null;
    try {
      const snap = await getDocs(collection(db, 'users'));
      snap.forEach((d) => {
        const u = d.data() as User;
        if (u.phone && normalizeSriLankanPhone(u.phone) === cleanPhone) {
          existingUser = u;
        }
      });
    } catch {
      // ignore
    }

    if (!existingUser) {
      existingUser = {
        id: 'user_' + Date.now(),
        username: `user_${cleanPhone.slice(-4)}_${Math.random().toString(36).substring(2, 5)}`,
        fullname: fullname || `Seller ${cleanPhone.slice(-4)}`,
        email: `${cleanPhone}@huta.lk`,
        phone: cleanPhone,
        created: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'users', existingUser.id), existingUser);
      } catch {
        // ignore
      }
    }

    localStorage.setItem('huta_user', JSON.stringify(existingUser));
    return {
      success: true,
      message: 'Mobile number verified successfully!',
      user: existingUser,
    };
  },

  async verifyAdOwnerOtp(listingId: string, phone: string, otp: string, fullname?: string): Promise<{ success: boolean; message: string; user: User; listing: Listing }> {
    const res = await this.verifyMobileOtp(phone, otp, fullname);
    const listing = await this.getListingById(listingId);

    // Associate ad with user if not already set
    if (!listing.userId || listing.userId === 'guest' || listing.userId === 'system') {
      await this.updateListing(listingId, { userId: res.user.id });
    }

    return {
      success: true,
      message: 'Ad ownership verified successfully!',
      user: res.user,
      listing,
    };
  },

  // -------------------------------------------------------------
  // AI Description Generator
  // -------------------------------------------------------------

  async suggestDescription(params: {
    title: string;
    category: string;
    price?: number;
    location?: string;
    condition?: string;
    notes?: string;
  }): Promise<{ description: string; source: string }> {
    // 1. Try server-side Gemini API
    try {
      const res = await fetch(`${API_BASE}/ai/suggest-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Standalone Vercel fallback
    }

    // 2. High-quality client-side description generator fallback
    const { title, category, price, location, condition, notes } = params;
    const priceText = price ? `Rs. ${price.toLocaleString()}` : 'Negotiable';
    const locText = location || 'Sri Lanka';
    const condText = condition || 'Excellent Condition';

    const desc = `${title.toUpperCase()} FOR SALE IN ${locText.toUpperCase()}

• Item / Model: ${title}
• Category: ${category}
• Condition: ${condText}
• Price: ${priceText} (Direct seller, genuine buyers welcome)
• Location: ${locText}

${notes ? `Additional Details:\n${notes}\n\n` : ''}Key Features & Highlights:
- Well maintained and in 100% working condition.
- Genuine sale by owner.
- Inspection can be arranged upon request in ${locText}.
- Price is slightly negotiable after personal inspection.

For quick inquiries, call or send a message via WhatsApp!`;

    return {
      description: desc,
      source: 'smart-template-engine',
    };
  },

  // -------------------------------------------------------------
  // Events & Community Spotlights (Shared Firestore)
  // -------------------------------------------------------------

  async getEvents(params?: { category?: string; district?: string; spotlight?: boolean }): Promise<EventItem[]> {
    let events: EventItem[] = [];

    try {
      const snap = await getDocs(collection(db, 'events'));
      if (!snap.empty) {
        snap.forEach((d) => events.push(d.data() as EventItem));
      }
    } catch {
      // fallback
    }

    if (events.length === 0) {
      try {
        const res = await fetch(`${API_BASE}/events`);
        if (res.ok) {
          events = await res.json();
        }
      } catch {
        // ignore
      }
    }

    // Fallback seed events if empty
    if (events.length === 0) {
      events = [
        {
          id: 'evt-colombo-motor-show',
          title: 'Colombo International Motor Show 2026',
          category: 'Automotive',
          district: 'Colombo',
          date: 'OCT 24 - 26, 2026',
          month: 'OCT',
          day: '24',
          time: '09:00 AM - 08:00 PM',
          location: 'BMICH, Colombo 07',
          venue: 'Sirimavo Bandaranaike Memorial Exhibition Centre',
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
          badge: 'Premier Expo',
          price: 'Rs. 500 Entry',
          isFree: false,
          attendees: 15000,
          description: "Sri Lanka's largest automotive gathering featuring new vehicle launches, classic car displays, EV technology showcases, and custom bike expos.",
          organizer: 'Motor Traders Association of Sri Lanka',
          isSpotlight: true,
        },
      ];
    }

    let filtered = [...events];
    if (params?.spotlight) {
      filtered = filtered.filter((e) => e.isSpotlight);
    }
    if (params?.category && params.category !== 'All') {
      filtered = filtered.filter((e) => e.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.district && params.district !== 'All') {
      filtered = filtered.filter((e) => e.district.toLowerCase() === params.district!.toLowerCase());
    }

    return filtered;
  },

  async createEvent(data: Partial<EventItem>): Promise<EventItem> {
    const id = data.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newEvent: EventItem = {
      id,
      title: String(data.title || '').trim(),
      category: String(data.category || 'General').trim(),
      district: data.district || 'Colombo',
      date: data.date || 'Upcoming 2026',
      month: data.month || 'OCT',
      day: data.day || '01',
      time: data.time || '10:00 AM - 06:00 PM',
      location: data.location || data.district || 'Colombo',
      venue: data.venue || 'Event Venue',
      image: data.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      badge: data.badge || 'Featured',
      price: data.price || 'Free Entry',
      isFree: Boolean(data.isFree),
      attendees: data.attendees || 1000,
      description: data.description || '',
      organizer: data.organizer || 'HUTA Community',
      isSpotlight: data.isSpotlight !== undefined ? Boolean(data.isSpotlight) : true,
    };

    try {
      await setDoc(doc(db, 'events', id), newEvent);
    } catch {
      // ignore
    }

    try {
      await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
    } catch {
      // Standalone
    }

    return newEvent;
  },

  async updateEvent(id: string, data: Partial<EventItem>): Promise<EventItem> {
    try {
      await setDoc(doc(db, 'events', id), data, { merge: true });
    } catch {
      // ignore
    }

    try {
      await fetch(`${API_BASE}/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // Standalone
    }

    const events = await this.getEvents();
    return events.find((e) => e.id === id) || (data as EventItem);
  },

  async toggleSpotlightEvent(id: string): Promise<EventItem> {
    const events = await this.getEvents();
    const event = events.find((e) => e.id === id);
    const nextSpotlight = event ? !event.isSpotlight : true;
    return this.updateEvent(id, { isSpotlight: nextSpotlight });
  },

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch {
      // ignore
    }
    try {
      await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
    } catch {
      // Standalone
    }
    return { success: true };
  },

  // -------------------------------------------------------------
  // Hero Banner Ads & Promotional Settings (Shared Firestore)
  // -------------------------------------------------------------

  async getHeroAds(): Promise<{ settings: HeroAdSettings; ads: HeroAd[] }> {
    try {
      const docRef = doc(db, 'hero_ads', 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as { settings: HeroAdSettings; ads: HeroAd[] };
      }
    } catch {
      // fallback
    }

    try {
      const res = await fetch(`${API_BASE}/hero-ads`);
      if (res.ok) {
        return res.json();
      }
    } catch {
      // Standalone
    }

    const defaultHero = {
      settings: {
        mode: 'default' as const,
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
          gradientTheme: 'orange' as const,
          animationType: 'pulse' as const,
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
          gradientTheme: 'blue' as const,
          animationType: 'slide' as const,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    try {
      await setDoc(doc(db, 'hero_ads', 'main'), defaultHero);
    } catch {
      // ignore
    }

    return defaultHero;
  },

  async updateHeroAdSettings(settings: Partial<HeroAdSettings>): Promise<HeroAdSettings> {
    const current = await this.getHeroAds();
    const updated = { ...current.settings, ...settings };
    try {
      await setDoc(doc(db, 'hero_ads', 'main'), { settings: updated }, { merge: true });
    } catch {
      // ignore
    }
    return updated;
  },

  async createHeroAd(data: Partial<HeroAd>): Promise<HeroAd> {
    const current = await this.getHeroAds();
    const newAd: HeroAd = {
      id: `hero-ad-${Date.now()}`,
      badge: String(data.badge || 'Sponsored Promotion').trim(),
      title: String(data.title || '').trim(),
      highlightText: data.highlightText ? String(data.highlightText).trim() : undefined,
      subtitle: String(data.subtitle || '').trim(),
      ctaText: data.ctaText ? String(data.ctaText).trim() : undefined,
      ctaAction: data.ctaAction ? String(data.ctaAction).trim() : undefined,
      bgImage: data.bgImage ? String(data.bgImage).trim() : undefined,
      gradientTheme: data.gradientTheme || 'orange',
      animationType: data.animationType || 'slide',
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdAt: new Date().toISOString(),
    };

    const updatedAds = [newAd, ...current.ads];
    try {
      await setDoc(doc(db, 'hero_ads', 'main'), { ads: updatedAds }, { merge: true });
    } catch {
      // ignore
    }
    return newAd;
  },

  async updateHeroAd(id: string, data: Partial<HeroAd>): Promise<HeroAd> {
    const current = await this.getHeroAds();
    const updatedAds = current.ads.map((a) => (a.id === id ? { ...a, ...data } : a));
    try {
      await setDoc(doc(db, 'hero_ads', 'main'), { ads: updatedAds }, { merge: true });
    } catch {
      // ignore
    }
    return updatedAds.find((a) => a.id === id) || (data as HeroAd);
  },

  async toggleHeroAd(id: string): Promise<HeroAd> {
    const current = await this.getHeroAds();
    const target = current.ads.find((a) => a.id === id);
    const nextActive = target ? !target.isActive : true;
    return this.updateHeroAd(id, { isActive: nextActive });
  },

  async deleteHeroAd(id: string): Promise<{ success: boolean }> {
    const current = await this.getHeroAds();
    const updatedAds = current.ads.filter((a) => a.id !== id);
    try {
      await setDoc(doc(db, 'hero_ads', 'main'), { ads: updatedAds }, { merge: true });
    } catch {
      // ignore
    }
    return { success: true };
  },
};
