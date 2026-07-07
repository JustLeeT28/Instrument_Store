import { useEffect, useMemo, useState } from 'react';
import {
  createAdminCoupon,
  deleteAdminCoupon,
  fetchAdminCoupons,
  updateAdminCoupon,
  type AdminCoupon,
  type AdminCouponInput,
  type CouponDiscountType,
} from '../../services/coupons';

type VoucherFormState = {
  id?: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: string;
  quantity: string;
  minOrderValue: string;
  maxDiscountValue: string;
  startDate: string;
  endDate: string;
  active: boolean;
};

const INITIAL_FORM: VoucherFormState = {
  code: '',
  discountType: 'percent',
  discountValue: '',
  quantity: '',
  minOrderValue: '',
  maxDiscountValue: '',
  startDate: '',
  endDate: '',
  active: true,
};

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const formatDate = (value: string | null) => {
  if (!value) return 'Không giới hạn';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không rõ';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const toDateTimeLocal = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const fromDateTimeLocal = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

function mapCouponToForm(coupon: AdminCoupon): VoucherFormState {
  return {
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: String(coupon.discountValue),
    quantity: String(coupon.quantity),
    minOrderValue: String(coupon.minOrderValue ?? 0),
    maxDiscountValue: coupon.maxDiscountValue == null ? '' : String(coupon.maxDiscountValue),
    startDate: toDateTimeLocal(coupon.startDate),
    endDate: toDateTimeLocal(coupon.endDate),
    active: coupon.active,
  };
}

function toPayload(form: VoucherFormState): AdminCouponInput {
  return {
    code: form.code.trim(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    quantity: Number(form.quantity),
    minOrderValue: form.minOrderValue.trim() ? Number(form.minOrderValue) : 0,
    maxDiscountValue: form.maxDiscountValue.trim() ? Number(form.maxDiscountValue) : null,
    startDate: fromDateTimeLocal(form.startDate),
    endDate: fromDateTimeLocal(form.endDate),
    active: form.active,
  };
}

function getDiscountLabel(coupon: AdminCoupon) {
  if (coupon.discountType === 'percent') {
    return `${coupon.discountValue}%`;
  }
  return formatCurrency(coupon.discountValue);
}

export function VoucherManagement() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<VoucherFormState | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    fetchAdminCoupons()
      .then((data) => {
        if (!mounted) return;
        setCoupons(data);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Khong the tai danh sach voucher');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCoupons = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return coupons;

    return coupons.filter((coupon) =>
      coupon.code.toLowerCase().includes(keyword) ||
      coupon.discountType.toLowerCase().includes(keyword)
    );
  }, [coupons, query]);

  const stats = useMemo(() => {
    return coupons.reduce(
      (result, coupon) => {
        result.total += 1;
        if (coupon.active) result.active += 1;
        result.quantity += coupon.quantity;
        return result;
      },
      { total: 0, active: 0, quantity: 0 }
    );
  }, [coupons]);

  const handleCreate = () => {
    setEditing({ ...INITIAL_FORM });
    setError(null);
  };

  const handleEdit = (coupon: AdminCoupon) => {
    setEditing(mapCouponToForm(coupon));
    setError(null);
  };

  const handleSave = async () => {
    if (!editing) return;

    setSaving(true);
    setError(null);

    try {
      const payload = toPayload(editing);
      const saved = editing.id
        ? await updateAdminCoupon(editing.id, payload)
        : await createAdminCoupon(payload);

      setCoupons((prev) => {
        if (editing.id) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        return [saved, ...prev];
      });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the luu voucher');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon: AdminCoupon) => {
    const confirmed = window.confirm(`Xóa voucher ${coupon.code}?`);
    if (!confirmed) return;

    setSaving(true);
    setError(null);

    try {
      await deleteAdminCoupon(coupon.id);
      setCoupons((prev) => prev.filter((item) => item.id !== coupon.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the xoa voucher');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Admin</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-950">Quan ly voucher</h2>
          <p className="mt-2 text-sm text-slate-500">Tạo, cập nhật và theo dõi số lượng voucher bán ra.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:w-fit sm:grid-cols-3">
          <StatBox label="Tổng" value={stats.total} />
          <StatBox label="Hoạt động" value={stats.active} />
          <StatBox label="Tồn" value={stats.quantity} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo mã voucher hoặc loại giảm giá"
              className="w-full rounded-md border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm voucher
          </button>
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
                <th className="px-5 py-4 font-bold">Voucher</th>
                <th className="px-5 py-4 font-bold">Loại</th>
                <th className="px-5 py-4 font-bold">Giảm giá</th>
                <th className="px-5 py-4 font-bold">Số lượng</th>
                <th className="px-5 py-4 font-bold">Điều kiện</th>
                <th className="px-5 py-4 font-bold">Trạng thái</th>
                <th className="px-5 py-4 text-right font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">Đang tải danh sách voucher...</td>
                </tr>
              )}

              {!loading && filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">Chưa có voucher phù hợp.</td>
                </tr>
              )}

              {!loading && filteredCoupons.map((coupon) => {
                const expired = coupon.endDate ? new Date(coupon.endDate).getTime() < Date.now() : false;

                return (
                  <tr key={coupon.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-950">{coupon.code}</p>
                        <p className="text-xs text-slate-500">{coupon.id}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {coupon.discountType === 'percent' ? 'Phần trăm' : 'Số tiền cố định'}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {getDiscountLabel(coupon)}
                      {coupon.maxDiscountValue != null && coupon.discountType === 'percent' && (
                        <p className="text-xs text-slate-500">Tối đa {formatCurrency(coupon.maxDiscountValue)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{coupon.quantity}</td>
                    <td className="px-5 py-4 text-slate-700">
                      <div className="space-y-1">
                        <p>Tối thiểu {formatCurrency(coupon.minOrderValue)}</p>
                        <p className="text-xs text-slate-500">Bắt đầu {formatDate(coupon.startDate)}</p>
                        <p className="text-xs text-slate-500">Kết thúc {formatDate(coupon.endDate)}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${coupon.active && !expired ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {coupon.active && !expired ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(coupon)}
                          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(coupon)}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Xóa
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

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-4 pb-12 pt-6 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-6 md:p-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-950">
                  {editing.id ? 'Cập nhật voucher' : 'Tạo voucher mới'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">Cập nhật số lượng, mức giảm và thời gian hiệu lực.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2 md:p-8">
              <Field label="Mã voucher">
                <input
                  value={editing.code}
                  onChange={(event) => setEditing({ ...editing, code: event.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </Field>
              <Field label="Trạng thái">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editing.active}
                    onChange={(event) => setEditing({ ...editing, active: event.target.checked })}
                  />
                  Đang hoạt động
                </label>
              </Field>
              <Field label="Loại giảm giá">
                <select
                  value={editing.discountType}
                  onChange={(event) => setEditing({ ...editing, discountType: event.target.value as CouponDiscountType })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="percent">Phần trăm</option>
                  <option value="fixed">Số tiền cố định</option>
                </select>
              </Field>
              <Field label="Giá trị giảm">
                <input
                  type="number"
                  min="0"
                  value={editing.discountValue}
                  onChange={(event) => setEditing({ ...editing, discountValue: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </Field>
              <Field label="Số lượng">
                <input
                  type="number"
                  min="0"
                  value={editing.quantity}
                  onChange={(event) => setEditing({ ...editing, quantity: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </Field>
              <Field label="Đơn tối thiểu">
                <input
                  type="number"
                  min="0"
                  value={editing.minOrderValue}
                  onChange={(event) => setEditing({ ...editing, minOrderValue: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </Field>
              <Field label="Giảm tối đa (nếu %)">
                <input
                  type="number"
                  min="0"
                  value={editing.maxDiscountValue}
                  onChange={(event) => setEditing({ ...editing, maxDiscountValue: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </Field>
              <Field label="Bắt đầu">
                <input
                  type="datetime-local"
                  value={editing.startDate}
                  onChange={(event) => setEditing({ ...editing, startDate: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </Field>
              <Field label="Kết thúc">
                <input
                  type="datetime-local"
                  value={editing.endDate}
                  onChange={(event) => setEditing({ ...editing, endDate: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </Field>
            </div>

            <div className="flex flex-col gap-3 border-t p-6 md:flex-row md:items-center md:justify-end md:p-8">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu voucher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</span>
      {children}
    </label>
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

export default VoucherManagement;