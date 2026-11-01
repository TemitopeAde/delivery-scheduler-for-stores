# Wix API verification log

Spec §5 / Milestone 0. Each row records **what the Wix documentation says** (checked through the Wix docs MCP on 2026‑10‑27) and **what still has to be proven on a published test site**. A row is only "Pass" once there is live evidence. Until then, the go/no-go gate in §5 is still open.

- App ID: `0127f604-ab9e-4ae2-bc21-b74bb2578a00`. Namespace: `@admin14744/delivery-scheduler-for-stores`
- CLI: `@wix/cli` 1.2.2. Runtime: `@wix/astro` (endpoints under `src/pages/api`)
- SDK versions: `@wix/ecom` ^1.0.2611, `@wix/data` ^1.0.535, `@wix/essentials` ^0.1.23, `@wix/app-management`, `@wix/site-plugins`, `@wix/stores` ^1.0.961
- Preview: `wix preview` on 2026‑10‑27 created version override `11dd827e-8495-47b0-901a-275bc10d691d`
- Test site: **not yet assigned**. Use a Premium dev site with Wix Stores (needed for checkout plugins).

## Status legend

| Status | Meaning |
| --- | --- |
| Docs ✔ | Confirmed in current Wix docs or SDK typings; implemented to match. |
| Live — pending | Needs evidence from a published test site (screenshot, API response, log). |
| Blocker | Known gap; the feature must not be advertised until it is resolved. |

## Findings

| # | Area | Extension / API | Docs finding | Implementation | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Customer placement | Site plugin, Checkout page | The delivery-step options slot is `checkout:delivery-step:options:after`. Its API exposes `checkoutId`, `deliveryStepState`, `onRefreshCheckout`, and `disableContinueButton`. Checkout plugins may not support automatic addition, so a dashboard `addSitePlugin()` flow is required. | `delivery-scheduler-picker.extension.ts` and the Overview page use the delivery-step options placement. | Schema ✔ · Live — pending |
| 2 | Plugin props | Custom element receiving props | Wix sets each prop as a JS property (setter) and a kebab-case attribute. Early-set values must be re-applied in `connectedCallback`. `onRefreshCheckout` is set to the refresh function itself. | Setters plus the early-value re-application loop. | Docs ✔ |
| 3 | Continue button | `disableContinueButton` | The docs describe it as `(callback: (isDisabled) => void) => void`, but don't say what the custom-element property holds (unlike `onRefreshCheckout`). | The element treats the property as the control function and calls `fn(true/false)`. If the property is actually the registrar, required scheduling still holds via the validator (#5). | **Live — pending (verify shape)** |
| 4 | Brand styling | `slotBrand` | Always defined; re-pushed on change; paint the background on the outermost element. | Used when "Use my own colors" is off; the outermost element is square with padding. | Docs ✔ |
| 5 | Checkout validation | `ECOM_VALIDATIONS` service plugin | `getValidationViolations(request, metadata)`; `ERROR` blocks placing the order at CHECKOUT; `validateInCart` opt-in; request has `sourceInfo.purchaseFlowId` (correlates cart, checkout, order) and line items; **don't call Get Checkout from this handler**. | Read-only validator correlates by `purchaseFlowId`. Missing or expired hold blocks only when scheduling is required. Never calls Get Checkout. `validateInCart: false`. Fails closed only when it already knows a schedule is required. | Docs ✔ · Live — pending (spike step 5) |
| 6 | Correlation | Checkout → hold → order | `Order.checkoutId` and `Order.purchaseFlowId` exist (SDK typings). `Checkout.purchaseFlowId` exists. | Hold stores `checkoutId` (from the plugin) and `purchaseFlowId` (resolved server-side). The order event matches on either. | Docs ✔ · Live — pending (spike step 8) |
| 7 | Checkout lookup | `checkout.getCheckout` (elevated) | Scope `SCOPE.DC-STORES.READ-ORDERS`. **Deprecated → Cart V2 `GetCart`.** Purchase-flow overview: Checkout API "will be removed on February 1, 2027". | Isolated in `src/lib/server/checkout-context.ts`. Used only by the availability and hold endpoints, not the validator. | **Blocker (migration):** confirm how the checkout plugin's `checkoutId` maps to Cart V2 before Feb 2027. |
| 8 | Order events | `orders.onOrderCreated` / `onOrderApproved` / `onOrderCanceled` | Envelopes: created → `event.entity`; approved/canceled → `event.data.order`; `event.metadata._id` is the event ID. Scope includes `SCOPE.DC-STORES.READ-ORDERS`. The first event extension forces a **major** release. | Idempotent handlers keyed by `<type>:<metadata._id>`. Re-fetch the order with `orders.getOrder`. Retry ×3 with backoff; dead-letter after 5 attempts. | Docs ✔ · Live — pending (spike step 9) |
| 9 | Order persistence | `Order.customFields` / `extendedFields` | Update Order supports only a restricted field set; extended fields must be configured in the app dashboard. | **Not written.** The app-side `scheduled-orders` record is the source of truth (spec §12). | Deliberately deferred: decide after spike step 8 |
| 10 | Atomic capacity | Wix Data `items.insert` | "If you specify an ID that already exists in the collection, the insertion will fail." The `condition` option on update/remove is marked `@internal` in the typings, so it is **not used**. | One lock item per seat with a deterministic `_id`; claim = insert. Unit test: 8 concurrent claims for 1 seat → exactly 1 wins (25 runs). Duplicate detection matches error code `WDE0074` or an "already exists" message. | Docs ✔ · **Live — pending** (spike step 10: prove on the real store; confirm the duplicate error code) |
| 11 | Expired-hold reclaim | Same | No documented conditional delete. | Re-read before remove, then verify after insert. A narrow race remains; order confirmation re-checks ownership and flags `needs_review` instead of overbooking silently. | Known limitation, documented |
| 12 | Collections | Data Collections extension | Collections are created on install/update of a **major** version. The site needs the CMS app (bundle as a dependency). | 6 collections, all `PRIVILEGED`; backend uses `auth.elevate`. | Docs ✔ · Live — pending |
| 13 | Caller identity | `auth.getTokenInfo()` | Returns `subjectType` `APP`/`USER`/`MEMBER`/`VISITOR`/`UNKNOWN`, `siteId`, `instanceId`; documented for CLI backend extensions. | `/api/dashboard/*` requires `USER`; `/api/availability` and `/api/reservations/*` accept visitor/member/user. Per-instance rate limit. | Docs ✔ |
| 14 | Widget placement status | `plugins.getPlacementStatus` (`@wix/site-plugins`) | Returns `placementStatuses[{ pluginId, placedInSlot }]`. Scope `SCOPE.SITE-PLUGIN.READ-PLACEMENT-STATUS`. | Overview shows placed / not placed / unknown. | Docs ✔ |
| 15 | Billing | `appInstances.getAppInstance` | Scope `SCOPE.DC.MANAGE-YOUR-APP`. `isFree`; `billing` (packageName, expirationDate…) only when `isFree` is false. | Pro if paid, package name in `PRO_PACKAGE_NAMES`, and not expired. Anything else → Basic (default deny). Enforced on settings save, product-rule save, and CSV export. | Docs ✔ · Live — pending (plan names) |
| 16 | Upgrade link | — | No documented URL format for an "upgrade this app" deep link. The Billing API has `Get URL` (Wix checkout for a plan, valid 48h). | No hard-coded URL. The plan card tells merchants to upgrade from Manage Apps. | Open: adopt `billing.getUrl` once plans exist |
| 17 | Notifications | Email Transmission v1 | Docs show `Send Email Transmission` with `type: TRANSACTIONAL`, `contactId` recipient, verified sender, and an `idempotencyKey`. Sender verification, limits and scopes are not yet checked. | Preferences are stored; **no email is sent**. The UI says so explicitly. | **Blocker:** verify per spec §16 before enabling |
| 18 | Stores catalog | `catalogVersioning`, `products` / `productsV3` | Apps must support V1 and V3. | Product picker detects the version; V3 `searchProducts`, V1 `startsWith('name')`. The product ID from `catalogReference.catalogItemId` is the same in both. | Docs ✔ |
| 19 | Order link | `pages.orderDetails` (`@wix/ecom/dashboard`) | Destination builder for `dashboard.navigate`. | "Open Wix order" on the order page. | Docs ✔ |

## Permission scopes to request (Dev Center → Develop → Permissions)

| Scope | Why |
| --- | --- |
| `SCOPE.DC-STORES.READ-ORDERS` (Read Orders) | Order events, `orders.getOrder`, `checkout.getCheckout` |
| `SCOPE.DC.MANAGE-YOUR-APP` | `appInstances.getAppInstance` (plan) |
| `SCOPE.SITE-PLUGIN.READ-PLACEMENT-STATUS` | Widget placement status |
| `SCOPE.STORES.CATALOG_READ_LIMITED` | `getCatalogVersion()` |
| `SCOPE.DC-STORES.READ-PRODUCTS` (V1) and `SCOPE.STORES.PRODUCT_READ` (V3) | Product picker |

Wix Data item access to the app's own collections comes with the Data Collections extension.

## Spike checklist (§5) — evidence still required

1. ☐ Install the preview on a Premium Stores test site. Confirm 6 collections exist with `PRIVILEGED` permissions.
2. ☐ Add the widget from Overview → "Add to checkout". Confirm it renders in the delivery step on desktop, mobile and the published site.
3. ☐ Confirm `disableContinueButton` blocks and unblocks Continue (#3).
4. ☐ Pick a slot. Confirm a `held` reservation plus 2 lock items, and that `purchaseFlowId` is populated.
5. ☐ Place the order without a selection (required mode). Confirm the validator's ERROR blocks it.
6. ☐ Complete an order. Confirm `order.created` produces a `confirmed` reservation and a `scheduled-orders` record keyed by the order ID.
7. ☐ Cancel it. Confirm capacity is released and the record is `cancelled`.
8. ☐ Fire two simultaneous holds for the last seat (two browsers or a script against `/api/reservations/hold`). Confirm exactly one 201 and one `SLOT_FULL`. Record the duplicate-insert error code.
9. ☐ Redeliver an order event (or run reconciliation twice). Confirm no duplicate records.
10. ☐ Decide on writing order `extendedFields` (#9) and the Cart V2 migration path (#7).
