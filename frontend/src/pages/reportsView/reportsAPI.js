import api from '../api';
const reportsAPI = {
  getAll: (params = {}) => api.get('/reports/archives/', { params }),
  getOne: (id) => {
    if (!id) throw new Error("Report ID is required");
    return api.get(`/reports/archives/${id}/`);
  },
  create: (data) => api.post('/reports/archives/', data),
  delete: (id) => {
    if (!id) throw new Error("Report ID is required");
    return api.delete(`/reports/archives/${id}/`);
  },
  downloadCSV: (id) => {
    if (!id) throw new Error("Report ID is required");
    return api.get(`/reports/archives/${id}/download/csv/`, { responseType: 'blob' });
  },
  downloadPDF: (id) => api.get(`/reports/archives/${id}/download/pdf/`, { responseType: 'blob' }),
  downloadExcel: (id) => api.get(`/reports/archives/${id}/download/excel/`, { responseType: 'blob' }),
};

export default reportsAPI;
