import { API_BASE } from './api';

export type Brand = {
  id: string;
  name: string;
  slug?: string;
};

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetch(`${API_BASE}/brands`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Không thể tải danh sách thương hiệu');
  }

  return res.json();
}

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

export async function createAdminBrand(name: string): Promise<Brand> {
  const res = await fetch(`${API_BASE}/brands/admin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}

export async function deleteAdminBrand(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/brands/admin/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(await readErrorMessage(res));
  }
}
