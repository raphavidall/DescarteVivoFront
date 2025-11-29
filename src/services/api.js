import axios from 'axios';

export const BASE_URL = 'https://descarte-api.onrender.com'; 

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor: Adiciona o Token automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response, // Se der certo, só passa
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Token inválido ou expirado. Deslogando...");
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;