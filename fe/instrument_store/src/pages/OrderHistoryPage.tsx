import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders, type Order, type OrderStatus } from '../services/orders';
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

const FILTER_TABS = [
  { key: 'all', label: 'Tất cả đơn' },
  { key: 'preparing', label: 'Chuẩn bị hàng' },
  { key: 'shipping', label: 'Đang vận chuyển' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã hủy' },
] as const;

const fallbackImage = 'https://via.placeholder.com/200x200?text=No+Image';

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        setError('');
        setLoading(true);
        const data = await fetchOrders(1, 10);
        if (!mounted) return;
        setOrders(data.orders);
        setTotal(data.total);
        setPage(1);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Co loi xay ra');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      setError('');
      const nextPage = page + 1;
      const data = await fetchOrders(nextPage, 10);
      setOrders((prev) => [...prev, ...data.orders]);
      setTotal(data.total);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Co loi xay ra');
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab);

  const displayedCount = filteredOrders.length;

  if (!isAuthenticated()) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/70 bg-white/90 p-10 shadow-xl backdrop-blur text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600">Tài khoản</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Vui lòng đăng nhập</h1>
          <p className="mt-3 text-sm text-slate-500">Đăng nhập để xem lịch sử mua hàng của bạn.</p>
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
            <span className="text-slate-900">Lịch sử mua hàng</span>
          </nav>
          <h1 className="font-['Noto_Serif'] text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Lịch sử mua hàng
          </h1>
          <p className="mt-3 max-w-2xl text-base italic leading-7 text-slate-600 md:text-lg">
            Xem lại các đơn hàng nhạc cụ và phụ kiện cao cấp bạn đã sở hữu.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 flex gap-6 bg-white/90 border border-white/70 rounded-xl p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur w-fit">
          <div className="text-center px-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Đơn hàng</p>
            <p className="font-['Noto_Serif'] text-2xl font-medium text-slate-950 mt-1">{total}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-6 bg-white/80 border border-white/70 p-5 rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-slate-950 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300 hover:text-amber-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="rounded-2xl border border-white/70 bg-white/90 p-8 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Đang tải đơn hàng</p>
            <p className="mt-2 text-slate-600">Đợi mình lấy dữ liệu từ backend...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status];
              return (
                <article
                  key={order.id}
                  className="bg-white/90 border border-white/70 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                >
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                    {/* Left Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-amber-600">Mã đơn hàng</p>
                          <h3 className="font-['Noto_Serif'] text-xl font-medium text-slate-950 mt-1">
                            #{order.orderCode}
                          </h3>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider border ${statusCfg.class}`}
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

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-y border-slate-100">
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Ngày mua</p>
                          <p className="text-base font-semibold text-slate-900 mt-1">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Tổng thanh toán</p>
                          <p className="text-base font-semibold text-amber-700 mt-1">{formatCurrency(order.total)}</p>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Phương thức</p>
                          <p className="text-base font-semibold text-slate-900 mt-1">
                            {order.paymentMethod || 'Chưa xác định'}
                          </p>
                        </div>
                      </div>

                      {(order.couponCode || order.discountAmount > 0) && (
                        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
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

                      {/* Product Thumbnails */}
                      <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        {order.items.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex-shrink-0"
                          >
                            <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-slate-200/60">
                              <img
                                className="w-full h-full object-cover"
                                src={item.image ?? fallbackImage}
                                alt={item.productName}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{item.productName}</p>
                              <p className="text-[12px] text-slate-500 mt-0.5">Số lượng: {String(item.quantity).padStart(2, '0')}</p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-lg bg-slate-100 text-sm font-semibold text-slate-500">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:w-64 flex flex-col justify-between items-stretch gap-4 md:border-l md:border-slate-200/60 md:pl-6">
                      <div className="space-y-3">
                        <button className="w-full py-3.5 bg-slate-950 text-white rounded-lg text-sm font-bold uppercase tracking-[0.12em] hover:bg-slate-800 transition-all shadow-sm">
                          Xem chi tiết
                        </button>
                        {order.status === 'shipping' && (
                          <button className="w-full py-3.5 bg-transparent border border-slate-300 text-slate-700 rounded-lg text-sm font-bold uppercase tracking-[0.12em] hover:bg-slate-50 transition-all">
                            Theo dõi vận chuyển
                          </button>
                        )}
                      </div>
                      {(order.status === 'delivered' || order.status === 'cancelled') && (
                        <button className="text-amber-700 text-sm font-bold uppercase tracking-[0.12em] hover:underline underline-offset-4 flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">replay</span>
                          Mua lại đơn này
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">Chưa có đơn hàng nào</p>
            <p className="mt-2 text-sm text-slate-500">
              {activeTab === 'all'
                ? 'Bạn chưa đặt đơn hàng nào. Hãy ghé cửa hàng để chọn nhạc cụ phù hợp.'
                : 'Không có đơn hàng nào ở trạng thái này.'}
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-900 px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Tiếp tục mua sắm
            </Link>
          </div>
        )}

        {/* Pagination / Load More */}
        {displayedCount > 0 && displayedCount < total && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Hiển thị {displayedCount} trên {total} đơn hàng
            </p>
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-12 py-4 bg-transparent border-2 border-slate-900 text-slate-900 rounded-lg text-sm font-bold uppercase tracking-[0.12em] hover:bg-slate-900 hover:text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore ? 'Đang tải...' : 'Tải thêm đơn hàng'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};