import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CartItem, StorefrontInfo, StorefrontProduct } from '../types/storefront.types';
import { StorefrontLiveCartItem } from './StorefrontLiveCartItem';
import { Trash2Icon, XIcon, AlertTriangleIcon, ShoppingBagIcon } from '@/shared/components/icons/AppIcons';
import { calculateCartSubtotal } from '../lib/storefront-cart-pricing';
import { isThreeDecimalCurrency, getCurrencySymbol } from '@/lib/currencies';
import { useBodyScrollLock } from '@/shared/components/dialog-shell';

const LIVE_CART_STATIC_CSS = `
  @keyframes liveCartSlideInRight {
    from { opacity: 0; transform: translate3d(32px, 0, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .live-cart-scroll::-webkit-scrollbar { width: 4px; }
  .live-cart-scroll::-webkit-scrollbar-track { background: transparent; }
  .live-cart-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
  @media (max-width: 640px) {
    .storefront-live-cart-fullsheet { width: 100% !important; max-width: 100% !important; }
  }
`;

interface StorefrontLiveCartDockProps {
  cartItems: CartItem[];
  info?: StorefrontInfo;
  deliveryFee?: number;
  minOrder?: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onUpdateQuantity: (productId: number, qty: number) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  suggestedProducts?: StorefrontProduct[];
  onAddToCart?: (product: StorefrontProduct) => void;
}

export const StorefrontLiveCartDock = React.memo(function StorefrontLiveCartDock({
  cartItems,
  info,
  deliveryFee: deliveryFeeProp,
  minOrder: minOrderProp,
  isOpen,
  onClose,
  onUpdateQuantity,
  onClearCart,
  onProceedToCheckout,
}: StorefrontLiveCartDockProps) {
  const { t } = useTranslation();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const clearConfirmRef = useRef<HTMLDivElement>(null);

  // Close clear confirmation on click outside
  useEffect(() => {
    if (!showClearConfirm) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (clearConfirmRef.current && !clearConfirmRef.current.contains(e.target as Node)) {
        setShowClearConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showClearConfirm]);

  // Close live cart drawer (or clear confirmation first) on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (showClearConfirm) {
          setShowClearConfirm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isOpen, showClearConfirm, onClose]);

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const storeCurrency = info?.currency || 'EGP';
  const isThreeDec = isThreeDecimalCurrency(storeCurrency);
  const activeCurrencySymbol = storeCurrency === 'EGP' ? 'جنيه' : getCurrencySymbol(storeCurrency);

  const formatPriceNumber = (val: number | string | undefined | null): string => {
    const num = Number(val || 0);
    if (isThreeDec) return num.toFixed(3);
    if (storeCurrency === 'EGP') return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
    return num.toFixed(2);
  };

  const cartTotals = calculateCartSubtotal(cartItems, storeCurrency);
  const subtotal = cartTotals.subtotal;
  const originalSubtotal = cartTotals.originalSubtotal;
  const totalSavings = cartTotals.totalSavings;

  const freeShippingThreshold = info?.freeShippingMinOrder || 500;
  const isFreeShippingQualified = Boolean(info?.freeShippingEnabled && subtotal >= freeShippingThreshold);

  const baseDeliveryFee = deliveryFeeProp ?? info?.deliveryFee ?? 0;
  const effectiveDeliveryFee = isFreeShippingQualified ? 0 : baseDeliveryFee;
  const minOrder = minOrderProp ?? info?.minOrder ?? 0;
  const total = subtotal + effectiveDeliveryFee;
  const isMinOrderMet = minOrder <= 0 || subtotal >= minOrder;

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.38)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        animation: 'sfAppleBackdropIn 0.16s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        fontFamily: 'inherit',
      }}
      onClick={onClose}
    >
      <style>{LIVE_CART_STATIC_CSS}</style>

      <div
        className="storefront-live-cart-fullsheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '410px',
          height: '100%',
          background: '#ffffff',
          boxShadow: '-20px 0 50px rgba(15, 23, 42, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          animation: 'liveCartSlideInRight 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          overflow: 'hidden',
        }}
      >
        {/* Minimalist Centered Top Bar (Soft Squircle Back/Close Button, Centered Title, Squircle Clear Button) */}
        <div
          style={{
            padding: '12px 16px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            position: 'relative',
          }}
        >
          {/* Right Soft Squircle Button: Close / Back */}
          <button
            type="button"
            onClick={onClose}
            title={t('storefront.storefront_live_cart_dock.s3', 'تصغير ومتابعة التسوق')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'background-color 0.15s ease, transform 0.12s ease',
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
          >
            <XIcon size={15} />
          </button>

          {/* Centered Title */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 700, letterSpacing: '0px' }}>
              {t('storefront.storefront_live_cart_dock.s0', 'سلة المشتريات')}
            </h3>
          </div>

          {/* Left Circular Button: Clear Cart (hidden when empty, placeholder keeps title centered) */}
          {cartItems.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowClearConfirm((prev) => !prev)}
              title={t('storefront.storefront_live_cart_dock.s1', 'تفريغ السلة بالكامل')}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: showClearConfirm ? '#fef2f2' : '#f8fafc',
                border: showClearConfirm ? '1px solid #fecaca' : '1px solid #f1f5f9',
                color: showClearConfirm ? '#ef4444' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.background = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                if (!showClearConfirm) {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
            >
              <Trash2Icon size={14} />
            </button>
          ) : (
            <div style={{ width: '32px', height: '32px' }} />
          )}

          {/* Confirmation Popover for Clear Cart */}
          {showClearConfirm && cartItems.length > 0 && (
            <div
              ref={clearConfirmRef}
              dir="rtl"
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: '16px',
                zIndex: 100,
                width: '230px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 14px 32px rgba(15, 23, 42, 0.14)',
                padding: '14px',
                animation: 'fadeIn 0.15s ease-out',
                letterSpacing: '0px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                {t('storefront.storefront_live_cart_dock.s5', 'تفريغ السلة بالكامل؟')}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '12px', lineHeight: 1.4 }}>
                {t('storefront.storefront_live_cart_dock.s6', 'هل تريد إزالة كافة المنتجات (')}{cartItems.length}{t('storefront.storefront_live_cart_dock.s7', ') من سلتك؟')}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClearCart();
                    setShowClearConfirm(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '8px',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t('storefront.storefront_live_cart_dock.s8', 'تأكيد')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '8px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t('storefront.storefront_live_cart_dock.s9', 'إلغاء')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Un-boxed Scrollable Items List or Empty Cart State */}
        <div
          className="live-cart-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 16px',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
          }}
        >
          {cartItems.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '32px 16px',
                color: '#64748b',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  color: '#94a3b8',
                }}
              >
                <ShoppingBagIcon size={24} />
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                سلة المشتريات فارغة
              </div>
              <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748b', lineHeight: 1.45, maxWidth: '240px' }}>
                لم تقم بإضافة أي منتجات للسلة بعد، تصفح المتجر وأضف منتجاتك المفضلة.
              </p>
              <button
                type="button"
                onClick={onClose}
                style={{
                  height: '36px',
                  padding: '0 18px',
                  borderRadius: '10px',
                  background: 'var(--storefront-primary-color, #2d68c4)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 3px 10px rgba(45, 104, 196, 0.2)',
                }}
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <StorefrontLiveCartItem
                key={item.product.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))
          )}
        </div>

        {/* Ultra-Compact Summary Footer & Checkout Button (only when cart has items) */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '8px 16px 12px',
              background: '#ffffff',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
              flexShrink: 0,
              letterSpacing: '0px',
            }}
          >
            {/* Compact Price Calculations Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', lineHeight: 1.25 }}>
                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '11.5px' }}>
                  {t('storefront.storefront_live_cart_dock.subtotal_label', 'قيمة الأصناف')}
                </span>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '12px' }}>
                  {formatPriceNumber(totalSavings > 0 ? originalSubtotal : subtotal)} {activeCurrencySymbol}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', lineHeight: 1.25 }}>
                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '11.5px' }}>
                  {t('storefront.storefront_live_cart_dock.s16', 'مصاريف التوصيل')}
                </span>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {effectiveDeliveryFee === 0 && baseDeliveryFee > 0 && (
                    <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '10.5px', fontWeight: 400 }}>
                      {formatPriceNumber(baseDeliveryFee)} {activeCurrencySymbol}
                    </span>
                  )}
                  <span style={{ fontWeight: 600, color: effectiveDeliveryFee > 0 ? '#0f172a' : '#16a34a', fontSize: '11.5px' }}>
                    {effectiveDeliveryFee > 0
                      ? `${formatPriceNumber(effectiveDeliveryFee)} ${activeCurrencySymbol}`
                      : t('storefront.storefront_live_cart_dock.s17', 'مجاني')}
                  </span>
                </div>
              </div>

              {totalSavings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', lineHeight: 1.25 }}>
                  <span style={{ color: '#64748b', fontWeight: 500, fontSize: '11.5px' }}>
                    {t('storefront.storefront_live_cart_dock.discount_label', 'الخصم')}
                  </span>
                  <span style={{ fontWeight: 600, color: '#dc2626', fontSize: '11.5px' }}>
                    - {formatPriceNumber(totalSavings)} {activeCurrencySymbol}
                  </span>
                </div>
              )}

              <div style={{ height: '1px', background: '#e2e8f0', margin: '2px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', lineHeight: 1.2 }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {t('storefront.storefront_live_cart_dock.s18', 'المبلغ الإجمالي')}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--storefront-primary-color, #2d68c4)' }}>
                  {formatPriceNumber(total)} {activeCurrencySymbol}
                </span>
              </div>
            </div>

            {!isMinOrderMet && (
              <div
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  color: '#c2410c',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  letterSpacing: '0px',
                }}
              >
                <AlertTriangleIcon size={12} color="#c2410c" />
                <span>
                  {t('storefront.storefront_live_cart_dock.s19', 'الحد الأدنى للطلب هو')} {minOrder} {activeCurrencySymbol} (
                  {t('storefront.storefront_live_cart_dock.s20', 'متبقي')} {formatPriceNumber(minOrder - subtotal)} {activeCurrencySymbol})
                </span>
              </div>
            )}

            {/* Primary Checkout Button with standard site border-radius (10px) */}
            <button
              type="button"
              onClick={onProceedToCheckout}
              disabled={!isMinOrderMet}
              style={{
                width: '100%',
                height: '38px',
                borderRadius: '10px',
                background: isMinOrderMet ? 'var(--storefront-primary-color, #2d68c4)' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: 700,
                letterSpacing: '0px',
                cursor: isMinOrderMet ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isMinOrderMet ? '0 3px 10px rgba(45, 104, 196, 0.22)' : 'none',
                transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.18s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (isMinOrderMet) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (isMinOrderMet) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>{t('storefront.storefront_live_cart_dock.s21', 'إتمام الطلب')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});


