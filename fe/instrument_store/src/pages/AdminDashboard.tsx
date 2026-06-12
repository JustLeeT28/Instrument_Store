import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout, fetchCurrentUser } from '../services/auth';
import { useEffect, useState } from 'react';

export function AdminDashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    fetchCurrentUser()
      .then(u => {
        if (!mounted) return;
        setUserName(u.fullName || u.email);
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <Link to="/admin" className="font-bold text-lg">Admin Dashboard</Link>
          <div className="text-sm text-gray-600">{userName}</div>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink to="/admin" end className={({isActive})=> isActive? 'block p-2 bg-gray-100 rounded':'block p-2 hover:bg-gray-50 rounded'}>Thống kê doanh thu</NavLink>
          <NavLink to="/admin/users" className={({isActive})=> isActive? 'block p-2 bg-gray-100 rounded':'block p-2 hover:bg-gray-50 rounded'}>Quản lý tài khoản</NavLink>
          <NavLink to="/admin/products" className={({isActive})=> isActive? 'block p-2 bg-gray-100 rounded':'block p-2 hover:bg-gray-50 rounded'}>Quản lý sản phẩm</NavLink>
          <NavLink to="/admin/vouchers" className={({isActive})=> isActive? 'block p-2 bg-gray-100 rounded':'block p-2 hover:bg-gray-50 rounded'}>Quản lý voucher</NavLink>
          <NavLink to="/" className="block p-2 hover:bg-gray-50 rounded">Quay về trang chủ</NavLink>
          <button onClick={handleLogout} className="w-full text-left p-2 hover:bg-gray-50 rounded">Đăng xuất</button>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminDashboard;
