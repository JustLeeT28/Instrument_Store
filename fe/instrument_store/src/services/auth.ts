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

async function readErrorMessage(res: Response) {
  const text = await res.text();

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Fall back to raw response text below.
  }

  return text || 'Đăng nhập thất bại';
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
