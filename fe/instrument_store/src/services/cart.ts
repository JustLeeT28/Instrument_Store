import { API_BASE } from './api';

export type CartProduct = {
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
  specs?: Record<string, unknown> | null;
};

export type CartItem = {
  product: CartProduct;
  quantity: number;
  lineTotal: number;
};

export type CartResponse = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

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

const jsonHeaders = {
  Accept: 'application/json',
};

export async function fetchCart(): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart`, {
    headers: jsonHeaders,
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function updateCartItem(productId: string, quantity: number): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart/items/${productId}?quantity=${encodeURIComponent(quantity)}`, {
    method: 'PUT',
    headers: jsonHeaders,
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function addCartItem(productId: string, quantity = 1): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart/items/${productId}?quantity=${encodeURIComponent(quantity)}`, {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function removeCartItem(productId: string): Promise<CartResponse> {
  const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
    method: 'DELETE',
    headers: jsonHeaders,
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function clearCart(): Promise<void> {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'DELETE',
    headers: jsonHeaders,
    credentials: 'include',
  });

  if (!res.ok && res.status !== 204) throw new Error(await readErrorMessage(res));
}
