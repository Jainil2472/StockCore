// Set VITE_API_BASE_URL in Vercel for production. The fallback keeps local development working.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
