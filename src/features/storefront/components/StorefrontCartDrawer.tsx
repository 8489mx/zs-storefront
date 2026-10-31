import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { getCurrencySymbol, isThreeDecimalCurrency } from '@/lib/currencies';
import { XIcon, Trash2Icon } from '@/shared/components/icons/AppIcons';
import { CartItem, StorefrontInfo } from '../types/storefront.types';
import { ProductIcon } from '@/shared/components/icons/product-svg-catalog';
import { StorefrontFreeShippingBar } from './StorefrontFreeShippingBar';
import { IconShoppingCart } from './StorefrontIcons';
import { calculateCartSubtotal, calculateCartLinePricing } from '../lib/storefront-cart-pricing';
import { resolveProductPhoto } from '../lib/storefront-photo-matcher';
import { useBodyScrollLock } from '@/shared/components/dialog-shell';

interface StorefrontCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  info?: StorefrontInfo;
  deliveryFee?: number;
  minOrder?: number;
  onUpdateQuantity: (productId: number, qty: number) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export function StorefrontCartDrawer({
  isOpen,
  onClose,
  cartItems,
  info,
  deliveryFee: deliveryFeeProp,
  minOrder: minOrderProp,
  onUpdateQuantity,
  onClearCart,
  onProceedToCheckout,
}: StorefrontCartDrawerProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isOpen, onClose]);

  const storeCurrency = info?.currency || 'EGP';
  const isThreeDec = isThreeDecimalCurrency(storeCurrency);
  const activeCurrencySymbol = storeCurrency === 'EGP' ? 'جنيه' : getCurrencySymbol(storeCurrency);

  const formatPriceNumber = (val: number | string | undefined | null): string => {
    const num = Number(val || 0);
    if (isThreeDec) {
      return num.toFixed(3);
    }
    if (storeCurrency === 'EGP') {
      return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
    }
    return num.toFixed(2);
  };

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const cartTotals = calculateCartSubtotal(cartItems, storeCurrency);
  const subtotal = cartTotals.subtotal;
  const originalSubtotal = cartTotals.originalSubtotal;
  const totalSavings = cartTotals.totalSavings;
  const freeShippingThreshold = info?.freeShippingMinOrder || 500;
  const isFreeShippingQualified = Boolean(info?.freeShippingEnabled && subtotal >= freeShippingThreshold);
  const baseDeliveryFee = deliveryFeeProp ?? info?.deliveryFee ?? 0;
  const deliveryFee = isFreeShippingQualified ? 0 : baseDeliveryFee;
  const minOrder = minOrderProp ?? info?.minOrder ?? 0;
  const total = subtotal + deliveryFee;
  const isMinOrderMet = minOrder <= 0 || subtotal >= minOrder;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-start',
        background: 'rgba(15, 23, 42, 0.38)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'sfAppleBackdropIn 0.16s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      }}
      onClick={onClose}
    >
      <div
        dir="rtl"
        style={{
          width: '100%',
          maxWidth: '410px',
          height: '100%',
          background: '#ffffff',
          boxShadow: '-20px 0 50px rgba(15, 23, 42, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          cursor: 'default',
          willChange: 'transform, opacity',
          animation: 'sfAppleSlideInRight 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimalist Centered Top Bar */}
        <div
          style={{
            padding: '12px 16px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            title={t('common.close', 'إغلاق')}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0f172a',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.16s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
          >
            <XIcon size={15} />
          </button>

          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a', letterSpacing: '0px' }}>
            {t('storefront.storefront_cart_drawer.s0', 'سلة المشتريات')}
          </h2>

          {cartItems.length > 0 ? (
            <button
              type="button"
              onClick={onClearCart}
              title={t('storefront.storefront_cart_drawer.s15', 'مسح الكل')}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.background = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.background = '#f8fafc';
              }}
            >
              <Trash2Icon size={14} />
            </button>
          ) : (
            <div style={{ width: '32px', height: '32px' }} />
          )}
        </div>

        {/* Free Shipping Progress Bar */}
        {info?.freeShippingEnabled && (
          <div style={{ padding: '6px 16px 4px', letterSpacing: '0px' }}>
            <StorefrontFreeShippingBar
              subtotal={subtotal}
              freeShippingEnabled={info.freeShippingEnabled}
              freeShippingMinOrder={info.freeShippingMinOrder}
              currency={info.currency}
              compact
            />
          </div>
        )}

        {/* Drawer Body: Un-boxed Minimalist Items List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 16px',
            display: 'flex',
            flexDirection: 'column',
            letterSpacing: '0px',
          }}
        >
          {cartItems.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#94a3b8',
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '18px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#94a3b8',
                }}
              >
                <IconShoppingCart size={32} strokeWidth={1.5} />
              </div>
              <p style={{ margin: 0, fontSize: '15.5px', fontWeight: 600, color: '#0f172a' }}>
                {t('storefront.storefront_cart_drawer.s2', 'سلة التسوق فارغة')}
              </p>
              <p style={{ margin: '6px 0 20px', fontSize: '13px', color: '#64748b', maxWidth: '240px', fontWeight: 400 }}>
                {t('storefront.storefront_cart_drawer.s3', 'تصفح المنتجات وأضف ما ترغب لطلبك الآن')}
              </p>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  background: 'var(--storefront-primary-color, #588cb3)',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(88, 140, 179, 0.25)',
                }}
              >
                {t('storefront.storefront_cart_drawer.browse_products', 'تصفح المنتجات')}
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const photo = item.product.imageUrl || resolveProductPhoto(item.product.name, item.product.categoryName)?.url;
              const linePricing = calculateCartLinePricing(item.product, item.quantity, storeCurrency);

              return (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 2px',
                    borderBottom: '1px solid #f1f5f9',
                    position: 'relative',
                    letterSpacing: '0px',
                  }}
                >
                  {/* Product Image */}
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '11px',
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                      padding: '3px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt={item.product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <ProductIcon name={item.product.icon || 'box-package'} size={22} color="#0f172a" />
                    )}
                  </div>

                  {/* Middle Details: 2-line title on top, Price + Stepper on bottom row */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#0f172a',
                        lineHeight: 1.28,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        letterSpacing: '0px',
                      }}
                      title={item.product.name}
                    >
                      {item.product.name}
                    </h4>

                    {/* Bottom Row: Price on Right + Compact Stepper on Left */}
                    <div
                      style={{
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'nowrap', whiteSpace: 'nowrap', letterSpacing: '0px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', letterSpacing: '0px' }}>
                          {formatPriceNumber(linePricing.lineTotal)} {activeCurrencySymbol}
                        </span>
                        {linePricing.savings > 0 && (
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '10.5px', fontWeight: 400, letterSpacing: '0px' }}>
                            {formatPriceNumber(linePricing.originalLineTotal)} {activeCurrencySymbol}
                          </span>
                        )}
                        {linePricing.isBogoApplied && (
                          <span
                            style={{
                              fontSize: '9.5px',
                              background: '#dcfce7',
                              color: '#166534',
                              padding: '1px 5px',
                              borderRadius: '5px',
                              fontWeight: 600,
                              letterSpacing: '0px',
                            }}
                          >
                            {linePricing.offerBadge}
                          </span>
                        )}
                      </div>

                      {/* Circular Quantity Stepper Controls (Left in RTL) */}
                      {/* CRITICAL: Follow RULE[AGENTS_md] Section 2 for RTL: [+] on Right, Quantity in Center, [-] on Left */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          flexShrink: 0,
                        }}
                      >
                        {/* [+] Filled Dark Squircle on RIGHT in RTL */}
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          title={t('storefront.storefront_cart_drawer.s4', 'زيادة الكمية')}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '7px',
                            border: 'none',
                            background: '#0f172a',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 600,
                            padding: 0,
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
                          }}
                        >
                          +
                        </button>

                        {/* Quantity in CENTER */}
                        <span
                          style={{
                            minWidth: '15px',
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#0f172a',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {item.quantity}
                        </span>

                        {/* [-] Outlined Squircle on LEFT in RTL */}
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          title={t('storefront.storefront_cart_drawer.s5', 'تقليل الكمية')}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '7px',
                            border: item.quantity === 1 ? '1px solid #fecaca' : '1px solid #cbd5e1',
                            background: item.quantity === 1 ? '#fef2f2' : '#ffffff',
                            color: item.quantity === 1 ? '#ef4444' : '#0f172a',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 600,
                            padding: 0,
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                          }}
                        >
                          {item.quantity === 1 ? <Trash2Icon size={11.5} /> : '−'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ultra-Compact Luxury Footer Breakdown & CTA */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '8px 16px 12px',
              borderTop: '1px solid #f1f5f9',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
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
                  {t('storefront.storefront_cart_drawer.subtotal_label', 'قيمة الأصناف')}
                </span>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '12px' }}>
                  {formatPriceNumber(totalSavings > 0 ? originalSubtotal : subtotal)} {activeCurrencySymbol}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', lineHeight: 1.25 }}>
                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '11.5px' }}>
                  {t('storefront.storefront_cart_drawer.delivery_fee_label', 'مصاريف التوصيل')}
                </span>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {deliveryFee === 0 && (deliveryFeeProp ?? info?.deliveryFee ?? 0) > 0 && (
                    <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '10.5px', fontWeight: 400 }}>
                      {formatPriceNumber(deliveryFeeProp ?? info?.deliveryFee ?? 0)} {activeCurrencySymbol}
                    </span>
                  )}
                  <span style={{ fontWeight: 600, color: deliveryFee > 0 ? '#0f172a' : '#16a34a', fontSize: '11.5px' }}>
                    {deliveryFee > 0 ? `${formatPriceNumber(deliveryFee)} ${activeCurrencySymbol}` : 'مجاني'}
                  </span>
                </div>
              </div>

              {totalSavings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', lineHeight: 1.25 }}>
                  <span style={{ color: '#64748b', fontWeight: 500, fontSize: '11.5px' }}>
                    {t('storefront.storefront_cart_drawer.discount_label', 'الخصم')}
                  </span>
                  <span style={{ fontWeight: 600, color: '#dc2626', fontSize: '11.5px' }}>
                    - {formatPriceNumber(totalSavings)} {activeCurrencySymbol}
                  </span>
                </div>
              )}

              <div style={{ height: '1px', background: '#e2e8f0', margin: '2px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', lineHeight: 1.2 }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {t('storefront.storefront_cart_drawer.s12', 'المبلغ الإجمالي')}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--storefront-primary-color, #2d68c4)' }}>
                  {formatPriceNumber(total)} {activeCurrencySymbol}
                </span>
              </div>
            </div>

            {!isMinOrderMet && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  color: '#991b1b',
                  textAlign: 'center',
                  fontWeight: 500,
                  letterSpacing: '0px',
                }}
              >
                {t('storefront.storefront_cart_drawer.s6', 'الحد الأدنى للطلب هو')} {minOrder} {activeCurrencySymbol} (
                {t('storefront.storefront_cart_drawer.s7', 'متبقي')} {formatPriceNumber(minOrder - subtotal)} {activeCurrencySymbol})
              </div>
            )}

            {/* Primary Checkout CTA Button with standard site border-radius (10px) */}
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
                fontSize: '13.5px',
                fontWeight: 700,
                letterSpacing: '0px',
                border: 'none',
                cursor: isMinOrderMet ? 'pointer' : 'not-allowed',
                boxShadow: isMinOrderMet ? '0 3px 10px rgba(45, 104, 196, 0.22)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>{t('storefront.storefront_cart_drawer.checkout_now', 'إتمام الطلب')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


