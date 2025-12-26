import { createAPIService } from './baseAPI';

export const countsAPI = createAPIService('/counts/sheets/');
export const entriesAPI = createAPIService('/counts/entries/');
export const locationsAPI = createAPIService('/locations/');
export const catalogAPI = createAPIService('/inventory/items/');
export const overridesAPI = createAPIService('/locations/overrides/');
export const reportsAPI = createAPIService('/reports/');
export const usersAPI = createAPIService('/users/');

export default {
  countsAPI,
  entriesAPI,
  locationsAPI,
  catalogAPI,
  overridesAPI,
  reportsAPI,
  usersAPI,
};
