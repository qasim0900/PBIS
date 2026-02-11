import api from "./axiosConfig";

// -------------------------
// :: Auth APIs
// -------------------------

/*
Handles authentication-related API calls including login,
token refresh, and fetching the currently authenticated user.
*/

export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  refresh: (data) => api.post('/auth/refresh/', data),
  me: () => api.get('/auth/me/'),
};

// -------------------------
// :: Users APIs
// -------------------------

/*
Provides user management endpoints such as listing users,
registering a new user, retrieving user details,
and updating user information.
*/

export const usersAPI = {
  list: () => api.get("/auth/users-list/"),
  register: (data) => api.post("/auth/register/", data),
  retrieve: (id) => api.get(`/auth/${id}/`),
  update: (id, data) => api.put(`/auth/${id}/update/`, data),
};

// -------------------------
// :: Reports APIs
// -------------------------

/*
Exposes API methods for managing reports, including
listing all reports, creating a new report,
and updating existing reports.
*/

export const reportsAPI = {
  list: (params) => api.get("/reports/", { params }),
  create: (data) => api.post("/reports/", data),
  update: (id, data) => api.put(`/reports/${id}/`, data),
  patch: (id, data) => api.patch(`/reports/${id}/`, data),
  delete: (data) => api.post(`/reports/delete/`, data),
  hide: (id) => api.post(`/reports/${id}/hide/`),
};


// -------------------------
// :: Vendors APIs
// -------------------------

/*
Handles vendor-related operations such as listing vendors,
creating a vendor, retrieving vendor details,
updating vendor information, and deleting vendors.
*/

export const vendorsAPI = {
  list: () => api.get("/vendors/"),
  create: (data) => api.post("/vendors/create/", data),
  retrieve: (id) => api.get(`/vendors/${id}/`),
  update: (id, data) => api.put(`/vendors/${id}/update/`, data),
  patch: (id, data) => api.patch(`/vendors/${id}/update/`, data),
  remove: (id) => api.delete(`/vendors/${id}/delete/`),
};

// -------------------------
// :: Brands APIs
// -------------------------

/*
Handles brand-related operations such as listing brands,
creating a brand, retrieving brand details,
updating brand information, and deleting brands.
*/

export const brandsAPI = {
  list: () => api.get("/brands/"),
  create: (data) => api.post("/brands/create/", data),
  retrieve: (id) => api.get(`/brands/${id}/`),
  update: (id, data) => api.put(`/brands/${id}/update/`, data),
  patch: (id, data) => api.patch(`/brands/${id}/update/`, data),
  remove: (id) => api.delete(`/brands/${id}/delete/`),
};


// -------------------------
// :: Locations APIs
// -------------------------

/*
Provides endpoints for managing locations, including
fetching all locations, creating a new location,
and updating existing location records.
*/

export const locationsAPI = {
  list: () => api.get("/locations/"),
  create: (data) => api.post("/locations/create/", data),
  update: (id, data) => api.put(`/locations/${id}/update/`, data),
  patch: (id, data) => api.patch(`/locations/${id}/update/`, data),
};
// -------------------------
// :: Inventory APIs
// -------------------------

/*
Manages inventory items by providing endpoints for
listing items, creating new inventory records,
retrieving item details, updating items,
and deleting inventory entries.
*/

export const inventoryAPI = {
  list: () => api.get("/inventory-items/"),
  create: (data) => api.post("/inventory-items/create/", data),
  retrieve: (id) => api.get(`/inventory-items/${id}/`),
  update: (id, data) => api.put(`/inventory-items/${id}/update/`, data),
  patch: (id, data) => api.patch(`/inventory-items/${id}/update/`, data),
  remove: (id) => api.delete(`/inventory-items/${id}/delete/`),
};

// -------------------------
// :: Frequencies APIs
// -------------------------

/*
Contains API methods for frequency management,
including listing available frequencies,
creating new frequencies, and updating frequency records.
*/

export const frequenciesAPI = {
  list: () => api.get("/frequencies/"),
  create: (data) => api.post("/frequencies/create/", data),
  update: (id, data) => api.put(`/frequencies/${id}/update/`, data),
  patch: (id, data) => api.patch(`/frequencies/${id}/update/`, data),
};

// -------------------------
// :: Count Entries APIs
// -------------------------

/*
Handles count entry operations such as listing entries,
creating new count entries, retrieving entry details,
updating existing entries, and deleting count records.
*/

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

// -----------------------------
// :: Exports Individual APIs
// -----------------------------

/*
This exports all individual API service objects as a single default export,
allowing any part of the application to import and access
all backend endpoints from one centralized module.
*/

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
