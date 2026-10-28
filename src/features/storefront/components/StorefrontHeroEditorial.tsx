import React, { useState, useMemo } from 'react';
import type { StorefrontInfo, StorefrontProduct, StorefrontCategory } from '../types/storefront.types';
import { CurrencySymbol } from '@/shared/ui/currency-symbol';
import { resolveProductPhoto, generatePremiumProductSvg } from '../lib/storefront-photo-matcher';
import { IconShoppingCart, IconCheckCircle, IconArrowUpRight } from './StorefrontIcons';

interface StorefrontHeroEditorialProps {
  info: StorefrontInfo;
  featuredProducts: StorefrontProduct[];
  categories: StorefrontCategory[];
  cartMap: Map<number, number>;
  onAddToCart: (product: StorefrontProduct) => void;
  onUpdateQuantity: (productId: number, qty: number) => void;
  onQuickView: (product: StorefrontProduct) => void;
  onSelectDeals: () => void;
  onSelectCategory: (categoryId: number) => void;
  onOpenCategoriesModal: () => void;
}

// Preset badges for the 3D coverflow product deck
const CARD_BADGES = [
  'عرض محدود',
  'وصل حديثاً',
  'خصم خاص',
  'أفضل تقييم',
  'تخفيضات اليوم',
  'الأكثر مبيعاً',
  'مختاراتنا',
];

// Balanced 3D Coverflow geometry by offset from center (-3 to +3)
// Keeps cards wide enough for crisp Arabic typography & product art while stepping height & 3D tilt inward
function getCoverflowStyle(offset: number, isHovered: boolean) {
  const abs = Math.abs(offset);
  const sign = offset < 0 ? -1 : 1;

  if (offset === 0) {
    return {
      width: '248px',
      height: '312px',
      borderRadius: '22px',
      marginInline: '4px',
      transform: isHovered
        ? 'perspective(1000px) rotateY(0deg) translateY(-10px) scale(1.03)'
        : 'perspective(1000px) rotateY(0deg) translateY(-4px) scale(1)',
      zIndex: 30,
      opacity: 1,
    };
  }

  if (abs === 1) {
    const rotY = sign * 20;
    return {
      width: '212px',
      height: '282px',
      borderRadius: '20px',
      marginInline: '-2px',
      transform: isHovered
        ? `perspective(950px) rotateY(${rotY * 0.65}deg) translateY(0px) scale(1.03)`
        : `perspective(950px) rotateY(${rotY}deg) translateY(8px) scale(1)`,
      zIndex: 20,
      opacity: 0.99,
    };
  }

  if (abs === 2) {
    const rotY = sign * 24;
    return {
      width: '194px',
      height: '254px',
      borderRadius: '18px',
      marginInline: '-6px',
      transform: isHovered
        ? `perspective(950px) rotateY(${rotY * 0.65}deg) translateY(10px) scale(1.03)`
        : `perspective(950px) rotateY(${rotY}deg) translateY(20px) scale(1)`,
      zIndex: 10,
      opacity: 0.96,
    };
  }

  // abs >= 3
  const rotY = sign * 28;
  return {
    width: '178px',
    height: '228px',
    borderRadius: '16px',
    marginInline: '-8px',
    transform: isHovered
      ? `perspective(950px) rotateY(${rotY * 0.65}deg) translateY(20px) scale(1.03)`
      : `perspective(950px) rotateY(${rotY}deg) translateY(32px) scale(1)`,
    zIndex: 5,
    opacity: 0.92,
  };
}

export const StorefrontHeroEditorial = React.memo(function StorefrontHeroEditorial({
  info,
  featuredProducts,
  categories,
  cartMap,
  onAddToCart,
  onUpdateQuantity,
  onQuickView,
  onSelectDeals,
  onSelectCategory,
  onOpenCategoriesModal,
}: StorefrontHeroEditorialProps) {
  const [hoveredCardIdx, setHoveredCardIdx] = useState<number | null>(null);
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  // Build a 7-card deck for the symmetrical 3D Coverflow (3 Left + 1 Center + 3 Right)
  const deckProducts = useMemo(() => {
    if (!featuredProducts || featuredProducts.length === 0) return [];
    if (featuredProducts.length >= 7) return featuredProducts.slice(0, 7);
    const list: StorefrontProduct[] = [];
    const targetLen = Math.min(7, featuredProducts.length >= 5 ? 7 : featuredProducts.length);
    for (let i = 0; i < targetLen; i++) {
      list.push(featuredProducts[i % featuredProducts.length]);
    }
    return list;
  }, [featuredProducts]);

  const [centerIdx, setCenterIdx] = useState<number>(3);
  const effectiveCenterIdx = deckProducts.length > 0
    ? Math.min(centerIdx, deckProducts.length - 1)
    : 0;

  // Arrange products so the selected center product sits in the middle slot (slot 3)
  const orderedDeck = useMemo(() => {
    if (deckProducts.length < 7) {
      return deckProducts.map((product, originalIdx) => ({ product, originalIdx }));
    }
    const midSlot = 3;
    const result: Array<{ product: StorefrontProduct; originalIdx: number }> = [];
    for (let slot = 0; slot < 7; slot++) {
      const idx = (effectiveCenterIdx + (slot - midSlot) + deckProducts.length) % deckProducts.length;
      result.push({ product: deckProducts[idx], originalIdx: idx });
    }
    return result;
  }, [deckProducts, effectiveCenterIdx]);

  const handleInstantAdd = (e: React.MouseEvent, product: StorefrontProduct) => {
    e.stopPropagation();
    if (!product.inStock || product.stockQty <= 0) return;
    onAddToCart(product);
    setJustAddedId(product.id);
    window.setTimeout(() => {
      setJustAddedId((curr) => (curr === product.id ? null : curr));
    }, 1200);
  };

  return (
    <section
      className="storefront-pallet-hero"
      style={{
        position: 'relative',
        background: 'radial-gradient(ellipse 90% 70% at 50% 15%, #ffffff 0%, #f4f7fb 55%, #eaeff7 100%)',
        color: '#0f172a',
        padding: '40px 16px 48px',
        overflow: 'hidden',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        userSelect: 'none',
      }}
    >
      <style>{`
        .storefront-coverflow-card {
          transition:
            transform 0.42s cubic-bezier(0.16, 1, 0.3, 1),
            width 0.42s cubic-bezier(0.16, 1, 0.3, 1),
            height 0.42s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.32s ease,
            opacity 0.32s ease !important;
          will-change: transform, width, height;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        /* Responsive Mobile Scroll Track */
        @media (max-width: 920px) {
          .storefront-pallet-hero {
            padding: 28px 12px 36px !important;
          }
          .storefront-fanned-deck {
            overflow-x: auto !important;
            padding: 16px 12px 24px !important;
            width: 100% !important;
            justify-content: flex-start !important;
            gap: 12px !important;
            scrollbar-width: none !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .storefront-fanned-deck::-webkit-scrollbar {
            display: none !important;
          }
          .storefront-coverflow-card {
            transform: none !important;
            width: 185px !important;
            min-width: 185px !important;
            height: 250px !important;
            margin-inline: 0 !important;
            opacity: 1 !important;
            flex-shrink: 0 !important;
          }
        }
      `}</style>

      {/* Top Main Headline */}
      <div style={{ maxWidth: '820px', marginBottom: '18px', position: 'relative', zIndex: 5 }}>
        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 'clamp(2rem, 4vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.22,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            textWrap: 'balance',
            fontFamily: "'Alexandria', 'Inter', 'Tajawal', 'Cairo', sans-serif",
          }}
        >
          كل ما تحتاجه في مكان واحد وبأفضل سعر.
        </h1>
      </div>

      {/* Centerpiece: Symmetrical 3D Coverflow Deck */}
      <div
        dir="ltr"
        className="storefront-fanned-deck"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0px',
          position: 'relative',
          padding: '16px 12px 42px',
          maxWidth: '100%',
          zIndex: 4,
          flexWrap: 'nowrap',
          perspective: '1200px',
        }}
      >
        {orderedDeck.map((item, slotIdx) => {
          const { product, originalIdx } = item;
          const midSlot = Math.floor(orderedDeck.length / 2);
          const offset = slotIdx - midSlot;
          const isCenter = offset === 0;
          const isOuter = Math.abs(offset) >= 2;
          const isHovered = hoveredCardIdx === slotIdx;
          const covStyle = getCoverflowStyle(offset, isHovered);

          const autoPhoto = resolveProductPhoto(product.name, product.categoryName);
          const photoUrl = product.imageUrl || autoPhoto.url;
          const isOutOfStock = !product.inStock || product.stockQty <= 0;
          const badgeText = isOutOfStock ? 'نفدت الكمية' : CARD_BADGES[originalIdx % CARD_BADGES.length];

          return (
            <div
              key={`${product.id}-${slotIdx}`}
              dir="rtl"
              className="storefront-coverflow-card"
              onMouseEnter={() => setHoveredCardIdx(slotIdx)}
              onMouseLeave={() => setHoveredCardIdx(null)}
              onClick={() => {
                if (!isCenter && orderedDeck.length >= 7) {
                  setCenterIdx(originalIdx);
                } else {
                  onQuickView(product);
                }
              }}
              style={{
                width: covStyle.width,
                height: covStyle.height,
                borderRadius: covStyle.borderRadius,
                marginInline: covStyle.marginInline,
                background: '#ffffff',
                border: isCenter ? '1.5px solid #cbd5e1' : '1px solid #e2e8f0',
                boxShadow: isCenter
                  ? '0 24px 48px -12px rgba(15, 23, 42, 0.2), 0 6px 16px rgba(15, 23, 42, 0.07)'
                  : isHovered
                    ? '0 20px 36px -10px rgba(15, 23, 42, 0.16), 0 4px 10px rgba(0, 0, 0, 0.05)'
                    : '0 14px 28px -10px rgba(15, 23, 42, 0.1), 0 2px 6px rgba(0, 0, 0, 0.03)',
                position: 'relative',
                transform: covStyle.transform,
                transformOrigin: 'center 55%',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: isCenter ? '14px' : isOuter ? '10px' : '12px',
                boxSizing: 'border-box',
                zIndex: isHovered ? 35 : covStyle.zIndex,
                opacity: covStyle.opacity,
                flexShrink: 0,
              }}
            >
              {/* Card Header: Dark Badge Pill + Price Tag */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 2,
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    background: isOutOfStock ? '#ef4444' : '#0f172a',
                    color: '#ffffff',
                    fontSize: isCenter ? '11px' : isOuter ? '9.5px' : '10px',
                    fontWeight: 800,
                    padding: isCenter ? '4px 10px' : '3px 8px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                  }}
                >
                  {badgeText}
                </span>

                <span
                  style={{
                    fontSize: isCenter ? '12.5px' : isOuter ? '10.5px' : '11.5px',
                    fontWeight: 800,
                    color: '#0f172a',
                    fontVariantNumeric: 'tabular-nums',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: isCenter ? '3px 8px' : '2px 6px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                  }}
                >
                  {product.price} <CurrencySymbol />
                </span>
              </div>

              {/* Seamless Product Artwork Container (No square drop-shadow artifact) */}
              <div
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: isCenter ? '6px 4px' : '4px 2px',
                  boxSizing: 'border-box',
                  position: 'relative',
                }}
              >
                <img
                  src={photoUrl}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = generatePremiumProductSvg(product.name, product.categoryName);
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.3s ease',
                    transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                  }}
                />
              </div>

              {/* Card Footer: Product Name & Quick Add Squircle Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: isCenter ? '10px' : '8px',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    fontSize: isCenter ? '13px' : isOuter ? '11px' : '12px',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.32,
                    textAlign: 'right',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={product.name}
                >
                  {product.name}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleInstantAdd(e, product)}
                  disabled={isOutOfStock}
                  style={{
                    width: isCenter ? '34px' : '30px',
                    height: isCenter ? '34px' : '30px',
                    borderRadius: '10px',
                    background: justAddedId === product.id ? '#16a34a' : isOutOfStock ? '#e2e8f0' : '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isOutOfStock ? 'none' : '0 4px 10px rgba(15, 23, 42, 0.14)',
                  }}
                  title="أضف للسلة"
                >
                  {justAddedId === product.id ? (
                    <IconCheckCircle size={isCenter ? 16 : 14} />
                  ) : (
                    <IconShoppingCart size={isCenter ? 15 : 13} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Subtitle & CTA Buttons */}
      <div
        style={{
          maxWidth: '640px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(0.95rem, 1.35vw, 1.1rem)',
            color: '#64748b',
            lineHeight: 1.65,
            fontWeight: 600,
          }}
        >
          تشكيلة متنوعة من المنتجات المختارة بعناية، اطلب أونلاين بسهولة واستلم طلبك في أسرع وقت.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={onSelectDeals}
            style={{
              height: '35px',
              padding: '0 18px',
              borderRadius: '12px',
              background: '#0f172a',
              color: '#ffffff',
              border: '1px solid #0f172a',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>تصفح عروض اليوم</span>
            <span style={{ fontSize: '15px', lineHeight: 1 }}>←</span>
          </button>

          <button
            type="button"
            onClick={onOpenCategoriesModal}
            style={{
              height: '35px',
              padding: '0 16px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #E0E3E7',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>تصفح كل الأقسام</span>
            <IconArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
});
