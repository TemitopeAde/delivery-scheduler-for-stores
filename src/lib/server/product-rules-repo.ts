import { COLLECTIONS } from '../constants';
import { productRuleInputSchema, type ProductRule, type ProductRuleInput } from '../schemas';
import { db, toDate, withRetry } from './data';
import { log } from './log';

type Item = Record<string, unknown>;

function itemToRule(item: Item): ProductRule | null {
  const parsed = productRuleInputSchema.safeParse({
    productId: item.productId,
    productName: item.productName ?? '',
    enabled: item.enabled,
    preparationMinutes: item.preparationMinutes ?? 0,
    allowedFulfilmentMethods: item.allowedFulfilmentMethods,
    requiredScheduling: item.requiredScheduling ?? false,
    customWorkingHours: item.customWorkingHours ?? null,
  });
  if (!parsed.success) {
    log.error('productRules.invalid', parsed.error, { itemId: String(item._id ?? '') });
    return null;
  }
  return { ...parsed.data, updatedAt: toDate(item.updatedAt)?.toISOString() ?? null };
}

/** Rules for the given products. Product IDs double as item IDs, so each product has one rule. */
export async function rulesForProducts(productIds: string[]): Promise<ProductRule[]> {
  const unique = [...new Set(productIds.filter(Boolean))];
  if (unique.length === 0) return [];
  const result = await withRetry(() =>
    db.query(COLLECTIONS.productRules).hasSome('_id', unique).limit(1000).find(),
  );
  return result.items.map((i) => itemToRule(i as Item)).filter((r): r is ProductRule => r !== null);
}

export async function getRule(productId: string): Promise<ProductRule | null> {
  const item = (await db.get(COLLECTIONS.productRules, productId)) as Item | null;
  return item ? itemToRule(item) : null;
}

export async function listRules(options: {
  limit: number;
  offset: number;
  search?: string;
}): Promise<{ rules: ProductRule[]; hasNext: boolean }> {
  let query = db.query(COLLECTIONS.productRules).ascending('productName');
  if (options.search) query = query.contains('productName', options.search);
  const result = await query.skip(options.offset).limit(options.limit).find();
  return {
    rules: result.items.map((i) => itemToRule(i as Item)).filter((r): r is ProductRule => r !== null),
    hasNext: result.hasNext(),
  };
}

export async function saveRule(input: ProductRuleInput): Promise<ProductRule> {
  const now = new Date();
  const existing = (await db.get(COLLECTIONS.productRules, input.productId)) as Item | null;
  await db.save(COLLECTIONS.productRules, {
    _id: input.productId,
    ...input,
    createdAt: existing ? (toDate(existing.createdAt) ?? now) : now,
    updatedAt: now,
  });
  return { ...input, updatedAt: now.toISOString() };
}

export async function removeRule(productId: string): Promise<void> {
  await db.remove(COLLECTIONS.productRules, productId);
}
