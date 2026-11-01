// Client for the app's authenticated /api/dashboard endpoints. Every call is
// made with the Wix user's identity; the backend re-checks it and validates input.
import { httpClient } from '@wix/essentials';
import type { ProductRule, ProductRuleInput, Settings, SettingsInput } from '../../../../lib/schemas';
import type { Entitlement } from '../../../../lib/server/entitlements';
import type { diagnostics, overview } from '../../../../lib/server/insights';
import type { orderDetail } from '../../../../lib/server/order-admin';
import type { ScheduledOrder } from '../../../../lib/server/scheduled-orders-repo';

export type Overview = Awaited<ReturnType<typeof overview>>;
export type Diagnostics = Awaited<ReturnType<typeof diagnostics>>;
export type OrderDetail = Awaited<ReturnType<typeof orderDetail>>;
export type { Entitlement, ScheduledOrder };

export class DashboardApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}

const APP_ORIGIN = new URL(import.meta.url).origin;
const endpoint = (path: string) => new URL(`/api/dashboard/${path}`, APP_ORIGIN);

async function send(path: string, init: RequestInit = {}, query: Record<string, string> = {}) {
  const url = endpoint(path);
  for (const [k, v] of Object.entries(query)) if (v !== '') url.searchParams.set(k, v);
  const response = await httpClient.fetchWithAuth(url.toString(), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const error = (body as { error?: { code?: string; message?: string } } | null)?.error;
    throw new DashboardApiError(error?.message ?? `Request failed (${response.status})`, error?.code ?? 'INTERNAL');
  }
  return response;
}

async function request<T>(path: string, init?: RequestInit, query?: Record<string, string>): Promise<T> {
  const response = await send(path, init, query);
  return (response.status === 204 ? null : await response.json()) as T;
}

export interface OrdersFilters {
  search?: string;
  from?: string;
  to?: string;
  method?: string[];
  scheduleStatus?: string[];
  orderStatus?: string[];
  paymentStatus?: string[];
  fulfillmentStatus?: string[];
  slotId?: string;
}

function ordersQuery(filters: OrdersFilters): Record<string, string> {
  return {
    search: filters.search ?? '',
    from: filters.from ?? '',
    to: filters.to ?? '',
    method: (filters.method ?? []).join(','),
    scheduleStatus: (filters.scheduleStatus ?? []).join(','),
    orderStatus: (filters.orderStatus ?? []).join(','),
    paymentStatus: (filters.paymentStatus ?? []).join(','),
    fulfillmentStatus: (filters.fulfillmentStatus ?? []).join(','),
    slotId: filters.slotId ?? '',
  };
}

export const api = {
  overview: () => request<Overview>('overview'),
  diagnostics: () => request<Diagnostics>('diagnostics'),
  reconcile: () =>
    request<{ expiredHolds: number; retried: Array<{ orderId: string | null; status: string }> }>('reconcile', {
      method: 'POST',
    }),

  listOrders: (filters: OrdersFilters, limit: number, cursor: number) =>
    request<{ orders: ScheduledOrder[]; nextCursor: number | null; total: number | null }>('orders', undefined, {
      ...ordersQuery(filters),
      limit: String(limit),
      cursor: String(cursor),
    }),
  getOrder: (orderId: string) => request<OrderDetail>(`orders/${encodeURIComponent(orderId)}`),
  patchOrder: (orderId: string, patch: Record<string, unknown>) =>
    request<{ order: ScheduledOrder }>(`orders/${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
  bulkStatus: (orderIds: string[], scheduleStatus: string) =>
    request<{ updated: string[]; skipped: string[] }>('orders/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ orderIds, scheduleStatus }),
    }),
  exportOrders: async (filters: OrdersFilters) => (await send('orders/export', undefined, ordersQuery(filters))).text(),

  getSettings: () => request<{ settings: Settings; entitlement: Entitlement }>('settings'),
  saveSettings: (expectedRevision: number, settings: SettingsInput) =>
    request<{ settings: Settings; entitlement: Entitlement }>('settings', {
      method: 'PUT',
      body: JSON.stringify({ expectedRevision, settings }),
    }),
  plan: () => request<Entitlement>('plan'),

  listRules: (limit: number, cursor: number, search?: string) =>
    request<{ rules: ProductRule[]; nextCursor: number | null }>('product-rules', undefined, {
      limit: String(limit),
      cursor: String(cursor),
      search: search ?? '',
    }),
  getRule: (productId: string) =>
    request<{ rule: ProductRule }>(`product-rules/${encodeURIComponent(productId)}`),
  saveRule: (rule: ProductRuleInput) =>
    request<{ rule: ProductRule }>(`product-rules/${encodeURIComponent(rule.productId)}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    }),
  deleteRule: (productId: string) =>
    request<null>(`product-rules/${encodeURIComponent(productId)}`, { method: 'DELETE' }),
};
