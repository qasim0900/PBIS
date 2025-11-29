import api from './api';

export const catalogAPI = {
  getAll: (params) => api.get('/catalog/items/', { params }),
  getOne: (id) => api.get(`/catalog/items/${id}/`),
  create: (data) => api.post('/catalog/items/', data),
  update: (id, data) => api.put(`/catalog/items/${id}/`, data),
  patch: (id, data) => api.patch(`/catalog/items/${id}/`, data),
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