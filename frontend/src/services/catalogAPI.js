import api from './api';

const toFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'boolean') value = value ? 'true' : 'false'; // Django requires string for booleans
    formData.append(key, value);
  });
  return formData;
};

const catalogAPI = {
  getAll: (params) => api.get('/catalog/items/', { params }),
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
