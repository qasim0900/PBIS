// src/services/countsAPI.js
import api from './api';

const countsAPI = {
  // Fetch sheets with filters
  getSheets: async (filters = {}) => {
    return api.get('/counts/sheets/', {
      params: {
        ordering: '-count_date',
        include_entries: true,
        ...filters, // location, frequency yahan se aayenge
      },
    });
  },

  // Create today's sheet (most important)
  ensureSheet: async (locationId, frequency = 'weekly') => {
    return api.post('/counts/sheets/', {
      location_id: Number(locationId),
      frequency,
      include_entries: true,
    });
  },

  // Alternative (better) — today's sheet
  getTodaySheet: async (locationId, frequency = 'weekly') => {
    return api.get('/counts/sheets/today/', {
      params: {
        location: locationId,
        frequency,
        include_entries: true,
      },
    });
  },

  // Submit sheet
  submitSheet: async (sheetId, note = '') => {
    return api.post(`/counts/sheets/${sheetId}/submit/`, { note });
  },

  // Get entries for a sheet
  getEntries: async (sheetId) => {
    return api.get('/counts/entries/', {
      params: { sheet: sheetId },
    });
  },

  // Update single entry
  updateEntry: async (entryId, data) => {
    return api.patch(`/counts/entries/${entryId}/`, data);
  },

  // Low stock
  getLowStock: async (includeNear = false) => {
    return api.get('/counts/entries/low-stock/', {
      params: includeNear ? { include_near: '1' } : {},
    });
  },
};

export default countsAPI;