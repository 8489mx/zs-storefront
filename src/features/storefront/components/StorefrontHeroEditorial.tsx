import React, { useState, useEffect } from 'react';
import type { StorefrontInfo, StorefrontProduct, StorefrontCategory } from '../types/storefront.types';
import { CurrencySymbol } from '@/shared/ui/currency-symbol';
import { resolveProductPhoto, generatePremiumProductSvg } from '../lib/storefront-photo-matcher';
import { IconShoppingCart, IconStar, IconCheckCircle } from './StorefrontIcons';

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
  const spotlightItems = featuredProducts.slice(0, 4);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  useEffect(() => {
    if (spotlightItems.length <= 1 || isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % spotlightItems.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [spotlightItems.length, isPaused]);

  const activeProduct = spotlightItems[activeIndex] || spotlightItems[0];
  if (!activeProduct) return null;

  const autoPhoto = resolveProductPhoto(activeProduct.name, activeProduct.categoryName);
  const displayPhotoUrl = activeProduct.imageUrl || autoPhoto.url;
  const cartQty = cartMap.get(activeProduct.id) || 0;
  const isOutOfStock = !activeProduct.inStock || activeProduct.stockQty <= 0;
  const oldPrice = activeProduct.originalPrice && activeProduct.originalPrice > activeProduct.price
    ? activeProduct.originalPrice
    : Math.round(activeProduct.price * 1.2);
  const savings = Math.max(0, oldPrice - activeProduct.price);
  const discountPercent = oldPrice > 0 ? Math.round((savings / oldPrice) * 100) : 20;

  const handleInstantAdd = (product: StorefrontProduct) => {
    onAddToCart(product);
    setJustAddedId(product.id);
    window.setTimeout(() => {
      setJustAddedId((curr) => (curr === product.id ? null : curr));
    }, 900);
  };

  return (
    <section
      className="storefront-hero-editorial"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0b0f19 0%, var(--storefront-primary-color, #170e5e) 58%, var(--storefront-primary-hover, #120b4c) 100%)',
        color: '#ffffff',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Subtle Architectural Lighting Accents */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-8%',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(99, 102, 241, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '10%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.16) 0%, rgba(217, 119, 6, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="storefront-hero-editorial-grid"
        style={{
          maxWidth: 'var(--storefront-container, 1440px)',
          margin: '0 auto',
          padding: '28px 24px 32px',
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: '32px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Right Column (RTL Primary): Editorial Narrative & Quick Collection Triggers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Unboxed Editorial Eyebrow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#fbbf24',
              letterSpacing: '0.2px',
            }}
          >
            <span>إصدارات الموسم المختارة</span>
            <span style={{ opacity: 0.45 }}>·</span>
            <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
              ضمان الجودة الأصلية 100%
            </span>
          </div>

          <h1
            className="storefront-hero-headline"
            style={{
              margin: 0,
              fontSize: 'clamp(1.65rem, 3.2vw, 2.75rem)',
              fontWeight: 900,
              lineHeight: 1.2,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textWrap: 'balance',
            }}
          >
            {info.bio || 'ارتقِ بأسلوب حياتك مع تشكيلة النخبة من الأزياء والإلكترونيات والعطور الفاخرة'}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)',
              color: '#cbd5e1',
              lineHeight: 1.65,
              maxWidth: '58ch',
            }}
          >
            تجربة تسوق مصممة بعناية لتجمع لك أرقى الخامات وأحدث الإصدارات بأسعار تنافسية، مع شحن سريع ومعاينة فورية عند الاستلام.
          </p>

          {/* Primary & Secondary Hero CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onSelectDeals}
              className="storefront-gpu-btn"
              style={{
                background: '#f59e0b',
                color: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                boxShadow: '0 10px 24px -4px rgba(245, 158, 11, 0.4)',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
              }}
            >
              <span>استكشف العروض الحصرية</span>
              <span style={{ fontSize: '16px', lineHeight: 1 }}>←</span>
            </button>

            <button
              type="button"
              onClick={onOpenCategoriesModal}
              className="storefront-gpu-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.09)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(8px)',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
              }}
            >
              <span>تصفح جميع الأقسام ({categories.length})</span>
            </button>
          </div>

          {/* Quick Category Links (Unboxed / Tactile Navigation) */}
          {categories.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                paddingTop: '10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, marginLeft: '4px' }}>
                وصول سريع:
              </span>
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s ease',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Left Column (RTL Secondary): Interactive Focal Product Stage */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              color: '#0f172a',
              borderRadius: '20px',
              padding: '18px',
              boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              gap: '16px',
              alignItems: 'center',
              position: 'relative',
            }}
            className="storefront-hero-spotlight-card"
          >
            {/* Studio Product Frame */}
            <div
              onClick={() => onQuickView(activeProduct)}
              style={{
                width: '150px',
                height: '150px',
                aspectRatio: '1 / 1',
                borderRadius: '14px',
                background: '#ffffff',
                border: 'none',
                padding: '12px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isOutOfStock ? (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: '10.5px',
                    fontWeight: 900,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    zIndex: 2,
                  }}
                >
                  نفدت الكمية
                </span>
              ) : discountPercent > 0 ? (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#e11d48',
                    color: '#ffffff',
                    fontSize: '10.5px',
                    fontWeight: 900,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    fontVariantNumeric: 'tabular-nums',
                    zIndex: 2,
                  }}
                >
                  خصم {discountPercent}%
                </span>
              ) : null}
              <img
                src={displayPhotoUrl}
                alt={activeProduct.name}
                onError={(e) => {
                  e.currentTarget.src = generatePremiumProductSvg(activeProduct.name, activeProduct.categoryName);
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>

            {/* Focal Product Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{activeProduct.categoryName || 'مختارات النخبة'}</span>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#d97706', fontVariantNumeric: 'tabular-nums' }}>
                  <IconStar size={12} fill="#f59e0b" color="#f59e0b" />
                  <strong style={{ color: '#0f172a' }}>{Number(activeProduct.rating || 4.9).toFixed(1)}</strong>
                </span>
              </div>

              <h2
                onClick={() => onQuickView(activeProduct)}
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#0f172a',
                  lineHeight: 1.35,
                  cursor: 'pointer',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {activeProduct.name}
              </h2>

              {/* Price & Savings with Tabular Numerals */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                  flexWrap: 'wrap',
                  fontVariantNumeric: 'tabular-nums',
                  marginTop: '2px',
                }}
              >
                <span style={{ fontSize: '21px', fontWeight: 900, color: 'var(--storefront-primary-color, #170e5e)' }}>
                  {activeProduct.price.toLocaleString('en-US')} <CurrencySymbol />
                </span>
                {oldPrice > activeProduct.price && (
                  <span style={{ fontSize: '12.5px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                    {oldPrice.toLocaleString('en-US')} <CurrencySymbol />
                  </span>
                )}
                {savings > 0 && (
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#15803d' }}>
                    وفر {savings.toLocaleString('en-US')} <CurrencySymbol />
                  </span>
                )}
              </div>

              {/* Action Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                {isOutOfStock ? (
                  <button
                    type="button"
                    disabled
                    style={{
                      flex: 1,
                      height: '38px',
                      background: '#e2e8f0',
                      color: '#64748b',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0 14px',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'not-allowed',
                    }}
                  >
                    غير متوفر
                  </button>
                ) : cartQty > 0 ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--storefront-primary-color, #170e5e)',
                      color: '#ffffff',
                      borderRadius: '10px',
                      padding: '3px',
                      minWidth: '124px',
                      height: '38px',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(activeProduct.id, cartQty + 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '7px',
                        border: 'none',
                        background: 'rgba(255,255,255,0.2)',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      +
                    </button>
                    <span style={{ fontSize: '13.5px', fontWeight: 900, padding: '0 8px' }}>{cartQty}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(activeProduct.id, cartQty - 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '7px',
                        border: 'none',
                        background: 'rgba(255,255,255,0.2)',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      -
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleInstantAdd(activeProduct)}
                    className="storefront-gpu-btn"
                    style={{
                      flex: 1,
                      height: '38px',
                      background: justAddedId === activeProduct.id ? '#16a34a' : 'var(--storefront-primary-color, #170e5e)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0 14px',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
                    }}
                  >
                    {justAddedId === activeProduct.id ? (
                      <>
                        <IconCheckCircle size={15} color="#ffffff" />
                        <span>تمت الإضافة للسلة</span>
                      </>
                    ) : (
                      <>
                        <IconShoppingCart size={15} />
                        <span>أضف للسلة فوراً</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onQuickView(activeProduct)}
                  style={{
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  التفاصيل
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Spotlight Selector Strip */}
          {spotlightItems.length > 1 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${spotlightItems.length}, 1fr)`,
                gap: '8px',
              }}
            >
              {spotlightItems.map((item, idx) => {
                const isSelected = idx === activeIndex;
                const thumbPhoto = item.imageUrl || resolveProductPhoto(item.name, item.categoryName).url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                      border: isSelected ? '1.5px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'right',
                      minWidth: 0,
                      transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s ease',
                    }}
                  >
                    <img
                      src={thumbPhoto}
                      alt={item.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '7px',
                        background: '#ffffff',
                        objectFit: 'contain',
                        padding: '2px',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: isSelected ? '#fbbf24' : '#f8fafc',
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#cbd5e1', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {item.price} <CurrencySymbol />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
});
