import api from './axios';

export const login = (credentials: { email: string; password: string }) =>
  api.post('/auth/login', credentials).then(res => res.data);

export const register = (credentials: { email: string; password: string }) =>
  api.post('/auth/signup', credentials).then(res => res.data);

export const me = () =>
  api.get('/auth/me').then(res => res.data);

export const logoutApi = () =>
  api.post('/auth/logout').then(res => res.data); 