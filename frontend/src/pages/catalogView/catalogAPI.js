import api from '../api';
const toFormData = (data) => {
  const formData = new FormData();

  const appendValue = (key, value) => {
    if (value === null || value === undefined) return;
    if (typeof value === 'boolean') value = value ? 'true' : 'false';
    else if (typeof value === 'object' && !(value instanceof File)) value = JSON.stringify(value);
    formData.append(key, value);
  };

  Object.entries(data).forEach(([key, value]) => appendValue(key, value));

  return formData;
};

const catalogAPI = {
  getAll: (params = {}) => api.get('/catalog/items/', { params }),
  getOne: (id) => api.get(`/catalog/items/${id}/`),
  create: (data) => api.post('/catalog/items/', toFormData(data)),
  update: (id, data) => api.put(`/catalog/items/${id}/`, toFormData(data)),
  patch: (id, data) => api.patch(`/catalog/items/${id}/`, toFormData(data)),
  delete: (id) => api.delete(`/catalog/items/${id}/`),
  exportExcel: () => api.get('/catalog/items/export_excel/', { responseType: 'blob' }),
  importExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/catalog/items/import_excel/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  downloadTemplate: () => api.get('/catalog/items/template/', { responseType: 'blob' }),
};

export default catalogAPI;
