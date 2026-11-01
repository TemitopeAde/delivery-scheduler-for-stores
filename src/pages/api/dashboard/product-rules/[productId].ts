import type { APIRoute } from 'astro';
import { productRuleInputSchema } from '../../../../lib/schemas';
import { resolveEntitlement } from '../../../../lib/server/entitlements';
import { AppError } from '../../../../lib/server/errors';
import { handler, json, readJson } from '../../../../lib/server/http';
import { getRule, removeRule, saveRule } from '../../../../lib/server/product-rules-repo';

function productIdOf(params: Record<string, string | undefined>): string {
  const id = params.productId;
  if (!id || id.length > 64) throw new AppError('INVALID_REQUEST', 'A product ID is required.');
  return id;
}

export const GET: APIRoute = handler('dashboard', 'productRules.get', async (_request, { params }) => {
  const rule = await getRule(productIdOf(params));
  if (!rule) throw new AppError('NOT_FOUND', 'No rule exists for this product.');
  return json({ rule });
});

export const PUT: APIRoute = handler('dashboard', 'productRules.put', async (request, { params }) => {
  const { plan } = await resolveEntitlement();
  if (plan !== 'pro') throw new AppError('PLAN_REQUIRED', 'Upgrade to Pro to use product rules.');
  const body = await readJson(request);
  const input = productRuleInputSchema.parse({
    ...(body && typeof body === 'object' ? body : {}),
    productId: productIdOf(params),
  });
  return json({ rule: await saveRule(input) });
});

export const DELETE: APIRoute = handler('dashboard', 'productRules.delete', async (_request, { params }) => {
  await removeRule(productIdOf(params));
  return new Response(null, { status: 204 });
});
