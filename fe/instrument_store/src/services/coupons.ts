import { API_BASE } from './api';

export type CouponDiscountType = 'percent' | 'fixed';

export type AdminCoupon = {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  quantity: number;
  minOrderValue: number;
  maxDiscountValue: number | null;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
};

export type AdminCouponInput = {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  quantity: number;
  minOrderValue?: number;
  maxDiscountValue?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  active: boolean;
};

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

  return text || 'Khong the xu ly yeu cau';
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Vui long dang nhap');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function fetchAdminCoupons(): Promise<AdminCoupon[]> {
  const res = await fetch(`${API_BASE}/coupons/admin`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}

export async function createAdminCoupon(payload: AdminCouponInput): Promise<AdminCoupon> {
  const res = await fetch(`${API_BASE}/coupons/admin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}

export async function updateAdminCoupon(id: string, payload: AdminCouponInput): Promise<AdminCoupon> {
  const res = await fetch(`${API_BASE}/coupons/admin/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}

export async function deleteAdminCoupon(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/coupons/admin/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(await readErrorMessage(res));
  }
}