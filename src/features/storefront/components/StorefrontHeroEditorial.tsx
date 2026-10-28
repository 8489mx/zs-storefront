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

// Preset badges for the 7-card 3D perspective coverflow deck
const CARD_BADGES = [
  'عرض محدود',
  'وصل حديثاً',
  'خصم خاص',
  'الأكثر مبيعاً',
  'أفضل تقييم',
  'تخفيضات اليوم',
  'مختاراتنا',
];

// 3D Coverflow geometry presets by offset from center (-3 to +3)
function getCoverflowStyle(offset: number, isHovered: boolean) {
  const abs = Math.abs(offset);
  const sign = offset < 0 ? -1 : 1;

  if (offset === 0) {
    return {
      width: '248px',
      height: '326px',
      borderRadius: '22px',
      transform: isHovered
        ? 'perspective(900px) rotateY(0deg) translateY(-8px) scale(1.03)'
        : 'perspective(900px) rotateY(0deg) translateY(0px) scale(1)',
      zIndex: 20,
      opacity: 1,
    };
  }

  if (abs === 1) {
    const rotY = sign * 34; // Left (-1) -> -34deg (right edge taller), Right (+1) -> +34deg (left edge taller)
    return {
      width: '154px',
      height: '286px',
      borderRadius: '18px',
      transform: isHovered
        ? `perspective(750px) rotateY(${rotY * 0.75}deg) translateY(0px) scale(1.03)`
        : `perspective(750px) rotateY(${rotY}deg) translateY(8px) scale(1)`,
      zIndex: 15,
      opacity: 0.98,
    };
  }

  if (abs === 2) {
    const rotY = sign * 38;
    return {
      width: '138px',
      height: '248px',
      borderRadius: '16px',
      transform: isHovered
        ? `perspective(750px) rotateY(${rotY * 0.75}deg) translateY(10px) scale(1.03)`
        : `perspective(750px) rotateY(${rotY}deg) translateY(18px) scale(1)`,
      zIndex: 10,
      opacity: 0.94,
    };
  }

  // abs >= 3
  const rotY = sign * 42;
  return {
    width: '124px',
    height: '214px',
    borderRadius: '15px',
    transform: isHovered
      ? `perspective(750px) rotateY(${rotY * 0.75}deg) translateY(18px) scale(1.03)`
      : `perspective(750px) rotateY(${rotY}deg) translateY(26px) scale(1)`,
    zIndex: 5,
    opacity: 0.9,
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
        padding: '44px 20px 52px',
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
        @media (max-width: 860px) {
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
            width: 175px !important;
            min-width: 175px !important;
            height: 245px !important;
            opacity: 1 !important;
            flex-shrink: 0 !important;
          }
        }
      `}</style>

      {/* Top Main Headline */}
      <div style={{ maxWidth: '820px', marginBottom: '20px', position: 'relative', zIndex: 5 }}>
        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
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

      {/* Centerpiece: 3D Perspective Coverflow Deck (Exact match to reference image) */}
      <div
        dir="ltr"
        className="storefront-fanned-deck"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '18px',
          position: 'relative',
          padding: '18px 16px 34px',
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
                background: '#ffffff',
                border: isCenter ? '1.5px solid #cbd5e1' : '1px solid #E0E3E7',
                boxShadow: isCenter
                  ? '0 24px 48px -12px rgba(15, 23, 42, 0.22), 0 6px 16px rgba(15, 23, 42, 0.08)'
                  : isHovered
                    ? '0 18px 34px -8px rgba(15, 23, 42, 0.16), 0 4px 10px rgba(0, 0, 0, 0.05)'
                    : '0 12px 26px -8px rgba(15, 23, 42, 0.11), 0 2px 6px rgba(0, 0, 0, 0.03)',
                position: 'relative',
                transform: covStyle.transform,
                transformOrigin: 'center 58%',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: isCenter ? '14px' : '10px',
                boxSizing: 'border-box',
                zIndex: isHovered ? 25 : covStyle.zIndex,
                opacity: covStyle.opacity,
                flexShrink: 0,
              }}
            >
              {/* Card Header: Badge & Price Tag */}
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
                {isCenter && (
                  <span
                    style={{
                      background: isOutOfStock ? '#ef4444' : '#0f172a',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {badgeText}
                  </span>
                )}

                <span
                  style={{
                    fontSize: isCenter ? '13px' : '11px',
                    fontWeight: 800,
                    color: '#0f172a',
                    fontVariantNumeric: 'tabular-nums',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: isCenter ? '3px 9px' : '2px 7px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    marginInlineStart: isCenter ? '0' : 'auto',
                    marginInlineEnd: isCenter ? '0' : 'auto',
                  }}
                >
                  {product.price} <CurrencySymbol />
                </span>
              </div>

              {/* Product Artwork / Photo Container */}
              <div
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: isCenter ? '10px 6px' : '6px 2px',
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
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    filter: isCenter
                      ? 'drop-shadow(0 10px 20px rgba(15, 23, 42, 0.16))'
                      : 'drop-shadow(0 6px 12px rgba(15, 23, 42, 0.11))',
                    transition: 'transform 0.3s ease',
                    transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                  }}
                />
              </div>

              {/* Card Footer: Product Name & Add Action */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: isCenter ? '10px' : '7px',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    fontSize: isCenter ? '13px' : '11px',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.3,
                    textAlign: 'right',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: isCenter ? 2 : 1,
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
                    width: isCenter ? '34px' : '28px',
                    height: isCenter ? '34px' : '28px',
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
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.12)',
                  }}
                  title={isOutOfStock ? 'غير متوفر' : 'أضف للسلة'}
                >
                  {justAddedId === product.id ? (
                    <IconCheckCircle size={isCenter ? 16 : 13} color="#ffffff" />
                  ) : (
                    <IconShoppingCart size={isCenter ? 15 : 12} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subheading Narrative Paragraph below Cards */}
      <div style={{ maxWidth: '640px', margin: '4px auto 20px', position: 'relative', zIndex: 5 }}>
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(0.92rem, 1.25vw, 1.05rem)',
            color: '#64748b',
            lineHeight: 1.6,
            fontWeight: 600,
          }}
        >
          {info.description || info.bio || 'تشكيلة متنوعة من المنتجات المختارة بعناية، اطلب أونلاين بسهولة واستلم طلبك في أسرع وقت.'}
        </p>
      </div>

      {/* Action Buttons with 12px Curvature & 35px Height */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <button
          type="button"
          onClick={onSelectDeals}
          style={{
            background: '#0f172a',
            color: '#ffffff',
            border: '1px solid #0f172a',
            borderRadius: '12px',
            height: '35px',
            padding: '0 16px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.18)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.15s ease',
            boxSizing: 'border-box',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span>تصفح عروض اليوم</span>
          <span style={{ fontSize: '14px', lineHeight: 1 }}>←</span>
        </button>

        <button
          type="button"
          onClick={onOpenCategoriesModal}
          style={{
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #E0E3E7',
            borderRadius: '12px',
            height: '35px',
            padding: '0 14px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.15s ease',
            boxSizing: 'border-box',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#E0E3E7';
          }}
        >
          <span>تصفح كل الأقسام</span>
          <IconArrowUpRight size={13} strokeWidth={2.4} />
        </button>
      </div>
    </section>
  );
});

