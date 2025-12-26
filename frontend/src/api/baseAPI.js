import api from './axiosConfig';

export const createAPIService = (baseEndpoint) => {
  return {
    list: (params = {}) =>
      api.get(baseEndpoint, { params }),
    
    retrieve: (id) =>
      api.get(`${baseEndpoint}${id}/`),
    
    create: (data) =>
      api.post(baseEndpoint, data),
    
    update: (id, data) =>
      api.put(`${baseEndpoint}${id}/`, data),
    
    partialUpdate: (id, data) =>
      api.patch(`${baseEndpoint}${id}/`, data),
    
    delete: (id) =>
      api.delete(`${baseEndpoint}${id}/`),
    
    action: (id, actionName, method = 'post', data = null) => {
      const url = `${baseEndpoint}${id}/${actionName}/`;
      return method.toLowerCase() === 'post' ? api.post(url, data) : api.get(url);
    },
  };
};

export default api;
