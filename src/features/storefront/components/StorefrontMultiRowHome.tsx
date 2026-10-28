import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { StorefrontProduct, StorefrontCategory, StorefrontInfo } from '../types/storefront.types';
import { StorefrontShelfSection } from './StorefrontShelfSection';
import { StorefrontMidBannerCard } from './StorefrontMidBannerCard';
import { StorefrontInteractiveSpotlightBreak } from './StorefrontInteractiveSpotlightBreak';
import { StorefrontFeaturedBroadcastCard } from './StorefrontFeaturedBroadcastCard';
import { StorefrontBentoShowcase } from './StorefrontBentoShowcase';
import { StorefrontCustomerReviewsSection } from './StorefrontCustomerReviewsSection';
import { IconFolder } from './StorefrontIcons';

interface TopHomepageSection {
  categoryId: number;
  categoryName: string;
  products: StorefrontProduct[];
  totalCount: number;
}

interface StorefrontMultiRowHomeProps {
  dealsProducts: StorefrontProduct[];
  topHomepageSections: TopHomepageSection[];
  categories: StorefrontCategory[];
  categoryCounts?: Map<number | 'all', number>;
  cartMap: Map<number, number>;
  info: StorefrontInfo;
  favoriteIds: Set<number>;
  onAddToCart: (product: StorefrontProduct) => void;
  onUpdateQuantity: (productId: number, qty: number) => void;
  onOpenReviewModal: (product: StorefrontProduct) => void;
  onToggleFavorite: (productId: number) => void;
  onQuickView?: (product: StorefrontProduct) => void;
  onSelectDeals: () => void;
  onSelectCategory: (categoryId: number) => void;
  onOpenCategoriesModal: () => void;
}

export function StorefrontMultiRowHome({
  dealsProducts,
  topHomepageSections,
  categories,
  categoryCounts,
  cartMap,
  info,
  favoriteIds,
  onAddToCart,
  onUpdateQuantity,
  onOpenReviewModal,
  onToggleFavorite,
  onQuickView,
  onSelectDeals,
  onSelectCategory,
  onOpenCategoriesModal,
}: StorefrontMultiRowHomeProps) {
  const { t } = useTranslation();

  const resolvedCategoryCounts = useMemo(() => {
    if (categoryCounts) return categoryCounts;
    const map = new Map<number | 'all', number>();
    for (const sec of topHomepageSections) {
      map.set(sec.categoryId, sec.totalCount);
    }
    return map;
  }, [categoryCounts, topHomepageSections]);

  const allShowcaseProducts = useMemo(() => {
    if (dealsProducts.length > 0) return dealsProducts;
    return topHomepageSections.flatMap((s) => s.products);
  }, [dealsProducts, topHomepageSections]);

  const isMidBannersActive = info.midBannersEnabled !== false;
  const validMidBanners = isMidBannersActive && Array.isArray(info.midBanners)
    ? info.midBanners.filter((b) => b && b.imageUrl && b.isEnabled !== false)
    : [];

  const getBannersForSlot = (slot: string, fallbackIdx?: number) => {
    const matched = validMidBanners.filter((b) => b.slot === slot);
    if (matched.length > 0) return matched;
    if (fallbackIdx !== undefined && validMidBanners[fallbackIdx] && !validMidBanners[fallbackIdx].slot) {
      return [validMidBanners[fallbackIdx]];
    }
    return [];
  };

  const afterDealsBanners = getBannersForSlot('after_deals', 0);
  const bottomBanners = getBannersForSlot('bottom', validMidBanners.length > 3 ? 3 : undefined);

  return (
    <div className="storefront-homepage-sections">
      {/* Row 1: Deals Spotlight Shelf */}
      {dealsProducts.length > 0 && (
        <StorefrontShelfSection
          sectionId="storefront-deals-shelf"
          badge={t('storefront.storefront_multi_row_home.s0', 'عروض وتخفيضات حصرية')}
          subtitle={t('storefront.storefront_multi_row_home.s1', 'أقوى الخصومات المختارة بعناية لفترة محدودة')}
          viewAllLabel={`عرض كل العروض (${dealsProducts.length})`}
          products={dealsProducts.slice(0, 12)}
          cartMap={cartMap}
          whatsappPhone={info.whatsappPhone}
          favoriteIds={favoriteIds}
          isSmartDeal
          onAddToCart={onAddToCart}
          onUpdateQuantity={onUpdateQuantity}
          onOpenReviewModal={onOpenReviewModal}
          onToggleFavorite={onToggleFavorite}
          onQuickView={onQuickView}
          onViewAll={onSelectDeals}
        />
      )}

      {/* Visual Rhythm Break 1: Asymmetric Bento Grid Curation */}
      <StorefrontBentoShowcase
        categories={categories}
        categoryCounts={resolvedCategoryCounts}
        featuredProducts={allShowcaseProducts}
        onSelectCategory={(id) => {
          const shelfEl = document.getElementById(`storefront-category-shelf-${id}`);
          if (shelfEl) {
            shelfEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
          onSelectCategory(id);
          window.scrollTo({ top: 220, behavior: 'smooth' });
        }}
        onSelectDeals={onSelectDeals}
        onQuickView={onQuickView}
        onAddToCart={onAddToCart}
      />

      {/* Mid Banner Slot: After Deals */}
      {afterDealsBanners.map((banner) => (
        <StorefrontMidBannerCard
          key={banner.id}
          banner={banner}
          categories={categories}
          onSelectCategory={onSelectCategory}
          onSelectDeals={onSelectDeals}
        />
      ))}

      {/* Wide Horizontal Category Shelves with Editorial Breaks */}
      {topHomepageSections.map((section, idx) => {
        const slotKey = idx === 0 ? 'after_row_1' : idx === 1 ? 'after_row_2' : `after_row_${idx + 1}`;
        const slotFallbackIdx = idx === 0 ? 1 : idx === 1 ? 2 : undefined;
        const bannersAfterThis = getBannersForSlot(slotKey, slotFallbackIdx);

        return (
          <React.Fragment key={section.categoryId}>
            <StorefrontShelfSection
              sectionId={`storefront-category-shelf-${section.categoryId}`}
              badge={section.categoryName}
              subtitle={t('storefront.multi_row.category_subtitle', 'تشكيلة مختارة من أرقى منتجات {{category}}', { category: section.categoryName })}
              viewAllLabel={`عرض كل أصناف القسم (${section.totalCount})`}
              products={section.products.slice(0, 12)}
              cartMap={cartMap}
              whatsappPhone={info.whatsappPhone}
              favoriteIds={favoriteIds}
              onAddToCart={onAddToCart}
              onUpdateQuantity={onUpdateQuantity}
              onOpenReviewModal={onOpenReviewModal}
              onToggleFavorite={onToggleFavorite}
              onQuickView={onQuickView}
              onViewAll={() => {
                onSelectCategory(section.categoryId);
                window.scrollTo({ top: 180, behavior: 'smooth' });
              }}
            />

            {bannersAfterThis.map((banner) => (
              <StorefrontMidBannerCard
                key={banner.id}
                banner={banner}
                categories={categories}
                onSelectCategory={onSelectCategory}
                onSelectDeals={onSelectDeals}
              />
            ))}

            {/* Visual Rhythm Break 2: Interactive Deal of the Day */}
            {idx === 0 && (
              <StorefrontInteractiveSpotlightBreak
                product={dealsProducts.length > 0 ? dealsProducts[0] : (topHomepageSections[1]?.products[0] || section.products[0])}
                dealProducts={dealsProducts.length > 0 ? dealsProducts.slice(0, 4) : section.products.slice(0, 4)}
                cartQuantity={cartMap.get(dealsProducts.length > 0 ? dealsProducts[0]?.id : (topHomepageSections[1]?.products[0]?.id || section.products[0]?.id)) || 0}
                cartMap={cartMap}
                whatsappPhone={info.whatsappPhone}
                onAddToCart={onAddToCart}
                onUpdateQuantity={onUpdateQuantity}
                onQuickView={onQuickView}
              />
            )}

            {/* Visual Rhythm Break 3: Verified Customer Reviews & Social Proof */}
            {idx === 1 && (
              <StorefrontCustomerReviewsSection
                products={allShowcaseProducts}
                onQuickView={onQuickView}
                onOpenReviewModal={onOpenReviewModal}
              />
            )}

            {idx === 2 && bannersAfterThis.length === 0 && (
              <StorefrontFeaturedBroadcastCard
                whatsappPhone={info.whatsappPhone}
                onOpenCategories={onOpenCategoriesModal}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Show Customer Reviews if fewer than 2 category sections exist */}
      {topHomepageSections.length < 2 && (
        <StorefrontCustomerReviewsSection
          products={allShowcaseProducts}
          onQuickView={onQuickView}
          onOpenReviewModal={onOpenReviewModal}
        />
      )}

      {/* Show Broadcast Card if fewer than 3 category sections exist */}
      {topHomepageSections.length < 3 && (
        <StorefrontFeaturedBroadcastCard
          whatsappPhone={info.whatsappPhone}
          onOpenCategories={onOpenCategoriesModal}
        />
      )}

      {/* Mid Banner Slot: Bottom */}
      {bottomBanners.map((banner) => (
        <StorefrontMidBannerCard
          key={banner.id}
          banner={banner}
          categories={categories}
          onSelectCategory={onSelectCategory}
          onSelectDeals={onSelectDeals}
        />
      ))}

      {/* Bottom Invitation Banner to browse remaining categories */}
      <div
        className="storefront-explore-banner"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '32px 24px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
        }}
      >
        <h4
          style={{
            margin: '0 0 8px',
            fontSize: '17px',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.4,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            columnGap: '6px',
            rowGap: '2px',
          }}
        >
          <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {t('storefront.storefront_multi_row_home.s2', 'استكشف كافة أقسام المتجر')}
          </span>
          <span
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              color: 'var(--storefront-primary-color, #170e5e)',
              fontSize: '14px',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ({categories.length} {t('storefront.storefront_multi_row_home.s3', 'قسم متاح)')}
          </span>
        </h4>
        <p style={{ margin: '0 0 18px', fontSize: '13.5px', color: '#64748b', maxWidth: '540px', marginInline: 'auto' }}>
          {info?.bio || t('storefront.storefront_multi_row_home.s4', 'تصفح كافة الأقسام والمنتجات المتاحة واطلب ما تحتاجه بكل سهولة مع خدمة التوصيل المباشر')}
        </p>
        <button
          type="button"
          onClick={onOpenCategoriesModal}
          className="storefront-gpu-btn"
          style={{
            padding: '11px 26px',
            borderRadius: '12px',
            background: 'var(--storefront-primary-color, #170e5e)',
            color: 'var(--storefront-primary-contrast, #ffffff)',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px var(--storefront-primary-subtle, rgba(23, 14, 94, 0.2))',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          <IconFolder size={16} strokeWidth={2} />
          <span>{t('storefront.storefront_multi_row_home.s5', 'تصفح جميع الأقسام والمنتجات')}</span>
        </button>
      </div>
    </div>
  );
}
