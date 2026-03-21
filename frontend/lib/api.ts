import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Cached auth token — set synchronously by AuthSync (useLayoutEffect) before any page useEffect fires.
// Falls back to async getSession() only if the cache is still empty (e.g. hot-reload edge case).
let _authToken: string | null = null;
export function setAuthToken(token: string | null) { _authToken = token; }

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = _authToken ?? ((await getSession()) as any)?.accessToken ?? null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 401: token expirado o inválido — forzar logout para evitar errores en bucle
    if (err.response?.status === 401) {
      setAuthToken(null);
      signOut({ callbackUrl: '/login' }).catch(() => {});
    }
    const message = err.response?.data?.message || err.message || 'An error occurred';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);

// ---- Auth ----
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

// ---- Deals ----
export const dealsApi = {
  create: (data: any) => api.post('/deals', data).then((r) => r.data),
  list: () => api.get('/deals').then((r) => r.data),
  get: (id: string) => api.get(`/deals/${id}`).then((r) => r.data),
  deliver: (id: string, deliveryNote?: string) =>
    api.patch(`/deals/${id}/deliver`, { deliveryNote }).then((r) => r.data),
  confirm: (id: string) => api.patch(`/deals/${id}/confirm`).then((r) => r.data),
  cancel: (id: string) => api.delete(`/deals/${id}`).then((r) => r.data),
  allAdmin: () => api.get('/deals/admin/all').then((r) => r.data),
  // Evidencias — obligatorias antes de completar el trato
  getEvidence: (dealId: string) => api.get(`/deals/${dealId}/evidence`).then((r) => r.data),
  addEvidence: (dealId: string, data: { url: string; description: string }) =>
    api.post(`/deals/${dealId}/evidence`, data).then((r) => r.data),
  // Flujo "Compra Gestionada"
  setAwaitingApproval: (dealId: string) =>
    api.patch(`/deals/${dealId}/awaiting-approval`).then((r) => r.data),
  approveService: (dealId: string) =>
    api.patch(`/deals/${dealId}/approve`).then((r) => r.data),
};

// ---- Payments ----
export const paymentsApi = {
  createIntent: (dealId: string) =>
    api.post(`/payments/deals/${dealId}/intent`).then((r) => r.data),
  confirmFunding: (dealId: string) =>
    api.post(`/payments/deals/${dealId}/confirm`).then((r) => r.data),
  releaseFunds: (dealId: string) =>
    api.post(`/payments/deals/${dealId}/release`).then((r) => r.data),
  getStatus: (dealId: string) =>
    api.get(`/payments/deals/${dealId}/status`).then((r) => r.data),
};

// ---- Disputes ----
export const disputesApi = {
  raise: (dealId: string, data: { reason: string; evidence?: string }) =>
    api.post(`/disputes/deals/${dealId}`, data).then((r) => r.data),
  list: () => api.get('/disputes').then((r) => r.data),
  get: (id: string) => api.get(`/disputes/${id}`).then((r) => r.data),
  markReview: (id: string) => api.patch(`/disputes/${id}/review`).then((r) => r.data),
  resolve: (id: string, data: { resolution: string; resolutionNote: string }) =>
    api.patch(`/disputes/${id}/resolve`, data).then((r) => r.data),
};

// ---- Notifications ----
export const notificationsApi = {
  list: () => api.get('/notifications').then((r) => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then((r) => r.data),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
};

// ---- Users ----
export const usersApi = {
  // Timestamp en URL fuerza invalidación de caché en cada llamada
  dashboard: () => api.get(`/users/dashboard?_t=${Date.now()}`).then((r) => r.data),
  list: () => api.get('/users').then((r) => r.data),
  // Admin: eliminar y actualizar credenciales de cualquier cuenta
  deleteUser: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
  updateCredentials: (id: string, data: { name?: string; email?: string; password?: string }) =>
    api.patch(`/users/${id}/credentials`, data).then((r) => r.data),
};
