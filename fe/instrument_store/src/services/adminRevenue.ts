import { API_BASE } from './api';

export type DailyRevenue = {
  date: string;
  revenue: number;
  orders: number;
};

export type TopProduct = {
  productName: string;
  quantity: number;
  revenue: number;
};

export type RevenueStats = {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  grossRevenue: number;
  totalDiscount: number;
  averageOrderValue: number;
  totalOrders: number;
  countedOrders: number;
  cancelledOrders: number;
  soldItems: number;
  dailyRevenue: DailyRevenue[];
  topProducts: TopProduct[];
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

  return text || 'Không thể tải thống kê doanh thu';
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Vui lòng đăng nhập');
  }

  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

export async function fetchRevenueStats(startDate?: string, endDate?: string): Promise<RevenueStats> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);

  const query = params.toString();
  const res = await fetch(`${API_BASE}/admin/revenue${query ? `?${query}` : ''}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return res.json();
}
