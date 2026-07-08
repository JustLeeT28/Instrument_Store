import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { fetchCurrentUser, logout } from '../services/auth';

export function AdminDashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    fetchCurrentUser().then(user => {
      if (!mounted) return;
      setUserName(user.fullName || user.email);
    });

    return () => {
      mounted = false;
    };
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'block rounded bg-gray-100 p-2' : 'block rounded p-2 hover:bg-gray-50';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 border-r bg-white">
        <div className="border-b p-4">
          <Link to="/admin" className="text-lg font-bold">Admin Dashboard</Link>
          <div className="text-sm text-gray-600">{userName}</div>
        </div>
        <nav className="space-y-2 p-4">
          <NavLink to="/admin" end className={navClass}>Thống kê doanh thu</NavLink>
          <NavLink to="/admin/users" className={navClass}>Quản lý tài khoản</NavLink>
          <NavLink to="/admin/products" className={navClass}>Quản lý sản phẩm</NavLink>
          <NavLink to="/admin/vouchers" className={navClass}>Quản lý voucher</NavLink>
          <NavLink to="/" className="block rounded p-2 hover:bg-gray-50">Quay về trang chủ</NavLink>
          <button onClick={handleLogout} className="w-full rounded p-2 text-left hover:bg-gray-50">Đăng xuất</button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminDashboard;
