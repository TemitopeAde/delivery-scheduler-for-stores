import type { Appearance } from '../lib/schemas';

export interface SlotBrand {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  selectionColor: string;
  cornerRadius: number;
}

const HEX = /^#[0-9a-fA-F]{3,8}$/;
const safeColor = (value: string | undefined, fallback: string) =>
  value && HEX.test(value) ? value : fallback;

/**
 * Theme variables. Merchant colours (validated hex) win when enabled; otherwise
 * the checkout's own brand is used so the widget matches a themed checkout.
 */
export function themeVariables(appearance: Appearance, brand: SlotBrand | null): string {
  const custom = appearance.useCustomColors || !brand;
  const text = custom ? appearance.textColor : safeColor(brand.textColor, appearance.textColor);
  const bg = custom ? appearance.backgroundColor : safeColor(brand.backgroundColor, appearance.backgroundColor);
  const accent = custom ? appearance.accentColor : safeColor(brand.buttonColor, appearance.accentColor);
  const accentText = custom
    ? appearance.accentTextColor
    : safeColor(brand.buttonTextColor, appearance.accentTextColor);
  const radius = custom ? appearance.borderRadius : Math.max(0, Math.min(24, Number(brand.cornerRadius) || 0));
  return [
    `--ds-text:${text}`,
    `--ds-bg:${bg}`,
    `--ds-border:${appearance.borderColor}`,
    `--ds-accent:${accent}`,
    `--ds-accent-text:${accentText}`,
    `--ds-radius:${radius}px`,
    `--ds-space:${appearance.spacing}px`,
    `--ds-font:'${appearance.fontFamily}',Arial,sans-serif`,
    `--ds-size:${appearance.fontSize}px`,
    `--ds-weight:${appearance.fontWeight}`,
  ].join(';');
}

export const WIDGET_CSS = `
:host{display:block}
.ds{background:var(--ds-bg);color:var(--ds-text);font-family:var(--ds-font);font-size:var(--ds-size);font-weight:var(--ds-weight);line-height:1.4;padding:var(--ds-space) 0}
.ds *{box-sizing:border-box;font-family:inherit}
.ds-inner{display:flex;flex-direction:column;gap:var(--ds-space)}
.ds-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}
.ds-title{margin:0;font-size:1.1em;font-weight:700}
.ds-tag{font-size:.8em;opacity:.8}
.ds-muted{margin:0;font-size:.875em;opacity:.85}
.ds fieldset{border:0;margin:0;padding:0;min-width:0}
.ds legend{font-weight:600;margin-bottom:6px;padding:0}
.ds-row{display:flex;flex-wrap:wrap;gap:8px}
.ds-btn{min-height:44px;min-width:44px;padding:8px 14px;border:1px solid var(--ds-border);border-radius:var(--ds-radius);background:transparent;color:inherit;cursor:pointer;font-size:1em}
.ds-btn:focus-visible,.ds-day:focus-visible{outline:3px solid var(--ds-accent);outline-offset:2px}
.ds-btn[aria-checked="true"],.ds-btn[aria-pressed="true"]{border-color:var(--ds-accent);box-shadow:inset 0 0 0 1px var(--ds-accent);font-weight:700}
.ds-filled .ds-btn[aria-checked="true"],.ds-filled .ds-btn[aria-pressed="true"]{background:var(--ds-accent);color:var(--ds-accent-text)}
.ds-btn[aria-disabled="true"]{cursor:not-allowed;opacity:.55;text-decoration:line-through}
.ds-link{background:none;border:0;color:inherit;text-decoration:underline;cursor:pointer;min-height:44px;padding:0 4px;font-size:1em}
.ds-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.ds-cal-title{font-weight:600}
.ds-grid{width:100%;border-collapse:collapse;table-layout:fixed}
.ds-grid th{font-size:.75em;font-weight:600;padding:4px 0;opacity:.8}
.ds-grid td{padding:2px;text-align:center}
.ds-day{width:100%;min-height:44px;border:1px solid transparent;border-radius:var(--ds-radius);background:transparent;color:inherit;cursor:pointer;font-size:1em}
.ds-day[aria-disabled="true"]{cursor:not-allowed;opacity:.4;text-decoration:line-through}
.ds-day.is-available{border-color:var(--ds-border)}
.ds-day[aria-selected="true"]{background:var(--ds-accent);color:var(--ds-accent-text);border-color:var(--ds-accent);font-weight:700}
.ds-day.is-today{text-decoration:underline}
.ds-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.ds-slot-sub{display:block;font-size:.8em;opacity:.85}
.ds-alert{padding:10px 12px;border-radius:var(--ds-radius);border:1px solid var(--ds-border)}
.ds-alert[data-tone="error"]{border-color:#b3261e}
.ds-summary{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;border:1px solid var(--ds-accent);border-radius:var(--ds-radius)}
.ds-spinner{display:inline-block;width:1em;height:1em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:ds-spin .8s linear infinite;vertical-align:-2px;margin-inline-end:6px}
.ds-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@keyframes ds-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.ds-spinner{animation:none}}
`;
