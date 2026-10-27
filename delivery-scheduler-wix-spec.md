# Delivery Scheduler for Wix Stores --- Product & Technical Specification

**Document status:** Implementation specification with Wix API
verification notes\
**Date:** 27 October 2026\
**Product type:** Wix App Market app\
**Working name:** Delivery Scheduler\
**Primary stack:** Wix CLI app, Astro + React where compatible with
generated CLI extension templates, TypeScript, shadcn/ui, lucide-react,
sonner, Zod, Wix Data

## 1. Product summary

Delivery Scheduler lets Wix Stores merchants offer scheduled delivery
and/or pickup. Customers select an available date and, where configured,
a timeslot. Merchants configure lead times, booking windows, cut-off
times, working days, holidays, closures, product preparation times, and
slot capacity. A dashboard groups scheduled orders by date and slot.

The app must not claim a fully native checkout calendar until a
supported Wix checkout extension point has been verified in a published
test app. Wix's eCommerce Validations service plugin can validate
carts/checkouts and display violations, but it is not itself a custom
calendar UI and does not itself persist the customer's chosen date to an
order.

## 2. Product goals

-   Let eligible customers choose delivery or pickup scheduling before
    completing an order.
-   Enforce scheduling rules on the server, not just in browser UI.
-   Avoid overbooking through atomic reservation/capacity handling.
-   Save scheduling details against the resulting order and keep a
    reliable app-side record.
-   Give merchants a daily fulfilment dashboard and configurable
    notifications.
-   Support localization, accessibility, mobile layouts, and brand
    customization.
-   Integrate with Wix Stores/eCommerce without replacing Wix checkout
    or payment processing.

## 3. Explicit non-goals for V1

-   Route optimization or driver dispatch.
-   Third-party courier label purchasing.
-   Charging delivery fees or calculating shipping rates independently.
-   Creating replacement orders or bypassing standard Wix checkout.
-   Guaranteeing a custom calendar inside Wix's native checkout until
    supported extension capability is demonstrated.
-   Using an unsupported or deprecated Checkout API as the foundation.

## 4. Wix documentation verification

The following claims have been checked against Wix developer
documentation. Links are authoritative documentation entry points;
verify details again when implementation starts because Wix APIs and
extension availability can change.

  -----------------------------------------------------------------------
  Requirement             Wix documentation       Implementation decision
                          finding                 
  ----------------------- ----------------------- -----------------------
  Validate checkout/cart  Wix eCommerce           Implement the service
  rules                   Validations service     plugin and return an
                          plugin lets an app      error when a known
                          validate cart/checkout  scheduling selection is
                          and return violations.  invalid. Do not treat
                          Cart validation is      it as the date-picker
                          opt-in through          UI.
                          `validateInCart`.       

  Add app extensions      Wix CLI supports        Generate extensions
                          dashboard               using the Wix CLI; do
                          pages/plugins, backend  not hand-write
                          events, service         unregistered extension
                          plugins, data           manifests.
                          collections, HTTP       
                          endpoints, site         
                          widgets, editor React   
                          components, and site    
                          plugins, subject to     
                          current extension       
                          availability.           

  Add site plugin         Wix CLI site plugins    Evaluate supported
                          use custom-element      checkout/cart/order
                          technology and occupy   slots in a real test
                          predefined slots in     site. Use only a
                          supported Wix business  documented slot.
                          solutions.              

  Store app data          A Wix CLI Data          Define collections,
                          Collections extension   schemas, permissions,
                          creates configured CMS  indexes and initial
                          collections on          records in the
                          install/update; the     extension. Confirm CMS
                          site needs CMS, which   dependency behavior
                          may need to be bundled  during app setup.
                          as a dependency.        

  Read and manage orders  eCommerce Orders API    Use eCommerce Orders
                          supports searching,     API/events for the
                          retrieving, updating    dashboard; never create
                          selected fields, and    a second order for an
                          order lifecycle events. ordinary checkout.
                          Standard online orders  
                          are created through     
                          checkout.               

  Persist schedule on     The Order object has    Prefer a supported
  order                   `customFields` and      order custom/extended
                          `extendedFields`;       field only after
                          extended fields must be confirming exact write
                          configured in the app   semantics for the
                          dashboard. Update Order chosen checkout flow.
                          only supports a         Always maintain a
                          restricted list of      separate app-side
                          properties, including   schedule record keyed
                          `extendedFields`.       by order ID as the
                                                  source of truth for
                                                  dashboard scheduling.
                                                  Do not assume arbitrary
                                                  order properties can be
                                                  patched.

  Use current checkout    Wix documentation       Use current Wix
  approach                describes               eCommerce APIs and Cart
                          service-plugin decision V2 where relevant.
                          points and current      Confirm
                          eCommerce flows. Avoid  migration/deprecation
                          new dependencies on     status at
                          legacy checkout APIs.   implementation time.

  Notifications           Order events and Wix    Prefer supported Wix
                          notification/email APIs email/trigger
                          must be checked for     infrastructure when an
                          exact permissions and   approved API supports
                          capabilities before     the required
                          implementation.         transactional message.
                                                  Otherwise use a clearly
                                                  disclosed fallback; do
                                                  not invent a Wix email
                                                  SDK method.
  -----------------------------------------------------------------------

### Official Wix references

-   Validations service plugin:
    https://dev.wix.com/docs/rest/business-solutions/e-commerce/service-plugins/validations-integration-service-plugin/introduction
-   Validations API overview:
    https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/extensions/validations/introduction
-   Wix CLI supported extensions:
    https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/supported-extensions/about-extensions-in-the-wix-cli
-   Add a site plugin with Wix CLI:
    https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/supported-extensions/site/site-plugins/add-a-site-plugin-extension-with-the-wix-cli
-   Add a Data Collections extension:
    https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/supported-extensions/backend/data-collections/add-a-data-collections-extension-with-the-wix-cli
-   Data Collections overview:
    https://dev.wix.com/docs/overview/extensions-framework/backend-extensions/data-collections
-   eCommerce Orders API:
    https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/orders/orders/introduction
-   Create Order reference (used here for order object and supported
    update details; do not use to create duplicate online orders):
    https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/orders/orders/create-order
-   Extend eCommerce with service plugins:
    https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/guides/extend-the-e-commerce-platform-with-service-plugins

## 5. Mandatory feasibility spike before feature development

Complete these tasks on a dedicated Wix test site and document
screenshots, API responses, extension configuration and observed
limitations.

1.  Create a Wix CLI app using the current CLI, not an old legacy
    template.
2.  Generate a dashboard page, Data Collections extension, order event
    handler, and eCommerce Validations service plugin using the CLI's
    interactive generator.
3.  Inspect the generated service-plugin contract and implement a
    minimal response that returns no violations.
4.  Configure the plugin with a deployment URI and `validateInCart` as
    appropriate.
5.  Confirm the plugin runs for cart and checkout in a real test site
    and that a returned error blocks checkout.
6.  Identify a documented site-plugin or editor extension slot where the
    scheduling widget can actually appear. Test it in desktop and mobile
    editor previews and published site.
7.  If no supported native checkout slot permits a date/time selector,
    explicitly scope V1 as a cart-page/pre-checkout scheduling
    interface. Do not market it as a native checkout calendar.
8.  Test how the selected scheduling data can be written to the final
    order. Verify custom fields/extended fields support, permissions,
    and read-back behavior. Do not infer support from the existence of
    the fields in the Order schema.
9.  Confirm the exact supported order event names and payloads using
    generated event templates and current Wix docs.
10. Test two simultaneous requests for the final slot and prove only one
    succeeds.
11. Record all findings in `docs/WIX-API-VERIFICATION.md` with date, API
    version, extension name, test site, evidence and pass/fail result.

**Go/no-go:** If steps 5--8 fail, stop before building the full customer
experience. Revise the product flow or obtain a confirmed Wix-supported
extension path first.

## 6. User roles

-   **Site owner/admin:** Full access to configuration, schedule,
    orders, exports, notifications and billing.
-   **Authorized dashboard staff:** Access to fulfilment dashboard
    according to the app's supported Wix dashboard permissions model.
-   **Customer:** Can view available dates/slots and submit a scheduling
    selection; cannot access merchant settings or other orders.
-   **System/event handler:** Processes order lifecycle events
    idempotently and reconciles order/schedule state.

## 7. Merchant dashboard

Build the dashboard with shadcn/ui, React, lucide-react and sonner. Use
Arial as the default font. Use Zod for validation instead of relying on
browser-native validation. Do not change submit button labels while
loading; show a spinner inside the existing button.

### 7.1 Navigation

-   Overview
-   Schedule & capacity
-   Orders
-   Delivery settings
-   Pickup settings
-   Product rules
-   Notifications
-   Appearance
-   Billing
-   Help & diagnostics

### 7.2 Overview

Show: - Orders scheduled for today. - Upcoming scheduled orders. -
Delivery vs pickup counts. - Slots at or near capacity. - Orders missing
a valid schedule (if scheduling is required). - Integration status,
including whether the widget/plugin is placed and active. - A visible
"Add to site"/placement action when required extension placement is
missing. - Offline status at the bottom when network connectivity is
unavailable.

### 7.3 Orders fulfilment view

-   Table and calendar/list modes.
-   Group by scheduled date, then slot.
-   Filters: date range, delivery/pickup, order status, payment status,
    fulfilment status, product, customer, slot and unscheduled orders.
-   Search by order number, order ID or customer.
-   Display order number, customer, fulfilment method, schedule, item
    summary, order/payment status, notes and source.
-   Order detail opens the relevant Wix order where supported and the
    app's scheduling record.
-   Bulk export CSV.
-   Bulk status changes apply only to app-owned scheduling/fulfilment
    fields; never mutate unsupported Wix order properties.
-   Pagination and server-side filtering; do not load all historical
    orders at once.
-   Empty, loading, partial-error and offline states.

### 7.4 Settings UX

-   Use accordions for logically grouped settings.
-   Preload the selected font in the appearance editor.
-   Save, cancel and reset-to-default controls.
-   Show a preview of the customer widget.
-   Keep the original submit button label while saving and show a
    spinner.
-   Use toast feedback with `sonner`.
-   All user-facing strings must be localized; do not hardcode English
    into the widget.

## 8. Customer scheduling experience

### 8.1 Fulfilment method

Merchant can enable: - Delivery only. - Pickup only. - Both delivery and
pickup.

If both are enabled, customer chooses a method before dates are shown.
Only show pickup options if a pickup location and its hours are
configured.

### 8.2 Calendar and timeslots

-   Show available dates only; disabled dates explain why when
    practical.
-   Show date, weekday, local time and timezone context clearly.
-   Display available slots with remaining capacity only if that count
    can be safely and accurately calculated.
-   Slot labels are merchant-configurable, e.g. "9:00 AM--11:00 AM".
-   Support a no-timeslot mode where the customer chooses only a date.
-   Keep selections stable when the customer navigates the calendar.
-   Provide keyboard navigation, accessible labels, visible focus,
    screen-reader announcements and sufficient contrast.
-   Mobile-first layout and touch targets.
-   Handle stale availability by revalidating before confirming
    selection.

### 8.3 Required/optional selection

Merchant chooses whether scheduling is: - Required for all eligible
orders. - Required only for selected products. - Optional.

If a required selection is missing, show a clear validation error and
prevent completion when the documented Wix validation integration
supports that enforcement. If the selected date is not available in the
validation request, the app must not silently approve a
schedule-dependent checkout. This limitation must be tested and clearly
handled.

### 8.4 Appearance and copy controls

Configurable: - Font family, size and weight. - Text, background, border
and accent colors. - Calendar and slot button styles. - Border radius
and spacing. - Labels for delivery, pickup, date and time. -
Empty-state, cut-off, blocked-date, full-slot and validation messages. -
Required/optional indicator. - Locale, date format, 12/24-hour time and
translated strings. - Optional title, subtitle and helper text.

Use a React editor component for widget configuration. Persist only
validated, supported settings. Do not allow custom CSS or HTML
injection.

## 9. Scheduling rules engine

All rules are evaluated server-side in the merchant's configured IANA
timezone.

### 9.1 General rules

-   Minimum advance notice: minutes/hours/days.
-   Maximum booking horizon: days into the future.
-   Same-day ordering enabled/disabled.
-   Daily cut-off time.
-   Working weekdays.
-   Holidays and one-off blocked dates.
-   Date-range closures/vacation mode.
-   Date-specific opening hours.
-   Slot duration and interval.
-   Buffer between slots.
-   Maximum orders per slot.
-   Maximum units/items per slot where quantity data is available and
    reliable.
-   Daily capacity.
-   Optional blackout rules for specific fulfilment methods.
-   Product-specific preparation time and eligible fulfilment methods.

### 9.2 Rule precedence

Apply in this order: 1. App/site enabled state and merchant vacation
closure. 2. Fulfilment method availability. 3. Product eligibility and
preparation time. 4. Global blocked dates and holidays. 5.
Method-specific hours and blocked dates. 6. Product-specific overrides,
but never let an override bypass a global safety closure unless the
merchant explicitly configures that behavior. 7. Cut-off and minimum
notice. 8. Maximum booking horizon. 9. Slot capacity and existing
reservations. 10. Final server-side revalidation at selection
confirmation and checkout validation.

Define and test precedence where rules conflict. Persist a version
number for settings so stale customer sessions can be revalidated.

### 9.3 Timezone and daylight saving

-   Store UTC timestamps for event instants and an IANA timezone
    identifier for merchant-local rules.
-   Store selected local date separately as `YYYY-MM-DD`.
-   Store local slot start/end and resolved UTC instants where
    applicable.
-   Never rely on browser timezone.
-   Handle daylight-saving gaps and repeated times explicitly.
-   Use the merchant's timezone for cut-offs, daily capacity and
    dashboard grouping.
-   Do not infer the store timezone from the server host.

## 10. Capacity and reservation consistency

A simple read-then-write check is not sufficient to prevent overbooking.

-   Create short-lived slot holds only if the chosen customer flow has a
    reliable way to release or expire them.
-   Use an atomic transaction/locking strategy supported by the chosen
    storage layer. If Wix Data cannot provide the required atomic
    conditional update for capacity, use a supported external
    transactional store only after approval; do not claim strict
    capacity guarantees from non-atomic Wix Data queries.
-   Use idempotency keys for hold creation, confirmation, event
    processing and reconciliation.
-   Holds have expiration timestamps and are cleaned up safely.
-   Confirm a schedule against the final order ID when the order event
    arrives.
-   Release holds on failed/abandoned checkout when detectable; also
    expire stale holds.
-   If the order is created but the schedule cannot be confirmed, flag
    it for immediate reconciliation and notify the merchant. Never
    silently drop the schedule.
-   Define a documented policy for whether capacity is consumed at
    checkout start, successful order creation, payment, or approval.
    Default recommendation: temporary hold during the scheduling flow,
    final reservation after a confirmed order event, with
    payment/order-state exceptions tested.

## 11. Data model

Use Wix Data Collections extension for site-scoped settings and app
records where supported. Ensure collection permissions are private by
default; all writes and sensitive reads go through authenticated backend
code. Never expose collection write permissions to anonymous site
visitors for reservation or order records.

### 11.1 `DeliverySchedulerSettings`

-   `_id`
-   `schemaVersion`
-   `enabled`
-   `requiredMode` (`all`, `selectedProducts`, `optional`)
-   `timezone`
-   `fulfilmentMethods`
-   `minNoticeMinutes`
-   `maxDaysAhead`
-   `sameDayEnabled`
-   `cutoffRules`
-   `workingHours`
-   `slotDurationMinutes`
-   `slotIntervalMinutes`
-   `bufferMinutes`
-   `defaultSlotCapacity`
-   `blockedDates`
-   `holidayRules`
-   `vacationRanges`
-   `appearance`
-   `translations`
-   `notificationSettings`
-   `settingsRevision`
-   `createdAt`
-   `updatedAt`

### 11.2 `DeliverySchedulerProductRules`

-   `_id`
-   `productId`
-   `enabled`
-   `preparationMinutes`
-   `allowedFulfilmentMethods`
-   `requiredScheduling`
-   `customWorkingHours` (optional)
-   `customSlotCapacity` (optional, only if supported by the chosen
    capacity model)
-   `createdAt`
-   `updatedAt`

### 11.3 `DeliverySchedulerReservations`

-   `_id`
-   `reservationId`
-   `orderId` (nullable until confirmed)
-   `checkoutId`/`cartId` only where available through a supported flow
-   `idempotencyKey`
-   `fulfilmentMethod`
-   `localDate`
-   `slotId`
-   `slotStartUtc`
-   `slotEndUtc`
-   `timezone`
-   `status` (`held`, `confirmed`, `released`, `expired`,
    `needs_review`, `cancelled`)
-   `expiresAt`
-   `settingsRevision`
-   `createdAt`
-   `updatedAt`

### 11.4 `DeliverySchedulerOrders`

-   `_id`
-   `orderId` (unique logical key; enforce uniqueness in backend
    logic/index where supported)
-   `orderNumber`
-   `reservationId`
-   `fulfilmentMethod`
-   `localDate`
-   `slotId`
-   `slotLabelSnapshot`
-   `slotStartUtc`
-   `slotEndUtc`
-   `timezone`
-   `scheduleStatus`
-   `orderStatusSnapshot`
-   `paymentStatusSnapshot`
-   `fulfillmentStatusSnapshot`
-   `customerDisplayName` (minimize personal data; only store if needed)
-   `itemSummarySnapshot`
-   `merchantNotes`
-   `source`
-   `lastSyncedAt`
-   `createdAt`
-   `updatedAt`

### 11.5 `DeliverySchedulerEventLog`

-   `_id`
-   `eventId`
-   `eventType`
-   `orderId`
-   `reservationId`
-   `idempotencyKey`
-   `processingStatus`
-   `attemptCount`
-   `lastErrorCode`
-   `receivedAt`
-   `processedAt`

Do not store payment card details, unnecessary personal data, or full
order payloads. Keep retention and deletion policies aligned with
applicable privacy requirements and Wix App Market requirements.

## 12. Order integration and schedule persistence

1.  The customer selects a date and slot in the supported customer
    interface.
2.  Backend validates the selection against current settings and
    capacity.
3.  Backend creates a short-lived hold/reservation where supported.
4.  Checkout proceeds through Wix's normal checkout/payment flow.
5.  An official Wix order event is received and authenticated.
6.  Handler verifies the order is eligible and correlates it to the
    reservation through a supported identifier or verified metadata
    field.
7.  Create/update the app-side `DeliverySchedulerOrders` record
    idempotently.
8.  Confirm the reservation against the final order ID.
9.  Save schedule data to a Wix order custom field/extended field only
    after exact API support and permission behavior have been verified.
10. Reconcile records periodically or on relevant order updates.
11. Handle cancellation, refund/payment failure, order updates and
    deletion according to documented event semantics and merchant
    policy.

**Important:** Do not assume an arbitrary field can be appended to an
order. Wix's Orders API exposes custom fields and configured extended
fields, but the API documents a restricted set of properties for Update
Order. Validate the exact mechanism in the test site. The app-side
schedule record is required even if order metadata is available.

## 13. eCommerce Validations service plugin

-   Generate the extension using the current Wix CLI.
-   Implement the exact generated method names, request/response types
    and configuration contract.
-   Configure `deploymentUri`, unique `componentName`, and
    `validateInCart` according to desired coverage.
-   Return the documented empty violations array when no violation
    exists.
-   Return a documented blocking error for invalid required selections,
    unavailable dates or invalid slot/capacity state only when the
    validator has enough trustworthy context to make that decision.
-   Do not assume the validation request includes an app-specific
    selection unless verified.
-   Keep the validator fast, resilient and observable; use timeouts and
    safe failure behavior aligned with Wix's service-plugin contract.
-   Never return a false success if the app knows the schedule is
    invalid.
-   Avoid creating reservations as an uncontrolled side effect of
    repeated validation calls; validation can be invoked multiple times.
-   Log request correlation IDs and outcomes without logging sensitive
    customer data.

## 14. Backend API design

Implement authenticated, validated endpoints under the project's
supported HTTP API extension pattern. The exact generated file layout is
determined by the current Wix CLI template; do not force a legacy
`pages/api` layout into a Wix-hosted extension if the current generator
expects another structure. If Astro is used as a separately hosted
service, document that deployment boundary and secure every endpoint.

Suggested logical endpoints:

-   `GET /availability?method=delivery&from=YYYY-MM-DD&to=YYYY-MM-DD`
-   `POST /reservations/hold`
-   `POST /reservations/confirm` (internal/event-driven only where
    possible)
-   `POST /reservations/release`
-   `GET /dashboard/orders`
-   `GET /dashboard/orders/:orderId`
-   `PATCH /dashboard/orders/:orderId/schedule-status`
-   `GET /settings`
-   `PUT /settings`
-   `GET /product-rules`
-   `PUT /product-rules/:productId`
-   `POST /events/orders` only if an official event mechanism is not
    used; prefer Wix CLI event extensions for Wix-originated events.
-   `GET /health`

Security requirements: - Validate all inputs with Zod. - Authenticate
merchant/admin requests and authorize site/app instance access. - Never
trust a client-supplied site ID, order ID, capacity count, timezone, or
price without server-side verification. - Rate-limit public availability
and reservation endpoints. - Apply CSRF/origin protections appropriate
to the chosen hosting and Wix integration model. - Use idempotency keys
for mutation endpoints. - Do not expose secrets to browser bundles. -
Return stable error codes and safe messages.

## 15. Order events and reconciliation

-   Use generated Wix CLI event extensions for order lifecycle events
    supported by the current CLI.
-   Confirm exact event names and payload schemas from generated
    templates/current docs; do not guess event names.
-   Make every handler idempotent.
-   Persist event receipt and processing status.
-   Retry transient failures with bounded exponential backoff.
-   Dead-letter repeated failures and expose them in the diagnostics
    page.
-   Handle out-of-order events by fetching the current authoritative
    order state when supported.
-   Reconcile reservations without orders, orders without reservations,
    and schedule records whose order status changed.
-   Do not create an online order manually to recover a missed event.

## 16. Notifications

Configure templates for: - Customer order scheduled. - Merchant new
scheduled order. - Schedule changed by merchant. - Schedule
unavailable/needs review. - Optional upcoming fulfilment summary.

Each message may include order number, fulfilment method, local date,
slot, timezone, pickup instructions/delivery note, and a link to the
order where supported.

Use only a verified Wix-supported transactional email/trigger API and
required permissions. Verify the current Wix Email Transmission SDK/API
and its sending limits before implementation. Do not invent method names
or promise delivery. Avoid sending duplicate messages when order events
are retried; use an outbox/idempotency record. If a supported Wix email
API is unavailable to this app type, document an approved alternative
and its trade-offs.

## 17. Localization and accessibility

-   Initial target: top 20 languages, with translation keys externalized
    from day one.
-   No hardcoded customer-facing strings.
-   Locale-aware date and time formatting; store timezone separately
    from locale.
-   Merchant-editable labels/messages fall back to the selected
    language's defaults.
-   Support right-to-left layouts where relevant.
-   Accessible keyboard operation, focus states, semantic labels,
    screen-reader announcements and contrast.
-   Never rely on color alone to indicate blocked or full slots.

## 18. Billing and plans

Implement Wix app billing using the current approved Wix app
billing/pricing mechanism; verify current SDK and lifecycle semantics
before coding.

Suggested plans: - **Basic:** one fulfilment location, basic date
selection, weekly schedule, blocked dates, standard order dashboard,
limited future booking window. - **Pro:** multiple schedules/locations
if supported, product-specific preparation times, slot capacity,
advanced cutoffs, bulk exports, custom labels and advanced
notifications. - Optional trial only if the current Wix billing response
confirms trial eligibility. Enforce feature access server-side; default
deny for unverified billing state. - Handle trial, active, expired,
cancelled and resubscribed states idempotently. - Provide a
billing/settings page and clear upgrade path. - Never assume a
client-provided plan name proves entitlement.

Pricing values should be decided after competitor research and Wix App
Market review, not hardcoded into the architecture.

## 19. Observability and diagnostics

-   Structured logs with request ID, app/site instance ID, event ID,
    operation and safe error code.
-   No tokens, secrets, card data or full personal records in logs.
-   Dashboard health panel: extension status, last successful order
    event, pending reconciliation count, failed event count, last
    availability error and configuration revision.
-   Admin-facing retry action for recoverable failures.
-   Alert when an order is missing a confirmed schedule or capacity
    integrity is uncertain.
-   Provide export of scheduling records and a documented
    uninstall/data-retention behavior.

## 20. Testing and acceptance criteria

### Wix integration

-   [ ] App installs on a clean eligible Wix test site.
-   [ ] Data collections are created with correct schema and restrictive
    permissions.
-   [ ] Dashboard extension is visible and loads without console errors.
-   [ ] Customer interface appears only in a verified supported
    placement.
-   [ ] Validation service plugin runs at checkout; cart validation
    behavior matches configuration.
-   [ ] A blocking violation actually prevents checkout in the published
    test environment.
-   [ ] Selected date/slot is correlated to the correct completed order.
-   [ ] Order schedule can be read back from the chosen persistence
    path.
-   [ ] Current API scopes are documented and least-privilege.
-   [ ] No legacy/deprecated checkout dependency is introduced.

### Scheduling

-   [ ] Minimum notice, maximum horizon and cut-off rules work across
    timezone boundaries.
-   [ ] Blocked dates, holidays, vacation ranges and weekly working
    hours are respected.
-   [ ] Product-specific preparation time is respected.
-   [ ] Full slots cannot be selected.
-   [ ] Two simultaneous attempts for the final slot cannot both be
    confirmed.
-   [ ] Stale calendar selections are revalidated.
-   [ ] Daylight-saving transitions do not create ambiguous or
    impossible slots.
-   [ ] Cancelled/failed orders follow the documented capacity-release
    policy.

### Dashboard and notifications

-   [ ] Orders group by merchant-local date and slot.
-   [ ] Filters, search, pagination and CSV export work.
-   [ ] Retried order events do not duplicate schedule records or
    emails.
-   [ ] Notifications contain the correct local date/time and fulfilment
    method.
-   [ ] Failed event processing is visible and recoverable.

### Quality

-   [ ] Mobile and desktop customer experiences pass.
-   [ ] Accessibility keyboard and screen-reader checks pass.
-   [ ] All strings are translation-key based.
-   [ ] Zod validates settings and API payloads.
-   [ ] Loading buttons retain their labels and show an inline spinner.
-   [ ] No anonymous write permission allows clients to alter
    reservation/order data.
-   [ ] Subscription features are enforced on the backend.
-   [ ] Error, empty, offline and partial-failure states are covered.

## 21. Delivery milestones

### Milestone 0 --- Wix feasibility (blocking)

Complete Section 5 and create `docs/WIX-API-VERIFICATION.md`. No full
implementation until checkout placement, validation, and order
correlation are proven.

### Milestone 1 --- App foundation

Create Wix CLI app, generate extensions, configure scopes, collections,
dashboard shell, settings schema and billing gate.

### Milestone 2 --- Rules and availability

Implement timezone-aware rule engine, availability API, blocked dates,
cutoffs, product rules and capacity model.

### Milestone 3 --- Customer scheduling

Implement the verified customer placement, accessible calendar,
fulfilment choice, slots, hold lifecycle and error states.

### Milestone 4 --- Order integration

Implement event handlers, order correlation, schedule records,
idempotency and reconciliation.

### Milestone 5 --- Merchant fulfilment dashboard

Implement overview, order grouping, filters, detail view, export and
diagnostics.

### Milestone 6 --- Notifications, localization and billing

Integrate verified messaging mechanism, translation system and billing
entitlements.

### Milestone 7 --- QA and App Market readiness

Run acceptance tests on published test sites, verify app listing claims
match actual behavior, prepare support documentation and complete App
Market review requirements.

## 22. Developer implementation instructions

-   Start by reading the current Wix CLI skills/docs and the generated
    project's own instructions.
-   Use Wix CLI generators for extensions and preserve generated
    registration/configuration.
-   Do not replace an existing extension manifest or overwrite existing
    app extensions while adding new ones.
-   Use the current Wix JavaScript SDK/API supported by the generated
    app. Confirm API names, permissions and request/response types
    against Wix docs before implementation.
-   Use Astro only where compatible with the deployment target; do not
    assume Wix-hosted CLI extensions run as Astro `pages/api` routes. If
    a separate Astro backend is chosen, document it and secure the
    Wix-to-backend integration.
-   Use React, shadcn/ui, lucide-react, sonner and Arial for
    dashboard/editor UI.
-   Use Zod for validation and centralized translation keys for all
    user-facing text.
-   Never claim a feature is implemented until tested against a
    published Wix test site.
-   Record every unverified assumption as a blocker, not as a completed
    feature.

## 23. Release gate

The app is ready for App Market submission only when the supported
customer placement is proven, selection persistence is proven,
server-side validation works in published checkout, slot capacity cannot
be oversold under concurrent requests, order events are idempotent, and
all advertised capabilities pass the acceptance tests. If native
checkout UI is unavailable, describe the actual cart/pre-checkout
experience honestly in the listing.
