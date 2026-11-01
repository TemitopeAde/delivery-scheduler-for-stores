import { COLLECTIONS, SETTINGS_ITEM_ID, SETTINGS_SCHEMA_VERSION } from '../constants';
import { DEFAULT_SETTINGS, DEFAULT_SETTINGS_INPUT } from '../defaults';
import { settingsInputSchema, type Settings, type SettingsInput } from '../schemas';
import { db, num, toDate, withRetry } from './data';
import { AppError } from './errors';
import { log } from './log';

type Item = Record<string, unknown>;

const listOf = (value: unknown): unknown[] =>
  value && typeof value === 'object' && Array.isArray((value as { items?: unknown }).items)
    ? (value as { items: unknown[] }).items
    : [];

function itemToInput(item: Item): unknown {
  const methods = (item.fulfilmentMethods ?? {}) as Item;
  return {
    enabled: item.enabled,
    requiredMode: item.requiredMode,
    timezone: item.timezone,
    delivery: { ...DEFAULT_SETTINGS_INPUT.delivery, ...((methods.delivery as Item) ?? {}) },
    pickup: { ...DEFAULT_SETTINGS_INPUT.pickup, ...((methods.pickup as Item) ?? {}) },
    minNoticeMinutes: item.minNoticeMinutes,
    maxDaysAhead: item.maxDaysAhead,
    sameDayEnabled: item.sameDayEnabled,
    cutoff: item.cutoffRules ?? DEFAULT_SETTINGS_INPUT.cutoff,
    slots: { ...DEFAULT_SETTINGS_INPUT.slots, ...((item.slotRules as Item) ?? {}) },
    blockedDates: item.blockedDates ?? [],
    holidayRules: listOf(item.holidayRules),
    vacationRanges: listOf(item.vacationRanges),
    holdMinutes: item.holdMinutes ?? DEFAULT_SETTINGS_INPUT.holdMinutes,
    appearance: { ...DEFAULT_SETTINGS_INPUT.appearance, ...((item.appearance as Item) ?? {}) },
    translations: { ...DEFAULT_SETTINGS_INPUT.translations, ...((item.translations as Item) ?? {}) },
    notificationSettings: {
      ...DEFAULT_SETTINGS_INPUT.notificationSettings,
      ...((item.notificationSettings as Item) ?? {}),
    },
  };
}

function inputToItem(input: SettingsInput): Item {
  return {
    enabled: input.enabled,
    requiredMode: input.requiredMode,
    timezone: input.timezone,
    fulfilmentMethods: { delivery: input.delivery, pickup: input.pickup },
    minNoticeMinutes: input.minNoticeMinutes,
    maxDaysAhead: input.maxDaysAhead,
    sameDayEnabled: input.sameDayEnabled,
    cutoffRules: input.cutoff,
    slotRules: input.slots,
    blockedDates: input.blockedDates,
    holidayRules: { items: input.holidayRules },
    vacationRanges: { items: input.vacationRanges },
    holdMinutes: input.holdMinutes,
    appearance: input.appearance,
    translations: input.translations,
    notificationSettings: input.notificationSettings,
  };
}

export async function loadSettings(): Promise<Settings> {
  let item: Item | null;
  try {
    item = (await withRetry(() => db.get(COLLECTIONS.settings, SETTINGS_ITEM_ID))) as Item | null;
  } catch (error) {
    log.error('settings.load', error, {
      collection: COLLECTIONS.settings,
      itemId: SETTINGS_ITEM_ID,
    });
    throw error;
  }
  if (!item) return DEFAULT_SETTINGS;

  const parsed = settingsInputSchema.safeParse(itemToInput(item));
  const revision = num(item.settingsRevision);
  if (!parsed.success) {
    // Stored settings were edited outside the app and no longer validate. Report it
    // through diagnostics; scheduling stays off rather than running on bad rules.
    log.error('settings.load.invalid', parsed.error, { revision });
    return { ...DEFAULT_SETTINGS, settingsRevision: revision, configured: false };
  }
  return {
    ...parsed.data,
    schemaVersion: num(item.schemaVersion, SETTINGS_SCHEMA_VERSION),
    settingsRevision: revision,
    configured: true,
    updatedAt: toDate(item.updatedAt)?.toISOString() ?? null,
  };
}

/** Saves validated settings with optimistic concurrency on `settingsRevision`. */
export async function saveSettings(input: SettingsInput, expectedRevision: number): Promise<Settings> {
  const existing = (await db.get(COLLECTIONS.settings, SETTINGS_ITEM_ID)) as Item | null;
  const currentRevision = existing ? num(existing.settingsRevision) : 0;
  if (currentRevision !== expectedRevision) {
    throw new AppError('CONFLICT', 'Settings were changed elsewhere. Reload and try again.', {
      currentRevision,
    });
  }
  const now = new Date();
  const nextRevision = currentRevision + 1;
  await db.save(COLLECTIONS.settings, {
    _id: SETTINGS_ITEM_ID,
    ...inputToItem(input),
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    settingsRevision: nextRevision,
    createdAt: existing ? (toDate(existing.createdAt) ?? now) : now,
    updatedAt: now,
  });
  return {
    ...input,
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    settingsRevision: nextRevision,
    configured: true,
    updatedAt: now.toISOString(),
  };
}
