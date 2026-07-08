import { useEffect, useMemo, useState } from 'react';
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
} from '../../services/adminOrders';
import type { OrderStatus } from '../../services/orders';

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'preparing', label: 'Chuẩn bị hàng' },
  { value: 'shipping', label: 'Đang vận chuyển' },
  { value: 'delivered', label: 'Đã giao hàng' },
  { value: 'cancelled', label: 'Bị huỷ' },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  preparing: 'bg-amber-50 text-amber-700',
  shipping: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-rose-50 text-rose-700',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Khong ro';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function OrderManagement() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftStatuses, setDraftStatuses] = useState<Record<string, OrderStatus>>({});

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    fetchAdminOrders(1, 50)
      .then((data) => {
        if (!mounted) return;
      setOrders(data.orders);
      setDraftStatuses(Object.fromEntries(data.orders.map((order) => [order.id, order.status])));
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Khong the tai danh sach don hang');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    return orders.reduce(
      (result, order) => {
      result.total += 1;
      result[order.status] += 1;
      return result;
    },
      { total: 0, preparing: 0, shipping: 0, delivered: 0, cancelled: 0 }
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesText =
        !keyword ||
        order.orderCode.toLowerCase().includes(keyword) ||
        (order.customerName ?? '').toLowerCase().includes(keyword) ||
        (order.customerEmail ?? '').toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [orders, query, statusFilter]);

  async function handleSave(order: AdminOrder) {
    const nextStatus = draftStatuses[order.id] ?? order.status;
    if (nextStatus === order.status) return;

    setSavingId(order.id);
    setError(null);

    try {
      const updated = await updateAdminOrderStatus(order.id, nextStatus);
      setOrders((prev) => prev.map((item) => (item.id === order.id ? updated : item)));
      setDraftStatuses((prev) => ({ ...prev, [order.id]: updated.status }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the cap nhat trang thai don hang');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Admin</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-950">Quan ly don hang</h2>
          <p className="mt-2 text-sm text-slate-500">Xem danh sach don va cap nhat trang thai xu ly.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatBox label="Tong" value={stats.total} />
          <StatBox label="Chuan bi" value={stats.preparing} />
          <StatBox label="Van chuyen" value={stats.shipping} />
          <StatBox label="Da giao" value={stats.delivered} />
          <StatBox label="Huy" value={stats.cancelled} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tim theo ma don, ten khach hoac email"
              className="w-full rounded-md border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'ALL' | OrderStatus)}
            className="rounded-md border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option value="ALL">Tat ca trang thai</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-5 py-4 font-bold">Don hang</th>
                <th className="px-5 py-4 font-bold">Khach hang</th>
                <th className="px-5 py-4 font-bold">Trang thai</th>
                <th className="px-5 py-4 font-bold">Gia tri</th>
                <th className="px-5 py-4 font-bold">Ngay tao</th>
                <th className="px-5 py-4 text-right font-bold">Cap nhat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">Dang tai danh sach don hang...</td>
                </tr>
              )}

              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">Khong co don hang phu hop.</td>
                </tr>
              )}

              {!loading && filteredOrders.map((order) => {
                const isSaving = savingId === order.id;
                const currentDraft = draftStatuses[order.id] ?? order.status;

                return (
                  <tr key={order.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950">#{order.orderCode}</p>
                      <p className="text-xs text-slate-500">{order.paymentMethod || 'Chua xac dinh'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-950">{order.customerName || 'Khong ro ten'}</p>
                        <p className="text-xs text-slate-500">{order.customerEmail || 'Khong ro email'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[order.status]}`}>
                        {STATUS_OPTIONS.find((option) => option.value === order.status)?.label ?? order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(order.subtotal)} truoc giam gia</p>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={currentDraft}
                          onChange={(event) =>
                            setDraftStatuses((prev) => ({
                              ...prev,
                              [order.id]: event.target.value as OrderStatus,
                            }))
                          }
                          disabled={isSaving}
                          className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleSave(order)}
                          disabled={isSaving || currentDraft === order.status}
                          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSaving ? 'Dang luu...' : 'Luu'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

export default OrderManagement;
