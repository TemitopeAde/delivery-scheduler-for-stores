// Product lookup for product rules. Wix Stores has two incompatible catalogs,
// so the version is detected first and both are supported.
import { catalogVersioning, products, productsV3 } from '@wix/stores';

export interface ProductOption {
  id: string;
  name: string;
}

type CatalogVersion = 'V1_CATALOG' | 'V3_CATALOG' | 'STORES_NOT_INSTALLED';
let cachedVersion: CatalogVersion | undefined;

async function catalogVersion(): Promise<CatalogVersion> {
  if (cachedVersion) return cachedVersion;
  const { catalogVersion: version } = await catalogVersioning.getCatalogVersion();
  cachedVersion =
    version === 'V1_CATALOG' || version === 'V3_CATALOG' ? version : 'STORES_NOT_INSTALLED';
  return cachedVersion;
}

export async function searchProducts(term: string, limit = 20): Promise<ProductOption[]> {
  const version = await catalogVersion();
  if (version === 'STORES_NOT_INSTALLED') return [];
  if (version === 'V3_CATALOG') {
    const res = term.trim()
      ? await productsV3.searchProducts({
          cursorPaging: { limit },
          search: { expression: term.trim(), fields: ['name'], fuzzy: true },
        })
      : { products: (await productsV3.queryProducts().limit(limit).find()).items };
    return (res.products ?? []).flatMap((p) => (p._id ? [{ id: p._id, name: p.name ?? p._id }] : []));
  }
  let query = products.queryProducts().limit(limit);
  if (term.trim()) query = query.startsWith('name', term.trim());
  const res = await query.find();
  return res.items.flatMap((p) => (p._id ? [{ id: p._id, name: p.name ?? p._id }] : []));
}
