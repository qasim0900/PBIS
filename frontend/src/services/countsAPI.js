// services/countsAPI.js
import api from './api';

const countsAPI = {
  // 1. Ensure sheet (create today's draft or get existing)
  ensureSheet: async (locationId, frequency = null) => {
    return await api.post('/counts/sheets/', {
      location_id: Number(locationId),
      frequency,                    // snake_case: null, "weekly", "mon_wed", etc.
      include_entries: true,
    });
  },

  // 2. Get sheets by frequency (historical)
  getSheetsByFrequency: async (locationId, frequency) => {
    return await api.get('/counts/sheets/', {
      params: {
        location: locationId,
        frequency,                  // e.g., "weekly", "mon_wed"
        ordering: '-count_date',
      },
    });
  },

  // 3. Get entries for a sheet
  getEntries: (sheetId, page = 1, page_size = 1000) =>
    api.get('/counts/entries/', {
      params: { sheet: sheetId, page, page_size },
    }),
getAllSheets: (params = {}) => api.get('/counts/sheets/', { params }),
  // 4. Submit sheet
  submitSheet: (sheetId) =>
    api.post(`/counts/sheets/${sheetId}/submit/`),

  // 5. Low stock (optional)
  getLowStock: () => api.get('/counts/entries/low-stock/'),
};

export default countsAPI;