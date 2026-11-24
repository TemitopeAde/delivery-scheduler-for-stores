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
:host{display:block;min-width:0}
.ds{--ds-bg:#fff;--ds-text:#202624;--ds-border:#dce1de;--ds-accent:#245c45;--ds-accent-text:#fff;--ds-radius:8px;--ds-space:16px;--ds-font:Arial,sans-serif;--ds-size:14px;--ds-weight:400;--ds-soft:color-mix(in srgb,var(--ds-text) 4%,var(--ds-bg));position:relative;container-type:inline-size;background:var(--ds-bg);color:var(--ds-text);font-family:var(--ds-font);font-size:var(--ds-size);font-weight:var(--ds-weight);line-height:1.5;padding:var(--ds-space) 0}
.ds *{box-sizing:border-box;font-family:inherit}
.ds-dialog{box-sizing:border-box;width:min(720px,calc(100% - 24px));max-height:calc(100dvh - 24px);padding:16px;border:1px solid var(--ds-border,#dce1de);border-radius:var(--ds-radius,8px);background:var(--ds-bg,#fff);color:var(--ds-text,#202624);overflow:auto;overscroll-behavior:contain}
.ds-dialog::backdrop{background:rgb(0 0 0 / .45)}
.ds-dialog > .ds-close{display:flex;margin-inline-start:auto;align-items:center;justify-content:center}
.ds-icon{display:inline-flex;align-items:center;justify-content:center;padding:10px;flex-shrink:0}
.ds-icon .ds-spinner{margin:0}
.ds-open{background:var(--ds-accent);color:var(--ds-accent-text);align-self:flex-start}
.ds-inner{display:flex;flex-direction:column;gap:var(--ds-space);min-width:0}
.ds-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.ds-title{margin:0;font-size:1.2em;font-weight:700;letter-spacing:-.02em}
.ds-tag{font-size:.75em;font-weight:600;padding:4px 8px;background:var(--ds-soft);border:1px solid var(--ds-border);border-radius:var(--ds-radius)}
.ds-muted{margin:0;font-size:.875em;color:color-mix(in srgb,var(--ds-text) 78%,var(--ds-bg));overflow-wrap:anywhere}
.ds fieldset{border:0;margin:0;padding:0;min-width:0}
.ds legend,.ds-section-label{font-size:.875em;font-weight:600;margin:0 0 12px;padding:0}
.ds-row{display:flex;flex-wrap:wrap;gap:8px}
.ds-methods{display:flex;gap:8px;padding:4px;background:var(--ds-soft);border:1px solid var(--ds-border);border-radius:var(--ds-radius)}
.ds-methods .ds-btn{flex:1;border-color:transparent}
.ds-methods .ds-btn[aria-pressed="true"]{background:var(--ds-bg)}
.ds-btn{min-height:44px;min-width:44px;padding:10px 16px;border:1px solid var(--ds-border);border-radius:var(--ds-radius);background:var(--ds-bg);color:inherit;cursor:pointer;font-size:1em;line-height:1.4;overflow-wrap:anywhere;transition:background .15s,border-color .15s}
.ds-btn:focus-visible,.ds-day:focus-visible,.ds-link:focus-visible{outline:2px solid var(--ds-accent);outline-offset:3px}
.ds-btn[aria-checked="true"],.ds-btn[aria-pressed="true"]{border-color:var(--ds-accent);box-shadow:inset 0 0 0 1px var(--ds-accent);font-weight:700}
.ds-filled .ds-btn[aria-checked="true"],.ds-filled .ds-btn[aria-pressed="true"]{background:var(--ds-accent);color:var(--ds-accent-text)}
.ds-btn[aria-disabled="true"]{cursor:not-allowed;opacity:.45}
.ds-link{background:none;border:0;color:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer;min-height:44px;padding:0 4px;font-size:.875em}
.ds-picker{display:grid;gap:var(--ds-space);min-width:0}
.ds-cal{border:1px solid var(--ds-border);border-radius:var(--ds-radius);padding:12px;min-width:0}
.ds-cal-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}
.ds-cal-head .ds-btn{padding:0;font-size:1.5em;background:transparent;border-color:transparent}
.ds-cal-title{font-weight:600}
.ds-grid{width:100%;border-collapse:collapse;table-layout:fixed}
.ds-grid th{font-size:.75em;font-weight:500;padding:8px 0;color:color-mix(in srgb,var(--ds-text) 70%,var(--ds-bg))}
.ds-grid td{padding:2px;text-align:center}
.ds-day{position:relative;width:100%;min-height:44px;padding:0;border:1px solid transparent;border-radius:var(--ds-radius);background:transparent;color:inherit;cursor:pointer;font-size:.95em}
.ds-day[aria-disabled="true"]{cursor:not-allowed;opacity:.35}
.ds-day.is-available{background:var(--ds-soft);font-weight:500}
.ds-day[aria-selected="true"]{background:var(--ds-accent);color:var(--ds-accent-text);border-color:var(--ds-accent);font-weight:700;box-shadow:inset 0 0 0 2px var(--ds-bg)}
.ds-day.is-today:after{content:'';position:absolute;bottom:4px;inset-inline-start:calc(50% - 2px);width:4px;height:4px;border-radius:50%;background:currentColor}
.ds[dir="rtl"] .ds-cal-head .ds-btn{transform:scaleX(-1)}
.ds fieldset.ds-slot-panel{padding:16px;background:var(--ds-soft);border-radius:var(--ds-radius)}
.ds-slot-panel legend{float:inline-start;width:100%}
.ds-slot-date{display:block;font-weight:400;margin-top:4px;font-size:.95em}
.ds-slots{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr));gap:8px;clear:both}
.ds-slots .ds-btn{text-align:start;font-size:.9em}
.ds-slot-sub{display:block;font-size:.85em;margin-top:4px}
.ds-context{display:flex;flex-direction:column;gap:4px;border-top:1px solid var(--ds-border);padding-top:12px}
.ds-alert{padding:12px 16px;border-radius:var(--ds-radius);border:1px solid var(--ds-border);background:var(--ds-soft);font-size:.9em}
.ds-alert[data-tone="error"]{border-inline-start:3px solid #b3261e}
.ds-summary{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:16px;border:1px solid var(--ds-accent);border-radius:var(--ds-radius);background:color-mix(in srgb,var(--ds-accent) 5%,var(--ds-bg))}
.ds-summary-copy{display:flex;align-items:center;gap:12px;font-weight:600;flex:1;min-width:0;overflow-wrap:anywhere}
.ds-check{display:grid;place-items:center;flex:0 0 28px;height:28px;background:var(--ds-accent);color:var(--ds-accent-text);border-radius:50%;font-size:16px}
.ds-summary .ds-row{margin-inline-start:auto}
.ds-loading-overlay{position:absolute;inset:0;z-index:2;display:grid;place-items:center;background:var(--ds-bg);cursor:wait}
.ds-loading-overlay .ds-spinner{width:1.5em;height:1.5em;margin:0}
.ds-placeholder{min-height:280px;border:1px solid var(--ds-border);border-radius:var(--ds-radius)}
.ds-spinner{display:inline-block;width:1em;height:1em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:ds-spin .8s linear infinite;vertical-align:-2px;margin-inline-end:6px}
.ds-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@container (min-width:580px){.ds-picker:has(.ds-slot-panel){grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);align-items:start}}
@container (max-width:340px){.ds-cal{padding:8px}.ds-grid td{padding:1px}.ds-btn{padding-inline:10px}.ds fieldset.ds-slot-panel{padding:12px}}
@media (hover:hover){.ds-btn:not([aria-disabled="true"]):hover,.ds-day.is-available:not([aria-selected="true"]):hover{border-color:var(--ds-accent);background:color-mix(in srgb,var(--ds-accent) 10%,var(--ds-bg))}.ds-filled .ds-btn[aria-pressed="true"]:hover{background:var(--ds-accent)}}
@keyframes ds-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.ds-spinner{animation:none}.ds-btn{transition:none}}
`;
