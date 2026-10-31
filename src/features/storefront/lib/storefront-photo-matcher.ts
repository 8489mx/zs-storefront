/**
 * Multi-Tenant Storefront Photo & Placeholder Utilities
 * Strictly bans random/mismatched stock photo fallbacks (`fallbackPool` or keyword guessing).
 * If a product or category does not have an authentic uploaded image URL, a clean,
 * neutral geometric vector SVG placeholder card is generated with the item's title.
 */

export function isRealProductPhotoUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('data:image/svg+xml')) return false;
  return true;
}

export function cleanArabic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآٱٲٳ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي')
    .replace(/[\u064B-\u065F\u0640]/g, '')
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

export interface SemanticPhotoRule {
  id: string;
  nameAr: string;
  keywords: string[];
  imageUrl: string;
  weight: number;
}

export const SEMANTIC_PHOTO_RULES: SemanticPhotoRule[] = [];

function escapeSvgText(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncateLabel(text: string, maxLen: number): string {
  const clean = (text || '').trim().replace(/\s+/g, ' ');
  if (!clean) return '';
  return clean.length > maxLen ? `${clean.slice(0, maxLen - 1).trim()}…` : clean;
}

const svgCache = new Map<string, string>();
const photoCache = new Map<string, ResolvedProductPhoto>();

/**
 * Generates a clean, lightweight, neutral vector SVG placeholder card
 * carrying the product/category name and a geometric vector icon (Zero mismatched stock photos).
 */
export function generatePremiumProductSvg(productName: string, categoryName?: string): string {
  const cacheKey = `${productName || ''}||${categoryName || ''}`;
  const cached = svgCache.get(cacheKey);
  if (cached) return cached;

  const cleanTitle = (productName || '').trim() || (categoryName || '').trim() || 'صنف بالمتجر';
  const cleanCat = (categoryName || '').trim();
  const initial = Array.from(cleanTitle)[0] || '•';
  const displayTitle = escapeSvgText(truncateLabel(cleanTitle, 22));
  const showCategory = Boolean(cleanCat && cleanCat !== cleanTitle);
  const displayCategory = showCategory ? escapeSvgText(truncateLabel(cleanCat, 20)) : '';
  const safeInitial = escapeSvgText(initial);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#f1f5f9" />
      </linearGradient>
      <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="228" rx="28" fill="url(#bgGrad)" stroke="#e2e8f0" stroke-width="1.5" />
    <circle cx="120" cy="92" r="42" fill="url(#badgeGrad)" stroke="#e2e8f0" stroke-width="1.5" />
    <g transform="translate(102, 74)" fill="none" stroke="#64748b" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z" />
      <path d="M5 10.5L18 18L31 10.5" />
      <path d="M18 33V18" />
      <path d="M11.5 6.75L24.5 14.25" />
    </g>
    <rect x="142" y="54" width="26" height="26" rx="8" fill="#0f172a" />
    <text x="155" y="72" text-anchor="middle" fill="#ffffff" font-family="'Alexandria','Tajawal','Cairo',sans-serif" font-size="13" font-weight="700">${safeInitial}</text>
    <text x="120" y="164" text-anchor="middle" direction="rtl" fill="#1e293b" font-family="'Alexandria','Tajawal','Cairo',sans-serif" font-size="13.5" font-weight="700">${displayTitle}</text>
    ${
      displayCategory
        ? `<text x="120" y="186" text-anchor="middle" direction="rtl" fill="#64748b" font-family="'Alexandria','Tajawal','Cairo',sans-serif" font-size="11" font-weight="500">${displayCategory}</text>`
        : `<text x="120" y="186" text-anchor="middle" direction="rtl" fill="#94a3b8" font-family="'Alexandria','Tajawal','Cairo',sans-serif" font-size="10.5" font-weight="500">صورة الصنف قيد الإضافة</text>`
    }
  </svg>`;

  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  if (svgCache.size > 500) svgCache.clear();
  svgCache.set(cacheKey, dataUrl);
  return dataUrl;
}

export type ProductPhotoSource = 'name' | 'category' | 'placeholder';

export type ResolvedProductPhoto = {
  url: string;
  source: ProductPhotoSource;
};

/**
 * يعيد بطاقة SVG متجهة محايدة ونظيفة تحمل اسم الصنف وأيقونة هندسية
 * عند عدم توفر صورة حقيقية مرفوعة من التاجر، دون أي تخمين عشوائي للصور.
 */
export function resolveProductPhoto(productName: string, categoryName?: string): ResolvedProductPhoto {
  const cacheKey = `${productName || ''}||${categoryName || ''}`;
  const cached = photoCache.get(cacheKey);
  if (cached) return cached;

  const resolved: ResolvedProductPhoto = {
    url: generatePremiumProductSvg(productName, categoryName),
    source: 'placeholder',
  };
  if (photoCache.size > 500) photoCache.clear();
  photoCache.set(cacheKey, resolved);
  return resolved;
}

export function getAutoProductPhoto(productName: string, categoryName?: string): string {
  return generatePremiumProductSvg(productName, categoryName);
}
