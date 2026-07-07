import { API_BASE } from './api';

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export type OrderItem = {
  id: string;
  productName: string;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  image?: string | null;
};

export type Order = {
  id: string;
  orderCode: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
};

export type OrderListResponse = {
  orders: Order[];
  total: number;
  page: number;
  size: number;
};

export type CheckoutRequest = {
  productIds: string[];
};

async function readErrorMessage(res: Response) {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Fall back to raw text
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

export async function fetchOrders(page = 1, size = 10): Promise<OrderListResponse> {
  const res = await fetch(`${API_BASE}/orders?page=${page}&size=${size}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function fetchOrderById(orderId: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function checkout(productIds: string[]): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/checkout`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productIds } as CheckoutRequest),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}