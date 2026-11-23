import { validations } from '@wix/ecom/service-plugins';
import { auth } from '@wix/essentials';
import { items as dataItems } from '@wix/data';
import { COLLECTIONS } from '../../../../lib/constants';
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

type CheckoutLog = {
  operation: string;
  outcome: 'success' | 'error';
  reason: string;
  requestId: string | null;
  purchaseFlowId: string | null;
  source: string | null;
  reservationId?: string | null;
  errorCode?: string | null;
};

function recordCheckoutLog(entry: CheckoutLog): void {
  try {
    const insert = auth.elevate(dataItems.insert);
    void insert(COLLECTIONS.logs, {
      ...entry,
      createdAt: new Date(),
    }).catch((error: unknown) => {
      // Logging is best effort and must never affect the checkout response.
      log.error('validator.log_write_failed', error, { requestId: entry.requestId });
    });
  } catch (error) {
    // Elevation can fail synchronously; that must not affect the checkout response.
    log.error('validator.log_write_failed', error, { requestId: entry.requestId });
  }
}

function finish<T>(response: T, entry: CheckoutLog): T {
  recordCheckoutLog(entry);
  return response;
}

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
    const purchaseFlowId = request.sourceInfo?.purchaseFlowId ?? null;
    const source = request.sourceInfo?.source ?? null;
    let items: ReturnType<typeof storesItems> = [];
    let ctx: SchedulingContext | null = null;
    try {
      items = storesItems(request.validationInfo?.lineItems ?? []);
      if (items.length === 0) {
        return finish(NO_VIOLATIONS, { operation: 'checkout.validation', outcome: 'success', reason: 'no_store_items', requestId, purchaseFlowId, source });
      }
      ctx = await withTimeout(loadSchedulingContext(items));
      if (!isSchedulingRequired(ctx, items)) {
        return finish(NO_VIOLATIONS, { operation: 'checkout.validation', outcome: 'success', reason: 'scheduling_not_required', requestId, purchaseFlowId, source });
      }
      // The plugin is placed in checkout; cart calls (if enabled later) only inform.
      if (source === 'CART') {
        return finish(NO_VIOLATIONS, { operation: 'checkout.validation', outcome: 'success', reason: 'cart_validation_skipped', requestId, purchaseFlowId, source });
      }

      if (!purchaseFlowId) {
        return finish(blocking(ctx, metadata.languages, 'validation.unverified'), { operation: 'checkout.validation', outcome: 'error', reason: 'purchase_flow_missing', requestId, purchaseFlowId, source });
      }

      const reservation = await withTimeout(findLatestByPurchaseFlow(purchaseFlowId));
      if (!reservation) {
        return finish(blocking(ctx, metadata.languages, 'validation.required'), { operation: 'checkout.validation', outcome: 'error', reason: 'reservation_missing', requestId, purchaseFlowId, source });
      }
      if (reservation.status === 'needs_review') {
        return finish(blocking(ctx, metadata.languages, 'validation.unavailable'), { operation: 'checkout.validation', outcome: 'error', reason: 'reservation_needs_review', requestId, purchaseFlowId, source, reservationId: reservation.reservationId });
      }
      const now = new Date();
      const lapsed =
        reservation.status === 'expired' ||
        (reservation.status === 'held' && reservation.expiresAt !== null && reservation.expiresAt <= now);
      if (lapsed) {
        return finish(blocking(ctx, metadata.languages, 'validation.expired'), { operation: 'checkout.validation', outcome: 'error', reason: 'reservation_expired', requestId, purchaseFlowId, source, reservationId: reservation.reservationId });
      }

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
      if (!check.ok && !clockOnly) {
        return finish(blocking(ctx, metadata.languages, 'validation.unavailable'), { operation: 'checkout.validation', outcome: 'error', reason: check.reason, requestId, purchaseFlowId, source, reservationId: reservation.reservationId });
      }

      log.info('validator.ok', { requestId, reservationId: reservation.reservationId });
      return finish(NO_VIOLATIONS, { operation: 'checkout.validation', outcome: 'success', reason: 'reservation_valid', requestId, purchaseFlowId, source, reservationId: reservation.reservationId });
    } catch (error) {
      log.error('validator.failed', error, { requestId });
      recordCheckoutLog({ operation: 'checkout.validation', outcome: 'error', reason: 'validator_exception', requestId, purchaseFlowId, source, errorCode: log.errorCode(error) });
      // Fail closed only when we already know scheduling is required for this purchase.
      if (ctx && isSchedulingRequired(ctx, items)) {
        return blocking(ctx, metadata.languages, 'validation.unverified');
      }
      return NO_VIOLATIONS;
    }
  },
});
