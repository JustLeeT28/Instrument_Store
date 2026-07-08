import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCurrentUser, isAuthenticated, logout, updateCurrentUser, type CurrentUser } from '../services/auth';

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
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [ward, setWard] = useState('');

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
          setFullName(data.fullName ?? '');
          setEmail(data.email);
          setPhone(data.phone ?? '');
          setLine1(data.defaultAddress?.line1 ?? '');
          setCity(data.defaultAddress?.city ?? '');
          setWard(data.defaultAddress?.ward ?? '');
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

  const startEdit = () => {
    if (!user) return;
    setFullName(user.fullName ?? '');
    setEmail(user.email);
    setPhone(user.phone ?? '');
    setLine1(user.defaultAddress?.line1 ?? '');
    setCity(user.defaultAddress?.city ?? '');
    setWard(user.defaultAddress?.ward ?? '');
    setEditing(true);
    setError(null);
  };

  const cancelEdit = () => {
    if (!user) return;
    setFullName(user.fullName ?? '');
    setEmail(user.email);
    setPhone(user.phone ?? '');
    setLine1(user.defaultAddress?.line1 ?? '');
    setCity(user.defaultAddress?.city ?? '');
    setWard(user.defaultAddress?.ward ?? '');
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const hasAddressInput = [line1, city, ward].some((value) => value.trim().length > 0);
      if (hasAddressInput && (!line1.trim() || !city.trim())) {
        throw new Error('Vui lòng nhập địa chỉ và tỉnh/thành phố');
      }

      const payload = {
        email: email.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        ...(hasAddressInput
          ? {
            address: {
              line1: line1.trim(),
              city: city.trim(),
              ward: ward.trim(),
              defaultAddress: true,
            },
          }
          : {}),
      };

      const updatedUser = await updateCurrentUser(payload);
      setUser(updatedUser);
      setFullName(updatedUser.fullName ?? '');
      setEmail(updatedUser.email);
      setPhone(updatedUser.phone ?? '');
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
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
            <Link
              className="flex items-center gap-4 rounded-2xl px-4 py-3 font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              to="/orders"
            >
              <span className="material-symbols-outlined">history</span>
              Lịch sử đơn hàng
            </Link>
            <Link
              className="flex items-center gap-4 rounded-2xl px-4 py-3 font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              to="/favorite"
            >
              <span className="material-symbols-outlined">favorite</span>
              Danh sách yêu thích
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                className="mt-3 flex items-center gap-4 rounded-2xl px-4 py-3 font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                to="/admin"
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
                Quản lý cửa hàng
              </Link>
            )}
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
                  
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <span
                  className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                    user.status ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {user.status ? 'Đang hoạt động' : 'Đã khóa'}
                </span>
                {!editing ? (
                  <button
                    type="button"
                    onClick={startEdit}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
                  >
                    Chỉnh sửa thông tin
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!editing ? (
              <div className="grid gap-6 md:grid-cols-2">
                <InfoBlock label="Họ và tên" value={user.fullName?.trim() || 'Chưa cập nhật'} />
                <InfoBlock label="Email" value={user.email} />
                <InfoBlock label="Số điện thoại" value={formatPhone(user.phone)} />
                <InfoBlock label="Địa chỉ mặc định" value={formatAddress(user.defaultAddress)} />
                <InfoBlock label="Vai trò" value={ROLE_LABELS[user.role]} />
                <InfoBlock label="Ngày tạo tài khoản" value={formatDate(user.createdAt)} />
                <InfoBlock label="Cập nhật gần nhất" value={formatDate(user.updatedAt)} />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Họ và tên" value={fullName} onChange={setFullName} placeholder="Nhập họ và tên" />
                <Field label="Email" value={email} onChange={setEmail} placeholder="name@example.com" />
                <Field label="Số điện thoại" value={phone} onChange={setPhone} placeholder="Nhập số điện thoại" />
                <Field label="Địa chỉ" value={line1} onChange={setLine1} placeholder="Số nhà, tên đường" />
                <Field label="Quận/Huyện" value={ward} onChange={setWard} placeholder="Quận/Huyện" />
                <Field label="Tỉnh/Thành phố" value={city} onChange={setCity} placeholder="Tỉnh/Thành phố" />
                <InfoBlock label="Địa chỉ mặc định" value={formatAddress(user.defaultAddress)} />
                <InfoBlock label="Vai trò" value={ROLE_LABELS[user.role]} />
                <InfoBlock label="Ngày tạo tài khoản" value={formatDate(user.createdAt)} />
                <InfoBlock label="Cập nhật gần nhất" value={formatDate(user.updatedAt)} />
              </div>
            )}

            {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
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

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
      <span className="block text-xs font-bold uppercase tracking-[0.3em] text-amber-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
      />
    </label>
  );
}