import { appInstances } from '@wix/app-management';
import { auth } from '@wix/essentials';
import { PRO_PACKAGE_NAMES } from '../constants';
import type { Plan } from '../engine/types';
import { log } from './log';

export interface Entitlement {
  plan: Plan;
  packageName: string | null;
  expiresAt: string | null;
  verified: boolean;
}

const elevatedGetAppInstance = auth.elevate(appInstances.getAppInstance);

/**
 * Resolves the plan from Wix's app-instance billing data. Anything that cannot
 * be verified resolves to Basic: Pro features are default-deny.
 */
export async function resolveEntitlement(now = new Date()): Promise<Entitlement> {
  try {
    const { instance } = await elevatedGetAppInstance();
    const billing = instance?.billing;
    const packageName = billing?.packageName ?? null;
    const expiresAt = billing?.expirationDate ?? null;
    const notExpired = !expiresAt || new Date(expiresAt).getTime() > now.getTime();
    const isPro =
      instance?.isFree === false &&
      packageName !== null &&
      PRO_PACKAGE_NAMES.includes(packageName) &&
      notExpired;
    return { plan: isPro ? 'pro' : 'basic', packageName, expiresAt, verified: true };
  } catch (error) {
    log.error('entitlement.resolve', error);
    return { plan: 'basic', packageName: null, expiresAt: null, verified: false };
  }
}
