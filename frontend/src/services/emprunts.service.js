import api from './api';

export const emprunter      = (id_livre) => api.post('/emprunts', { id_livre });
export const retourner      = (id)       => api.put(`/emprunts/${id}/retour`);
export const getMesEmprunts = ()         => api.get('/emprunts/mes-emprunts');
export const getAllEmprunts  = ()         => api.get('/emprunts');
