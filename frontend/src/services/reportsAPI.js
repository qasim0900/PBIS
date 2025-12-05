import api from './api';

/**
 * Reports API - Archive endpoints
 * 
 * Features:
 * - Standard CRUD
 * - Download endpoints
 * - Can be extended for filtering, pagination, or export types
 */
const reportsAPI = {
  // Fetch all archives with optional query params
  getAll: (params = {}) => api.get('/reports/archives/', { params }),

  // Fetch single archive by ID
  getOne: (id) => {
    if (!id) throw new Error("Report ID is required");
    return api.get(`/reports/archives/${id}/`);
  },

  // Create a new report archive
  create: (data) => api.post('/reports/archives/', data),

  // Delete an archive
  delete: (id) => {
    if (!id) throw new Error("Report ID is required");
    return api.delete(`/reports/archives/${id}/`);
  },

  // Custom CSV download endpoint
  downloadCSV: (id) => {
    if (!id) throw new Error("Report ID is required");
    return api.get(`/reports/archives/${id}/download/csv/`, { responseType: 'blob' });
  },

  // Placeholder for future exports (PDF, Excel)
  downloadPDF: (id) => api.get(`/reports/archives/${id}/download/pdf/`, { responseType: 'blob' }),
  downloadExcel: (id) => api.get(`/reports/archives/${id}/download/excel/`, { responseType: 'blob' }),
};

export default reportsAPI;
