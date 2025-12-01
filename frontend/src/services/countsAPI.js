// services/countsAPI.js

import api from './api';       // your axios instance
import axios from 'axios';     // needed for absolute calls (if api is baseURL)

const countsAPI = {

  /** -------------------------------------------
   * 1. ENSURE SHEET (CREATE OR GET)
   * POST /counts/sheets/
   * ------------------------------------------- */
  ensureSheet: async (locationId, date, frequency = 'weekly') => {
    return await api.post('/counts/sheets/', {
      location_id: Number(locationId),
      frequency,
      count_date: date,
      include_entries: true, // always include entries
    });
  },

  /** -------------------------------------------
   * 2. LOW STOCK ITEMS
   * GET /counts/low-stock/
   * ------------------------------------------- */
  getLowStock: () => api.get('/counts/entries/low-stock/'),

  /** -------------------------------------------
   * 3. GET SHEETS IN DATE RANGE
   * GET /counts/sheets/?location=&count_date__gte=&count_date__lte=
   * ------------------------------------------- */
  getSheetsInRange: (locationId, startDate, endDate) => {
    return api.get('/counts/sheets/', {
      params: {
        location: locationId,
        count_date__gte: startDate,
        count_date__lte: endDate,
        ordering: '-count_date',
      },
    });
  },

  /** -------------------------------------------
   * 4. ENTRIES (Paginated)
   * GET /counts/entries/?sheet=id
   * ------------------------------------------- */
  getEntries: (sheetId, page = 1, page_size = 10) =>
    api.get('/counts/entries/', {
      params: { sheet: sheetId, page, page_size },
    }),

  /** -------------------------------------------
   * 5. UPDATE ENTRY
   * PATCH /counts/entries/<id>/
   * ------------------------------------------- */
  updateEntry: (id, data) => api.patch(`/counts/entries/${id}/`, data),

  /** -------------------------------------------
   * 6. SUBMIT SHEET
   * POST /counts/sheets/<id>/submit/
   * ------------------------------------------- */
  submitSheet: (id, note = '') =>
    api.post(`/counts/sheets/${id}/submit/`, { note }),
};

export default countsAPI;
