// services/countsAPI.js
import api from './api';

const countsAPI = {
  /**
   * Ensure a sheet exists for today or get existing draft
   * @param {number|string} locationId - Location ID
   * @param {string|null} frequency - Frequency e.g. 'weekly', 'mon_wed'
   * @param {boolean} includeEntries - Include entries in response
   * @returns {Promise} Axios response
   */
  ensureSheet: (locationId, frequency = null, includeEntries = true) =>
    api.post('/counts/sheets/', {
      location_id: Number(locationId),
      frequency,
      include_entries: includeEntries,
    }),

  /**
   * Fetch sheets by location and frequency
   * @param {number|string|null} locationId - Filter by location, optional
   * @param {string|null} frequency - Filter by frequency, optional
   * @param {object} extraParams - Additional query params
   * @returns {Promise} Axios response
   */
  getSheets: (locationId = null, frequency = null, extraParams = {}) => {
    const params = { ordering: '-count_date', ...extraParams };
    if (locationId) params.location = locationId;
    if (frequency) params.frequency = frequency;

    return api.get('/counts/sheets/', { params });
  },

  /**
   * Fetch entries for a specific sheet
   * @param {number|string} sheetId
   * @param {object} options - { page, page_size }
   * @returns {Promise} Axios response
   */
  getEntries: (sheetId, { page = 1, page_size = 1000 } = {}) =>
    api.get('/counts/entries/', { params: { sheet: sheetId, page, page_size } }),

  /**
   * Fetch all sheets (optional params for filters)
   * @param {object} params - Query params
   * @returns {Promise} Axios response
   */
  getAllSheets: (params = {}) => api.get('/counts/sheets/', { params }),

  /**
   * Submit a draft sheet
   * @param {number|string} sheetId
   * @returns {Promise} Axios response
   */
  submitSheet: (sheetId) => api.post(`/counts/sheets/${sheetId}/submit/`),

  /**
   * Fetch low stock entries
   * @param {boolean} includeNearStock - Include near low items
   * @returns {Promise} Axios response
   */
  getLowStock: (includeNearStock = false) =>
    api.get('/counts/entries/low-stock/', {
      params: includeNearStock ? { include_near: 1 } : {},
    }),
};

export default countsAPI;
