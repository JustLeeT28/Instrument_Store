import { Link } from 'react-router-dom';

const mockUser = {
  fullName: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '+84 123 456 789',
  role: 'customer',
  addresses: [
    {
      line1: '123 Đường ABC',
      line2: 'Căn hộ 45',
      city: 'Hà Nội',
      state: 'Quận Cầu Giấy',
      country: 'Việt Nam',
      label: 'Nhà riêng',
      default: true,
    },
    {
      line1: '456 Đường DEF',
      line2: 'Tầng 3, Toà B',
      city: 'Hồ Chí Minh',
      state: 'Quận 1',
      country: 'Việt Nam',
      label: 'Văn phòng',
      default: false,
    },
    {
      line1: '789 Đường GHI',
      line2: '',
      city: 'Đà Nẵng',
      state: 'Quận Hải Châu',
      country: 'Việt Nam',
      label: 'Cửa hàng',
      default: false,
    },
  ],
};

export const ProfilePage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-8 shadow-xl shadow-slate-900/10 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-amber-500 text-3xl font-bold uppercase text-white shadow-lg shadow-amber-500/20">
                {mockUser.fullName
                  .split(' ')
                  .slice(-2)
                  .map((part) => part[0])
                  .join('')}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Hồ sơ của bạn</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight">Xin chào, {mockUser.fullName.split(' ')[0]}</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">Đây là trang quản lý thông tin cá nhân. Bạn có thể xem, chỉnh sửa hoặc thay đổi mật khẩu khi cần.</p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Quay lại trang chủ
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Vai trò</p>
              <p className="mt-3 text-xl font-semibold text-white">{mockUser.role === 'customer' ? 'Khách hàng' : mockUser.role}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Email</p>
              <p className="mt-3 text-xl font-semibold text-white">{mockUser.email}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Điện thoại</p>
              <p className="mt-3 text-xl font-semibold text-white">{mockUser.phone}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.7fr_0.9fr]">
          <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Tác vụ nhanh</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Một số thao tác truy cập nhanh cho tài khoản của bạn.</p>
            </div>
            <div className="grid gap-3">
              <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Chỉnh sửa hồ sơ</button>
              <button className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">Đổi mật khẩu</button>
              <button className="rounded-full border border-rose-500 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100">Đăng xuất</button>
            </div>
          </aside>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Thông tin tài khoản</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Chi tiết người dùng</h2>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">Hoạt động</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Họ và tên</p>
                <p className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">{mockUser.fullName}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                <p className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">{mockUser.email}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Số điện thoại</p>
                <p className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">{mockUser.phone}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Vai trò</p>
                <p className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">{mockUser.role === 'customer' ? 'Khách hàng' : mockUser.role}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Địa chỉ</p>
                  <p className="mt-2 text-base text-slate-500 dark:text-slate-400">Danh sách địa chỉ giao hàng và các thao tác nhanh.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                  <span className="material-symbols-outlined text-base">add</span>
                  Thêm địa chỉ
                </button>
              </div>

              <div className="mt-6 space-y-4">
              {mockUser.addresses.map((address, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {address.default ? 'Địa chỉ mặc định' : address.label}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {`${address.line1}${address.line2 ? `, ${address.line2}` : ''}, ${address.city}, ${address.state}, ${address.country}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                        aria-label="Chọn địa chỉ"
                      >
                        <span className="material-symbols-outlined">check</span>
                      </button>
                      <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-300 bg-rose-50 text-rose-700 transition hover:bg-rose-100 dark:border-rose-600/50 dark:bg-rose-900/30 dark:text-rose-200 dark:hover:bg-rose-900"
                        aria-label="Xóa địa chỉ"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
