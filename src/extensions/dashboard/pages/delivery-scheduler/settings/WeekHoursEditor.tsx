import React from 'react';
import { Box, IconButton, Input, Text, TextButton } from '@wix/design-system';
import { Add, Delete } from '@wix/wix-ui-icons-common/lazy';
import { WEEKDAYS, type TimeInterval, type WeekHours, type Weekday } from '../../../../../lib/schemas';

const DAY_LABELS: Record<Weekday, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

/** Opening hours per weekday as HH:mm ranges; the server validates every range with Zod. */
export const WeekHoursEditor = ({
  value,
  onChange,
}: {
  value: WeekHours;
  onChange: (next: WeekHours) => void;
}) => {
  const setDay = (day: Weekday, intervals: TimeInterval[]) => onChange({ ...value, [day]: intervals });
  return (
    <Box direction="vertical" gap="SP3">
      {WEEKDAYS.map((day) => {
        const intervals = value[day];
        return (
          <Box key={day} gap="SP3" verticalAlign="top">
            <Box width="100px" paddingTop="SP1">
              <Text size="small" weight="bold">{DAY_LABELS[day]}</Text>
            </Box>
            <Box direction="vertical" gap="SP2">
              {intervals.length === 0 && <Text size="small" secondary>Closed</Text>}
              {intervals.map((interval, index) => (
                <Box key={index} gap="SP2" verticalAlign="middle">
                  <Box width="90px">
                    <Input
                      size="small"
                      value={interval.start}
                      placeholder="09:00"
                      ariaLabel={`${DAY_LABELS[day]} opening time ${index + 1}`}
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
                      ariaLabel={`${DAY_LABELS[day]} closing time ${index + 1}`}
                      onChange={(e) =>
                        setDay(day, intervals.map((x, i) => (i === index ? { ...x, end: e.target.value } : x)))
                      }
                    />
                  </Box>
                  <IconButton
                    size="small"
                    ariaLabel={`Remove ${DAY_LABELS[day]} hours ${index + 1}`}
                    onClick={() => setDay(day, intervals.filter((_, i) => i !== index))}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              {intervals.length < 6 && (
                <TextButton
                  size="small"
                  prefixIcon={<Add />}
                  onClick={() => setDay(day, [...intervals, { start: '09:00', end: '17:00' }])}
                >
                  Add hours
                </TextButton>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
