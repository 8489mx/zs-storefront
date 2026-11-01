import type {
  StorefrontCategory,
  StorefrontInfo,
  StorefrontProduct,
} from '../types/storefront.types';

export type StorefrontLang = 'ar' | 'en';

export const STOREFRONT_LANG_STORAGE_KEY = 'zs_storefront_lang';

export function getSavedStorefrontLang(): StorefrontLang {
  if (typeof window === 'undefined') return 'ar';
  try {
    const saved = window.localStorage.getItem(STOREFRONT_LANG_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

/**
 * Category translations (by ID and by Arabic name)
 */
export const CATEGORY_EN_BY_ID: Record<number, string> = {
  1: 'Smartphones & Audio',
  2: 'Laptops & Tablets',
  3: 'Luxury & Smart Watches',
  4: 'Sneakers & Casual Shoes',
  5: 'Perfumes & Beauty',
  6: "Men's Fashion",
  7: "Women's Fashion",
  8: 'Bags & Sunglasses',
};

export const CATEGORY_EN_BY_AR: Record<string, string> = {
  'الهواتف والصوتيات الذكية': 'Smartphones & Audio',
  'اللابتوب والتابلت': 'Laptops & Tablets',
  'الساعات الفاخرة والذكية': 'Luxury & Smart Watches',
  'الأحذية الرياضية والكاجوال': 'Sneakers & Casual Shoes',
  'العطور ومستحضرات التجميل': 'Perfumes & Beauty',
  'الأزياء والملابس الرجالية': "Men's Fashion",
  'الأزياء والملابس النسائية': "Women's Fashion",
  'الحقائب والنظارات الشمسية': 'Bags & Sunglasses',
  'الهواتف': 'Phones',
  'اللابتوب': 'Laptops',
  'الساعات': 'Watches',
  'الأحذية': 'Shoes',
  'العطور': 'Perfumes',
  'رجالي': 'Men',
  'نسائي': 'Women',
  'الحقائب': 'Bags',
  'عام': 'General',
  'قسم عام': 'General Category',
  'منتج أصلي': 'Authentic Product',
  'منتجات مميزة': 'Featured Products',
  'عروض حصرية': 'Exclusive Deals',
};

export const SHORT_CATEGORY_EN_BY_AR: Record<string, string> = {
  'الهواتف والصوتيات الذكية': 'Phones',
  'اللابتوب والتابلت': 'Laptops',
  'الساعات الفاخرة والذكية': 'Watches',
  'الأحذية الرياضية والكاجوال': 'Shoes',
  'العطور ومستحضرات التجميل': 'Perfumes',
  'الأزياء والملابس الرجالية': 'Men',
  'الأزياء والملابس النسائية': 'Women',
  'الحقائب والنظارات الشمسية': 'Bags',
  'الهواتف': 'Phones',
  'اللابتوب': 'Laptops',
  'الساعات': 'Watches',
  'الأحذية': 'Shoes',
  'العطور': 'Perfumes',
  'رجالي': 'Men',
  'نسائي': 'Women',
  'الحقائب': 'Bags',
};

/**
 * Offer badge translations
 */
export const OFFER_BADGE_EN_BY_AR: Record<string, string> = {
  'الأكثر مبيعاً': 'Best Seller',
  'الأكثر طلباً': 'Most Popular',
  'خصم حصري': 'Exclusive Deal',
  'عرض اليوم': "Today's Deal",
  'عرض خاص': 'Special Offer',
  'عرض الحزمة': 'Bundle Deal',
  'إصدار محدود': 'Limited Edition',
  'إصدار خاص': 'Special Edition',
  'إصدار احترافي': 'Pro Edition',
  'كاميرا خارقة': 'Ultra Camera',
  'قيمة مقابل سعر': 'Best Value',
  'للألعاب والمونتاج': 'Gaming & Creator',
  'جديد': 'New Arrival',
  'خيار اقتصادي': 'Budget Pick',
  'الأقوى للأعمال': 'Top Business Pick',
  'ساعة ذكية متكاملة': 'All-in-One Smartwatch',
  'تصميم سويسري': 'Swiss Design',
  'بطارية 14 يوم': '14-Day Battery',
  'مقاومة للصدمات': 'Shock Resistant',
  'أيقونة الموضة': 'Fashion Icon',
  'للجري اليومي': 'Daily Running',
  'كلاسيك عصري': 'Modern Classic',
  'ثبات 48 ساعة': '48h Long-Lasting',
  'عطر شرقي فاخر': 'Luxury Oriental',
  'الأكثر مبيعاً نسائياً': "Women's Best Seller",
  'تفتيح ونضارة': 'Brightening & Glow',
  'عناية متكاملة': 'Complete Care',
  'ترطيب 72 ساعة': '72h Hydration',
  'الأكثر طلباً في الشتاء': 'Winter Best Seller',
  'قطن مصري 100%': '100% Egyptian Cotton',
  'إطلالة رسمية': 'Formal Look',
  'خامة تركية ممتازة': 'Premium Turkish Fabric',
  'تطريز يدوي فاخر': 'Handcrafted Embroidery',
  'تصميم إيطالي': 'Italian Design',
  'كشمير ناعم': 'Soft Cashmere',
  'أرباح مضاعفة': 'Top Value',
  'عدسات مستقطبة': 'Polarized Lenses',
  'إصدار كلاسيك': 'Classic Edition',
  'ضد السرقة والماء': 'Anti-Theft & Waterproof',
  'جلد طبيعي 100%': '100% Genuine Leather',
  'حماية 99%': '99% Protection',
  'شحن فائق السرعة': 'Super Fast Charging',
  'سفر وعمل': 'Travel & Work',
  'نفدت الكمية': 'Out of Stock',
  'تشكيلة جديدة': 'New Collection',
  'عرض لمدة محدودة': 'Limited Time Deal',
  'اختيار المتجر': "Store's Choice",
  'اختيار مميز': 'Featured Pick',
};

/**
 * Complete English catalog data for all 62 Demo Products
 */
export const PRODUCT_EN_BY_ID: Record<
  number,
  { name: string; description: string; offerBadge?: string }
> = {
  // 1. Smartphones & Audio
  101: {
    name: 'Apple iPhone 15 Pro Max - 256GB Natural Titanium',
    description:
      '6.7" Super Retina XDR ProMotion 120Hz display, A17 Pro chip, and 48MP pro camera system with 5x optical zoom.',
    offerBadge: 'Best Seller',
  },
  102: {
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    description:
      'Industry-leading active noise cancellation (ANC), Hi-Res 3D audio, 30-hour battery life, and ultra-fast charging.',
    offerBadge: 'Exclusive Deal',
  },
  103: {
    name: 'Samsung Galaxy S24 Ultra 5G - 512GB Titanium Black',
    description:
      'Built-in S-Pen, 200MP quad camera with Galaxy AI, and Snapdragon 8 Gen 3 flagship processor.',
    offerBadge: 'Ultra Camera',
  },
  104: {
    name: 'Apple AirPods Pro (2nd Gen) with USB-C MagSafe Case',
    description:
      '2x Active Noise Cancellation, Adaptive Transparency mode, Personalized Spatial Audio, and IP54 sweat/water resistance.',
    offerBadge: "Today's Deal",
  },
  105: {
    name: 'Anker 737 PowerCore 24000mAh 140W Fast Power Bank',
    description:
      'Ultra-fast PD 3.1 bidirectional charging for laptops and smartphones with smart digital display.',
  },
  106: {
    name: 'JBL Flip 6 Waterproof Portable Bluetooth Speaker',
    description:
      'Powerful stereo bass sound, IP67 waterproof and dustproof rating, and 12 hours of continuous playtime.',
  },
  107: {
    name: 'Xiaomi Redmi Note 13 Pro+ 5G - 512GB / 12GB RAM',
    description:
      'Curved 1.5K AMOLED display, 200MP OIS camera, and blazing-fast 120W HyperCharge included in the box.',
    offerBadge: 'Best Value',
  },
  108: {
    name: 'Anker 65W GaN II 3-Port Fast Wall Charger + Type-C Cable',
    description:
      'Charge your laptop, phone, and earbuds simultaneously in a compact GaN II pocket-friendly design.',
  },
  109: {
    name: 'Apple MagSafe Shockproof Clear Case for iPhone 15 Pro Max',
    description:
      'Military-grade drop protection with anti-yellowing crystal clear polycarbonate and strong MagSafe magnets.',
    offerBadge: '99% Protection',
  },
  110: {
    name: 'Anker MagGo 15W 3-in-1 Wireless Charging Stand',
    description:
      'Sleek magnetic charging dock for iPhone, Apple Watch, and AirPods simultaneously.',
    offerBadge: 'Super Fast Charging',
  },

  // 2. Laptops & Tablets
  201: {
    name: 'Apple MacBook Air 15" M3 - 16GB RAM / 512GB SSD',
    description:
      'Ultra-thin aluminum unibody design, Liquid Retina display, Apple M3 chip, and 18-hour battery life.',
    offerBadge: 'Most Popular',
  },
  202: {
    name: 'ASUS ROG Strix G16 Gaming Laptop - Core i7 / RTX 4060',
    description:
      '16" FHD+ 165Hz display, Intel Core i7-13650HX, NVIDIA RTX 4060 8GB GPU, and advanced ROG tri-fan cooling.',
    offerBadge: 'Gaming & Creator',
  },
  203: {
    name: 'Apple iPad Air 11" M2 Wi-Fi - 256GB Space Gray',
    description:
      'Liquid Retina display with True Tone, M2 chip for design and study, and Apple Pencil Pro support.',
    offerBadge: 'New Arrival',
  },
  204: {
    name: 'Logitech MX Master 3S Wireless Ergonomic Mouse',
    description:
      '8000 DPI optical sensor that tracks on glass, quiet clicks, and MagSpeed electromagnetic scrolling.',
  },
  205: {
    name: 'Keychron K2 Pro Wireless RGB Mechanical Keyboard',
    description:
      'Bluetooth 5.1 & USB-C connectivity, aluminum frame, hot-swappable mechanical switches for Mac & Windows.',
  },
  206: {
    name: 'SanDisk Extreme Portable SSD 1TB USB 3.2',
    description:
      'Read speeds up to 1050MB/s, IP65 water/dust resistance, and 3-meter drop protection.',
    offerBadge: 'Special Offer',
  },
  207: {
    name: 'Lenovo IdeaPad Slim 5 - Ryzen 7 / 16GB RAM / 512GB SSD',
    description:
      'Lightweight everyday work & study laptop with 15.6" IPS anti-glare screen and Dolby Audio.',
    offerBadge: 'Budget Pick',
  },
  208: {
    name: 'Dell XPS 15 OLED - Core i9 / 32GB RAM / 1TB SSD',
    description:
      '3.5K OLED touch display, CNC machined aluminum & carbon fiber chassis, and NVIDIA RTX 4070 graphics.',
    offerBadge: 'Top Business Pick',
  },

  // 3. Luxury & Smart Watches
  301: {
    name: 'Apple Watch Ultra 2 Titanium 49mm GPS + Cellular',
    description:
      'Aerospace-grade titanium case, 3000-nit sapphire display, dual-frequency GPS, and 100m water resistance.',
    offerBadge: 'Pro Edition',
  },
  302: {
    name: 'Classic Swiss Chronograph Men’s Watch - Gold & Black',
    description:
      'Japanese quartz chronograph movement, scratch-resistant sapphire crystal, 316L stainless steel strap, 5ATM water resistance.',
    offerBadge: 'Swiss Design',
  },
  303: {
    name: 'Huawei Watch GT 4 46mm Smartwatch - Brown Leather Strap',
    description:
      'Classic octagonal bezel, AMOLED display, TruSeen 5.5+ health tracking, and up to 14 days of battery life.',
    offerBadge: '14-Day Battery',
  },
  304: {
    name: 'Casio G-Shock GA-2100 CasiOak Carbon Core - Matte Black',
    description:
      'Iconic octagonal carbon-reinforced resin bezel, 200m water resistance, world time, and dual LED light.',
    offerBadge: 'Shock Resistant',
  },
  305: {
    name: 'Luxury Women’s Rose Gold Watch with Crystal Bezel',
    description:
      'Slim Milanese mesh strap in rose gold, mother-of-pearl dial, and sparkling zirconia crystal accents.',
  },
  306: {
    name: 'Automatic Skeleton Mechanical Men’s Watch - Genuine Leather',
    description:
      'Self-winding mechanical movement with open-heart dial and handcrafted Italian crocodile-embossed leather strap.',
    offerBadge: 'Limited Edition',
  },
  307: {
    name: 'Samsung Galaxy Watch 6 Classic 47mm with Rotating Bezel',
    description:
      'Iconic rotating stainless steel bezel, sapphire crystal glass, BIA body composition sensor, and ECG.',
    offerBadge: 'All-in-One Smartwatch',
  },
  308: {
    name: 'Tissot PRX Powermatic 80 Men’s Watch - Ice Blue Dial',
    description:
      'Integrated stainless steel bracelet, waffle-pattern dial, and 80-hour automatic power reserve.',
    offerBadge: 'Special Edition',
  },

  // 4. Sneakers & Casual Shoes
  401: {
    name: 'Nike Air Jordan 1 Retro High OG - Red, White & Black',
    description:
      'Premium full-grain leather upper, encapsulated Air-Sole cushioning, and high-traction rubber outsole.',
    offerBadge: 'Fashion Icon',
  },
  402: {
    name: 'Adidas Ultraboost Light Running Shoes - White & Blue',
    description:
      '30% lighter Light BOOST midsole for maximum energy return, Primeknit+ breathable upper, and Continental rubber grip.',
    offerBadge: 'Daily Running',
  },
  403: {
    name: 'New Balance 550 Casual Lifestyle Sneakers - White & Grey',
    description:
      'Retro 80s basketball silhouette crafted with perforated leather, suede overlays, and OrthoLite comfort insole.',
    offerBadge: 'Modern Classic',
  },
  404: {
    name: 'Puma RS-X Efekt Multi-Layer Chunky Sneakers',
    description:
      'Bold futuristic design with RS cushioning technology, breathable mesh upper, and suede overlays.',
  },
  405: {
    name: 'Skechers Arch Fit Slip-On Medical Comfort Walking Shoes',
    description:
      'Podiatrist-certified Arch Fit insole for superior foot support during long standing or walking hours.',
  },
  406: {
    name: 'Handcrafted Italian Genuine Suede Men’s Loafer - Brown',
    description:
      'Soft natural suede leather with hand-stitched detailing, memory foam leather footbed, and flexible non-slip sole.',
  },
  407: {
    name: 'Nike Air Max 270 React Men’s Sneakers - Black & White',
    description:
      '270-degree Max Air heel unit paired with Nike React foam for ultra-smooth all-day cushioning.',
  },
  408: {
    name: 'Converse Chuck Taylor All Star Lift Platform - White',
    description:
      'Durable canvas upper with elevated double-stacked rubber platform sole for a timeless street-style look.',
  },

  // 5. Perfumes & Beauty
  501: {
    name: 'Dior Sauvage Eau de Parfum - 100ml Original',
    description:
      'Calabrian bergamot, Sichuan pepper, and warm Papua New Guinean vanilla with smoky ambroxan.',
    offerBadge: '48h Long-Lasting',
  },
  502: {
    name: 'Bleu de Chanel Eau de Parfum - 100ml',
    description:
      'Aromatic-woody fragrance blending fresh citrus, New Caledonian sandalwood, cedar, and incense.',
  },
  503: {
    name: 'Royal Oud & Amber Oriental Niche Perfume - 100ml',
    description:
      'Rich Cambodian oud oil blended with saffron, Damask rose, and warm amber in a luxury crystal bottle.',
    offerBadge: 'Luxury Oriental',
  },
  504: {
    name: 'YSL Libre Eau de Parfum for Women - 90ml',
    description:
      'French lavender essence combined with Moroccan orange blossom, warm vanilla, and white musk.',
    offerBadge: "Women's Best Seller",
  },
  505: {
    name: 'Vitamin C 20% + Hyaluronic Acid & Vitamin E Glow Serum',
    description:
      'Brightens skin tone, reduces dark spots, and boosts natural collagen with a fast-absorbing non-greasy formula.',
    offerBadge: 'Brightening & Glow',
  },
  506: {
    name: 'Complete 4-Step Daily Skincare Routine Set',
    description:
      'Includes foaming cleanser, soothing rose toner, niacinamide 10% serum, and ceramide barrier cream.',
    offerBadge: 'Bundle Deal',
  },
  507: {
    name: 'pure Moroccan Argan Oil Hair Mask & Serum Set',
    description:
      'Repairs damaged and split ends, restores natural shine, and provides heat protection.',
  },
  508: {
    name: 'Coco Mademoiselle Chanel Eau de Parfum - 100ml',
    description:
      'Vibrant orange notes with jasmine, May rose, patchouli, and vetiver for timeless feminine elegance.',
    offerBadge: 'Complete Care',
  },
  509: {
    name: 'Hyaluronic Acid + Ceramide 72-Hour Deep Hydration Gel Cream',
    description:
      'Oil-free water-gel moisturizer that locks in hydration for 72 hours and strengthens the skin barrier.',
    offerBadge: '72h Hydration',
  },

  // 6. Men's Fashion
  601: {
    name: 'Water-Resistant Quilted Puffer Winter Jacket - Navy Blue',
    description:
      'Windproof & water-repellent outer shell with lightweight thermal insulation, removable hood, and zippered pockets.',
    offerBadge: 'Winter Best Seller',
  },
  602: {
    name: 'Premium Oxford 100% Egyptian Cotton Shirt - Sky Blue',
    description:
      'Tailored slim-fit cut crafted from breathable long-staple Egyptian cotton with easy-iron finish.',
    offerBadge: '100% Egyptian Cotton',
  },
  603: {
    name: 'Heavy Fleece Oversized Cotton Hoodie - Charcoal Black',
    description:
      '400 GSM brushed combed cotton fleece that resists pilling and shrinkage, with kangaroo pocket.',
  },
  604: {
    name: 'Piqué Cotton Polo Shirt with Embroidered Collar - White & Navy',
    description:
      'Breathable honeycomb piqué weave with contrast ribbed collar and cuffs for smart-casual wear.',
  },
  605: {
    name: 'Stretch Gabardine Chino Pants - Beige',
    description:
      '98% cotton + 2% Lycra stretch fabric for superior freedom of movement and all-day color fastness.',
  },
  606: {
    name: 'Italian Cut Slim-Fit Men’s Blazer - Charcoal Grey',
    description:
      'Wrinkle-resistant premium suiting fabric with satin lining, ideal for business meetings and events.',
    offerBadge: 'Formal Look',
  },
  607: {
    name: 'Men’s Biker Faux-Leather Jacket - Classic Black',
    description:
      'Soft matte leather finish with rust-proof metal zippers and quilted inner lining.',
    offerBadge: 'Premium Turkish Fabric',
  },

  // 7. Women's Fashion
  701: {
    name: 'Pleated Chiffon Evening Maxi Dress - Royal Burgundy',
    description:
      'Flowing pleated chiffon with full soft lining, cinched waist belt, and elegant balloon sleeves.',
    offerBadge: 'New Arrival',
  },
  702: {
    name: 'Embroidered Crepe Open Abaya with Matching Sheila - Black',
    description:
      'Japanese matte crepe fabric with delicate hand-beaded sleeve embroidery, includes matching chiffon headscarf.',
    offerBadge: 'Handcrafted Embroidery',
  },
  703: {
    name: 'Formal 2-Piece Women’s Blazer & Wide-Leg Pants Suit - Beige',
    description:
      'Double-breasted tailored blazer paired with high-waist wide-leg trousers for a refined executive look.',
    offerBadge: 'Italian Design',
  },
  704: {
    name: 'Satin Wrap Blouse with Pearl Cuff Buttons - Emerald Green',
    description:
      'Silky smooth satin blouse with V-neck wrap drape and pearl-accented cuffs.',
  },
  705: {
    name: 'Cashmere-Blend Long Winter Coat with Waist Belt - Camel',
    description:
      'Warm wool-cashmere blend trench coat with wide lapel collar and adjustable tie belt.',
    offerBadge: 'Soft Cashmere',
  },
  706: {
    name: 'Cotton Linen Summer Shirt Dress with Belt - Olive Green',
    description:
      'Breathable natural linen-cotton blend shirt dress with wooden front buttons and side pockets.',
    offerBadge: 'Top Value',
  },

  // 8. Bags & Sunglasses
  801: {
    name: 'Ray-Ban Aviator Polarized Sunglasses - Gold Frame & Green Lens',
    description:
      '100% UV400 protection with anti-glare polarized crystal lenses and lightweight metal frame.',
    offerBadge: 'Polarized Lenses',
  },
  802: {
    name: 'Waterproof Laptop Backpack 15.6" with Built-in USB Charging Port',
    description:
      'Padded shockproof laptop compartment, hidden anti-theft back pocket, and ergonomic breathable straps.',
    offerBadge: 'Anti-Theft & Waterproof',
  },
  803: {
    name: 'Luxury Quilted Women’s Crossbody Bag with Gold Chain - Black',
    description:
      'Scratch-resistant caviar leather texture with gold-tone twist lock and convertible shoulder chain.',
    offerBadge: 'Most Popular',
  },
  804: {
    name: 'Handcrafted Genuine Cowhide Leather Men’s Wallet + Cardholder Gift Box',
    description:
      'RFID-blocking slim bifold leather wallet with 8 card slots and cash pocket in a luxury gift box.',
    offerBadge: '100% Genuine Leather',
  },
  805: {
    name: 'Vintage Acetate Cat-Eye Women’s Sunglasses - Tortoise Brown',
    description:
      'Italian acetate frame with gradient UV400 lenses, includes hard leather case and microfiber cloth.',
    offerBadge: 'Classic Edition',
  },
  806: {
    name: 'Genuine Leather Travel & Gym Duffel Bag - Cognac Brown',
    description:
      'Spacious cabin-size leather duffel with dedicated shoe compartment and padded shoulder strap.',
    offerBadge: 'Travel & Work',
  },
};

/**
 * Translate variant names dynamically (e.g. "مقاس 41" -> "Size 41")
 */
export function translateVariantNameToEn(nameAr: string): string {
  if (!nameAr) return '';
  const exactMap: Record<string, string> = {
    'سعة 256GB - تيتانيوم طبيعي': '256GB - Natural Titanium',
    'سعة 512GB - تيتانيوم أسود': '512GB - Black Titanium',
    'سعة 1TB - تيتانيوم أزرق': '1TB - Blue Titanium',
    'رام 16GB - هارد 512GB SSD': '16GB RAM - 512GB SSD',
    'رام 16GB - هارد 1TB SSD': '16GB RAM - 1TB SSD',
    'رام 24GB - هارد 1TB SSD': '24GB RAM - 1TB SSD',
    'حجم 50 مل (Eau de Parfum)': '50ml (Eau de Parfum)',
    'حجم 100 مل (الحجم الأصلي)': '100ml (Full Size)',
    'حجم 200 مل (توفير عائلي)': '200ml (Value Size)',
  };
  if (exactMap[nameAr]) return exactMap[nameAr];
  return nameAr
    .replace(/^مقاس\s+/i, 'Size ')
    .replace(/رام/g, 'RAM')
    .replace(/هارد/g, 'Storage')
    .replace(/سعة/g, 'Capacity');
}

/**
 * Translate dynamic discount / stock badge strings
 */
export function translateBadgeToEn(text: string): string {
  if (!text) return '';
  if (OFFER_BADGE_EN_BY_AR[text]) return OFFER_BADGE_EN_BY_AR[text];
  const discountMatch = text.match(/خصم\s*(\d+)%/);
  if (discountMatch) return `${discountMatch[1]}% OFF`;
  const leftMatch = text.match(/متبقي\s*(\d+)\s*فقط/);
  if (leftMatch) return `Only ${leftMatch[1]} left`;
  const countMatch = text.match(/^(\d+)\s*منتج/);
  if (countMatch) return `${countMatch[1]} Products`;
  return text;
}

/**
 * Localize a StorefrontCategory into the active language
 */
export function localizeCategory(
  cat: StorefrontCategory,
  lang: StorefrontLang
): StorefrontCategory {
  if (lang !== 'en') return cat;
  const enName =
    CATEGORY_EN_BY_ID[cat.id] ||
    CATEGORY_EN_BY_AR[cat.name?.trim()] ||
    cat.name;
  return {
    ...cat,
    name: enName,
  };
}

/**
 * Localize a StorefrontProduct into the active language
 * Preserves original Arabic fields in `_arName` / `_arCategoryName` if needed for photo matching
 */
export function localizeProduct(
  product: StorefrontProduct,
  lang: StorefrontLang
): StorefrontProduct {
  if (lang !== 'en') return product;

  const enEntry = PRODUCT_EN_BY_ID[product.id];
  const enCat =
    (product.categoryId && CATEGORY_EN_BY_ID[product.categoryId]) ||
    (product.categoryName && CATEGORY_EN_BY_AR[product.categoryName.trim()]) ||
    product.categoryName;

  const enBadge =
    enEntry?.offerBadge ||
    (product.offerBadge ? translateBadgeToEn(product.offerBadge) : product.offerBadge);

  const localizedVariants = product.variants?.map((v) => ({
    ...v,
    name: translateVariantNameToEn(v.name),
  }));

  return {
    ...product,
    name: enEntry?.name || product.name,
    description: enEntry?.description || product.description,
    categoryName: enCat,
    offerBadge: enBadge,
    variants: localizedVariants,
  };
}

/**
 * Localize StorefrontInfo into the active language
 */
export function localizeStorefrontInfo(
  info: StorefrontInfo,
  lang: StorefrontLang
): StorefrontInfo {
  if (lang !== 'en') return info;

  const zoneNameEnMap: Record<string, string> = {
    'القاهرة والجيزة': 'Cairo & Giza',
    'الإسكندرية والدلتا': 'Alexandria & Delta',
    'مدن القناة والصعيد': 'Canal Cities & Upper Egypt',
  };

  const zoneTimeEnMap: Record<string, string> = {
    'خلال 24 ساعة': 'Within 24 hours',
    'خلال 48 ساعة': 'Within 48 hours',
    '2 إلى 3 أيام عمل': '2 to 3 business days',
  };

  return {
    ...info,
    bio:
      info.bio ===
      'وجهتك الأولى للتسوق الذكي — أحدث الإلكترونيات، الساعات الفاخرة، العطور العالمية، والأزياء العصرية بضمان رسمي وتوصيل سريع لباب المنزل.'
        ? 'Your premier destination for smart shopping — flagship electronics, luxury watches, signature perfumes, and modern fashion with official warranty and fast doorstep delivery.'
        : info.bio,
    announcement:
      info.announcement ===
      '🔥 عروض الموسم الكبرى: خصومات تصل إلى 35% + شحن مجاني للطلبات فوق 1500 ج.م!'
        ? '🔥 Grand Season Sale: Up to 35% OFF + Free Shipping on orders over 1,500 EGP!'
        : info.announcement,
    address:
      info.address === 'القاهرة - التجمع الخامس، شارع التسعين الشمالي، مول كايرو فيستيفال'
        ? 'Cairo - Fifth Settlement, North 90th St., Cairo Festival City Mall'
        : info.address,
    heroHeadline:
      info.heroHeadline === 'تسوق أحدث الإصدارات العالمية بأفضل الأسعار في مصر'
        ? 'Shop the Latest Global Releases at the Best Prices'
        : info.heroHeadline,
    deliveryZones: info.deliveryZones?.map((z) => ({
      ...z,
      name: zoneNameEnMap[z.name] || z.name,
      estimatedTime: z.estimatedTime ? zoneTimeEnMap[z.estimatedTime] || z.estimatedTime : z.estimatedTime,
    })),
  };
}

/**
 * Universal Arabic-to-English phrase dictionary used by i18n fallback & components
 */
export const AR_TO_EN_PHRASES: Record<string, string> = {
  // Header & Nav
  'الرئيسية': 'Home',
  'كل المنتجات': 'All Products',
  'كل الأقسام': 'All Categories',
  'الأقسام': 'Categories',
  'العروض': 'Deals',
  'عروض اليوم': "Today's Deals",
  'عروض فلاش': 'Flash Deals',
  'الأكثر مبيعاً': 'Best Sellers',
  'وصل حديثاً': 'New Arrivals',
  'طلباتي': 'My Orders',
  'تتبع طلباتي': 'Track My Orders',
  'سلة المشتريات': 'Shopping Cart',
  'سلة التسوق': 'Shopping Cart',
  'السلة': 'Cart',
  'حسابي': 'My Account',
  'متجر إلكتروني': 'Online Store',
  'تصفح الأقسام': 'Browse Categories',
  'ابحث عن منتج، قسم، أو علامة تجارية...': 'Search products, categories, or brands...',
  'ابحث عن منتج أو قسم...': 'Search for a product or category...',
  'مسح البحث': 'Clear search',
  'بحث': 'Search',

  // Hero & Showcase & Vibrant Sections
  'تشكيلة الموسم الحصرية': 'Exclusive Season Collection',
  'تسوق أرقى الماركات العالمية': 'Shop Top Global Brands',
  'بأفضل سعر في مصر': 'At the Best Prices',
  'اكتشف تشكيلة مختارة من أحدث الهواتف الذكية، اللابتوب، الساعات الفاخرة، العطور، والأزياء العصرية بضمان أصلي 100% وتوصيل سريع.':
    'Discover a curated selection of flagship smartphones, laptops, luxury watches, signature perfumes, and modern fashion with 100% authentic warranty and express delivery.',
  'تسوق العروض الآن': 'Shop Deals Now',
  'تصفح جميع المنتجات': 'Browse All Products',
  'منتج أصلي 100%': '100% Authentic',
  'شحن سريع لباب البيت': 'Fast Doorstep Delivery',
  'دفع آمن عند الاستلام': 'Cash on Delivery',
  'استرجاع مجاني خلال 14 يوم': '14-Day Free Returns',
  'تشكيلة المتجر المختارة': "Store's Curated Collection",
  'أقوى العروض والمنتجات المميزة': 'Top Deals & Featured Products',
  'استكشف العروض الآن': 'Explore Deals Now',
  'الأكثر طلباً ومبيعاً': 'Most Popular & Best Selling',
  'تشكيلة مختارة بأعلى جودة': 'Handpicked top-quality collection',
  'تخفيضات وباقات التوفير': 'Discounts & Value Bundles',
  'تسوق أفضل الأسعار اليوم': "Shop today's best prices",
  'منتجات أصلية ومعتمدة': 'Certified Authentic Products',
  'نختار لك الأفضل دائماً': 'Always curating the best for you',
  'اكتشف التشكيلة الجديدة': 'Discover the New Collection',
  'أحدث الإصدارات في مكان واحد': 'The latest releases in one place',
  'مختارات مميزة': 'Featured Picks',
  'أفضل العروض': 'Best Deals',
  'عرض خاص لك': 'Special Offer for You',
  'ترشيحاتنا لك': 'Recommended for You',
  'تسوق حسب القسم': 'Shop by Category',
  'عرض كل الأقسام': 'View All Categories',
  'عرض الكل': 'View All',
  'تصفح القسم': 'Browse Category',

  // Flash Sale & Shelves
  'عروض فلاش الحصرية': 'Exclusive Flash Sale',
  'ينتهي العرض خلال': 'Offer Ends In',
  'ساعة': 'Hrs',
  'دقيقة': 'Min',
  'ثانية': 'Sec',
  'خصومات فورية لفترة محدودة جداً': 'Instant markdowns for a strictly limited time',
  'أقوى عروض اليوم': "Today's Top Deals",
  'وفر أكثر مع خصوماتنا الحصرية اليومية': 'Save more with our exclusive daily markdowns',
  'المنتجات الأكثر مبيعاً': 'Best Selling Products',
  'اختيارات عملائنا المفضلة والأعلى تقييماً': 'Our customers’ favorite and highest-rated picks',
  'أحدث الإضافات والتشكيلات العصرية': 'Latest arrivals and modern collections',

  // Product Card & Quick View & Spotlight
  'أضف للسلة': 'Add to Cart',
  'أضف إلى السلة': 'Add to Cart',
  'أضف للسلة الآن': 'Add to Cart Now',
  'تمت الإضافة': 'Added',
  'تمت الإضافة للسلة': 'Added to Cart',
  'بالسلة': 'in cart',
  'نفدت الكمية': 'Out of Stock',
  'غير متوفر': 'Unavailable',
  'متوفر في المخزون': 'In Stock',
  'السعر عند التواصل': 'Price on Inquiry',
  'استفسر عن السعر': 'Inquire Price',
  'طلب عبر واتساب': 'Order via WhatsApp',
  'المواصفات': 'Specifications',
  'عرض سريع': 'Quick View',
  'إضافة للمفضلة': 'Add to Favorites',
  'إزالة من المفضلة': 'Remove from Favorites',
  'زيادة الكمية': 'Increase quantity',
  'إنقاص الكمية': 'Decrease quantity',
  'تقليل الكمية': 'Decrease quantity',
  'حذف من السلة': 'Remove from cart',
  'خصم': 'OFF',
  'وفرت': 'You save',
  'شامل الضريبة': 'VAT Included',
  'اختر المقاس أو الإصدار:': 'Select Size or Variant:',
  'اختر الخيار المناسب': 'Select Option',
  'وصف المنتج': 'Product Description',
  'منتجات مشابهة قد تعجبك': 'Similar Products You May Like',

  // Filtered Grid & Sorting
  'ترتيب حسب:': 'Sort by:',
  'الأكثر تطابقاً': 'Most Relevant',
  'الأقل سعراً': 'Price: Low to High',
  'الأعلى سعراً': 'Price: High to Low',
  'الأعلى خصماً': 'Highest Discount',
  'المفضلة فقط': 'Favorites Only',
  'العروض فقط': 'Deals Only',
  'إعادة ضبط الفلاتر': 'Reset Filters',
  'لا توجد منتجات مطابقة لبحثك': 'No products match your search',
  'جرب البحث بكلمات أخرى أو تصفح كافة الأقسام': 'Try different keywords or browse all categories',
  'عرض كافة المنتجات': 'Show All Products',

  // Cart & Checkout & Orders
  'سلة التسوق فارغة': 'Your shopping cart is empty',
  'تصفح المنتجات وأضف ما ترغب لطلبك الآن': 'Browse products and add your favorite items to your order now',
  'تصفح المنتجات': 'Browse Products',
  'تفريغ السلة': 'Clear Cart',
  'تفريغ السلة بالكامل': 'Clear entire cart',
  'تفريغ السلة بالكامل؟': 'Clear entire cart?',
  'تأكيد': 'Confirm',
  'إلغاء': 'Cancel',
  'قيمة الأصناف': 'Subtotal',
  'المجموع الفرعي': 'Subtotal',
  'مجموع الأصناف:': 'Items Subtotal:',
  'مصاريف التوصيل': 'Delivery Fee',
  'الشحن': 'Shipping',
  'مجاني': 'Free',
  'مجاناً': 'Free',
  'توصيل مجاني': 'Free Delivery',
  'الخصم': 'Discount',
  'المبلغ الإجمالي': 'Total Amount',
  'الإجمالي': 'Total',
  'الإجمالي:': 'Total:',
  'المبلغ الإجمالي للدفع:': 'Total Payable:',
  'إتمام الطلب': 'Proceed to Checkout',
  'إتمام الشراء': 'Checkout',
  'متابعة التسوق': 'Continue Shopping',
  'متابعة التسوق في المتجر': 'Continue Shopping',
  'تعديل': 'Edit',
  'إعادة الطلب': 'Reorder',
  'تاريخ الطلب': 'Order Date',
  'شركة الشحن': 'Shipping Method',
  'توصيل سريع': 'Express Delivery',
  'العنوان': 'Address',
  'استلام من الفرع': 'Branch Pickup',
  'طريقة الدفع': 'Payment Method',
  'الدفع عند الاستلام': 'Cash on Delivery',
  'عند الاستلام': 'Cash on Delivery',
  'بطاقة بنكية': 'Credit / Debit Card',
  'إنستاباي / محفظة': 'InstaPay / Mobile Wallet',
  'مدفوع': 'Paid',
  'تم الطلب': 'Order Placed',
  'تم التجهيز': 'Processing',
  'في الطريق': 'Out for Delivery',
  'تم التسليم': 'Delivered',
  'قيد الانتظار...': 'Pending...',

  // Trust Bar & Footer
  'توصيل سريع ومؤمن': 'Fast & Insured Delivery',
  'لجميع المحافظات لباب المنزل': 'To all governorates right to your doorstep',
  'منتجات أصلية 100%': '100% Authentic Products',
  'ضمان رسمي معتمد على كافة المنتجات': 'Official certified warranty on all items',
  'دفع آمن وميسر': 'Safe & Flexible Payment',
  'الدفع عند الاستلام أو بالبطاقات والمحافظ': 'Cash on delivery, cards, or digital wallets',
  'استبدال واسترجاع مجاني': 'Free Exchange & Returns',
  'خلال 14 يوماً طبقاً لسياسة المتجر': 'Within 14 days per store policy',
  'روابط سريعة': 'Quick Links',
  'أقسام المتجر': 'Store Categories',
  'خدمة العملاء والتواصل': 'Customer Service & Contact',
  'تواصل معنا عبر واتساب': 'Chat with us on WhatsApp',
  'جميع الحقوق محفوظة': 'All rights reserved',
};

export function translateKnownPhrase(text: string | null | undefined, lang: StorefrontLang): string {
  if (!text) return '';
  if (lang !== 'en') return text;
  const trimmed = text.trim();
  return (
    AR_TO_EN_PHRASES[trimmed] ||
    CATEGORY_EN_BY_AR[trimmed] ||
    SHORT_CATEGORY_EN_BY_AR[trimmed] ||
    OFFER_BADGE_EN_BY_AR[trimmed] ||
    text
  );
}

export function translateProductName(name: string | null | undefined, lang: StorefrontLang): string {
  if (!name) return '';
  if (lang !== 'en') return name;
  return translateKnownPhrase(name, lang);
}

export function translateCategoryName(cat: string | null | undefined, lang: StorefrontLang): string {
  if (!cat) return '';
  if (lang !== 'en') return cat;
  const trimmed = cat.trim();
  return CATEGORY_EN_BY_AR[trimmed] || SHORT_CATEGORY_EN_BY_AR[trimmed] || translateKnownPhrase(trimmed, lang);
}

export function translateOfferBadge(badge: string | null | undefined, lang: StorefrontLang): string {
  if (!badge) return '';
  if (lang !== 'en') return badge;
  return translateBadgeToEn(badge.trim());
}

export function translateProductDesc(desc: string | null | undefined, lang: StorefrontLang): string {
  if (!desc) return '';
  if (lang !== 'en') return desc;
  return translateKnownPhrase(desc, lang);
}


