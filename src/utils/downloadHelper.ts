import { Listing } from '../types';

/**
 * Cleanly format prices in LKR
 */
export function formatLKRForPromo(price: number): string {
  if (!price || isNaN(price)) return 'Price on Request';
  return 'Rs. ' + price.toLocaleString('en-US');
}

/**
 * Downloads a remote or local image file directly to the user's device
 */
export async function downloadImage(url: string, filename: string): Promise<boolean> {
  try {
    // Attempt fetch to create a local blob (prevents navigation on modern browsers)
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'huta-marketplace-photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      return true;
    }
  } catch {
    // Fallback if CORS prevents blob fetch
  }

  // Fallback: direct anchor download trigger
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = filename || 'huta-marketplace-photo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.warn('Direct download fallback failed:', err);
    window.open(url, '_blank');
    return false;
  }
}

/**
 * Generate an engaging, high-conversion caption tailored for Facebook Marketplace and Groups
 */
export function generateFacebookCaption(listing: Listing, appUrl?: string): string {
  const url = appUrl || window.location.origin;
  const isService = listing.category === 'Services' || Boolean(listing.serviceTrade);
  const cleanPhone = (listing.phone || '').replace(/[^0-9+]/g, '');
  const waPhone = cleanPhone.startsWith('+')
    ? cleanPhone.replace('+', '')
    : cleanPhone.startsWith('0')
    ? '94' + cleanPhone.substring(1)
    : '94' + cleanPhone;

  const priceText = isService
    ? listing.pricingType === 'quote'
      ? 'Free Estimate / Price on Request'
      : listing.pricingType === 'hourly'
      ? `${formatLKRForPromo(listing.price)} / hr`
      : listing.pricingType === 'starting_at'
      ? `Starting from ${formatLKRForPromo(listing.price)}`
      : formatLKRForPromo(listing.price)
    : formatLKRForPromo(listing.price);

  const cleanDescription = (listing.description || '').replace(/\s+/g, ' ').trim();
  const shortDesc =
    cleanDescription.length > 280
      ? cleanDescription.substring(0, 277) + '...'
      : cleanDescription;

  const categoryTag = (listing.category || 'Classifieds').replace(/\s+/g, '');
  const locationTag = (listing.location || 'SriLanka').replace(/[^a-zA-Z0-9]/g, '');

  return [
    `🔥 ${isService ? 'AVAILABLE SERVICE' : 'FOR SALE IN SRI LANKA'}: ${listing.title}`,
    `💰 Price: ${priceText}`,
    `📍 Location: ${listing.location}, Sri Lanka`,
    `📂 Category: ${listing.category}${listing.serviceTrade ? ` • ${listing.serviceTrade}` : ''}`,
    `📞 Phone Call: ${listing.phone}`,
    `💬 WhatsApp: https://wa.me/${waPhone}`,
    '',
    shortDesc ? `📝 Details:\n"${shortDesc}"\n` : '',
    '✅ Verified listing on HUTA.lk — Sri Lanka\'s Premier Marketplace',
    `🔗 View full listing & more photos: ${url}`,
    '',
    `#SriLanka #Marketplace #BuyAndSell #${categoryTag} #${locationTag} #HutaLK #SriLankaClassifieds`,
  ]
    .filter(Boolean)
    .join('\n');
}

export interface FlyerOptions {
  aspectRatio: 'square' | 'landscape'; // square: 1080x1080, landscape: 1200x630
  theme: 'orange' | 'dark' | 'navy';
  showPrice: boolean;
  showPhone: boolean;
  showLocation: boolean;
}

/**
 * Loads an image safely onto an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image: ' + src));
    img.src = src;
  });
}

/**
 * Renders a high-resolution Facebook promo flyer on an HTML Canvas and triggers download
 */
export async function renderAndDownloadFacebookFlyer(
  canvas: HTMLCanvasElement,
  imageUrl: string,
  listing: Listing,
  options: FlyerOptions
): Promise<boolean> {
  const width = options.aspectRatio === 'square' ? 1080 : 1200;
  const height = options.aspectRatio === 'square' ? 1080 : 630;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  // 1. Draw Background
  let mainImageLoaded = false;
  try {
    const img = await loadImage(imageUrl);
    mainImageLoaded = true;

    // Draw image with "cover" sizing
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawHeight = height;
      drawWidth = height * imgRatio;
      offsetX = -(drawWidth - width) / 2;
    } else {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetY = -(drawHeight - height) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  } catch (err) {
    console.warn('Could not load image with CORS for flyer; rendering gradient fallback:', err);
    // Gradient fallback
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1E293B');
    grad.addColorStop(1, '#0F172A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. High-Contrast Bottom & Top Overlays
  const isDark = options.theme === 'dark';
  const isOrange = options.theme === 'orange';

  // Top gentle vignette
  const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.3);
  topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, height * 0.3);

  // Bottom rich gradient for content
  const bottomHeight = height * (options.aspectRatio === 'square' ? 0.52 : 0.65);
  const bottomGrad = ctx.createLinearGradient(0, height - bottomHeight, 0, height);
  bottomGrad.addColorStop(0, 'rgba(10, 10, 15, 0)');
  bottomGrad.addColorStop(0.25, 'rgba(10, 10, 15, 0.7)');
  bottomGrad.addColorStop(0.65, isDark ? 'rgba(10, 10, 15, 0.95)' : isOrange ? 'rgba(15, 10, 25, 0.95)' : 'rgba(15, 23, 42, 0.95)');
  bottomGrad.addColorStop(1, 'rgba(10, 10, 15, 1.0)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, height - bottomHeight, width, bottomHeight);

  // 3. Top Header Bar: HUTA.lk Verified Badge
  ctx.fillStyle = '#FF5A36';
  ctx.beginPath();
  ctx.roundRect(40, 36, 210, 48, 24);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('🇱🇰 HUTA.LK', 60, 68);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '600 16px system-ui, -apple-system, sans-serif';
  ctx.fillText('Verified Sri Lanka Marketplace', 270, 68);

  // 4. Content Area
  const contentY = height - (options.aspectRatio === 'square' ? 360 : 250);

  // Category Tag
  ctx.fillStyle = '#FF8A65';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.fillText((listing.category || 'Classifieds').toUpperCase(), 45, contentY);

  // Main Title (Clean wrap or truncate)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
  const title = listing.title || 'Marketplace Item';
  const maxTitleChars = options.aspectRatio === 'square' ? 44 : 38;
  const displayTitle = title.length > maxTitleChars ? title.substring(0, maxTitleChars) + '...' : title;
  ctx.fillText(displayTitle, 45, contentY + 54);

  // Price Badge & Location Pill
  let badgeX = 45;
  const badgeY = contentY + 85;

  if (options.showPrice) {
    const formattedPrice = formatLKRForPromo(listing.price);
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    const priceWidth = ctx.measureText(formattedPrice).width;

    // Price Badge Background
    ctx.fillStyle = '#FF5A36';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, priceWidth + 40, 56, 16);
    ctx.fill();

    // Price text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(formattedPrice, badgeX + 20, badgeY + 40);

    badgeX += priceWidth + 55;
  }

  if (options.showLocation && listing.location) {
    const locationText = `📍 ${listing.location}`;
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    const locWidth = ctx.measureText(locationText).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY + 4, locWidth + 32, 48, 14);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(locationText, badgeX + 16, badgeY + 36);
  }

  // 5. Seller Contact Footer Bar
  const footerY = height - 60;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(45, footerY - 20);
  ctx.lineTo(width - 45, footerY - 20);
  ctx.stroke();

  if (options.showPhone && listing.phone) {
    ctx.fillStyle = '#4ADE80'; // Bright emerald green
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`📞 Call / WhatsApp: ${listing.phone}`, 45, footerY + 12);
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  const ctaText = 'Direct Deal • No Middleman Fees';
  const ctaWidth = ctx.measureText(ctaText).width;
  ctx.fillText(ctaText, width - 45 - ctaWidth, footerY + 12);

  // 6. Download the generated canvas
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const safeTitle = (listing.title || 'huta-promo')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 30);
    link.download = `facebook-promo-${safeTitle}-${options.aspectRatio}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Canvas export error (likely cross-origin tainted canvas):', err);
    // If canvas is tainted by external image without CORS header, open image directly
    if (mainImageLoaded) {
      downloadImage(imageUrl, `huta-ad-${listing.id}.jpg`);
    }
    return false;
  }
}
