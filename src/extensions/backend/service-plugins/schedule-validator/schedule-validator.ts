import { validations } from '@wix/ecom/service-plugins';
import { checkSelection } from '../../../../lib/engine/availability';
import { resolveMessages, type MessageKey } from '../../../../lib/i18n/messages';
import { storesItems } from '../../../../lib/server/checkout-context';
import { log } from '../../../../lib/server/log';
import { findLatestByPurchaseFlow } from '../../../../lib/server/reservations-repo';
import {
  isSchedulingRequired,
  loadSchedulingContext,
  type SchedulingContext,
} from '../../../../lib/server/scheduling-context';

const NO_VIOLATIONS = { violations: [] };
const TIMEOUT_MS = 4000;

function blocking(ctx: SchedulingContext | null, languages: string[] | undefined, key: MessageKey) {
  const locale = languages?.[0] ?? ctx?.settings.translations.defaultLocale ?? 'en';
  const messages = resolveMessages(locale, ctx?.settings.translations.overrides ?? {});
  return {
    violations: [
      {
        description: messages[key],
        severity: validations.Severity.ERROR,
        target: { other: { name: validations.NameInOther.OTHER_DEFAULT } },
      },
    ],
  };
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('VALIDATION_TIMEOUT')), TIMEOUT_MS)),
  ]);
}

/**
 * Read-only: this validator never creates or changes reservations, because Wix
 * may call it many times per checkout. It decides only from the hold the
 * checkout plugin created, correlated by the purchase flow ID.
 */
validations.provideHandlers({
  getValidationViolations: async ({ request, metadata }) => {
    const requestId = metadata.requestId ?? null;
    const items = storesItems(request.validationInfo?.lineItems ?? []);
    if (items.length === 0) return NO_VIOLATIONS;

    let ctx: SchedulingContext | null = null;
    try {
      ctx = await withTimeout(loadSchedulingContext(items));
      if (!isSchedulingRequired(ctx, items)) return NO_VIOLATIONS;
      // The plugin is placed in checkout; cart calls (if enabled later) only inform.
      if (request.sourceInfo?.source === 'CART') return NO_VIOLATIONS;

      const purchaseFlowId = request.sourceInfo?.purchaseFlowId;
      if (!purchaseFlowId) return blocking(ctx, metadata.languages, 'validation.unverified');

      const reservation = await withTimeout(findLatestByPurchaseFlow(purchaseFlowId));
      if (!reservation) return blocking(ctx, metadata.languages, 'validation.required');
      if (reservation.status === 'needs_review') {
        return blocking(ctx, metadata.languages, 'validation.unavailable');
      }
      const now = new Date();
      const lapsed =
        reservation.status === 'expired' ||
        (reservation.status === 'held' && reservation.expiresAt !== null && reservation.expiresAt <= now);
      if (lapsed) return blocking(ctx, metadata.languages, 'validation.expired');

      // The capacity lock is owned already, so only the rules are re-checked (cart
      // contents or settings may have changed since the hold was made).
      const check = checkSelection(
        {
          settings: ctx.settings,
          method: reservation.fulfilmentMethod,
          productRules: ctx.rules,
          now,
          usage: { slotCount: () => 0, dayCount: () => 0 },
          plan: ctx.plan,
        },
        reservation.localDate,
        reservation.slotId,
        { ignoreCapacity: true },
      );
      // Notice and cut-off were satisfied when the hold was placed; a customer
      // lingering on the payment step must not be failed by the clock alone.
      const clockOnly = !check.ok && (check.reason === 'too_soon' || check.reason === 'cutoff');
      if (!check.ok && !clockOnly) return blocking(ctx, metadata.languages, 'validation.unavailable');

      log.info('validator.ok', { requestId, reservationId: reservation.reservationId });
      return NO_VIOLATIONS;
    } catch (error) {
      log.error('validator.failed', error, { requestId });
      // Fail closed only when we already know scheduling is required for this purchase.
      if (ctx && isSchedulingRequired(ctx, items)) {
        return blocking(ctx, metadata.languages, 'validation.unverified');
      }
      return NO_VIOLATIONS;
    }
  },
});
