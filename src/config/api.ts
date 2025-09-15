export const API_CONFIG = {
  BASE_URL: "https://ya-praktikum.tech/api/v2",
  TIMEOUT: 5000,
} as const;

export const getApiUrl = () => import.meta.env.VITE_API_URL || API_CONFIG.BASE_URL;
