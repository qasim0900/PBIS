// This file re-exports the shared axios instance from services so slices that
// mistakenly import './api' will still work. Prefer importing from
// '../services/api' directly.
import api from '../../services/api';
export default api;
