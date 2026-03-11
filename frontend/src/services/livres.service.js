import api from './api';

export const getLivres    = ()         => api.get('/livres');
export const getLivreById = (id)       => api.get(`/livres/${id}`);
export const createLivre  = (data)     => api.post('/livres', data);
export const updateLivre  = (id, data) => api.put(`/livres/${id}`, data);
export const deleteLivre  = (id)       => api.delete(`/livres/${id}`);
