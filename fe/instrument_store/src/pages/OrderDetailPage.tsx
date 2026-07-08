import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrderById, type Order, type OrderStatus } from '../services/orders';
import { isAuthenticated } from '../services/auth';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; class: string; icon: string }> = {
  preparing: {
    label: 'Chuẩn bị hàng',
    class: 'bg-amber-50 text-amber-700 border-amber-100',
    icon: 'hourglass_empty',
  },
  shipping: {
    label: 'Đang vận chuyển',
    class: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    icon: 'local_shipping',
  },
  delivered: {
    label: 'Đã giao hàng',
    class: 'bg-green-50 text-green-700 border-green-100',
    icon: 'check_circle',
  },
  cancelled: {
    label: 'Bị huỷ',
    class: 'bg-red-50 text-red-700 border-red-100',
    icon: 'cancel',
  },
};

const fallbackImage =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
    '<rect width="200" height="200" fill="#e2e8f0"/>' +
    '<text x="100" y="100" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="16" fill="#94a3b8">No Image</text>' +
    '</svg>'
  );

export const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!orderId) {
        setError('Mã đơn hàng không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        setError('');
        setLoading(true);
        const data = await fetchOrderById(orderId);
        if (!mounted) return;
        setOrder(data);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [orderId]);

  if (!isAuthenticated()) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/70 bg-white/90 p-10 shadow-xl backdrop-blur text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600">Tài khoản</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Vui lòng đăng nhập</h1>
          <p className="mt-3 text-sm text-slate-500">Đăng nhập để xem chi tiết đơn hàng.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[linear-gradient(180deg,#f7f9fb_0%,#f8fafc_55%,#fdf7f2_100%)] text-slate-900">
        <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-10 lg:px-16 lg:pb-24 lg:pt-12">
          <div className="rounded-2xl border border-white/70 bg-white/90 p-8 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Đang tải chi tiết đơn hàng</p>
            <p className="mt-2 text-slate-600">Đợi mình lấy dữ liệu từ backend...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="relative min-h-screen bg-[linear-gradient(180deg,#f7f9fb_0%,#f8fafc_55%,#fdf7f2_100%)] text-slate-900">
        <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-10 lg:px-16 lg:pb-24 lg:pt-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-700">Lỗi</p>
            <p className="mt-2 text-red-600">{error || 'Không tìm thấy đơn hàng'}</p>
            <Link
              to="/orders"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-900 px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại lịch sử mua hàng
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status];

  return (
    <div className="relative min-h-screen bg-[linear-gradient(180deg,#f7f9fb_0%,#f8fafc_55%,#fdf7f2_100%)] text-slate-900">
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="absolute right-[-8%] top-[-6%] h-[32rem] w-[32rem] rounded-full bg-[#ffdbcc] blur-[120px]" />
        <div className="absolute bottom-[-8%] left-[-10%] h-[28rem] w-[28rem] rounded-full bg-[#dae2fd] blur-[120px]" />
      </div>

      <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-10 lg:px-16 lg:pb-24 lg:pt-12">
        {/* Header */}
        <div className="mb-10 animate-[fadeIn_0.8s_ease-out_forwards]">
          <nav className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            <Link to="/" className="transition-colors hover:text-amber-700">Trang chủ</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link to="/orders" className="transition-colors hover:text-amber-700">Lịch sử mua hàng</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-900">#{order.orderCode}</span>
          </nav>
          <h1 className="font-['Noto_Serif'] text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Chi tiết đơn hàng
          </h1>
          <p className="mt-3 max-w-2xl text-base italic leading-7 text-slate-600 md:text-lg">
            Mã đơn hàng: <span className="not-italic font-bold text-amber-700">#{order.orderCode}</span>
          </p>
        </div>

        {/* Order Info Card */}
        <div className="mb-8 bg-white/90 border border-white/70 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur">
          <div className="p-6 md:p-8">
            {/* Status & Order Code */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-amber-600">Trạng thái</p>
                <span
                  className={`mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider border ${statusCfg.class}`}
                >
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {statusCfg.icon}
                  </span>
                  {statusCfg.label}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-slate-100">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Ngày đặt</p>
                <p className="text-base font-semibold text-slate-900 mt-1">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Tạm tính</p>
                <p className="text-base font-semibold text-slate-900 mt-1">{formatCurrency(order.subtotal)}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Phí vận chuyển</p>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {order.shippingFee > 0 ? formatCurrency(order.shippingFee) : 'Miễn phí'}
                </p>
              </div>
              {order.discountAmount > 0 && (
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Giảm giá</p>
                  <p className="text-base font-semibold text-green-600 mt-1">-{formatCurrency(order.discountAmount)}</p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-6">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Tổng thanh toán</p>
                <p className="font-['Noto_Serif'] text-2xl font-semibold text-amber-700 mt-1">{formatCurrency(order.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Phương thức thanh toán</p>
                <p className="text-base font-semibold text-slate-900 mt-1">{order.paymentMethod || 'Chưa xác định'}</p>
              </div>
            </div>

            {/* Voucher */}
            {(order.couponCode || order.discountAmount > 0) && (
              <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                {order.couponCode && (
                  <p className="font-semibold">Voucher áp dụng: {order.couponCode}</p>
                )}
                {order.discountAmount > 0 && (
                  <p className={order.couponCode ? 'mt-1' : 'font-semibold'}>
                    Giảm giá: {formatCurrency(order.discountAmount)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white/90 border border-white/70 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur">
          <div className="px-6 md:px-8 pt-6 md:pt-8 pb-2">
            <h2 className="font-['Noto_Serif'] text-2xl font-semibold text-slate-950">Sản phẩm đã mua</h2>
            <p className="mt-1 text-sm text-slate-500">{order.items.length} sản phẩm</p>
          </div>
          <div className="px-6 md:px-8 pb-6 md:pb-8 divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-5">
                <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-slate-200/60 flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    src={item.image ?? fallbackImage}
                    alt={item.productName}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-slate-900 truncate">{item.productName}</p>
                  {item.variantName && (
                    <p className="text-sm text-slate-500 mt-0.5">{item.variantName}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm text-slate-500">Số lượng: {String(item.quantity).padStart(2, '0')}</p>
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.unitPrice)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Thành tiền</p>
                  <p className="text-base font-semibold text-amber-700 mt-0.5">{formatCurrency(item.lineTotal)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-amber-300 hover:text-amber-700"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quay lại lịch sử mua hàng
          </Link>
        </div>
      </main>
    </div>
  );
};
