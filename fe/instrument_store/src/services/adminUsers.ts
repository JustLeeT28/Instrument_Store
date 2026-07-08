import { API_BASE } from './api';
import type { CurrentUser } from './auth';

export type UserRole = CurrentUser['role'];
export type AdminUser = CurrentUser;

async function readErrorMessage(res: Response) {
  const text = await res.text();

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Fall back to raw text.
  }

  return text || 'Không thể xử lý yêu cầu';
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Vui lòng đăng nhập');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${API_BASE}/users/admin`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}

export async function updateAdminUserRole(id: string, role: UserRole): Promise<AdminUser> {
  const res = await fetch(`${API_BASE}/users/admin/${encodeURIComponent(id)}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}

export async function updateAdminUserStatus(id: string, status: boolean): Promise<AdminUser> {
  const res = await fetch(`${API_BASE}/users/admin/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}
