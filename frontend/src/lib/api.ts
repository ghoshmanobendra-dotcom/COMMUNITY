
// Use environment variable or fallback to proxy path
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper to get the full API URL for a given endpoint.
 * usage: getApiUrl('/users') -> 'https://community-backend-ovxv.onrender.com/users' (or /api/users via proxy)
 */
export const getApiUrl = (endpoint: string) => {
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${path}`;
};
