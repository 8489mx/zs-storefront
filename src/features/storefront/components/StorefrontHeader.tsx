import React, { useEffect, useState } from 'react';
import { useStorefrontLang } from '@/i18n';
import { StorefrontInfo, StorefrontProduct } from '../types/storefront.types';
import { PackageIcon } from '@/shared/components/icons/AppIcons';
import { IconShoppingCart, IconSearch, IconClose } from './StorefrontIcons';
import { StorefrontPredictiveSearch } from './StorefrontPredictiveSearch';
import { getCurrencySymbol, isThreeDecimalCurrency } from '@/lib/currencies';

interface StorefrontHeaderProps {
  info: StorefrontInfo;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenOrders?: () => void;
  onGoHome?: () => void;
  onSelectCategory?: (categoryId: number) => void;
  onSelectProduct?: (product: StorefrontProduct) => void;
  onAddToCart?: (product: StorefrontProduct) => void;
  onOpenCategories?: () => void;
}

export function resolveStorefrontBrand(
  info: { title?: string; businessName?: string; address?: string },
  isEn = false
) {
  const business = String(info.businessName || '').trim().replace(/^Z-\s*/i, '');
  const rawTitle = String(info.title || '').trim().replace(/^Z-\s*/i, '');
  const rawAddress = String(info.address || '').trim();

  let title = rawTitle || business || (isEn ? 'Our Online Store' : 'متجرنا الإلكتروني');

  if (isEn) {
    const brandMapEn: Record<string, string> = {
      'متجر زين وول للتجارة والتسوق': 'Zain Wall Store',
      'متجر زين وول الإلكتروني': 'Zain Wall Store',
      'زين وول': 'Zain Wall Store',
      'متجرنا الإلكتروني': 'Our Online Store',
    };
    if (brandMapEn[title]) {
      title = brandMapEn[title];
    }
  }

  if (rawAddress) {
    return {
      title,
      address: rawAddress,
    };
  }

  if (business && rawTitle.startsWith(business) && rawTitle.length > business.length) {
    const remainder = rawTitle.slice(business.length).trim().replace(/^[-–—:]\s*/, '');
    if (remainder.length >= 3) {
      return {
        title: isEn && title !== rawTitle ? title : business,
        address: remainder,
      };
    }
  }

  return {
    title,
    address: '',
  };
}

const processedLogoCache = new Map<string, string>();

function stripWhiteBackgroundFromImage(src: string): Promise<{ url: string; fallbackMultiply: boolean }> {
  const cached = processedLogoCache.get(src);
  if (cached) {
    return Promise.resolve({ url: cached, fallbackMultiply: false });
  }

  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve({ url: src, fallbackMultiply: false });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const naturalW = img.naturalWidth || img.width || 128;
        const naturalH = img.naturalHeight || img.height || 128;
        const maxDim = 256;
        const scale = Math.min(1, maxDim / Math.max(naturalW, naturalH, 1));
        const w = Math.max(1, Math.round(naturalW * scale));
        const h = Math.max(1, Math.round(naturalH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve({ url: src, fallbackMultiply: true });
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const isNearWhite = (idx: number) => {
          const a = data[idx + 3];
          if (a < 16) return true;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          return min >= 224 && max - min <= 28;
        };

        const totalPixels = w * h;
        const visited = new Uint8Array(totalPixels);
        const queue = new Int32Array(totalPixels);
        let head = 0;
        let tail = 0;
        let opaqueWhiteBorderCount = 0;

        const trySeed = (x: number, y: number) => {
          const p = y * w + x;
          if (visited[p]) return;
          const idx = p * 4;
          if (isNearWhite(idx)) {
            if (data[idx + 3] >= 200) opaqueWhiteBorderCount++;
            visited[p] = 1;
            queue[tail++] = p;
          }
        };

        for (let x = 0; x < w; x++) {
          trySeed(x, 0);
          trySeed(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          trySeed(0, y);
          trySeed(w - 1, y);
        }

        if (opaqueWhiteBorderCount === 0) {
          processedLogoCache.set(src, src);
          resolve({ url: src, fallbackMultiply: false });
          return;
        }

        while (head < tail) {
          const p = queue[head++];
          const x = p % w;
          const y = (p - x) / w;

          if (x > 0) {
            const np = p - 1;
            if (!visited[np] && isNearWhite(np * 4)) {
              visited[np] = 1;
              queue[tail++] = np;
            }
          }
          if (x + 1 < w) {
            const np = p + 1;
            if (!visited[np] && isNearWhite(np * 4)) {
              visited[np] = 1;
              queue[tail++] = np;
            }
          }
          if (y > 0) {
            const np = p - w;
            if (!visited[np] && isNearWhite(np * 4)) {
              visited[np] = 1;
              queue[tail++] = np;
            }
          }
          if (y + 1 < h) {
            const np = p + w;
            if (!visited[np] && isNearWhite(np * 4)) {
              visited[np] = 1;
              queue[tail++] = np;
            }
          }
        }

        for (let p = 0; p < totalPixels; p++) {
          const idx = p * 4;
          if (visited[p]) {
            data[idx + 3] = 0;
            continue;
          }
          const x = p % w;
          const y = (p - x) / w;
          const touchesBg =
            (x > 0 && visited[p - 1] === 1) ||
            (x + 1 < w && visited[p + 1] === 1) ||
            (y > 0 && visited[p - w] === 1) ||
            (y + 1 < h && visited[p + w] === 1);

          if (touchesBg) {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const min = Math.min(r, g, b);
            const max = Math.max(r, g, b);
            if (min >= 195 && max - min <= 36) {
              const factor = Math.max(0, Math.min(1, (228 - min) / 33));
              data[idx + 3] = Math.round(data[idx + 3] * factor);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const outputUrl = canvas.toDataURL('image/png');
        processedLogoCache.set(src, outputUrl);
        resolve({ url: outputUrl, fallbackMultiply: false });
      } catch {
        resolve({ url: src, fallbackMultiply: true });
      }
    };

    img.onerror = () => {
      resolve({ url: src, fallbackMultiply: true });
    };

    img.src = src;
  });
}

export function StorefrontBrandLogo({
  src,
  alt,
  size = 36,
  className,
  style,
}: {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [resolvedSrc, setResolvedSrc] = React.useState<string>(() => processedLogoCache.get(src) || src);
  const [useMultiply, setUseMultiply] = React.useState(false);

  useEffect(() => {
    let active = true;
    const cached = processedLogoCache.get(src);
    if (cached) {
      setResolvedSrc(cached);
      setUseMultiply(false);
      return;
    }
    setResolvedSrc(src);
    stripWhiteBackgroundFromImage(src).then((res) => {
      if (!active) return;
      setResolvedSrc(res.url);
      setUseMultiply(res.fallbackMultiply);
    });
    return () => {
      active = false;
    };
  }, [src]);

  return (
    <img
      src={resolvedSrc}
      alt={alt || ''}
      className={className}
      decoding="async"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        background: 'transparent',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        borderRadius: 0,
        padding: 0,
        flexShrink: 0,
        mixBlendMode: useMultiply ? 'multiply' : undefined,
        ...style,
      }}
    />
  );
}

const getInitialStorefrontScrollTop = () => {
  if (typeof window === 'undefined') return 0;
  return Math.max(
    window.scrollY || 0,
    window.pageYOffset || 0,
    document.documentElement?.scrollTop || 0,
    document.body?.scrollTop || 0,
    document.getElementById('root')?.scrollTop || 0,
    (document.querySelector('.storefront-page') as HTMLElement)?.scrollTop || 0
  );
};

export const StorefrontHeader = React.memo(function StorefrontHeader({
  info,
  searchTerm,
  onSearchChange,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenOrders,
  onGoHome,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  onOpenCategories,
}: StorefrontHeaderProps) {
  const { t, isEn, setLang } = useStorefrontLang();
  const headerRef = React.useRef<HTMLElement | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(() => getInitialStorefrontScrollTop() > 18);
  const isScrolledRef = React.useRef(getInitialStorefrontScrollTop() > 18);

  useEffect(() => {
    if (!langMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('.sf-lang-dropdown-root')) {
        setLangMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [langMenuOpen]);

  useEffect(() => {
    let rafId = 0;

    const getScrollTop = () => {
      return Math.max(
        window.scrollY || 0,
        window.pageYOffset || 0,
        document.documentElement?.scrollTop || 0,
        document.body?.scrollTop || 0,
        document.getElementById('root')?.scrollTop || 0,
        (document.querySelector('.storefront-page') as HTMLElement)?.scrollTop || 0
      );
    };

    const updateScrollState = () => {
      const y = getScrollTop();
      const nextScrolled = isScrolledRef.current ? y > 8 : y > 18;
      if (nextScrolled !== isScrolledRef.current) {
        isScrolledRef.current = nextScrolled;
        if (headerRef.current) {
          headerRef.current.classList.toggle('is-scrolled', nextScrolled);
        }
        setIsScrolled(nextScrolled);
      }
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateScrollState);
    };

    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('wheel', onScroll, { passive: true });
    updateScrollState();

    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true } as any);
      document.removeEventListener('scroll', onScroll, { capture: true } as any);
      window.removeEventListener('wheel', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleToggleMobileSearch = () => {
    setMobileSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        window.requestAnimationFrame(() => {
          const input = headerRef.current?.querySelector<HTMLInputElement>('.storefront-search-input');
          input?.focus();
        });
      } else if (searchTerm) {
        onSearchChange('');
      }
      return next;
    });
  };

  const brand = resolveStorefrontBrand(info, isEn);
  const storeCurr = info?.currency || 'EGP';
  const currSymbol = isEn && storeCurr === 'EGP' ? 'EGP' : getCurrencySymbol(storeCurr);
  const showMobileSearchRow = mobileSearchOpen || Boolean(searchTerm.trim());

  const renderLangDropdown = (isMobileSlot = false) => (
    <div
      className={`sf-lang-dropdown-root ${isMobileSlot ? 'sf-lang-mobile-slot' : 'sf-lang-desktop-slot'}`}
      style={{
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        onClick={() => setLangMenuOpen((prev) => !prev)}
        className="sf-lang-trigger-btn"
        title={isEn ? 'Change Language' : 'تغيير اللغة'}
        aria-label={isEn ? 'Change Language' : 'تغيير اللغة'}
        aria-expanded={langMenuOpen}
        dir="ltr"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          width: isMobileSlot ? '58px' : '58px',
          height: isMobileSlot ? '34px' : '36px',
          minHeight: isMobileSlot ? '34px' : '36px',
          padding: '0 8px',
          borderRadius: isMobileSlot ? '10px' : '12px',
          background: langMenuOpen ? '#f0f4f9' : '#ffffff',
          border: langMenuOpen ? '1px solid var(--storefront-primary-color, #2d68c4)' : '1px solid #dadce0',
          color: '#1f1f1f',
          fontSize: '11.5px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease',
          boxSizing: 'border-box',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--storefront-primary-color, #2d68c4)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span style={{ letterSpacing: '0.2px', lineHeight: 1 }}>{isEn ? 'EN' : 'AR'}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transform: langMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {langMenuOpen && (
        <div
          className="sf-lang-dropdown-menu"
          dir="ltr"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            minWidth: '58px',
            background: '#ffffff',
            borderRadius: '11px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 24px -4px rgba(15, 23, 42, 0.14), 0 4px 8px -2px rgba(15, 23, 42, 0.06)',
            padding: '4px',
            zIndex: 350,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            boxSizing: 'border-box',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setLang('ar');
              setLangMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '28px',
              padding: '0 6px',
              borderRadius: '7px',
              border: 'none',
              background: !isEn ? 'var(--storefront-primary-color, #2d68c4)' : 'transparent',
              color: !isEn ? '#ffffff' : '#1e293b',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.3px',
              cursor: 'pointer',
              transition: 'background-color 0.14s ease, color 0.14s ease',
              textAlign: 'center',
              fontFamily: 'inherit',
            }}
          >
            AR
          </button>

          <button
            type="button"
            onClick={() => {
              setLang('en');
              setLangMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '28px',
              padding: '0 6px',
              borderRadius: '7px',
              border: 'none',
              background: isEn ? 'var(--storefront-primary-color, #2d68c4)' : 'transparent',
              color: isEn ? '#ffffff' : '#1e293b',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.3px',
              cursor: 'pointer',
              transition: 'background-color 0.14s ease, color 0.14s ease',
              textAlign: 'center',
              fontFamily: 'inherit',
            }}
          >
            EN
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Storefront Header — Sticky on Desktop & Floating Search Bar on Mobile */}
      <header
        ref={headerRef}
        dir="rtl"
        className={`storefront-sticky-header${isScrolled ? ' is-scrolled' : ''}`}
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          zIndex: 110,
          padding: isScrolled ? '6px 16px' : '8px 16px',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          transform: 'none',
          transition: 'padding 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <style>{`
          .storefront-sticky-header {
            position: -webkit-sticky !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 110 !important;
            transform: none !important;
          }
          .storefront-brand-btn:hover .storefront-brand-avatar { transform: scale3d(1.05, 1.05, 1); }
          .storefront-brand-btn:hover .storefront-brand-title { color: var(--storefront-primary-color, #2d68c4); }
          .storefront-nav-bottom-row {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            min-width: 0;
          }
          .sf-lang-mobile-slot {
            display: none !important;
          }
          .storefront-mobile-search-trigger {
            display: none !important;
          }
          .sf-lang-trigger-btn:hover {
            background: #f8fafc !important;
            border-color: #94a3b8 !important;
          }
          .storefront-navbar {
            pointer-events: auto;
            width: 100%;
            max-width: var(--storefront-container, 1440px);
            margin: 0 auto;
            padding: 8px 18px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(240px, 380px) minmax(0, 1fr);
            align-items: center;
            gap: 14px;
            box-sizing: border-box;
            border-radius: 14px;
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.09), 0 2px 6px -1px rgba(15, 23, 42, 0.04) !important;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @media (min-width: 769px) {
            .storefront-sticky-header.is-scrolled {
              padding: 6px 16px !important;
            }
            .storefront-sticky-header.is-scrolled .storefront-navbar {
              max-width: 860px !important;
              padding: 5px 14px !important;
              gap: 10px !important;
              background: rgba(255, 255, 255, 0.98) !important;
              backdrop-filter: blur(16px) !important;
              -webkit-backdrop-filter: blur(16px) !important;
              border-color: #cbd5e1 !important;
              border-radius: 16px !important;
              box-shadow: 0 10px 28px -6px rgba(15, 23, 42, 0.14), 0 4px 10px -2px rgba(15, 23, 42, 0.06) !important;
            }
            .storefront-sticky-header.is-scrolled .storefront-search-box {
              height: 33px !important;
            }
            .storefront-sticky-header.is-scrolled .storefront-brand-avatar {
              width: 30px !important;
              height: 30px !important;
            }
            .storefront-sticky-header.is-scrolled .storefront-brand-title {
              font-size: 13.5px !important;
            }
            .storefront-sticky-header.is-scrolled .storefront-action-btn,
            .storefront-sticky-header.is-scrolled .storefront-cart-btn {
              height: 33px !important;
              min-height: 33px !important;
              padding: 0 12px !important;
              font-size: 12px !important;
              border-radius: 10px !important;
            }
            .storefront-sticky-header.is-scrolled .sf-lang-trigger-btn {
              height: 33px !important;
              min-height: 33px !important;
            }
          }
          @media (max-width: 768px) {
            .storefront-announcement-bar {
              display: none !important;
            }
            .storefront-sticky-header,
            .storefront-sticky-header.is-scrolled {
              position: sticky !important;
              top: 0 !important;
              z-index: 120 !important;
              padding: 8px 12px !important;
              pointer-events: auto !important;
              transform: none !important;
              background: rgba(255, 255, 255, 0.96) !important;
              backdrop-filter: blur(16px) !important;
              -webkit-backdrop-filter: blur(16px) !important;
              border-bottom: 1px solid #e8edf4 !important;
              border-radius: 0 !important;
              box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05) !important;
            }
            .storefront-navbar,
            .storefront-sticky-header.is-scrolled .storefront-navbar,
            .storefront-header-shell {
              pointer-events: auto !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              gap: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
              border-radius: 0 !important;
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
              position: relative !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .storefront-brand-btn {
              display: none !important;
            }
            .storefront-actions,
            .storefront-mobile-search-trigger {
              display: none !important;
            }
            .storefront-nav-bottom-row,
            .storefront-nav-bottom-row.is-mobile-search-open {
              display: flex !important;
              align-items: center !important;
              gap: 8px !important;
              width: 100% !important;
            }
            .sf-lang-mobile-slot {
              display: block !important;
            }
            .storefront-search-wrapper {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              flex: 1 1 auto !important;
              min-width: 0 !important;
            }
            .storefront-search-box {
              padding: 0 12px !important;
              border-radius: 11px !important;
              height: 38px !important;
              border: 1px solid #e2e8f0 !important;
              background: #ffffff !important;
              box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.02) !important;
              transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease !important;
            }
            .storefront-search-box:focus-within {
              background: #ffffff !important;
              border-color: var(--storefront-primary-color, #2d68c4) !important;
              box-shadow: 0 0 0 3px rgba(45, 104, 196, 0.12) !important;
            }
            .storefront-search-input,
            .storefront-search-input:focus,
            .storefront-search-input:focus-visible {
              font-size: 12.5px !important;
              padding: 5px 4px !important;
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
              min-height: 0 !important;
              border-radius: 0 !important;
            }
            .storefront-search-btn {
              display: none !important;
            }
          }
        `}</style>

        {/* Main Navbar — Fixed dir="rtl" so header items and language button never jump sides */}
        <div
          dir="rtl"
          className="storefront-navbar storefront-header-shell"
          style={{
            maxWidth: isScrolled ? '860px' : 'var(--storefront-container, 1440px)',
            transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Brand & Store Name (Clickable to go home / reset) */}
          <div
            onClick={onGoHome}
            role={onGoHome ? 'button' : undefined}
            tabIndex={onGoHome ? 0 : undefined}
            onKeyDown={(e) => {
              if (onGoHome && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onGoHome();
              }
            }}
            title={onGoHome ? (isEn ? 'Back to Home' : 'العودة للصفحة الرئيسية') : undefined}
            className="storefront-brand-btn"
            style={{
              justifySelf: 'start',
              display: 'flex',
              direction: 'ltr',
              alignItems: 'center',
              gap: '10px',
              cursor: onGoHome ? 'pointer' : 'default',
              userSelect: 'none',
              outline: 'none',
              minWidth: 0,
            }}
          >
            {info.logo_url || info.logoUrl ? (
              <StorefrontBrandLogo
                src={(info.logo_url || info.logoUrl)!}
                alt={info.title || info.businessName}
                size={36}
                className="storefront-brand-avatar"
                style={{
                  transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            ) : (
              <div
                className="storefront-brand-avatar"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--storefront-primary-color, #2d68c4) 0%, #2353a0 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '15px',
                  boxShadow: '0 2px 8px var(--storefront-primary-subtle, rgba(45, 104, 196, 0.22))',
                  flexShrink: 0,
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {((brand.title || '').trim().replace(/^ال/, '').trim().charAt(0) || (brand.title || '').trim().charAt(0) || (isEn ? 'S' : 'م'))}
              </div>
            )}
            <span
              dir="auto"
              className="storefront-brand-title"
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'color 0.16s ease',
              }}
            >
              {brand.title}
            </span>
          </div>

          {/* Unified Search Bar — Centered on Desktop, Flex Row with Lang Dropdown on Mobile */}
          <div className={`storefront-nav-bottom-row${showMobileSearchRow ? ' is-mobile-search-open' : ''}`}>
            <StorefrontPredictiveSearch
              slug={info.slug}
              storeName={brand.title}
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              onSelectCategory={onSelectCategory}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onOpenCategories={onOpenCategories}
            />
            {renderLangDropdown(true)}
          </div>

          {/* Quick Actions (Orders, Cart & Fixed-Position Language Dropdown) */}
          <div
            dir="rtl"
            className="storefront-actions"
            style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
          >
            {/* Mobile Search Icon Button */}
            <button
              className="storefront-mobile-search-trigger"
              type="button"
              onClick={handleToggleMobileSearch}
              title={isEn ? 'Search' : t('storefront.storefront_header.search', 'بحث')}
              aria-label={isEn ? 'Search' : t('storefront.storefront_header.search', 'بحث')}
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: showMobileSearchRow ? '#f1f5f9' : '#ffffff',
                border: '1px solid #E0E3E7',
                color: '#1f1f1f',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              {showMobileSearchRow ? <IconClose size={14} /> : <IconSearch size={15} />}
            </button>

            {/* My Orders Trigger */}
            {onOpenOrders && (
              <button
                className="storefront-action-btn"
                type="button"
                onClick={onOpenOrders}
                title={isEn ? 'Track My Orders' : 'متابعة وتتبع طلباتي'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '0 10px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#1f1f1f',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.16s ease, border-color 0.16s ease',
                  boxSizing: 'border-box',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <PackageIcon size={14} style={{ flexShrink: 0 }} />
                <span className="storefront-action-label" style={{ fontSize: '11.5px', fontWeight: 600 }}>
                  {isEn ? 'My Orders' : 'طلباتي'}
                </span>
              </button>
            )}

            {/* Cart Trigger */}
            <button
              className="storefront-cart-btn storefront-gpu-btn"
              type="button"
              onClick={onOpenCart}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0 10px',
                height: '32px',
                borderRadius: '10px',
                background: 'var(--storefront-primary-color, #2d68c4)',
                color: 'var(--storefront-primary-contrast, #ffffff)',
                fontSize: '11.5px',
                fontWeight: 600,
                border: '1px solid var(--storefront-primary-color, #2d68c4)',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                boxSizing: 'border-box',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {cartCount > 0 && (
                <span
                  style={{
                    background: '#ffffff',
                    color: 'var(--storefront-primary-color, #0f172a)',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    padding: '0.5px 4.5px',
                    borderRadius: '5px',
                    minWidth: '15px',
                    height: '16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
                    lineHeight: 1,
                  }}
                >
                  {cartCount}
                </span>
              )}
              <IconShoppingCart size={15} strokeWidth={2.1} />
              {cartTotal > 0 && (() => {
                const isThreeDec = isThreeDecimalCurrency(storeCurr);
                const formattedTotal = isThreeDec
                  ? cartTotal.toFixed(3)
                  : (storeCurr === 'EGP' && cartTotal % 1 === 0 ? cartTotal.toFixed(0) : cartTotal.toFixed(2));
                return (
                  <span className="storefront-action-label" style={{ borderInlineStart: '1px solid rgba(255,255,255,0.25)', paddingInlineStart: '5px', marginInlineStart: '2px', fontSize: '11px', fontWeight: 600 }}>
                    {formattedTotal} {currSymbol}
                  </span>
                );
              })()}
            </button>

            {/* Compact Language Switcher Dropdown (Always fixed at far-left of header) */}
            {renderLangDropdown(false)}
          </div>
        </div>
      </header>
    </>
  );
});
