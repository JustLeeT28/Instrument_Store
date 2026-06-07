import { API_BASE } from './api';

export interface FavoriteProduct {
  id: string;
  name: string;
  slug?: string;
  brand?: string | null;
  category?: string | null;
  price: number;
  rating?: number;
  reviewCount?: number;
  badge?: string | null;
  stockQty?: number;
  description?: string | null;
  image?: string | null;
  images?: string[] | null;
  specs?: Record<string, unknown> | null;
}

async function readErrorMessage(res: Response) {
  const text = await res.text();

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Fall back to raw text below.
  }

  return text || 'Co loi xay ra';
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

export async function fetchFavorites(): Promise<FavoriteProduct[]> {
  const res = await fetch(`${API_BASE}/favorites`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function fetchFavoriteStatus(productId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/favorites/${productId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  const data = await res.json();
  return Boolean(data?.favorite);
}

export async function addFavorite(productId: string): Promise<FavoriteProduct> {
  const res = await fetch(`${API_BASE}/favorites/${productId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function removeFavorite(productId: string) {
  const res = await fetch(`${API_BASE}/favorites/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
}
