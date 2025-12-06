// src/services/countsAPI.js
import api from './api';

const countsAPI = {
  ensureSheet: (locationId, frequency = null, includeEntries = true) =>
    api.post('/counts/sheets/', {
      location_id: Number(locationId),
      frequency,
      include_entries: includeEntries,
    }),

  getSheets: (locationId = null, frequency = null, extraParams = {}) => {
    const params = { ordering: '-count_date', ...extraParams };
    if (locationId) params.location = locationId;
    if (frequency) params.frequency = frequency;
    return api.get('/counts/sheets/', { params });
  },

  getEntries: (sheetId, options = {}) =>
    api.get('/counts/entries/', { params: { sheet: sheetId, ...options } }),

  submitSheet: (sheetId) => api.post(`/counts/sheets/${sheetId}/submit/`),

  getLowStock: (includeNear = false) =>
    api.get('/counts/entries/low-stock/', {
      params: includeNear ? { include_near: 1 } : {},
    }),
};

export default countsAPI;