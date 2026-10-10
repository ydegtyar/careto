import { useLocalStorage } from 'usehooks-ts';

export type DateFormatOption = 'ISO' | 'US' | 'EU' | 'SHORT_MONTH' | 'SYSTEM';
export type TimeFormatOption = '12H' | '24H' | 'SYSTEM';

export interface DateFormatConfig {
  id: DateFormatOption;
  label: string;
  example: string;
}

export interface TimeFormatConfig {
  id: TimeFormatOption;
  label: string;
  example: string;
}

export const DATE_FORMAT_OPTIONS: DateFormatConfig[] = [
  { id: 'SYSTEM', label: 'System Default', example: 'Default locale format' },
  { id: 'ISO', label: 'ISO 8601', example: 'YYYY-MM-DD (2026-10-10)' },
  { id: 'EU', label: 'DD/MM/YYYY', example: '10/10/2026' },
  { id: 'US', label: 'MM/DD/YYYY', example: '10/10/2026' },
  { id: 'SHORT_MONTH', label: 'Short Month', example: '31 Jan 26' },
];

export const TIME_FORMAT_OPTIONS: TimeFormatConfig[] = [
  { id: 'SYSTEM', label: 'System Default', example: 'Default locale format' },
  { id: '24H', label: '24-hour', example: '14:30' },
  { id: '12H', label: '12-hour', example: '2:30 PM' },
];

export const DATE_FORMAT_PREFERENCE_KEY = 'careto_date_format_preference';
export const TIME_FORMAT_PREFERENCE_KEY = 'careto_time_format_preference';

export const DEFAULT_DATE_FORMAT: DateFormatOption = 'SYSTEM';
export const DEFAULT_TIME_FORMAT: TimeFormatOption = 'SYSTEM';

export function useDateFormatPreference() {
  return useLocalStorage<DateFormatOption>(DATE_FORMAT_PREFERENCE_KEY, DEFAULT_DATE_FORMAT, {
    initializeWithValue: false,
  });
}

export function useTimeFormatPreference() {
  return useLocalStorage<TimeFormatOption>(TIME_FORMAT_PREFERENCE_KEY, DEFAULT_TIME_FORMAT, {
    initializeWithValue: false,
  });
}

export function formatDatePreference(
  date: Date | string | number,
  dateFormat: DateFormatOption = 'SYSTEM',
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  switch (dateFormat) {
    case 'ISO': {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    case 'EU': {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy}`;
    }
    case 'US': {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${mm}/${dd}/${yyyy}`;
    }
    case 'SHORT_MONTH': {
      const yy = String(d.getFullYear()).slice(-2);
      const mmm = d.toLocaleString('en-US', { month: 'short' });
      const dd = d.getDate();
      return `${dd} ${mmm} ${yy}`;
    }
    case 'SYSTEM':
    default:
      return d.toLocaleDateString();
  }
}

export function formatTimePreference(
  date: Date | string | number,
  timeFormat: TimeFormatOption = 'SYSTEM',
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  switch (timeFormat) {
    case '24H':
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    case '12H':
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    case 'SYSTEM':
    default:
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

export function formatDateTimePreference(
  date: Date | string | number,
  dateFormat: DateFormatOption = 'SYSTEM',
  timeFormat: TimeFormatOption = 'SYSTEM',
): string {
  const formattedDate = formatDatePreference(date, dateFormat);
  const formattedTime = formatTimePreference(date, timeFormat);
  if (!formattedDate) return '';
  return `${formattedDate} ${formattedTime}`.trim();
}
