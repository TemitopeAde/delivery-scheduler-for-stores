import { describe, expect, it } from 'vitest';
import {
  TARGET_LOCALES,
  LANGUAGES,
  isRtl,
  formatString,
} from '../src/lib/i18n/languages';
import {
  MESSAGES_EN,
  MESSAGE_KEYS,
  resolveMessages,
} from '../src/lib/i18n/messages';
import {
  getDashboardMessages,
  DASHBOARD_CATALOGUES,
} from '../src/lib/i18n/dashboard-messages';
import { renderPreviewHtml } from '../src/widget/preview';
import { DEFAULT_SETTINGS } from '../src/lib/defaults';

describe('Multilingual i18n support - Top 20 Languages', () => {
  it('supports exactly the top 20 languages', () => {
    expect(TARGET_LOCALES).toHaveLength(20);
    const expected = [
      'en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'tr', 'ru',
      'ja', 'ko', 'zh', 'ar', 'he', 'hi', 'sv', 'da', 'no', 'cs',
    ];
    expect([...TARGET_LOCALES]).toEqual(expected);
  });

  it('provides language metadata for all 20 languages', () => {
    for (const locale of TARGET_LOCALES) {
      const info = LANGUAGES[locale];
      expect(info).toBeDefined();
      expect(info.code).toBe(locale);
      expect(info.name).toBeTruthy();
      expect(info.nativeName).toBeTruthy();
      expect(['ltr', 'rtl']).toContain(info.dir);
    }
  });

  it('identifies RTL languages correctly', () => {
    expect(isRtl('ar')).toBe(true);
    expect(isRtl('ar-EG')).toBe(true);
    expect(isRtl('he')).toBe(true);
    expect(isRtl('he-IL')).toBe(true);
    expect(isRtl('en')).toBe(false);
    expect(isRtl('es')).toBe(false);
    expect(isRtl('fr')).toBe(false);
    expect(isRtl('de')).toBe(false);
  });

  it('provides complete customer widget catalogues for all 20 languages', () => {
    for (const locale of TARGET_LOCALES) {
      const messages = resolveMessages(locale);
      expect(messages).toBeDefined();

      for (const key of MESSAGE_KEYS) {
        expect(key in messages).toBe(true);
        if (key !== 'widget.subtitle' && key !== 'widget.helper') {
          expect(typeof messages[key]).toBe('string');
          expect(messages[key].length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('translates customer widget copy into non-English languages', () => {
    const es = resolveMessages('es');
    expect(es['widget.title']).toBe('Elige la fecha y hora de entrega o recogida');
    expect(es['method.delivery']).toBe('Entrega');
    expect(es['method.pickup']).toBe('Recogida');

    const fr = resolveMessages('fr');
    expect(fr['widget.title']).toBe('Choisissez votre heure de livraison ou de retrait');
    expect(fr['method.delivery']).toBe('Livraison');
    expect(fr['method.pickup']).toBe('Retrait');

    const de = resolveMessages('de');
    expect(de['widget.title']).toBe('Wählen Sie Ihre Liefer- oder Abholzeit');
    expect(de['method.delivery']).toBe('Lieferung');
    expect(de['method.pickup']).toBe('Abholung');

    const ar = resolveMessages('ar');
    expect(ar['widget.title']).toBe('اختر موعد التوصيل أو الاستلام');
    expect(ar['method.delivery']).toBe('توصيل');
    expect(ar['method.pickup']).toBe('استلام من المتجر');

    const ja = resolveMessages('ja');
    expect(ja['widget.title']).toBe('お届け日時または受け取り日時を選択');
    expect(ja['method.delivery']).toBe('配達・デリバリー');
    expect(ja['method.pickup']).toBe('店頭受け取り');
  });

  it('provides dashboard catalogues for all 20 languages', () => {
    for (const locale of TARGET_LOCALES) {
      const messages = getDashboardMessages(locale);
      expect(messages).toBeDefined();
      expect(messages['nav.overview']).toBeTruthy();
      expect(messages['nav.orders']).toBeTruthy();
      expect(messages['nav.settings']).toBeTruthy();
      expect(messages['settings.title']).toBeTruthy();
      expect(messages['common.save']).toBeTruthy();
      expect(messages['common.cancel']).toBeTruthy();
    }
  });

  it('translates dashboard messages for multiple languages', () => {
    const es = getDashboardMessages('es');
    expect(es['nav.overview']).toBe('Resumen');
    expect(es['nav.orders']).toBe('Pedidos');
    expect(es['nav.settings']).toBe('Ajustes');
    expect(es['common.save']).toBe('Guardar');

    const fr = getDashboardMessages('fr');
    expect(fr['nav.overview']).toBe('Aperçu');
    expect(fr['nav.orders']).toBe('Commandes');
    expect(fr['nav.settings']).toBe('Paramètres');
    expect(fr['common.save']).toBe('Enregistrer');

    const de = getDashboardMessages('de');
    expect(de['nav.overview']).toBe('Übersicht');
    expect(de['nav.orders']).toBe('Bestellungen');
    expect(de['nav.settings']).toBe('Einstellungen');
    expect(de['common.save']).toBe('Speichern');

    const ar = getDashboardMessages('ar');
    expect(ar['nav.overview']).toBe('نظرة عامة');
    expect(ar['nav.orders']).toBe('الطلبات');
    expect(ar['common.save']).toBe('حفظ');
  });

  it('renders widget preview in different languages with proper direction', () => {
    const htmlEs = renderPreviewHtml(DEFAULT_SETTINGS, 'es');
    expect(htmlEs).toContain('Elige la fecha y hora de entrega o recogida');
    expect(htmlEs).toContain('dir="ltr"');

    const htmlAr = renderPreviewHtml(DEFAULT_SETTINGS, 'ar');
    expect(htmlAr).toContain('اختر موعد التوصيل أو الاستلام');
    expect(htmlAr).toContain('dir="rtl"');

    const htmlHe = renderPreviewHtml(DEFAULT_SETTINGS, 'he');
    expect(htmlHe).toContain('בחר מועד משלוח או איסוף עצמי');
    expect(htmlHe).toContain('dir="rtl"');
  });

  it('formats strings with named tokens correctly', () => {
    expect(formatString('Hello {name}!', { name: 'Store' })).toBe('Hello Store!');
    expect(formatString('Quedan {count}', { count: 3 })).toBe('Quedan 3');
  });
});

