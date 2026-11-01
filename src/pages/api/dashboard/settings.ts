import type { APIRoute } from 'astro';
import { z } from 'zod';
import { BASIC_MAX_DAYS_AHEAD } from '../../../lib/constants';
import { settingsInputSchema, type SettingsInput } from '../../../lib/schemas';
import { resolveEntitlement } from '../../../lib/server/entitlements';
import { AppError } from '../../../lib/server/errors';
import { handler, json, readJson } from '../../../lib/server/http';
import { loadSettings, saveSettings } from '../../../lib/server/settings-repo';

const putSchema = z.object({ expectedRevision: z.number().int().min(0), settings: settingsInputSchema });

/** Pro-only settings are rejected server-side, whatever the client shows. */
function assertPlanAllows(input: SettingsInput, plan: 'basic' | 'pro'): void {
  if (plan === 'pro') return;
  const blocked: string[] = [];
  if (input.slots.defaultCapacity > 0) blocked.push('slot capacity');
  if (input.delivery.dailyCapacity > 0 || input.pickup.dailyCapacity > 0) blocked.push('daily capacity');
  if (Object.keys(input.slots.labels).length > 0) blocked.push('custom slot labels');
  if (Object.keys(input.translations.overrides).length > 0) blocked.push('custom copy');
  if (input.maxDaysAhead > BASIC_MAX_DAYS_AHEAD) blocked.push(`booking more than ${BASIC_MAX_DAYS_AHEAD} days ahead`);
  if (input.delivery.enabled && input.pickup.enabled) blocked.push('both delivery and pickup');
  if (input.requiredMode === 'selectedProducts') blocked.push('per-product requirements');
  if (blocked.length) {
    throw new AppError('PLAN_REQUIRED', `Upgrade to Pro to use ${blocked.join(', ')}.`, { features: blocked });
  }
}

export const GET: APIRoute = handler('dashboard', 'settings.get', async () => {
  const [settings, entitlement] = await Promise.all([loadSettings(), resolveEntitlement()]);
  return json({ settings, entitlement });
});

export const PUT: APIRoute = handler('dashboard', 'settings.put', async (request) => {
  const body = putSchema.parse(await readJson(request));
  const entitlement = await resolveEntitlement();
  assertPlanAllows(body.settings, entitlement.plan);
  const settings = await saveSettings(body.settings, body.expectedRevision);
  return json({ settings, entitlement });
});
