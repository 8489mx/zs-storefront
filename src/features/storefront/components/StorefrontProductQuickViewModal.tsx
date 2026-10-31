import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback, useRef } from 'react';
import { StorefrontProduct, StorefrontInfo } from '../types/storefront.types';
import { CurrencySymbol } from '@/shared/ui/currency-symbol';
import {
  XIcon,
  PlusIcon,
  CheckIcon,
  ClockIcon,
  Share2Icon,
} from '@/shared/components/icons/AppIcons';
import {
  IconShoppingBag,
  IconWhatsapp,
} from './StorefrontIcons';
import { trackStorefrontEvent } from '../lib/storefront-pixel-tracker';
import { buildCartProduct, getProductVariants, resolveVariantUnitPrice } from '../lib/storefront-variant-pricing';
import { generatePremiumProductSvg, resolveProductPhoto } from '../lib/storefront-photo-matcher';
import { getContrastTextColor } from '../lib/storefront-theme-contrast';
import { useBodyScrollLock } from '@/shared/components/dialog-shell';

interface TapOriginMetrics {
  dx: number;
  dy: number;
  scale: number;
  timestamp: number;
}

let lastProductTapOrigin: TapOriginMetrics | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const cardEl = target.closest(
        '.storefront-product-card, .storefront-coverflow-card, .sf-amz-quick-tile, .sf-amz-promo-card, .sf-amz-hero-orange-card, .storefront-deal-spotlight'
      ) as HTMLElement | null;

      const vw = window.innerWidth || 1280;
      const vh = window.innerHeight || 800;

      if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const ratio = Math.min(rect.width / 490, rect.height / 500);
        lastProductTapOrigin = {
          dx: Math.round(cx - vw / 2),
          dy: Math.round(cy - vh / 2),
          scale: Number(Math.max(0.28, Math.min(0.52, ratio)).toFixed(3)),
          timestamp: performance.now(),
        };
      } else if (e.clientX && e.clientY) {
        lastProductTapOrigin = {
          dx: Math.round(e.clientX - vw / 2),
          dy: Math.round(e.clientY - vh / 2),
          scale: 0.36,
          timestamp: performance.now(),
        };
      }
    },
    { capture: true, passive: true }
  );
}

export interface StorefrontProductQuickViewModalProps {
  product: StorefrontProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: StorefrontProduct, quantity: number) => void;
  info?: StorefrontInfo;
  tenantSlug?: string;
  slug?: string;
  cartLine?: { variantName?: string | null; quantity: number } | null;
  allProducts?: StorefrontProduct[];
  onSelectProduct?: (product: StorefrontProduct) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: number) => void;
  onOpenReviewModal?: (product: StorefrontProduct) => void;
}

const QUICKVIEW_STATIC_CSS = `
  @keyframes sfIosBackdropIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes sfIosBackdropOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes sfIosAppLaunchOpen {
    0% {
      opacity: 0;
      transform: translate3d(var(--ios-origin-x, 0px), var(--ios-origin-y, 48px), 0) scale3d(var(--ios-init-scale, 0.36), var(--ios-init-scale, 0.36), 1);
    }
    66% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale3d(1.012, 1.012, 1);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
    }
  }
  @keyframes sfIosAppLaunchClose {
    0% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
    }
    100% {
      opacity: 0;
      transform: translate3d(var(--ios-origin-x, 0px), var(--ios-origin-y, 48px), 0) scale3d(var(--ios-init-scale, 0.34), var(--ios-init-scale, 0.34), 1);
    }
  }
  .sf-quickview-backdrop {
    background-color: rgba(15, 23, 42, 0.48);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    backface-visibility: hidden;
  }
  .sf-quickview-backdrop.is-opening {
    animation: sfIosBackdropIn 0.15s ease forwards;
  }
  .sf-quickview-backdrop.is-closing {
    animation: sfIosBackdropOut 0.14s ease forwards;
    pointer-events: none;
  }
  .sf-quickview-shell {
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-origin: center center;
  }
  .sf-quickview-backdrop.is-opening .sf-quickview-shell {
    animation: sfIosAppLaunchOpen 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .sf-quickview-backdrop.is-closing .sf-quickview-shell {
    animation: sfIosAppLaunchClose 0.14s cubic-bezier(0.32, 0.72, 0, 1) forwards;
  }
  .sf-quickview-ai-btn:active {
    transform: scale3d(0.96, 0.96, 1);
  }
  .sf-quickview-photo-stage {
    height: clamp(175px, 28dvh, 225px);
  }
  @media (max-width: 640px) {
    .sf-quickview-backdrop {
      padding: 10px !important;
      align-items: center !important;
    }
    .sf-quickview-shell {
      max-width: 100% !important;
      width: 100% !important;
      border-radius: 18px !important;
      padding: 12px 13px 13px !important;
      gap: 9px !important;
      max-height: calc(100dvh - 20px) !important;
    }
    .sf-quickview-photo-stage {
      height: clamp(148px, 24.5dvh, 192px) !important;
      padding: 4px 6px 14px !important;
    }
  }
  @media (max-height: 640px) {
    .sf-quickview-photo-stage {
      height: clamp(118px, 20dvh, 152px) !important;
      padding: 4px 6px 12px !important;
    }
    .sf-quickview-shell {
      gap: 7px !important;
      padding: 10px 12px 11px !important;
    }
  }
`;

export function StorefrontProductQuickViewModal({
  product: propProduct,
  isOpen,
  onClose,
  onAddToCart,
  info,
  tenantSlug,
  slug,
  isFavorite: isFavoriteProp,
  onToggleFavorite,
}: StorefrontProductQuickViewModalProps) {
  const { t } = useTranslation();
  const [mountedProduct, setMountedProduct] = useState<StorefrontProduct | null>(propProduct);
  const [isClosing, setIsClosing] = useState(false);
  const [originMetrics, setOriginMetrics] = useState<TapOriginMetrics>({ dx: 0, dy: 48, scale: 0.38, timestamp: 0 });
  const closeTimerRef = useRef<number | null>(null);

  const [qty, setQty] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [localFavorite, setLocalFavorite] = useState(false);

  // Fullscreen Image Lightbox & Interactive Zoom State
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; origX: number; origY: number }>({
    x: 0,
    y: 0,
    origX: 0,
    origY: 0,
  });
  const didPanMoveRef = useRef(false);

  useEffect(() => {
    if (isOpen && propProduct) {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      const now = performance.now();
      if (lastProductTapOrigin && now - lastProductTapOrigin.timestamp < 1500) {
        setOriginMetrics(lastProductTapOrigin);
      } else {
        setOriginMetrics({ dx: 0, dy: 64, scale: 0.42, timestamp: now });
      }
      setMountedProduct(propProduct);
      setIsClosing(false);
    } else if (!isOpen && mountedProduct) {
      setIsZoomOpen(false);
      setIsClosing(true);
      closeTimerRef.current = window.setTimeout(() => {
        setMountedProduct(null);
        setIsClosing(false);
        closeTimerRef.current = null;
      }, 150);
    }
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [isOpen, propProduct]);

  const handleAnimatedClose = useCallback(() => {
    if (isClosing) return;
    setIsZoomOpen(false);
    setIsClosing(true);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setMountedProduct(null);
      setIsClosing(false);
      closeTimerRef.current = null;
      onClose();
    }, 145);
  }, [isClosing, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomOpen) {
          e.stopPropagation();
          setIsZoomOpen(false);
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
        } else {
          handleAnimatedClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isZoomOpen, handleAnimatedClose]);

  const product = propProduct || mountedProduct;

  useEffect(() => {
    if (propProduct) {
      setQty(1);
      setAddedAnimation(false);
      setCopiedLink(false);
      setActivePhotoIndex(0);
      setIsZoomOpen(false);
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
      const variants = (propProduct as any).variants || [];
      setSelectedVariantIndex(variants.length > 0 ? 0 : null);
      try {
        setLocalFavorite(localStorage.getItem(`zs_fav_${propProduct.id}`) === 'true');
      } catch {
        setLocalFavorite(false);
      }
    }
  }, [propProduct]);

  const isModalVisible = Boolean(product && (isOpen || mountedProduct));
  useBodyScrollLock(isModalVisible);

  if (!product || (!isOpen && !mountedProduct)) return null;

  const isFavorite = isFavoriteProp !== undefined ? isFavoriteProp : localFavorite;

  const handleFavoriteClick = () => {
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    } else {
      setLocalFavorite((prev) => {
        const next = !prev;
        try {
          localStorage.setItem(`zs_fav_${product.id}`, String(next));
        } catch {}
        return next;
      });
    }
  };

  const getProductDirectUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const activeSlug = tenantSlug || slug || info?.slug || 'demo';
    const pathMatch = window.location.pathname.match(/^\/(st|store|shop)\/[^/]+/);
    const basePath = pathMatch ? pathMatch[0] : `/st/${activeSlug}`;
    return `${origin}${basePath}/p/${product.id}`;
  };

  const handleShareClick = async () => {
    const shareUrl = getProductDirectUrl();
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `${product.name} - ${product.price.toLocaleString()} ${info?.currency || 'ج.م'}`,
          url: shareUrl,
        });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const autoPhoto = resolveProductPhoto(product.name, product.categoryName);
  const displayPrimaryPhoto = product.imageUrl || autoPhoto.url || '';

  const brandColor = info?.brandColor || 'var(--storefront-primary-color, #2563eb)';
  const brandColorContrast = getContrastTextColor(info?.brandColor);
  const inStock = product.inStock !== false;

  const gallery: string[] =
    (product as any).gallery && (product as any).gallery.length > 0
      ? (product as any).gallery
      : displayPrimaryPhoto
      ? [displayPrimaryPhoto]
      : [];

  const activePhotoUrl =
    gallery[activePhotoIndex] || displayPrimaryPhoto || generatePremiumProductSvg(product.name, product.categoryName);
  const isRealActivePhoto = Boolean(activePhotoUrl && !activePhotoUrl.startsWith('data:image/svg+xml'));

  const openZoomViewer = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsZoomOpen(true);
  };

  const closeZoomViewer = () => {
    setIsZoomOpen(false);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomStep = (delta: number) => {
    setZoomScale((prev) => {
      const next = Number(Math.min(3, Math.max(1, prev + delta)).toFixed(2));
      if (next <= 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleCycleZoom = () => {
    if (didPanMoveRef.current) {
      didPanMoveRef.current = false;
      return;
    }
    setZoomScale((prev) => {
      if (prev < 1.6) return 1.85;
      if (prev < 2.4) return 2.6;
      setPanOffset({ x: 0, y: 0 });
      return 1;
    });
  };

  const variants = getProductVariants(product);
  const selectedVariant = selectedVariantIndex !== null ? variants[selectedVariantIndex] || null : null;

  const basePrice = resolveVariantUnitPrice(product.price, selectedVariant) ?? product.price;
  const isZeroPrice = Number(basePrice || 0) <= 0;

  const hasOriginalDiscount = Boolean(product.hasDiscount && product.originalPrice && product.originalPrice > basePrice);
  const discountPercentage =
    product.discountPercent ||
    (hasOriginalDiscount && product.originalPrice
      ? Math.round(((product.originalPrice - basePrice) / product.originalPrice) * 100)
      : 0);

  const cleanWhatsappPhone = ((info?.whatsappPhone || (info as any)?.whatsapp) || '').replace(/[^0-9]/g, '');
  const whatsappInquiryUrl = cleanWhatsappPhone
    ? `https://wa.me/${cleanWhatsappPhone}?text=${encodeURIComponent(
        `مرحباً، أود الاستفسار عن صنف: ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} - بسعر ${basePrice.toLocaleString()} ${info?.currency || 'ج.م'}`
      )}`
    : null;

  const handleAdd = () => {
    if (!inStock || isZeroPrice) return;
    const finalProduct = buildCartProduct(product, selectedVariant?.name);
    if (!finalProduct) return;

    onAddToCart(finalProduct, qty);
    setAddedAnimation(true);
    trackStorefrontEvent('AddToCart', {
      contentName: finalProduct.name,
      contentId: product.id,
      value: basePrice * qty,
      currency: info?.currency || 'EGP',
    });
    setTimeout(() => {
      setAddedAnimation(false);
      handleAnimatedClose();
    }, 300);
  };

  return (
    <div
      dir="rtl"
      className={`sf-quickview-backdrop ${isClosing ? 'is-closing' : 'is-opening'}`}
      style={
        {
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          '--ios-origin-x': `${originMetrics.dx}px`,
          '--ios-origin-y': `${originMetrics.dy}px`,
          '--ios-init-scale': `${originMetrics.scale}`,
        } as React.CSSProperties
      }
      onClick={handleAnimatedClose}
    >
      <style>{QUICKVIEW_STATIC_CSS}</style>

      <div
        className="sf-quickview-shell"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #edf1f7',
          maxWidth: '430px',
          width: '100%',
          maxHeight: 'calc(100dvh - 24px)',
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.22)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '15px 18px 16px',
          gap: '11px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Compact Luxury Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleAnimatedClose}
            className="sf-quickview-ai-btn"
            aria-label="إغلاق"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '9px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
            }}
          >
            <XIcon size={14} strokeWidth={2.2} />
          </button>

          <span
            style={{
              fontSize: '13.5px',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.1px',
            }}
          >
            تفاصيل المنتج
          </span>

          <button
            type="button"
            onClick={handleShareClick}
            className="sf-quickview-ai-btn"
            title={copiedLink ? 'تم نسخ الرابط' : 'مشاركة المنتج'}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '9px',
              background: copiedLink ? '#ecfdf5' : '#f8fafc',
              border: `1px solid ${copiedLink ? '#a7f3d0' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: copiedLink ? '#059669' : '#334155',
              transition: 'transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
            }}
          >
            {copiedLink ? <CheckIcon size={14} color="#059669" /> : <Share2Icon size={14} color="#334155" strokeWidth={2} />}
          </button>
        </div>

        {/* Zero-Scroll Body Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '9px',
            overflow: 'hidden',
            flexShrink: 1,
            minHeight: 0,
          }}
        >
          {/* 2. Studio Image Showcase Box (Fills Maximum Space + Click to Open Fullscreen Zoom) */}
          <div
            className="sf-quickview-photo-stage"
            onClick={openZoomViewer}
            title="اضغط لتكبير صورة المنتج"
            style={{
              width: '100%',
              borderRadius: '14px',
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              padding: '4px 8px 14px',
              boxSizing: 'border-box',
              flexShrink: 0,
              cursor: 'zoom-in',
            }}
          >
            <img
              src={activePhotoUrl}
              alt={product.name}
              decoding="async"
              draggable={false}
              onError={(e) => {
                e.currentTarget.src = generatePremiumProductSvg(product.name, product.categoryName);
              }}
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: isRealActivePhoto ? 'scale(1.24)' : undefined,
                mixBlendMode: isRealActivePhoto ? 'multiply' : undefined,
                filter: 'drop-shadow(0 8px 16px rgba(15, 23, 42, 0.08))',
                transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                pointerEvents: 'none',
              }}
            />

            {discountPercentage > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '9px',
                  right: '9px',
                  background: '#e11d48',
                  color: '#ffffff',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: '8px',
                  lineHeight: 1.25,
                  boxShadow: '0 2px 8px rgba(225, 29, 72, 0.22)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                خصم {discountPercentage}%
              </span>
            )}

            {/* Zoom Hint Pill (Bottom-Left of Image Box) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openZoomViewer();
              }}
              aria-label="تكبير الصورة"
              style={{
                position: 'absolute',
                bottom: '7px',
                left: '8px',
                height: '24px',
                padding: '0 8px',
                borderRadius: '7px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(203, 213, 225, 0.85)',
                color: '#334155',
                fontSize: '10px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'zoom-in',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)',
                zIndex: 2,
                fontFamily: 'inherit',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span>تكبير</span>
            </button>

            {/* Minimal Dot Indicator overlaid at bottom of image box */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: '7px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                zIndex: 2,
              }}
            >
              {gallery.length > 1 ? (
                gallery.map((_, idx) => {
                  const isCurrent = idx === activePhotoIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      style={{
                        width: isCurrent ? '16px' : '5px',
                        height: '5px',
                        borderRadius: '5px',
                        background: isCurrent ? '#0f172a' : '#cbd5e1',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'width 0.2s ease, background-color 0.2s ease',
                      }}
                    />
                  );
                })
              ) : (
                <>
                  <span style={{ width: '4px', height: '4px', borderRadius: '4px', background: '#cbd5e1' }} />
                  <span style={{ width: '14px', height: '4px', borderRadius: '4px', background: '#0f172a' }} />
                  <span style={{ width: '4px', height: '4px', borderRadius: '4px', background: '#cbd5e1' }} />
                </>
              )}
            </div>
          </div>

          {/* 3. Category + Title + Favorite Button */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', flexShrink: 0 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              {product.categoryName && (
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748b',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {product.categoryName}
                </div>
              )}

              <h2
                style={{
                  fontSize: 'clamp(14px, 3.8vw, 16px)',
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                  lineHeight: 1.32,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {product.name}
              </h2>
            </div>

            {/* Favorite Button */}
            <button
              type="button"
              onClick={handleFavoriteClick}
              className="sf-quickview-ai-btn"
              aria-label="المفضلة"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: isFavorite ? '#fff1f2' : '#f8fafc',
                border: `1px solid ${isFavorite ? '#fecdd3' : '#e2e8f0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill={isFavorite ? '#e11d48' : 'none'}
                stroke={isFavorite ? '#e11d48' : '#64748b'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* 4. Compact Description (Clamped to 2 lines so it never triggers scroll) */}
          {product.description && (
            <p
              style={{
                margin: 0,
                fontSize: '11.5px',
                lineHeight: 1.45,
                color: '#64748b',
                fontWeight: 400,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {product.description}
            </p>
          )}

          {/* 5A. Full-Width Variant Selector Pills (when product has variants, so they never clip) */}
          {variants.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                paddingBottom: '1px',
                flexShrink: 0,
              }}
            >
              {variants.map((v, idx) => {
                const isSelected = selectedVariantIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedVariantIndex(idx)}
                    style={{
                      height: '29px',
                      padding: '0 11px',
                      borderRadius: '8px',
                      border: isSelected ? `1px solid ${brandColor}` : '1px solid #e2e8f0',
                      background: isSelected ? brandColor : '#f8fafc',
                      color: isSelected ? '#ffffff' : '#334155',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                    }}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* 5B. Unified Stock Status & Quantity Stepper Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              background: '#f8fafc',
              border: '1px solid #edf1f7',
              borderRadius: '11px',
              padding: '6px 10px',
              flexShrink: 0,
            }}
          >
            {/* Right side in RTL: Stock Status Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '26px',
                padding: '0 9px',
                borderRadius: '7px',
                background: inStock ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${inStock ? '#d1fae5' : '#fee2e2'}`,
                color: inStock ? '#15803d' : '#dc2626',
                fontSize: '11px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: inStock ? '#16a34a' : '#dc2626',
                  flexShrink: 0,
                }}
              />
              {inStock ? 'متوفر وجاهز للشحن' : 'نفدت الكمية'}
            </span>

            {/* Left side in RTL: QTY Stepper [ + ] 1 [ - ] */}
            {!isZeroPrice && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>الكمية</span>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: '28px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    padding: '0 2px',
                    gap: '2px',
                  }}
                >
                  <button
                    type="button"
                    disabled={!inStock || (product.stockQty > 0 && product.stockQty < 999 && qty >= product.stockQty)}
                    onClick={() => setQty((prev) => prev + 1)}
                    style={{
                      width: '23px',
                      height: '22px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#0f172a',
                    }}
                  >
                    <PlusIcon size={11} color="#0f172a" />
                  </button>

                  <span
                    style={{
                      minWidth: '22px',
                      textAlign: 'center',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#0f172a',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {qty}
                  </span>

                  <button
                    type="button"
                    disabled={qty <= 1 || !inStock}
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    style={{
                      width: '23px',
                      height: '22px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: qty <= 1 ? 'not-allowed' : 'pointer',
                      opacity: qty <= 1 ? 0.38 : 1,
                      color: '#0f172a',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    −
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 6. Bottom Action Bar (Stacked Old/New Price + Balanced Primary CTA Button) */}
        <div
          style={{
            flexShrink: 0,
            background: '#f8fafc',
            border: '1px solid #edf1f7',
            borderRadius: '14px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {isZeroPrice ? (
            <a
              href={whatsappInquiryUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '11px',
                backgroundColor: '#25d366',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
              }}
            >
              <IconWhatsapp size={16} color="#ffffff" />
              <span>{t('storefront.storefront_product_quick_view_modal.s23', 'استفسر عن السعر عبر واتساب')}</span>
            </a>
          ) : (
            <>
              {/* Primary CTA Button (Right side in RTL: Icon + Concise 'أضف للسلة') */}
              <button
                type="button"
                className="sf-quickview-ai-btn"
                disabled={!inStock}
                onClick={handleAdd}
                style={{
                  flex: '1 1 auto',
                  minWidth: 0,
                  height: '42px',
                  padding: '0 16px',
                  borderRadius: '11px',
                  backgroundColor: inStock ? brandColor : '#e2e8f0',
                  color: inStock ? brandColorContrast || '#ffffff' : '#64748b',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: inStock ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  boxShadow: inStock ? '0 4px 12px rgba(37, 99, 235, 0.22)' : 'none',
                  transition: 'transform 0.16s ease, background-color 0.16s ease',
                }}
              >
                {addedAnimation ? (
                  <>
                    <CheckIcon size={16} color="#ffffff" />
                    <span>تمت الإضافة</span>
                  </>
                ) : inStock ? (
                  <>
                    <IconShoppingBag size={16} color="#ffffff" strokeWidth={2.1} />
                    <span>أضف للسلة</span>
                  </>
                ) : (
                  <>
                    <ClockIcon size={15} color="#64748b" />
                    <span>غير متوفر</span>
                  </>
                )}
              </button>

              {/* Stacked Total Price Column (Left side in RTL: Old Strikethrough Above Final Price) */}
              <div
                style={{
                  flex: '0 0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  textAlign: 'left',
                  paddingRight: '4px',
                }}
              >
                {hasOriginalDiscount && product.originalPrice ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      lineHeight: 1.1,
                      marginBottom: '2px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11.5px',
                        color: '#94a3b8',
                        textDecoration: 'line-through',
                        fontWeight: 500,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {(product.originalPrice * qty).toLocaleString()} <CurrencySymbol />
                    </span>
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 500,
                      color: '#94a3b8',
                      lineHeight: 1.1,
                      marginBottom: '2px',
                    }}
                  >
                    السعر الإجمالي
                  </span>
                )}

                <span
                  style={{
                    fontSize: '18.5px',
                    fontWeight: 800,
                    color: '#0f172a',
                    display: 'inline-flex',
                    alignItems: 'baseline',
                    gap: '3px',
                    lineHeight: 1.1,
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{(basePrice * qty).toLocaleString()}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    <CurrencySymbol />
                  </span>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Interactive Product Photo Zoom Lightbox */}
      {isZoomOpen && (
        <div
          dir="rtl"
          onClick={(e) => {
            e.stopPropagation();
            closeZoomViewer();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10050,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            boxSizing: 'border-box',
            userSelect: 'none',
            animation: 'sfIosBackdropIn 0.16s ease forwards',
          }}
        >
          {/* Lightbox Top Bar: Close Button + Title + Zoom Stepper [ + ] 100% [ - ] */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              zIndex: 3,
            }}
          >
            <button
              type="button"
              onClick={closeZoomViewer}
              aria-label="إغلاق التكبير"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '11px',
                background: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <XIcon size={16} strokeWidth={2.4} color="#ffffff" />
            </button>

            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
                textAlign: 'center',
              }}
            >
              {product.name}
            </span>

            {/* Zoom Stepper: [ + ] (الزوم) [ - ] following RTL rule */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '36px',
                borderRadius: '11px',
                background: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                padding: '0 4px',
                gap: '4px',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => handleZoomStep(0.5)}
                disabled={zoomScale >= 3}
                aria-label="تكبير"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.16)',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: zoomScale >= 3 ? 'not-allowed' : 'pointer',
                  opacity: zoomScale >= 3 ? 0.45 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomScale(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                title="إعادة ضبط الحجم"
                style={{
                  minWidth: '42px',
                  height: '28px',
                  borderRadius: '7px',
                  border: 'none',
                  background: 'transparent',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontVariantNumeric: 'tabular-nums',
                  padding: '0 4px',
                }}
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => handleZoomStep(-0.5)}
                disabled={zoomScale <= 1}
                aria-label="تصغير"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.16)',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: zoomScale <= 1 ? 'not-allowed' : 'pointer',
                  opacity: zoomScale <= 1 ? 0.45 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                −
              </button>
            </div>
          </div>

          {/* Center Interactive Fullscreen Studio Canvas */}
          <div
            data-allow-wheel="true"
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleZoomStep(e.deltaY < 0 ? 0.25 : -0.25);
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleCycleZoom();
            }}
            onPointerDown={(e) => {
              if (zoomScale <= 1) return;
              isPanningRef.current = true;
              didPanMoveRef.current = false;
              panStartRef.current = {
                x: e.clientX,
                y: e.clientY,
                origX: panOffset.x,
                origY: panOffset.y,
              };
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {}
            }}
            onPointerMove={(e) => {
              if (!isPanningRef.current || zoomScale <= 1) return;
              const dx = e.clientX - panStartRef.current.x;
              const dy = e.clientY - panStartRef.current.y;
              if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
                didPanMoveRef.current = true;
              }
              const maxPan = (zoomScale - 1) * 160;
              setPanOffset({
                x: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.origX + dx)),
                y: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.origY + dy)),
              });
            }}
            onPointerUp={(e) => {
              isPanningRef.current = false;
              try {
                e.currentTarget.releasePointerCapture(e.pointerId);
              } catch {}
            }}
            onPointerCancel={() => {
              isPanningRef.current = false;
            }}
            style={{
              width: 'min(94vw, 520px)',
              height: 'min(70dvh, 520px)',
              borderRadius: '22px',
              background: '#ffffff',
              boxShadow: '0 28px 60px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              cursor: zoomScale > 1 ? 'grab' : 'zoom-in',
              touchAction: 'none',
              padding: '10px',
              boxSizing: 'border-box',
            }}
          >
            <img
              src={activePhotoUrl}
              alt={product.name}
              draggable={false}
              onError={(e) => {
                e.currentTarget.src = generatePremiumProductSvg(product.name, product.categoryName);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${
                  (isRealActivePhoto ? 1.16 : 1) * zoomScale
                })`,
                transition: isPanningRef.current ? 'none' : 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Bottom Helper & Gallery Switcher */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              zIndex: 3,
            }}
          >
            {gallery.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {gallery.map((imgUrl, idx) => {
                  const isCurrent = idx === activePhotoIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActivePhotoIndex(idx);
                        setZoomScale(1);
                        setPanOffset({ x: 0, y: 0 });
                      }}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        border: isCurrent ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.28)',
                        background: '#ffffff',
                        padding: '3px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        opacity: isCurrent ? 1 : 0.65,
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.82)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                padding: '5px 12px',
                borderRadius: '9px',
              }}
            >
              {zoomScale > 1
                ? 'اسحب الصورة للتحريك • اضغط لتصغير أو تكبير إضافي'
                : 'اضغط على الصورة أو زر (+) للتكبير والتقريب'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

