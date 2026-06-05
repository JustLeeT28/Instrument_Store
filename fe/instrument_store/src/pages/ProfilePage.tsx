import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCurrentUser, isAuthenticated, logout, type CurrentUser } from '../services/auth';

type OrderItem = {
  id: string;
  name: string;
  date: string;
  price: string;
  status: string;
  statusClass: string;
  image: string;
};

const recentOrders: OrderItem[] = [
  {
    id: '#LC-99201',
    name: 'Acoustic Custom Series X1',
    date: '12/05/2024',
    price: '45.000.000₫',
    status: 'Đã giao hàng',
    statusClass: 'bg-green-50 text-green-700',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJvo2sGuScIqZKAzB-vqlxFtKPnj4og30xo3oSb9mj3lKXrvCLB96zyMfh84CVYyMLcCurVYnwS9dukq2Ox40vMEPcRTPG-EaV29raYjNb2hFzF86aMxaF3QWjV4NvFQPjJxTzwq2fzR6fyNSMTBmsym44OHWBRl6M0YPk3pRPLjyjBBnWUYVuMW10muW3tscy7oConX1LiQIRZfN7LnksJseE0jT_0tsaU-CxdBZTGVfCI_2NSGcp_4TUC3F5mAo03cJXHTCOc4pe',
  },
  {
    id: '#LC-98150',
    name: 'Bộ bảo dưỡng Piano cao cấp',
    date: '02/04/2024',
    price: '2.500.000₫',
    status: 'Đang vận chuyển',
    statusClass: 'bg-amber-50 text-amber-700',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi0IMQVTU4-_3MgEwa7W9dUOi0sJLwMa3G9pGFDypxwkIU0jwgmS5h9cJU_kNxj6OksW_9xqWAH5XWk6HNIyV9F1KJHNpq4desG1HzprVm_408EumxZxqEzF3AaK6U-1FZ9L9QgYP7C0P9LioT-Rp6WbQIRwJpHjYjmtLyE8vmMt-yVvLrAi-MIKhToz6ZZ2xNT51-x4ORETaMd1EwP2E0jErkMLDD3afu_3DiZX3fiV2abYoyULO6IEGxEomHxnCcXcGls4pvM8qQ',
  },
];

const ROLE_LABELS: Record<CurrentUser['role'], string> = {
  CUSTOMER: 'Khách hàng',
  STUDENT: 'Học viên',
  TEACHER: 'Giáo viên',
  ADMIN: 'Quản trị viên',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatPhone(value: string | null) {
  return value?.trim() ? value : 'Chưa cập nhật';
}

function formatAddress(
  address: CurrentUser['defaultAddress'],
) {
  if (!address) return 'Chưa có địa chỉ mặc định';

  const parts = [address.line1, address.ward, address.city].filter((part) => part && part.trim());
  return parts.join(', ');
}

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchCurrentUser();
        if (active) {
          setUser(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Không thể tải thông tin tài khoản');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-16">
        <div className="mx-auto flex max-w-3xl items-center justify-center rounded-3xl border border-white/70 bg-white/80 p-12 shadow-lg backdrop-blur">
          <p className="text-slate-600">Đang tải hồ sơ của bạn...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated() || !user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/70 bg-white/90 p-10 shadow-xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600">Tài khoản</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Vui lòng đăng nhập để xem hồ sơ</h1>
          <p className="mt-3 text-sm text-slate-500">
            Thông tin cá nhân chỉ hiển thị sau khi bạn xác thực bằng tài khoản của mình.
          </p>
          {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
          <div className="mt-8 flex gap-3">
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

  const displayName = user.fullName?.trim() || user.email;
  const greetingName = displayName.split(' ')[0];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-8 lg:flex-row">
        <aside className="w-full flex-shrink-0 rounded-3xl border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-2xl lg:w-72">
          <div className="mb-8 border-b border-white/10 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">Tài khoản</p>
            <h2 className="mt-3 text-3xl font-semibold">{displayName}</h2>
            <p className="mt-2 text-sm text-slate-300">Xin chào, {greetingName}</p>
          </div>

          <nav className="space-y-2">
            <a
              className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white shadow-lg transition"
              href="#profile-info"
            >
              <span className="material-symbols-outlined text-lg">person</span>
              Thông tin cá nhân
            </a>
            <a
              className="flex items-center gap-4 rounded-2xl px-4 py-3 font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              href="#recent-orders"
            >
              <span className="material-symbols-outlined">history</span>
              Lịch sử đơn hàng
            </a>
            <Link
              className="flex items-center gap-4 rounded-2xl px-4 py-3 font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              to="/favorite"
            >
              <span className="material-symbols-outlined">favorite</span>
              Danh sách yêu thích
            </Link>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <span className="material-symbols-outlined">logout</span>
                Đăng xuất
              </button>
            </div>
          </nav>
        </aside>

        <div className="flex-1 space-y-8">
          <section
            id="profile-info"
            className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8"
          >
            <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600">Hồ sơ</p>
                <h3 className="mt-3 text-3xl font-semibold text-slate-900">Thông tin hồ sơ</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Dữ liệu này được lấy trực tiếp từ bảng `users` trong database.
                </p>
              </div>
              <span
                className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  user.status ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {user.status ? 'Đang hoạt động' : 'Đã khóa'}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <InfoBlock label="Họ và tên" value={user.fullName?.trim() || 'Chưa cập nhật'} />
              <InfoBlock label="Email" value={user.email} />
              <InfoBlock label="Số điện thoại" value={formatPhone(user.phone)} />
              <InfoBlock label="Địa chỉ mặc định" value={formatAddress(user.defaultAddress)} />
              <InfoBlock label="Vai trò" value={ROLE_LABELS[user.role]} />
              <InfoBlock label="Ngày tạo tài khoản" value={formatDate(user.createdAt)} />
              <InfoBlock label="Cập nhật gần nhất" value={formatDate(user.updatedAt)} />
            </div>

            {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
          </section>

          <section
            id="recent-orders"
            className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8"
          >
            <div className="mb-8 flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-3xl font-semibold text-slate-900">Đơn hàng gần đây</h3>
              <a className="text-sm font-semibold text-amber-600 underline-offset-4 hover:text-amber-700 hover:underline" href="#">
                Xem tất cả
              </a>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-200 shadow">
                      <img className="h-full w-full object-cover" src={order.image} alt={order.name} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">{order.name}</p>
                      <p className="text-sm text-slate-500">
                        Mã đơn: <span className="font-medium text-amber-600">{order.id}</span>
                      </p>
                      <p className="mt-1 text-sm text-slate-500">Ngày đặt: {order.date}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="mb-2 text-lg font-bold text-amber-600">{order.price}</p>
                    <span
                      className={`inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${order.statusClass}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
