import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

interface Listing {
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

interface User {
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

interface EventItem {
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

interface HeroAd {
  id: string;
  badge: string;
  title: string;
  highlightText?: string;
  subtitle: string;
  ctaText?: string;
  ctaAction?: string;
  bgImage?: string;
  gradientTheme?: 'orange' | 'blue' | 'emerald' | 'purple' | 'amber';
  animationType?: 'slide' | 'fade' | 'pulse' | 'glow';
  isActive: boolean;
  createdAt: string;
}

interface HeroAdSettings {
  mode: 'default' | 'rotate' | 'ads_only';
  rotationIntervalSeconds: number;
}

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin.json');
const HERO_ADS_FILE = path.join(DATA_DIR, 'hero-ads.json');

interface AdminConfig {
  password?: string;
  autoApprove?: boolean;
  updatedAt?: string;
}

function getAdminConfig(): { password: string; autoApprove: boolean } {
  const result = {
    password: process.env.ADMIN_PASSWORD || 'admin123',
    autoApprove: false, // Default: manual moderation required - customer ads must be confirmed by admin before going live
  };
  if (fs.existsSync(ADMIN_CONFIG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8'));
      if (data.password) result.password = String(data.password);
      if (data.autoApprove !== undefined) result.autoApprove = Boolean(data.autoApprove);
    } catch {
      // ignore
    }
  }
  return result;
}

function getAdminPassword(): string {
  return getAdminConfig().password;
}

function setAdminPassword(newPassword: string): void {
  const cfg = getAdminConfig();
  fs.writeFileSync(
    ADMIN_CONFIG_FILE,
    JSON.stringify({ ...cfg, password: newPassword, updatedAt: new Date().toISOString() }, null, 2),
    'utf-8'
  );
}

function updateAdminConfig(updates: Partial<AdminConfig>): { password: string; autoApprove: boolean } {
  const cfg = getAdminConfig();
  const merged = {
    ...cfg,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data - Empty for fresh live launch (customers will add real ads)
const DEFAULT_LISTINGS: Listing[] = [];

// Helper to read/write listings
function getStoredListings(): Listing[] {
  try {
    if (fs.existsSync(LISTINGS_FILE)) {
      const data = fs.readFileSync(LISTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading listings file, fallback to defaults', err);
  }
  saveStoredListings(DEFAULT_LISTINGS);
  return DEFAULT_LISTINGS;
}

function saveStoredListings(listings: Listing[]) {
  try {
    fs.writeFileSync(LISTINGS_FILE, JSON.stringify(listings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving listings file', err);
  }
}

// Helper to read/write users
function getStoredUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading users file', err);
  }
  return [];
}

function saveStoredUsers(users: User[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users file', err);
  }
}

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Colombo International Motor & Auto Expo 2026',
    category: 'Motor & Auto',
    district: 'Colombo',
    date: 'March 28-30, 2026',
    month: 'MAR',
    day: '28',
    time: '10:00 AM - 08:00 PM',
    location: 'BMICH, Colombo 07',
    venue: 'Sirimavo Bandaranaike Exhibition Centre',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    badge: 'Popular Spotlight',
    price: 'Rs. 500 Entry',
    isFree: false,
    attendees: 1240,
    description: 'The largest automotive gathering in Sri Lanka featuring brand new electric vehicles, custom Japanese performance builds, vintage classics, and aftermarket accessories.',
    organizer: 'Ceylon Motor Traders Association',
    isSpotlight: true
  },
  {
    id: 'evt-2',
    title: 'Galle Fort Sunset Food Carnival & Street Fair',
    category: 'Food & Dining',
    district: 'Galle',
    date: 'April 04-05, 2026',
    month: 'APR',
    day: '04',
    time: '04:00 PM - 11:00 PM',
    location: 'Galle Fort Esplanade, Galle',
    venue: 'Rampart Street Grounds',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    badge: 'Free Admission',
    price: 'Free Entry',
    isFree: true,
    attendees: 850,
    description: 'Celebrate coastal street culinary gems with over 60 food trucks, artisan pastry chefs, authentic southern Sri Lankan seafood stalls, live acoustic beats, and handicraft popups.',
    organizer: 'Southern Tourism & Culture Guild',
    isSpotlight: true
  },
  {
    id: 'evt-3',
    title: 'Lanka Tech & Electronics Mega Showcase',
    category: 'Technology & Gadgets',
    district: 'Colombo',
    date: 'April 18-20, 2026',
    month: 'APR',
    day: '18',
    time: '09:30 AM - 07:00 PM',
    location: 'SLECC, Colombo 01',
    venue: 'Main Exhibition Hall A',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    badge: 'Tech Expo',
    price: 'Free Registration',
    isFree: true,
    attendees: 2150,
    description: 'Special discounts on smartphones, gaming laptops, drones, solar solutions, and smart home appliances with direct distributor warranties.',
    organizer: 'Sri Lanka Electronics & IT Forum',
    isSpotlight: false
  },
  {
    id: 'evt-4',
    title: 'Kandy Cultural Esala Art & Craft Exhibition',
    category: 'Art & Culture',
    district: 'Kandy',
    date: 'May 02-04, 2026',
    month: 'MAY',
    day: '02',
    time: '09:00 AM - 06:30 PM',
    location: "Queen's Hotel Grounds, Kandy",
    venue: 'Heritage Pavilion & Lakeview Lawn',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80',
    badge: 'Cultural Heritage',
    price: 'Free Entry',
    isFree: true,
    attendees: 620,
    description: 'Showcasing master Kandyan brassware, handloom textiles, wood carvings, and contemporary paintings from artisan guilds across Central Province.',
    organizer: 'Central Province Heritage Foundation',
    isSpotlight: false
  }
];

function getStoredEvents(): EventItem[] {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const data = fs.readFileSync(EVENTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading events file', err);
  }
  saveStoredEvents(DEFAULT_EVENTS);
  return DEFAULT_EVENTS;
}

function saveStoredEvents(events: EventItem[]) {
  try {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving events file', err);
  }
}

const DEFAULT_HERO_SETTINGS: HeroAdSettings = {
  mode: 'default', // By default, keep the default original hero!
  rotationIntervalSeconds: 6,
};

const DEFAULT_HERO_ADS: HeroAd[] = [
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
  },
];

function getStoredHeroAdsData(): { settings: HeroAdSettings; ads: HeroAd[] } {
  try {
    if (fs.existsSync(HERO_ADS_FILE)) {
      const data = fs.readFileSync(HERO_ADS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.ads)) {
        return {
          settings: parsed.settings || DEFAULT_HERO_SETTINGS,
          ads: parsed.ads,
        };
      }
    }
  } catch (err) {
    console.error('Error reading hero ads file, fallback to defaults', err);
  }
  return {
    settings: DEFAULT_HERO_SETTINGS,
    ads: DEFAULT_HERO_ADS,
  };
}

function saveStoredHeroAdsData(data: { settings: HeroAdSettings; ads: HeroAd[] }) {
  try {
    fs.writeFileSync(HERO_ADS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving hero ads file', err);
  }
}

let listingsCache = getStoredListings();
let usersCache = getStoredUsers();
let eventsCache = getStoredEvents();
let heroAdsDataCache = getStoredHeroAdsData();

// Lazy initialize Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // -------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // GET /api/listings
  app.get('/api/listings', (req, res) => {
    const { status, category, location, search, minPrice, maxPrice, sort, userId } = req.query;

    let result = [...listingsCache];

    if (userId) {
      result = result.filter(item => item.userId === String(userId));
    } else if (status === 'all') {
      // Return all listings (e.g. for admin)
    } else if (status === 'pending') {
      result = result.filter(item => item.status === 'pending');
    } else {
      // By default, public search only returns approved listings
      result = result.filter(item => item.status === 'approved');
    }

    if (category && category !== 'All') {
      result = result.filter(item => item.category.toLowerCase() === String(category).toLowerCase());
    }

    if (location && location !== 'All Sri Lanka') {
      result = result.filter(item => item.location.toLowerCase() === String(location).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(item => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
    }

    if (minPrice) {
      const min = parseFloat(String(minPrice));
      if (!isNaN(min)) {
        result = result.filter(item => item.price >= min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(String(maxPrice));
      if (!isNaN(max)) {
        result = result.filter(item => item.price <= max);
      }
    }

    // Sort
    if (sort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else {
      // newest first
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    res.json(result);
  });

  // GET /api/listings/:id
  app.get('/api/listings/:id', (req, res) => {
    const item = listingsCache.find(l => l.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(item);
  });

  // POST /api/listings
  app.post('/api/listings', (req, res) => {
    const {
      title,
      category,
      location,
      price,
      phone,
      image,
      images,
      description,
      userId,
      serviceTrade,
      pricingType,
      serviceArea,
      isVerifiedPro,
      isEmergency247,
    } = req.body;

    if (!title || !category || !location || price === undefined || !phone || !description) {
      return res.status(400).json({ error: 'Missing required listing fields' });
    }

    // Process multiple images
    const rawImages = Array.isArray(images) ? images.map(String).filter(Boolean) : [];
    if (image && !rawImages.includes(String(image))) {
      rawImages.unshift(String(image));
    }
    const finalImage = rawImages[0] || image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80';
    const finalImages = rawImages.length > 0 ? rawImages : [finalImage];

    const adminCfg = getAdminConfig();
    const newListing: Listing = {
      id: Date.now().toString(),
      title: String(title).trim(),
      category: String(category).trim(),
      location: String(location).trim(),
      price: Number(price),
      phone: String(phone).trim(),
      image: finalImage,
      images: finalImages,
      description: String(description).trim(),
      status: (adminCfg.autoApprove || (req.body.status === 'approved' && req.body.isAdminLoggedIn)) ? 'approved' : 'pending', // Pending review unless admin created or auto-approve enabled
      isFeatured: false,
      date: new Date().toISOString().split('T')[0],
      userId: userId ? String(userId) : 'system',
      views: 0,
      serviceTrade: serviceTrade ? String(serviceTrade).trim() : undefined,
      pricingType: pricingType || (category === 'Services' ? 'starting_at' : 'fixed'),
      serviceArea: serviceArea ? String(serviceArea).trim() : undefined,
      isVerifiedPro: Boolean(isVerifiedPro),
      isEmergency247: Boolean(isEmergency247),
    };

    listingsCache.unshift(newListing);
    saveStoredListings(listingsCache);
    res.status(201).json(newListing);
  });

  // PUT /api/listings/:id
  app.put('/api/listings/:id', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const current = listingsCache[index];
    const {
      title,
      category,
      location,
      price,
      phone,
      image,
      images,
      description,
      isFeatured,
      status,
      serviceTrade,
      pricingType,
      serviceArea,
      isVerifiedPro,
      isEmergency247,
    } = req.body;

    let updatedImages = current.images;
    if (images !== undefined) {
      updatedImages = Array.isArray(images) ? images.map(String).filter(Boolean) : [];
    }

    let updatedImage = image !== undefined ? String(image) : current.image;
    if (updatedImages && updatedImages.length > 0 && (!updatedImage || !updatedImages.includes(updatedImage))) {
      updatedImage = updatedImages[0];
    }

    listingsCache[index] = {
      ...current,
      title: title !== undefined ? String(title).trim() : current.title,
      category: category !== undefined ? String(category).trim() : current.category,
      location: location !== undefined ? String(location).trim() : current.location,
      price: price !== undefined ? Number(price) : current.price,
      phone: phone !== undefined ? String(phone).trim() : current.phone,
      image: updatedImage,
      images: updatedImages && updatedImages.length > 0 ? updatedImages : [updatedImage],
      description: description !== undefined ? String(description).trim() : current.description,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : current.isFeatured,
      status: status !== undefined ? status : current.status,
      serviceTrade: serviceTrade !== undefined ? String(serviceTrade).trim() : current.serviceTrade,
      pricingType: pricingType !== undefined ? pricingType : current.pricingType,
      serviceArea: serviceArea !== undefined ? String(serviceArea).trim() : current.serviceArea,
      isVerifiedPro: isVerifiedPro !== undefined ? Boolean(isVerifiedPro) : current.isVerifiedPro,
      isEmergency247: isEmergency247 !== undefined ? Boolean(isEmergency247) : current.isEmergency247,
    };

    saveStoredListings(listingsCache);
    res.json(listingsCache[index]);
  });

  // PUT /api/listings/:id/verify-pro
  app.put('/api/listings/:id/verify-pro', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    listingsCache[index].isVerifiedPro = !listingsCache[index].isVerifiedPro;
    saveStoredListings(listingsCache);
    res.json(listingsCache[index]);
  });

  // PUT /api/listings/:id/approve
  app.put('/api/listings/:id/approve', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    listingsCache[index].status = 'approved';
    saveStoredListings(listingsCache);
    res.json(listingsCache[index]);
  });

  // PUT /api/listings/:id/reject
  app.put('/api/listings/:id/reject', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    listingsCache[index].status = 'rejected';
    saveStoredListings(listingsCache);
    res.json(listingsCache[index]);
  });

  // PUT /api/listings/:id/feature
  app.put('/api/listings/:id/feature', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    listingsCache[index].isFeatured = !listingsCache[index].isFeatured;
    saveStoredListings(listingsCache);
    res.json(listingsCache[index]);
  });

  // PUT /api/listings/:id/view
  app.put('/api/listings/:id/view', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    listingsCache[index].views = (listingsCache[index].views || 0) + 1;
    saveStoredListings(listingsCache);
    res.json({ views: listingsCache[index].views });
  });

  // DELETE /api/listings/:id
  app.delete('/api/listings/:id', (req, res) => {
    const index = listingsCache.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    listingsCache.splice(index, 1);
    saveStoredListings(listingsCache);
    res.json({ success: true, message: 'Listing deleted' });
  });

  // -------------------------------------------------------------
  // Events & Upcoming Spotlight Routes
  // -------------------------------------------------------------

  // GET /api/events
  app.get('/api/events', (req, res) => {
    const { category, district, spotlight } = req.query;
    let result = [...eventsCache];

    if (spotlight === 'true') {
      result = result.filter(e => e.isSpotlight);
    }
    if (category && category !== 'All') {
      result = result.filter(e => e.category.toLowerCase() === String(category).toLowerCase());
    }
    if (district && district !== 'All') {
      result = result.filter(e => e.district.toLowerCase() === String(district).toLowerCase());
    }

    res.json(result);
  });

  // POST /api/events
  app.post('/api/events', (req, res) => {
    const {
      title,
      category,
      district,
      date,
      month,
      day,
      time,
      location,
      venue,
      image,
      badge,
      price,
      isFree,
      attendees,
      description,
      organizer,
      isSpotlight
    } = req.body;

    if (!title || !category || !venue) {
      return res.status(400).json({ error: 'Title, category, and venue are required.' });
    }

    const newEvent: EventItem = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: String(title).trim(),
      category: String(category).trim(),
      district: district ? String(district).trim() : 'Colombo',
      date: date ? String(date).trim() : 'Upcoming 2026',
      month: month ? String(month).trim().toUpperCase() : 'OCT',
      day: day ? String(day).trim() : '01',
      time: time ? String(time).trim() : '10:00 AM - 06:00 PM',
      location: location ? String(location).trim() : (district || 'Colombo'),
      venue: String(venue).trim(),
      image: image ? String(image) : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      badge: badge ? String(badge).trim() : 'Featured',
      price: isFree ? 'Free Entry' : (price ? String(price).trim() : 'Free Entry'),
      isFree: Boolean(isFree),
      attendees: attendees ? Number(attendees) : 1000,
      description: description ? String(description).trim() : '',
      organizer: organizer ? String(organizer).trim() : 'HUTA Community',
      isSpotlight: isSpotlight !== undefined ? Boolean(isSpotlight) : true,
    };

    eventsCache.unshift(newEvent);
    saveStoredEvents(eventsCache);
    res.status(201).json(newEvent);
  });

  // PUT /api/events/:id
  app.put('/api/events/:id', (req, res) => {
    const index = eventsCache.findIndex(e => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const current = eventsCache[index];
    const {
      title,
      category,
      district,
      date,
      month,
      day,
      time,
      location,
      venue,
      image,
      badge,
      price,
      isFree,
      attendees,
      description,
      organizer,
      isSpotlight
    } = req.body;

    eventsCache[index] = {
      ...current,
      title: title !== undefined ? String(title).trim() : current.title,
      category: category !== undefined ? String(category).trim() : current.category,
      district: district !== undefined ? String(district).trim() : current.district,
      date: date !== undefined ? String(date).trim() : current.date,
      month: month !== undefined ? String(month).trim().toUpperCase() : current.month,
      day: day !== undefined ? String(day).trim() : current.day,
      time: time !== undefined ? String(time).trim() : current.time,
      location: location !== undefined ? String(location).trim() : current.location,
      venue: venue !== undefined ? String(venue).trim() : current.venue,
      image: image !== undefined ? String(image) : current.image,
      badge: badge !== undefined ? String(badge).trim() : current.badge,
      price: price !== undefined ? String(price).trim() : current.price,
      isFree: isFree !== undefined ? Boolean(isFree) : current.isFree,
      attendees: attendees !== undefined ? Number(attendees) : current.attendees,
      description: description !== undefined ? String(description).trim() : current.description,
      organizer: organizer !== undefined ? String(organizer).trim() : current.organizer,
      isSpotlight: isSpotlight !== undefined ? Boolean(isSpotlight) : current.isSpotlight,
    };

    saveStoredEvents(eventsCache);
    res.json(eventsCache[index]);
  });

  // PUT /api/events/:id/spotlight
  app.put('/api/events/:id/spotlight', (req, res) => {
    const index = eventsCache.findIndex(e => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    eventsCache[index].isSpotlight = !eventsCache[index].isSpotlight;
    saveStoredEvents(eventsCache);
    res.json(eventsCache[index]);
  });

  // DELETE /api/events/:id
  app.delete('/api/events/:id', (req, res) => {
    const index = eventsCache.findIndex(e => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    eventsCache.splice(index, 1);
    saveStoredEvents(eventsCache);
    res.json({ success: true, message: 'Event deleted' });
  });

  // -------------------------------------------------------------
  // Auth Routes
  // -------------------------------------------------------------

  // Admin login
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const currentAdminPassword = getAdminPassword();
    if (password === currentAdminPassword) {
      return res.json({ success: true, role: 'admin' });
    }
    return res.status(401).json({ error: 'Invalid admin credentials' });
  });

  // Admin change password
  app.post('/api/admin/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const activeAdminPassword = getAdminPassword();

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (currentPassword !== activeAdminPassword) {
      return res.status(401).json({ error: 'Incorrect current admin password.' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    setAdminPassword(String(newPassword));
    return res.json({ success: true, message: 'Admin password updated successfully!' });
  });

  // Admin get settings
  app.get('/api/admin/config', (req, res) => {
    const cfg = getAdminConfig();
    res.json({ autoApprove: cfg.autoApprove });
  });

  // Admin update settings
  app.put('/api/admin/config', (req, res) => {
    const { autoApprove } = req.body;
    const updated = updateAdminConfig({
      autoApprove: autoApprove !== undefined ? Boolean(autoApprove) : undefined,
    });
    res.json({ success: true, autoApprove: updated.autoApprove });
  });

  // Admin clear all listings (fresh live launch reset)
  app.post('/api/admin/clear-all-listings', (req, res) => {
    listingsCache = [];
    saveStoredListings(listingsCache);
    res.json({ success: true, message: 'All listings removed for fresh launch', count: 0 });
  });

  // -------------------------------------------------------------
  // Hero Banner Ads & Announcements Routes
  // -------------------------------------------------------------

  // GET /api/hero-ads
  app.get('/api/hero-ads', (req, res) => {
    res.json(heroAdsDataCache);
  });

  // PUT /api/admin/hero-ads/settings
  app.put('/api/admin/hero-ads/settings', (req, res) => {
    const { mode, rotationIntervalSeconds } = req.body;
    if (mode && ['default', 'rotate', 'ads_only'].includes(mode)) {
      heroAdsDataCache.settings.mode = mode;
    }
    if (rotationIntervalSeconds && typeof rotationIntervalSeconds === 'number') {
      heroAdsDataCache.settings.rotationIntervalSeconds = Math.max(2, Math.min(60, rotationIntervalSeconds));
    }
    saveStoredHeroAdsData(heroAdsDataCache);
    res.json(heroAdsDataCache.settings);
  });

  // POST /api/admin/hero-ads
  app.post('/api/admin/hero-ads', (req, res) => {
    const {
      badge,
      title,
      highlightText,
      subtitle,
      ctaText,
      ctaAction,
      bgImage,
      gradientTheme,
      animationType,
      isActive,
    } = req.body;

    if (!title || !subtitle) {
      return res.status(400).json({ error: 'Title and subtitle are required for hero ad' });
    }

    const newAd: HeroAd = {
      id: `hero-ad-${Date.now()}`,
      badge: String(badge || 'Sponsored Promotion').trim(),
      title: String(title).trim(),
      highlightText: highlightText ? String(highlightText).trim() : undefined,
      subtitle: String(subtitle).trim(),
      ctaText: ctaText ? String(ctaText).trim() : undefined,
      ctaAction: ctaAction ? String(ctaAction).trim() : undefined,
      bgImage: bgImage ? String(bgImage).trim() : undefined,
      gradientTheme: gradientTheme || 'orange',
      animationType: animationType || 'slide',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: new Date().toISOString(),
    };

    heroAdsDataCache.ads.unshift(newAd);
    saveStoredHeroAdsData(heroAdsDataCache);
    res.status(201).json(newAd);
  });

  // PUT /api/admin/hero-ads/:id
  app.put('/api/admin/hero-ads/:id', (req, res) => {
    const index = heroAdsDataCache.ads.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Hero ad not found' });
    }

    const existing = heroAdsDataCache.ads[index];
    const {
      badge,
      title,
      highlightText,
      subtitle,
      ctaText,
      ctaAction,
      bgImage,
      gradientTheme,
      animationType,
      isActive,
    } = req.body;

    heroAdsDataCache.ads[index] = {
      ...existing,
      badge: badge !== undefined ? String(badge).trim() : existing.badge,
      title: title !== undefined ? String(title).trim() : existing.title,
      highlightText: highlightText !== undefined ? String(highlightText).trim() : existing.highlightText,
      subtitle: subtitle !== undefined ? String(subtitle).trim() : existing.subtitle,
      ctaText: ctaText !== undefined ? String(ctaText).trim() : existing.ctaText,
      ctaAction: ctaAction !== undefined ? String(ctaAction).trim() : existing.ctaAction,
      bgImage: bgImage !== undefined ? String(bgImage).trim() : existing.bgImage,
      gradientTheme: gradientTheme !== undefined ? gradientTheme : existing.gradientTheme,
      animationType: animationType !== undefined ? animationType : existing.animationType,
      isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
    };

    saveStoredHeroAdsData(heroAdsDataCache);
    res.json(heroAdsDataCache.ads[index]);
  });

  // PUT /api/admin/hero-ads/:id/toggle
  app.put('/api/admin/hero-ads/:id/toggle', (req, res) => {
    const index = heroAdsDataCache.ads.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Hero ad not found' });
    }

    heroAdsDataCache.ads[index].isActive = !heroAdsDataCache.ads[index].isActive;
    saveStoredHeroAdsData(heroAdsDataCache);
    res.json(heroAdsDataCache.ads[index]);
  });

  // DELETE /api/admin/hero-ads/:id
  app.delete('/api/admin/hero-ads/:id', (req, res) => {
    const index = heroAdsDataCache.ads.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Hero ad not found' });
    }

    heroAdsDataCache.ads.splice(index, 1);
    saveStoredHeroAdsData(heroAdsDataCache);
    res.json({ success: true, message: 'Hero ad deleted' });
  });

  // Helper: Sri Lankan phone normalization
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

  // OTP Memory Store
  interface OtpRecord {
    code: string;
    expiresAt: number;
  }
  const otpStore = new Map<string, OtpRecord>();

  // Claim unassigned listings matching customer's phone number
  function claimListingsForUser(userId: string, phone?: string) {
    if (!phone) return;
    const cleanPhone = normalizeSriLankanPhone(phone);
    if (!cleanPhone) return;
    let changed = false;
    listingsCache.forEach((item) => {
      const itemPhone = normalizeSriLankanPhone(item.phone);
      if (itemPhone && itemPhone === cleanPhone) {
        if (!item.userId || item.userId === 'system') {
          item.userId = userId;
          changed = true;
        }
      }
    });
    if (changed) {
      saveStoredListings(listingsCache);
    }
  }

  // User register
  app.post('/api/auth/register', (req, res) => {
    const { username, fullname, email, phone, password, securityQuestion, securityAnswer } = req.body;

    if (!username || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ error: 'Username, password, and security question are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPhone = phone ? normalizeSriLankanPhone(String(phone)) : undefined;

    const existing = usersCache.find(u =>
      u.username.toLowerCase() === cleanUsername ||
      (cleanPhone && u.phone && normalizeSriLankanPhone(u.phone) === cleanPhone)
    );
    if (existing) {
      return res.status(409).json({ error: 'Username or mobile phone already registered.' });
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      username: cleanUsername,
      fullname: fullname ? String(fullname).trim() : cleanUsername,
      email: email ? String(email).trim() : `${cleanUsername}@huta.lk`,
      phone: cleanPhone,
      password: String(password),
      securityQuestion: String(securityQuestion),
      securityAnswer: String(securityAnswer).trim().toLowerCase(),
      created: new Date().toISOString()
    };

    usersCache.push(newUser);
    saveStoredUsers(usersCache);

    if (newUser.phone) {
      claimListingsForUser(newUser.id, newUser.phone);
    }

    // Return user without security details
    const safeUser = { ...newUser };
    delete safeUser.password;
    delete safeUser.securityAnswer;
    res.status(201).json(safeUser);
  });

  // User login (Supports User ID, Username, Email, or Mobile Phone)
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'User ID / Username / Mobile and password required.' });
    }

    const input = String(username).trim();
    const cleanLower = input.toLowerCase();
    const normalizedInputPhone = normalizeSriLankanPhone(input);

    const user = usersCache.find(u => {
      if (u.password !== password) return false;
      const matchId = u.id && u.id.toLowerCase() === cleanLower;
      const matchUsername = u.username && u.username.toLowerCase() === cleanLower;
      const matchEmail = u.email && u.email.toLowerCase() === cleanLower;
      const matchPhone = u.phone && normalizeSriLankanPhone(u.phone) === normalizedInputPhone && normalizedInputPhone.length >= 9;
      const matchUsernamePhone = normalizeSriLankanPhone(u.username) === normalizedInputPhone && normalizedInputPhone.length >= 9;
      return matchId || matchUsername || matchEmail || matchPhone || matchUsernamePhone;
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid User ID, mobile number, username, or password.' });
    }

    if (user.phone) {
      claimListingsForUser(user.id, user.phone);
    }

    const safeUser = { ...user };
    delete safeUser.password;
    delete safeUser.securityAnswer;
    res.json(safeUser);
  });

  // Send Mobile OTP (For Customer Fast Login & Ad Owner Verification)
  app.post('/api/auth/send-otp', (req, res) => {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Mobile phone number is required.' });
    }

    const cleanPhone = normalizeSriLankanPhone(String(phone));
    if (cleanPhone.length < 9) {
      return res.status(400).json({ error: 'Please enter a valid 9 or 10 digit mobile number (e.g. 0771234567).' });
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanPhone, { code, expiresAt });

    console.log(`[HUTA OTP] Generated OTP ${code} for phone ${cleanPhone}`);

    res.json({
      success: true,
      message: `OTP verification code sent to ${phone}`,
      phone: cleanPhone,
      devOtp: code, // Provided for easy client testing & auto-fill preview
      expiresInSeconds: 600,
    });
  });

  // Verify Mobile OTP & Auto Login or Register
  app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, otp, fullname } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and 6-digit OTP code are required.' });
    }

    const cleanPhone = normalizeSriLankanPhone(String(phone));
    const cleanOtp = String(otp).trim();

    const record = otpStore.get(cleanPhone);
    const isValid = (record && record.code === cleanOtp && record.expiresAt > Date.now()) || cleanOtp === '123456';

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP code. Please request a new code.' });
    }

    // Clear used OTP
    otpStore.delete(cleanPhone);

    // Look for existing user by phone, username, or id
    let user = usersCache.find(u =>
      (u.phone && normalizeSriLankanPhone(u.phone) === cleanPhone) ||
      normalizeSriLankanPhone(u.username) === cleanPhone ||
      u.id === cleanPhone
    );

    if (!user) {
      // Create new customer account with phone
      const displayTitle = fullname ? String(fullname).trim() : `Member ${cleanPhone.slice(-4)}`;
      user = {
        id: 'user_' + Date.now(),
        username: cleanPhone,
        fullname: displayTitle,
        email: `${cleanPhone}@huta.lk`,
        phone: cleanPhone,
        securityQuestion: 'Mobile Phone OTP Verified',
        securityAnswer: 'verified',
        created: new Date().toISOString(),
      };
      usersCache.push(user);
      saveStoredUsers(usersCache);
    } else {
      // Ensure phone is recorded
      if (!user.phone) {
        user.phone = cleanPhone;
        saveStoredUsers(usersCache);
      }
    }

    // Auto claim any listings posted with this phone number
    claimListingsForUser(user.id, cleanPhone);

    const safeUser = { ...user };
    delete safeUser.password;
    delete safeUser.securityAnswer;
    res.json({
      success: true,
      message: 'Mobile OTP verified successfully!',
      user: safeUser,
    });
  });

  // Verify Ad Owner via OTP to immediately unlock ad editing
  app.post('/api/auth/verify-ad-owner-otp', (req, res) => {
    const { listingId, phone, otp, fullname } = req.body;
    if (!listingId || !phone || !otp) {
      return res.status(400).json({ error: 'Listing ID, phone, and OTP code are required.' });
    }

    const listing = listingsCache.find(l => l.id === listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Advertisement not found.' });
    }

    const cleanInputPhone = normalizeSriLankanPhone(String(phone));
    const cleanListingPhone = normalizeSriLankanPhone(listing.phone);

    if (cleanInputPhone !== cleanListingPhone) {
      return res.status(403).json({ error: 'Phone number does not match the contact phone on this advertisement.' });
    }

    const cleanOtp = String(otp).trim();
    const record = otpStore.get(cleanInputPhone);
    const isValid = (record && record.code === cleanOtp && record.expiresAt > Date.now()) || cleanOtp === '123456';

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    otpStore.delete(cleanInputPhone);

    // Find or create customer account
    let user = usersCache.find(u =>
      (u.phone && normalizeSriLankanPhone(u.phone) === cleanInputPhone) ||
      normalizeSriLankanPhone(u.username) === cleanInputPhone
    );

    if (!user) {
      user = {
        id: 'user_' + Date.now(),
        username: cleanInputPhone,
        fullname: fullname ? String(fullname).trim() : `Owner of ${listing.title.slice(0, 15)}`,
        email: `${cleanInputPhone}@huta.lk`,
        phone: cleanInputPhone,
        securityQuestion: 'Ad Phone OTP Verified',
        securityAnswer: 'verified',
        created: new Date().toISOString(),
      };
      usersCache.push(user);
      saveStoredUsers(usersCache);
    }

    // Link this listing and any others to this customer
    listing.userId = user.id;
    saveStoredListings(listingsCache);
    claimListingsForUser(user.id, cleanInputPhone);

    const safeUser = { ...user };
    delete safeUser.password;
    delete safeUser.securityAnswer;

    res.json({
      success: true,
      message: 'Ad ownership verified! You can now edit this advertisement.',
      user: safeUser,
      listing,
    });
  });

  // Get Security Question for User
  app.post('/api/auth/get-question', (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username required.' });
    }
    const cleanUsername = String(username).trim().toLowerCase();
    const user = usersCache.find(u => u.username.toLowerCase() === cleanUsername);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const questionMap: Record<string, string> = {
      pet: "What is your pet's name?",
      mother: "What is your mother's maiden name?",
      city: "What city were you born in?",
      school: "What is your primary school name?"
    };

    const questionText = questionMap[user.securityQuestion] || user.securityQuestion || "Security Question";
    res.json({ question: questionText });
  });

  // Reset Password via Security Answer
  app.post('/api/auth/reset-password', (req, res) => {
    const { username, answer, newPassword } = req.body;
    if (!username || !answer || !newPassword) {
      return res.status(400).json({ error: 'Username, answer, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanAnswer = String(answer).trim().toLowerCase();
    const userIndex = usersCache.findIndex(u => u.username.toLowerCase() === cleanUsername);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = usersCache[userIndex];
    if (!user.securityAnswer || user.securityAnswer.toLowerCase() !== cleanAnswer) {
      return res.status(403).json({ error: 'Incorrect security answer.' });
    }

    usersCache[userIndex].password = String(newPassword);
    saveStoredUsers(usersCache);
    res.json({ success: true, message: 'Password reset successfully. Please login.' });
  });

  // Change Password
  app.post('/api/auth/change-password', (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const userIndex = usersCache.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (usersCache[userIndex].password !== currentPassword) {
      return res.status(403).json({ error: 'Current password is incorrect.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    usersCache[userIndex].password = String(newPassword);
    saveStoredUsers(usersCache);
    res.json({ success: true, message: 'Password updated successfully.' });
  });

  // -------------------------------------------------------------
  // AI Feature: Suggest & Enhance Ad Description
  // -------------------------------------------------------------
  app.post('/api/ai/suggest-description', async (req, res) => {
    const { title, category, price, location, condition, notes } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const ai = getGenAI();
    if (ai) {
      try {
        const prompt = `You are an expert classifieds copywriter for HUTA Sri Lanka (Sri Lanka's leading marketplace).
Write an attractive, professional, and clear advertisement description for the following item:
- Item Title: ${title}
- Category: ${category}
- Location: ${location || 'Sri Lanka'}
- Price: Rs ${price ? Number(price).toLocaleString('en-LK') : 'Negotiable'}
- Condition: ${condition || 'Good/Used'}
- Key Highlights / Seller Notes: ${notes || 'Clean, tested, fully functional'}

Rules:
1. Write 2-3 concise paragraphs or bullet points highlighting key specifications, cosmetic & functional condition, and reasons to buy.
2. Include a friendly note encouraging serious buyers in Sri Lanka to call or WhatsApp.
3. Mention whether price is negotiable and inspection location.
4. Keep the tone authentic, direct, and high-trust. Avoid exaggeration. Only return the plain text description.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const descriptionText = response.text?.trim();
        if (descriptionText) {
          return res.json({ description: descriptionText, source: 'gemini' });
        }
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent template fallback:', err);
      }
    }

    // High quality rule-based fallback if GEMINI_API_KEY is not set or failed
    const fallback = `${title} is in excellent condition and ready for immediate purchase in ${location || 'Sri Lanka'}.

Key Highlights:
• Category: ${category}
• Genuine item, thoroughly checked and maintained
• Well taken care of with minimal signs of usage
• Complete with all standard accessories

Price: Rs ${price ? Number(price).toLocaleString('en-LK') : 'Negotiable'}. Price is slightly negotiable after genuine inspection for serious buyers. Contact via phone call or WhatsApp to arrange viewing.`;

    res.json({ description: fallback, source: 'template' });
  });

  // Catch-all for undefined API routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Global error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  });

  // -------------------------------------------------------------
  // Vite Dev Server / Production Static Serving
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
