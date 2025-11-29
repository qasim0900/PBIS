import api from './api';

export const countsAPI = {
  getSheets: (params) => api.get('/counts/sheets/', { params }),
  getSheet: (id) => api.get(`/counts/sheets/${id}/`),
  createSheet: (data) => api.post('/counts/sheets/', data),
  updateSheet: (id, data) => api.patch(`/counts/sheets/${id}/`, data),
  deleteSheet: (id) => api.delete(`/counts/sheets/${id}/`),
  ensureSheet: (locationId, date) => api.get('/counts/sheets/ensure_sheet/', { params: { location: locationId, date } }),
  submitSheet: (id) => api.post(`/counts/sheets/${id}/submit/`),
  getEntries: (sheetId) => api.get('/counts/entries/', { params: { sheet: sheetId } }),
  updateEntry: (id, data) => api.patch(`/counts/entries/${id}/`, data),
  getLowStock: () => api.get('/counts/entries/low_stock/'),
};

export default countsAPI;