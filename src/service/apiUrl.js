// BASE URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL
console.log("🚀 ~ BASE_URL:", BASE_URL)

// API URL
const API_URL = `${BASE_URL}/api/v1`;

// AUTHENTICATION URL
export const REGISTER_URL = `${API_URL}/auth/register`;
export const SIGNIN_URL = `${API_URL}/auth/login`;
export const SIGN_OUT_URL = `${API_URL}/auth/logout`;
export const REFRESH_TOKEN_URL = `${API_URL}/auth/refresh-token`;
export const PROFILE_URL = `${API_URL}/auth/profile`;
export const CHANGE_PASSWORD_URL = `${API_URL}/auth/change-password`;

// USER URL
export const USERS_URL = `${API_URL}/users`;