// services/countsAPI.js

import api from './api';

const countsAPI = {
  // 1. ENSURE SHEET (CREATE OR GET) — POST karna hai!
  ensureSheet: async (locationId, date, frequency = 'weekly') => {
    return await api.post('/counts/sheets/', {
      location_id: parseInt(locationId),
      frequency,
      count_date: date,
      include_entries: true,
    });
  },

  // 2. GET SHEETS IN RANGE — date range filter
  getSheetsInRange: (locationId, startDate, endDate) => {
    return api.get('/counts/sheets/', {
      params: {
        location: locationId,
        count_date__gte: startDate,
        count_date__lte: endDate,
        ordering: '-count_date', // latest first
      }
    });
  },

  getEntries: (sheetId, page = 1, page_size = 10) => api.get('/counts/entries/', { params: { sheet: sheetId, page, page_size } }),
  
  updateEntry: (id, data) => api.patch(`/counts/entries/${id}/`, data),
  
  submitSheet: (id, note = '') => api.post(`/counts/sheets/${id}/submit/`, { note }),
};

export default countsAPI;