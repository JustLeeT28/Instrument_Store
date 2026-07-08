import { API_BASE } from './api';

export type ProductItem = {
  id: string;
  name: string;
  slug?: string;
  brand?: string | null;
  category?: string | null;
  price: number;
  rating?: number | null;
  reviewCount?: number | null;
  badge?: string | null;
  stockQty?: number | null;
  description?: string | null;
  image?: string | null;
  images?: string[] | null;
  specs?: Array<Record<string, string>> | null;
};

export type ProductImagePayload = {
  imageUrl: string;
  isPrimary?: boolean;
};

export type ProductUpdatePayload = {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stockQty?: number;
  brandId?: string;
  brandName?: string;
  categoryId?: string;
  images?: ProductImagePayload[];
  specs?: Array<Record<string, string>>;
};

async function readErrorMessage(res: Response) {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // fall through
  }

  return text || 'Lỗi server';
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

export async function fetchProducts(search?: string): Promise<ProductItem[]> {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_BASE}/products${q}`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function fetchProductById(id: string): Promise<ProductItem> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function createProduct(payload: ProductUpdatePayload): Promise<ProductItem> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function updateProduct(id: string, payload: ProductUpdatePayload): Promise<ProductItem> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}
