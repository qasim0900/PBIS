import api from "./axiosConfig";

export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  refresh: (data) => api.post('/auth/refresh/', data),
  me: () => api.get('/auth/me/'),
};

export const usersAPI = {
  list: () => api.get("/auth/users-list/"),
  register: (data) => api.post("/auth/register/", data),
  retrieve: (id) => api.get(`/auth/${id}/`),
  update: (id, data) => api.put(`/auth/${id}/update/`, data),
};

export const reportsAPI = {
  list: (params) => api.get("/reports/", { params }),
  create: (data) => api.post("/reports/", data),
  update: (id, data) => api.put(`/reports/${id}/`, data),
  patch: (id, data) => api.patch(`/reports/${id}/`, data),
  delete: (data) => api.post(`/reports/delete/`, data),
  hide: (id) => api.post(`/reports/${id}/hide/`),
};

export const vendorsAPI = {
  list: () => api.get("/vendors/"),
  create: (data) => api.post("/vendors/create/", data),
  retrieve: (id) => api.get(`/vendors/${id}/`),
  update: (id, data) => api.put(`/vendors/${id}/update/`, data),
  patch: (id, data) => api.patch(`/vendors/${id}/update/`, data),
  remove: (id) => api.delete(`/vendors/${id}/delete/`),
};

export const brandsAPI = {
  list: () => api.get("/brands/"),
  create: (data) => api.post("/brands/create/", data),
  retrieve: (id) => api.get(`/brands/${id}/`),
  update: (id, data) => api.put(`/brands/${id}/update/`, data),
  patch: (id, data) => api.patch(`/brands/${id}/update/`, data),
  remove: (id) => api.delete(`/brands/${id}/delete/`),
};

export const locationsAPI = {
  list: () => api.get("/locations/"),
  create: (data) => api.post("/locations/create/", data),
  update: (id, data) => api.put(`/locations/${id}/update/`, data),
  patch: (id, data) => api.patch(`/locations/${id}/update/`, data),
};

export const inventoryAPI = {
  list: (params) => api.get("/inventory-items/", { params }),
  create: (data) => api.post("/inventory-items/create/", data),
  retrieve: (id) => api.get(`/inventory-items/${id}/`),
  update: (id, data) => api.put(`/inventory-items/${id}/update/`, data),
  patch: (id, data) => api.patch(`/inventory-items/${id}/update/`, data),
  remove: (id) => api.delete(`/inventory-items/${id}/delete/`),
  addStock: (id, data) => api.post(`/inventory-items/${id}/add-stock/`, data),
  updateQuantity: (id, data) => api.post(`/inventory-items/${id}/update-quantity/`, data),
  processOrder: (id, data) => api.post(`/inventory-items/${id}/process-order/`, data),
};

export const frequenciesAPI = {
  list: () => api.get("/frequencies/"),
  create: (data) => api.post("/frequencies/create/", data),
  update: (id, data) => api.put(`/frequencies/${id}/update/`, data),
  patch: (id, data) => api.patch(`/frequencies/${id}/update/`, data),
};

export const countsAPI = {
  list: () => api.get("/count-entries/"),
  create: (data) => api.post("/count-entries/create/", data),
  retrieve: (id) => api.get(`/count-entries/${id}/`),
  update: (id, data) => api.put(`/count-entries/${id}/update/`, data),
  patch: (id, data) => api.patch(`/count-entries/${id}/update/`, data),
  remove: (id) => api.delete(`/count-entries/${id}/delete/`),
  listFilter: (params) => api.get("/inventory-items/", { params }),
  listSheets: () => api.get("/count-sheets/"),
  createSheet: (data) => api.post("/count-sheets/create/", data),
  retrieveSheet: (id) => api.get(`/count-sheets/${id}/`),
  updateSheet: (id, data) => api.put(`/count-sheets/${id}/update/`, data),
  submitSheet: (id) => api.post(`/count-sheets/${id}/submit/`),
};

export default {
  authAPI,
  usersAPI,
  brandsAPI,
  countsAPI,
  reportsAPI,
  vendorsAPI,
  locationsAPI,
  inventoryAPI,
  frequenciesAPI,
};
