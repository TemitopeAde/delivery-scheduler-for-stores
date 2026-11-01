import React, { useEffect } from 'react';
import { Accordion, Box, Button, Card } from '@wix/design-system';
import { SettingsPage, useSettingsPage, useSettingsPageContext } from '@wix/patterns';
import { useController, useForm } from '@wix/patterns/form';
import { DEFAULT_SETTINGS_INPUT } from '../../../../../lib/defaults';
import { settingsInputSchema, type Settings, type SettingsInput } from '../../../../../lib/schemas';
import { api, type Entitlement } from '../dashboard-api';
import { SectionTabs } from '../SectionTabs';
import { AppearanceSection } from './AppearanceSection';
import { ClosuresSection } from './ClosuresSection';
import { GeneralSection } from './GeneralSection';
import { MethodSection } from './MethodSection';
import { NotificationsSection } from './NotificationsSection';
import { PlanCard } from './PlanCard';
import { ScheduleSection } from './ScheduleSection';
import { WidgetPreview } from './WidgetPreview';
import { useDashboardI18n } from '../LanguageContext';

type Loaded = { settings: Settings; entitlement: Entitlement };
type SettingsForm = { settings: SettingsInput };

function toInput(settings: Settings): SettingsInput {
  const { schemaVersion: _v, settingsRevision: _r, configured, updatedAt: _u, ...input } = settings;
  if (!configured && input.timezone === 'UTC') {
    return { ...input, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' };
  }
  return input;
}

class SettingsValidationError extends Error {}

export const SettingsPageView = () => {
  const form = useForm<SettingsForm>();
  const loaded = React.useRef<Loaded | null>(null);
  const { t, setLocale } = useDashboardI18n();

  useEffect(() => {
    const handleLocaleChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const newLocale = customEvent.detail;
      if (newLocale) {
        const current = form.getValues().settings;
        if (current && current.translations.defaultLocale !== newLocale) {
          form.setValue('settings.translations.defaultLocale', newLocale);
        }
      }
    };
    window.addEventListener('ds-locale-changed', handleLocaleChange);
    return () => window.removeEventListener('ds-locale-changed', handleLocaleChange);
  }, [form]);

  const state = useSettingsPage<Loaded, SettingsForm>({
    form,
    fetch: async () => {
      const result = await api.getSettings();
      loaded.current = result;
      form.reset({ settings: toInput(result.settings) });
      return { settings: result };
    },
    onSave: async () => {
      const parsed = settingsInputSchema.safeParse(form.getValues().settings);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        throw new SettingsValidationError(
          issue ? `${issue.path.join(' › ') || 'Settings'}: ${issue.message}` : t('settings.saveError'),
        );
      }
      const revision = loaded.current?.settings.settingsRevision ?? 0;
      const result = await api.saveSettings(revision, parsed.data);
      loaded.current = result;
      form.reset({ settings: toInput(result.settings) });
      if (result.settings.translations.defaultLocale) {
        void setLocale(result.settings.translations.defaultLocale as any);
      }
    },
    onCancel: async () => {
      if (loaded.current) form.reset({ settings: toInput(loaded.current.settings) });
    },
    saveSuccessToast: t('settings.saveSuccess'),
    saveErrorToast: (err, { retry }) => ({
      message: err instanceof Error ? err.message : t('settings.saveError'),
      ...(err instanceof SettingsValidationError ? {} : { action: { text: t('common.retry'), onClick: retry } }),
    }),
  });

  return (
    <SettingsPage state={state}>
      <SettingsPage.Header title={{ text: t('settings.title') }} subtitle={{ text: t('settings.subtitle') }} />
      <SettingsPage.Content>
        <SettingsPage.MainContent>
          <SectionTabs />
          <SettingsSections />
        </SettingsPage.MainContent>
        <SettingsPage.AdditionalContent>
          <PreviewAndPlan />
        </SettingsPage.AdditionalContent>
      </SettingsPage.Content>
    </SettingsPage>
  );
};

const useSettingsField = () => {
  const page = useSettingsPageContext<Loaded, SettingsForm>();
  const { field } = useController({
    name: 'settings',
    control: page.form.control,
    defaultValue: page.settings ? toInput(page.settings.settings) : DEFAULT_SETTINGS_INPUT,
  });
  return { page, field };
};

const SettingsSections = () => {
  const { page, field } = useSettingsField();
  const { t } = useDashboardI18n();
  const value = field.value;
  const plan = page.settings?.entitlement.plan ?? 'basic';
  const update = (patch: Partial<SettingsInput>) => field.onChange({ ...value, ...patch });
  const props = { value, update, plan };

  return (
    <Card>
      <Accordion
        multiple
        items={[
          { title: t('settings.general'), initiallyOpen: true, children: <GeneralSection {...props} /> },
          { title: t('settings.schedule'), children: <ScheduleSection {...props} /> },
          { title: t('settings.closures'), children: <ClosuresSection {...props} /> },
          { title: t('settings.delivery'), children: <MethodSection {...props} method="delivery" /> },
          { title: t('settings.pickup'), children: <MethodSection {...props} method="pickup" /> },
          { title: t('settings.notifications'), children: <NotificationsSection {...props} /> },
          { title: t('settings.appearance'), children: <AppearanceSection {...props} /> },
          {
            title: t('settings.reset'),
            subtitle: t('settings.resetSubtitle'),
            children: (
              <Button priority="secondary" onClick={() => field.onChange({ ...DEFAULT_SETTINGS_INPUT, timezone: value.timezone })}>
                {t('settings.resetButton')}
              </Button>
            ),
          },
        ]}
      />
    </Card>
  );
};

const PreviewAndPlan = () => {
  const { page, field } = useSettingsField();
  const { t } = useDashboardI18n();
  return (
    <Box direction="vertical" gap="SP4">
      <Card>
        <Card.Header title={t('settings.previewTitle')} />
        <Card.Divider />
        <Card.Content>
          <WidgetPreview value={field.value} />
        </Card.Content>
      </Card>
      <Card>
        <Card.Header title={t('settings.planTitle')} />
        <Card.Divider />
        <Card.Content>
          <PlanCard entitlement={page.settings?.entitlement ?? null} />
        </Card.Content>
      </Card>
    </Box>
  );
};
