import { API_BASE } from './api';
import type { OrderStatus } from './orders';

export type AdminOrder = {
  id: string;
  orderCode: string;
  customerName: string | null;
  customerEmail: string | null;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
};

export type AdminOrderListResponse = {
  orders: AdminOrder[];
  total: number;
  page: number;
  size: number;
};

export type AdminOrderStatusInput = {
  status: OrderStatus;
};

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

async function readErrorMessage(res: Response) {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // fall back to raw text
  }
  return text || 'Co loi xay ra';
}

export async function fetchAdminOrders(page = 1, size = 10, status?: OrderStatus): Promise<AdminOrderListResponse> {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) {
    query.set('status', status);
  }

  const res = await fetch(`${API_BASE}/orders/admin?${query.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function updateAdminOrderStatus(orderId: string, status: OrderStatus): Promise<AdminOrder> {
  const res = await fetch(`${API_BASE}/orders/admin/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status } satisfies AdminOrderStatusInput),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}