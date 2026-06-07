import { API_BASE } from './api';

function getTokenExpiryMs(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: 'CUSTOMER' | 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: boolean;
  createdAt: string;
  updatedAt: string;
  defaultAddress: {
    id: string;
    line1: string;
    city: string;
    ward: string | null;
    defaultAddress: boolean;
  } | null;
}

export interface UpdateUserData {
  email?: string;
  fullName?: string;
  phone?: string;
  address?: {
    line1?: string;
    city?: string;
    ward?: string;
    defaultAddress?: boolean;
  };
}

async function readErrorMessage(res: Response) {
  const text = await res.text();

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Fall back to the raw response text below.
  }

  return text || 'Dang nhap that bai';
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Vui long dang nhap');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function register(data: RegisterData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function login(data: LoginData) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}

export async function updateCurrentUser(data: UpdateUserData): Promise<CurrentUser> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}

export function isAuthenticated() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  const expiresAt = getTokenExpiryMs(token);
  if (expiresAt && Date.now() >= expiresAt) {
    localStorage.removeItem('token');
    return false;
  }

  return true;
}

export function logout() {
  localStorage.removeItem('token');
  window.dispatchEvent(new Event('auth-change'));
}
