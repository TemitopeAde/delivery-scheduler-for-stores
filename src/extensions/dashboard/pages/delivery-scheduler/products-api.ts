// Product lookup for product rules. Wix Stores has two incompatible catalogs,
// so the version is detected first and both are supported.
import { catalogVersioning, products, productsV3 } from '@wix/stores';

export interface ProductOption {
  id: string;
  name: string;
}

export interface ProductPage {
  products: ProductOption[];
  nextCursor: string | null;
}

export const PRODUCT_PAGE_SIZE = 25;

type CatalogVersion = 'V1_CATALOG' | 'V3_CATALOG' | 'STORES_NOT_INSTALLED';
let cachedVersion: CatalogVersion | undefined;

async function catalogVersion(): Promise<CatalogVersion> {
  if (cachedVersion) return cachedVersion;
  const { catalogVersion: version } = await catalogVersioning.getCatalogVersion();
  cachedVersion =
    version === 'V1_CATALOG' || version === 'V3_CATALOG' ? version : 'STORES_NOT_INSTALLED';
  return cachedVersion;
}

export async function searchProducts(
  term: string,
  cursor?: string,
  limit = PRODUCT_PAGE_SIZE,
): Promise<ProductPage> {
  const version = await catalogVersion();
  if (version === 'STORES_NOT_INSTALLED') return { products: [], nextCursor: null };

  if (version === 'V3_CATALOG') {
    if (term.trim()) {
      const res = await productsV3.searchProducts({
        cursorPaging: { limit, ...(cursor ? { cursor } : {}) },
        search: { expression: term.trim(), fields: ['name'], fuzzy: true },
      });
      return {
        products: (res.products ?? []).flatMap((p) =>
          p._id ? [{ id: p._id, name: p.name ?? p._id }] : [],
        ),
        nextCursor: res.pagingMetadata?.hasNext
          ? res.pagingMetadata.cursors?.next ?? null
          : null,
      };
    }

    const query = productsV3.queryProducts().limit(limit);
    if (cursor) query.skipTo(cursor);
    const res = await query.find();
    return {
      products: res.items.flatMap((p) =>
        p._id ? [{ id: p._id, name: p.name ?? p._id }] : [],
      ),
      nextCursor: res.hasNext() ? res.cursors.next ?? null : null,
    };
  }

  const offset = cursor ? Number(cursor) : 0;
  let query = products.queryProducts().limit(limit).skip(Number.isFinite(offset) ? offset : 0);
  if (term.trim()) query = query.startsWith('name', term.trim());
  const res = await query.find();
  return {
    products: res.items.flatMap((p) =>
      p._id ? [{ id: p._id, name: p.name ?? p._id }] : [],
    ),
    nextCursor: res.hasNext() ? String((Number.isFinite(offset) ? offset : 0) + limit) : null,
  };
}
