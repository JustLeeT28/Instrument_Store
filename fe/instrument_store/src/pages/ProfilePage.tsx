import { Link } from 'react-router-dom';

const mockUser = {
  fullName: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '+84 901 234 567',
  role: 'customer',
  addresses: [
    {
      line1: '123 Đường Lê Lợi',
      line2: '',
      city: 'Quận 1',
      state: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
      label: 'Nhà riêng',
      default: true,
    },
  ],
};

const recentOrders = [
  {
    id: '#LC-99201',
    name: 'Acoustic Custom Series X1',
    date: '12/05/2024',
    price: '45.000.000₫',
    status: 'Đã giao hàng',
    statusColor: 'bg-green-50 text-green-700',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJvo2sGuScIqZKAzB-vqlxFtKPnj4og30xo3oSb9mj3lKXrvCLB96zyMfh84CVYyMLcCurVYnwS9dukq2Ox40vMEPcRTPG-EaV29raYjNb2hFzF86aMxaF3QWjV4NvFQPjJxTzwq2fzR6fyNSMTBmsym44OHWBRl6M0YPk3pRPLjyjBBnWUYVuMW10muW3tscy7oConX1LiQIRZfN7LnksJseE0jT_0tsaU-CxdBZTGVfCI_2NSGcp_4TUC3F5mAo03cJXHTCOc4pe',
  },
  {
    id: '#LC-98150',
    name: 'Bộ bảo dưỡng Piano cao cấp',
    date: '02/04/2024',
    price: '2.500.000₫',
    status: 'Đang vận chuyển',
    statusColor: 'bg-amber-50 text-amber-700',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi0IMQVTU4-_3MgEwa7W9dUOi0sJLwMa3G9pGFDypxwkIU0jwgmS5h9cJU_kNxj6OksW_9xqWAH5XWk6HNIyV9F1KJHNpq4desG1HzprVm_408EumxZxqEzF3AaK6U-1FZ9L9QgYP7C0P9LioT-Rp6WbQIRwJpHjYjmtLyE8vmMt-yVvLrAi-MIKhToz6ZZ2xNT51-x4ORETaMd1EwP2E0jErkMLDD3afu_3DiZX3fiV2abYoyULO6IEGxEomHxnCcXcGls4pvM8qQ',
  },
];

export const ProfilePage = () => {
  return (
    <main className="max-w-screen-2xl mx-auto px-16 py-12 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="flex gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-72 flex-shrink-0">
          <div className="mb-8 pb-6 border-b-2 border-amber-200">
            <h2 className="font-bold text-slate-900 mb-1 text-3xl">Tài khoản</h2>
            <p className="text-amber-600 text-sm font-semibold tracking-wide">Xin chào, {mockUser.fullName.split(' ')[0]}</p>
          </div>
          <nav className="space-y-2">
            <a className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold shadow-md hover:shadow-lg transition-all" href="#">
              <span className="material-symbols-outlined text-lg">person</span>
              Thông tin cá nhân
            </a>
            <a className="flex items-center gap-4 px-4 py-3 rounded-none bg-transparent text-slate-600 hover:text-amber-600 hover:bg-slate-200/50 font-medium transition-all" href="#">
              <span className="material-symbols-outlined">history</span>
              Lịch sử đơn hàng
            </a>
            <a className="flex items-center gap-4 px-4 py-3 rounded-none bg-transparent text-slate-600 hover:text-amber-600 hover:bg-slate-200/50 font-medium transition-all" href="#">
              <span className="material-symbols-outlined">location_on</span>
              Sổ địa chỉ
            </a>
            <a className="flex items-center gap-4 px-4 py-3 rounded-none bg-transparent text-slate-600 hover:text-amber-600 hover:bg-slate-200/50 font-medium transition-all" href="#">
              <span className="material-symbols-outlined">payments</span>
              Phương thức thanh toán
            </a>
            <Link className="flex items-center gap-4 px-4 py-3 rounded-none bg-transparent text-slate-600 hover:text-amber-600 hover:bg-slate-200/50 font-medium transition-all" to="/favorite">
              <span className="material-symbols-outlined">favorite</span>
              Danh sách yêu thích
            </Link>
            <div className="pt-4 mt-4 border-t-2 border-slate-200">
              <a className="flex items-center gap-4 px-4 py-3 rounded-none bg-transparent text-slate-500 hover:bg-red-50 hover:text-red-700 font-medium transition-all" href="#">
                <span className="material-symbols-outlined">logout</span>
                Đăng xuất
              </a>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow space-y-10">
          {/* Profile Section */}
          <section className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 backdrop-blur">
            <div className="flex justify-between items-center mb-10 pb-6 border-b-2 border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 mb-2 text-3xl">Thông tin hồ sơ</h3>
                <p className="text-slate-500 text-sm">Quản lý thông tin cá nhân của bạn để bảo mật tài khoản</p>
              </div>
              <button className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-full hover:shadow-lg transition-all text-sm">
                Chỉnh sửa
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-2">
                <label className="text-amber-600 text-xs font-bold uppercase tracking-wider">Họ và tên</label>
                <p className="text-lg text-slate-900 font-semibold">{mockUser.fullName}</p>
              </div>
              <div className="space-y-2">
                <label className="text-amber-600 text-xs font-bold uppercase tracking-wider">Địa chỉ Email</label>
                <p className="text-lg text-slate-900 font-semibold">{mockUser.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-amber-600 text-xs font-bold uppercase tracking-wider">Số điện thoại</label>
                <p className="text-lg text-slate-900 font-semibold">{mockUser.phone}</p>
              </div>
              <div className="space-y-2">
                <label className="text-amber-600 text-xs font-bold uppercase tracking-wider">Địa chỉ mặc định</label>
                <p className="text-lg text-slate-900 font-semibold">
                  {mockUser.addresses[0].line1}, {mockUser.addresses[0].city}, {mockUser.addresses[0].state}
                </p>
              </div>
            </div>
          </section>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 backdrop-blur">
            <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-slate-100">
              <h3 className="font-bold text-slate-900 text-3xl">Đơn hàng gần đây</h3>
              <a className="text-amber-600 font-semibold hover:text-amber-700 underline-offset-4 text-sm" href="#">Xem tất cả</a>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img className="w-full h-full object-cover" src={order.image} alt={order.name} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-base">{order.name}</p>
                      <p className="text-sm text-slate-500">Mã đơn: <span className="font-medium text-amber-600">{order.id}</span></p>
                      <p className="text-sm text-slate-500 mt-1">Ngày đặt: {order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-600 mb-2">{order.price}</p>
                    <span className={`inline-block px-4 py-1.5 ${order.statusColor} text-xs font-bold uppercase tracking-wider rounded-full`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
