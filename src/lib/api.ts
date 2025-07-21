// Centralized API base URL logic

export const API_BASE_URL =
  typeof window !== 'undefined' && import.meta && import.meta.env && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : (typeof process !== 'undefined' && process.env.API_BASE_URL) || 'http://localhost:3001'; 