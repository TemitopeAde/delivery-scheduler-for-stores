import { SETTINGS_SCHEMA_VERSION } from './constants';
import type { Settings, SettingsInput, WeekHours } from './schemas';

const weekdayHours = (start: string, end: string): WeekHours => ({
  mon: [{ start, end }],
  tue: [{ start, end }],
  wed: [{ start, end }],
  thu: [{ start, end }],
  fri: [{ start, end }],
  sat: [],
  sun: [],
});

export const DEFAULT_SETTINGS_INPUT: SettingsInput = {
  enabled: false,
  requiredMode: 'all',
  timezone: 'UTC',
  delivery: {
    enabled: true,
    workingHours: weekdayHours('09:00', '17:00'),
    blockedDates: [],
    dateOverrides: [],
    dailyCapacity: 0,
    note: '',
  },
  pickup: {
    enabled: false,
    workingHours: weekdayHours('10:00', '16:00'),
    blockedDates: [],
    dateOverrides: [],
    dailyCapacity: 0,
    locationName: '',
    locationAddress: '',
    instructions: '',
  },
  minNoticeMinutes: 24 * 60,
  maxDaysAhead: 14,
  sameDayEnabled: false,
  cutoff: { enabled: false, time: '14:00' },
  slots: {
    mode: 'timeslots',
    durationMinutes: 120,
    intervalMinutes: 120,
    bufferMinutes: 0,
    defaultCapacity: 0,
    labels: {},
  },
  blockedDates: [],
  holidayRules: [],
  vacationRanges: [],
  holdMinutes: 30,
  appearance: {
    fontFamily: 'Arial',
    fontSize: 15,
    fontWeight: 400,
    textColor: '#1f1f1f',
    backgroundColor: '#ffffff',
    borderColor: '#c9c9c9',
    accentColor: '#116dff',
    accentTextColor: '#ffffff',
    borderRadius: 6,
    spacing: 12,
    slotStyle: 'outline',
    useCustomColors: false,
  },
  translations: {
    defaultLocale: 'en',
    dateStyle: 'full',
    hourCycle: 'h12',
    overrides: {},
  },
  notificationSettings: {
    customerScheduled: true,
    merchantNewOrder: true,
    scheduleChanged: true,
    needsReview: true,
    upcomingSummary: false,
    merchantEmail: '',
  },
};

export const DEFAULT_SETTINGS: Settings = {
  ...DEFAULT_SETTINGS_INPUT,
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  settingsRevision: 0,
  configured: false,
  updatedAt: null,
};
