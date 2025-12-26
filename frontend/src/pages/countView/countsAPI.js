import api from '../api';

const countsAPI = {
  getSheets: async (filters = {}) => {
    return api.get('/counts/sheets/', {
      params: {
        ordering: '-count_date',
        ...filters,
      },
    });
  },
  ensureSheet: async (locationId, frequency = 'weekly') => {
    if (!locationId) throw new Error("Location ID required");
    return api.post('/counts/sheets/', {
      location: Number(locationId),
      frequency,
    });
  },

  getTodaySheet: async (locationId, frequency = 'weekly') => {
    if (!locationId) throw new Error("Location ID required");
    return api.get('/counts/sheets/today/', {
      params: {
        location: Number(locationId),
        frequency,
        include_entries: true,
      },
    });
  },

  submitSheet: async (sheetId, note = '') => {
    if (!sheetId) throw new Error("Sheet ID required");
    return api.post(`/counts/sheets/${sheetId}/submit/`, { note });
  },

  getEntries: async (sheetId) => {
    return api.get('/counts/entries/', {
      params: { sheet: sheetId },
    });
  },

  updateEntry: async (entryId, data) => {
    return api.patch(`/counts/entries/${entryId}/`, data);
  },

  getLowStock: async (includeNear = false) => {
    return api.get('/counts/entries/low-stock/', {
      params: includeNear ? { include_near: '1' } : {},
    });
  },
  getOrderReport: async (sheetId) => {
  if (!sheetId) throw new Error("Sheet ID required");
  return api.get(`/counts/sheets/${sheetId}/order_report/`);
},
};

export default countsAPI;