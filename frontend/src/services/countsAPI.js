// src/services/countsAPI.js
import api from './api';

const countsAPI = {
  // 1. Aaj ka sheet create/get karo + entries saath mein lao
  getTodaySheet: async (locationId, frequency = 'weekly') => {
    return api.get('/counts/sheets/today/', {
      params: {
        location: locationId,
        frequency: frequency,
        include_entries: true,     // ← Yeh zaroori hai!
      },
    });
  },

  // 2. Ya phir manually create karo (agar today/ endpoint nahi use karna)
  ensureSheet: async (locationId, frequency = 'weekly', includeEntries = true) => {
    return api.post('/counts/sheets/', {
      location_id: Number(locationId),
      frequency,
      include_entries: includeEntries,   // ← yeh snake_case mein bhejo
    });
  },

  // 3. Sheet ki full details (entries ke saath)
  getSheetDetail: (sheetId) => {
    return api.get(`/counts/sheets/${sheetId}/`, {
      params: { include_entries: true },   // ← Har baar daalo!
    });
  },

  // 4. Entries alag se fetch karo (sheetId ke basis par)
  getEntries: (sheetId, options = {}) => {
    return api.get('/counts/entries/', {
      params: {
        sheet: sheetId,
        include_inactive: false,   // default false rakhna better hai
        ...options,
      },
    });
  },

  // 5. Sheet submit karo
  submitSheet: (sheetId, note = '') => {
    return api.post(`/counts/sheets/${sheetId}/submit/`, { note });
  },

  // 6. Reset sheet (manager only)
  resetSheet: (sheetId) => {
    return api.post(`/counts/sheets/${sheetId}/reset/`);
  },

  // 7. Low stock items
  getLowStock: (includeNear = false) => {
    return api.get('/counts/entries/low-stock/', {
      params: {
        include_near: includeNear ? '1' : undefined,
      },
    });
  },

  getSheets: (params = {}) => {
    const defaultParams = {
      ordering: '-count_date',
      include_entries: true,   
    };
    return api.get('/counts/sheets/', {
      params: { ...defaultParams, ...params },
    });
  },
};

export default countsAPI;