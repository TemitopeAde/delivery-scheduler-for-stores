import React from 'react';
import { Box, IconButton, Input, Text, TextButton } from '@wix/design-system';
import { Add, Delete } from '@wix/wix-ui-icons-common/lazy';
import { WEEKDAYS, type TimeInterval, type WeekHours, type Weekday } from '../../../../../lib/schemas';
import { useDashboardI18n } from '../LanguageContext';
import type { DashboardMessageKey } from '../../../../../lib/i18n/dashboard-messages';

const DAY_KEY_MAP: Record<Weekday, DashboardMessageKey> = {
  mon: 'common.monday',
  tue: 'common.tuesday',
  wed: 'common.wednesday',
  thu: 'common.thursday',
  fri: 'common.friday',
  sat: 'common.saturday',
  sun: 'common.sunday',
};

/** Opening hours per weekday as HH:mm ranges; the server validates every range with Zod. */
export const WeekHoursEditor = ({
  value,
  onChange,
}: {
  value: WeekHours;
  onChange: (next: WeekHours) => void;
}) => {
  const { t } = useDashboardI18n();
  const setDay = (day: Weekday, intervals: TimeInterval[]) => onChange({ ...value, [day]: intervals });

  return (
    <Box direction="vertical" gap="SP3">
      {WEEKDAYS.map((day) => {
        const intervals = value[day];
        const dayLabel = t(DAY_KEY_MAP[day]);
        return (
          <Box key={day} gap="SP3" verticalAlign="top">
            <Box width="100px" paddingTop="SP1">
              <Text size="small" weight="bold">{dayLabel}</Text>
            </Box>
            <Box direction="vertical" gap="SP2">
              {intervals.length === 0 && <Text size="small" secondary>{t('settings.closed')}</Text>}
              {intervals.map((interval, index) => (
                <Box key={index} gap="SP2" verticalAlign="middle">
                  <Box width="90px">
                    <Input
                      size="small"
                      value={interval.start}
                      placeholder="09:00"
                      ariaLabel={`${dayLabel} ${index + 1}`}
                      onChange={(e) =>
                        setDay(day, intervals.map((x, i) => (i === index ? { ...x, start: e.target.value } : x)))
                      }
                    />
                  </Box>
                  <Text size="small">–</Text>
                  <Box width="90px">
                    <Input
                      size="small"
                      value={interval.end}
                      placeholder="17:00"
                      ariaLabel={`${dayLabel} ${index + 1}`}
                      onChange={(e) =>
                        setDay(day, intervals.map((x, i) => (i === index ? { ...x, end: e.target.value } : x)))
                      }
                    />
                  </Box>
                  <IconButton
                    size="small"
                    ariaLabel={`${t('settings.remove')} ${dayLabel} ${index + 1}`}
                    onClick={() => setDay(day, intervals.filter((_, i) => i !== index))}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <TextButton
                size="small"
                prefixIcon={<Add />}
                onClick={() => setDay(day, [...intervals, { start: '09:00', end: '17:00' }])}
              >
                {t('settings.addHours')}
              </TextButton>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
