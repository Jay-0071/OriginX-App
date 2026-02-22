import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://mertie-transmaterial-eusebio.ngrok-free.dev";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "ngrok-skip-browser-warning": "true"
  }
});

// Auth
export const loginUser = (data: any) => api.post("/api/consent/login", data);
export const registerUser = (data: any) => api.post("/api/consent/register", data);
export const getMe = (token: string) => api.get("/api/consent/me", {
  headers: { Authorization: `Bearer ${token}` }
});

// Watermarking
export const verifyImage = (formData: FormData) => api.post("/api/watermark/verify", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

export const embedWatermark = (formData: FormData) => api.post("/api/watermark/embed", formData, {
  responseType: "blob",
  headers: { "Content-Type": "multipart/form-data" },
});

export const extractWatermark = (formData: FormData) => api.post("/api/watermark/extract", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

// Detection
export const analyzeImage = (formData: FormData) => api.post("/api/detect/analyze", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

export const checkHealth = () => api.get("/api/health");
export const getRegistry = (token: string) => api.get("/api/consent/registry", {
  headers: { Authorization: `Bearer ${token}` }
});

// Admin
export const getUsers = (token: string) => api.get("/api/admin/users", {
  headers: { Authorization: `Bearer ${token}` }
});

export const updateUserStatus = (handle: string, isActive: boolean, token: string) => api.patch(`/api/admin/users/${encodeURIComponent(handle)}/status`, { is_active: isActive }, {
  headers: { Authorization: `Bearer ${token}` }
});

export const deleteUser = (handle: string, token: string) => api.delete(`/api/admin/users/${encodeURIComponent(handle)}`, {
  headers: { Authorization: `Bearer ${token}` }
});

export default api;
