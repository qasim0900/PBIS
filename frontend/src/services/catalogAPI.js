import api from './api';

/**
 * Converts an object to FormData, handling booleans and nested objects
 */
const toFormData = (data) => {
  const formData = new FormData();

  const appendValue = (key, value) => {
    if (value === null || value === undefined) return;
    if (typeof value === 'boolean') value = value ? 'true' : 'false'; // Django requires strings for booleans
    else if (typeof value === 'object' && !(value instanceof File)) value = JSON.stringify(value); // nested objects
    formData.append(key, value);
  };

  Object.entries(data).forEach(([key, value]) => appendValue(key, value));

  return formData;
};

const catalogAPI = {
  /** GET all items with optional filters */
  getAll: (params = {}) => api.get('/catalog/items/', { params }),

  /** GET single item */
  getOne: (id) => api.get(`/catalog/items/${id}/`),

  /** POST create new item */
  create: (data) => api.post('/catalog/items/', toFormData(data)),

  /** PUT update entire item */
  update: (id, data) => api.put(`/catalog/items/${id}/`, toFormData(data)),

  /** PATCH partial update */
  patch: (id, data) => api.patch(`/catalog/items/${id}/`, toFormData(data)),

  /** DELETE item */
  delete: (id) => api.delete(`/catalog/items/${id}/`),

  /** Export catalog items to Excel */
  exportExcel: () => api.get('/catalog/items/export_excel/', { responseType: 'blob' }),

  /** Import catalog items from Excel */
  importExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/catalog/items/import_excel/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  /** Download Excel template */
  downloadTemplate: () => api.get('/catalog/items/template/', { responseType: 'blob' }),
};

export default catalogAPI;
