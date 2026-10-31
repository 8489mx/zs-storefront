import { resolveRequestUrl } from '@/lib/http';

// Storefront images are served by the API at content-addressed paths (/api/storefront/media/<id>/<sha>,
// invariant SF-9). In the cloud the page and the API share an origin, but the desktop build and the
// dev server talk to the API on another origin, so a bare "/api/..." <img src> would miss. Every image
// reference coming from the storefront API goes through here once, in the API layer.

export function resolveStorefrontMediaUrl<T extends string | null | undefined>(url: T): T {
  if (typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('data:image/svg+xml')) {
    return undefined as unknown as T;
  }
  if (!trimmed.startsWith('/api/')) return trimmed as T;
  // In dev server (Vite on 5173), Vite already proxies /api to the dev backend on 3101.
  // Using relative /api/... keeps it same-origin with localhost:5173, avoiding CORP blocks.
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return trimmed as T;
  }
  return resolveRequestUrl(trimmed) as T;
}

export function resolveStorefrontMediaList(urls: unknown): string[] {
  return Array.isArray(urls)
    ? urls
        .filter((u): u is string => typeof u === 'string' && Boolean(u.trim()) && !u.startsWith('data:image/svg+xml'))
        .map((u) => resolveStorefrontMediaUrl(u))
        .filter(Boolean)
    : [];
}

/** Resolves only authentic tenant-uploaded product media without injecting random stock photos. */
export function withResolvedProductMedia<
  P extends { name?: string; categoryName?: string | null; imageUrl?: string; gallery?: unknown }
>(product: P): P {
  if (!product) return product;
  const cleanedUrl = resolveStorefrontMediaUrl(product.imageUrl);
  const finalUrl = cleanedUrl || '';
  const resolvedGallery = product.gallery !== undefined ? resolveStorefrontMediaList(product.gallery) : undefined;
  return {
    ...product,
    imageUrl: finalUrl,
    ...(resolvedGallery !== undefined
      ? { gallery: resolvedGallery.length > 0 ? resolvedGallery : finalUrl ? [finalUrl] : [] }
      : {}),
  };
}


