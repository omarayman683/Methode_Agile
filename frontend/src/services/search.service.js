import api from './api';

export const searchSimple = (q)     => api.get('/search/simple', { params: { q } });
export const searchAI     = (query) => api.post('/search/ai', { query });
