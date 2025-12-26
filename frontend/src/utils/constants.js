export const FREQUENCIES = [
  { label: 'Mon & Wed', value: 'mon_wed' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Bi-Weekly', value: 'biweekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Semi-Annual', value: 'semiannual' },
];

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const INVENTORY_STATUS = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  OK: 'ok',
};

export const SHEET_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  ARCHIVED: 'archived',
};

export const API_ENDPOINTS = {
  COUNTS: '/counts/sheets/',
  ENTRIES: '/counts/entries/',
  LOCATIONS: '/locations/',
  CATALOG: '/inventory/items/',
  OVERRIDES: '/locations/overrides/',
  REPORTS: '/reports/',
};

export default {
  FREQUENCIES,
  NOTIFICATION_TYPES,
  INVENTORY_STATUS,
  SHEET_STATUS,
  API_ENDPOINTS,
};
