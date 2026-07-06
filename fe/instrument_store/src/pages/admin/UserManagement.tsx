import { useEffect, useMemo, useState } from 'react';
import {
  fetchAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminUser,
  type UserRole,
} from '../../services/adminUsers';

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'CUSTOMER', label: 'Khach hang' },
  { value: 'STUDENT', label: 'Hoc sinh / sinh vien' },
  { value: 'TEACHER', label: 'Giao vien' },
  { value: 'ADMIN', label: 'Quan tri vien' },
];

const ROLE_BADGE: Record<UserRole, string> = {
  CUSTOMER: 'bg-slate-100 text-slate-700',
  STUDENT: 'bg-sky-50 text-sky-700',
  TEACHER: 'bg-amber-50 text-amber-700',
  ADMIN: 'bg-rose-50 text-rose-700',
};

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

function getRoleLabel(role: UserRole) {
  return ROLE_OPTIONS.find(option => option.value === role)?.label ?? role;
}

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    fetchAdminUsers()
      .then(data => {
        if (!mounted) return;
        setUsers(data);
        setError(null);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Khong the tai danh sach tai khoan');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    return users.reduce(
      (result, user) => {
        result.total += 1;
        if (user.status) result.active += 1;
        if (!user.status) result.locked += 1;
        if (user.role === 'ADMIN') result.admin += 1;
        return result;
      },
      { total: 0, active: 0, locked: 0, admin: 0 }
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return users.filter(user => {
      const matchesText =
        !keyword ||
        user.email.toLowerCase().includes(keyword) ||
        (user.fullName ?? '').toLowerCase().includes(keyword) ||
        (user.phone ?? '').toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && user.status) ||
        (statusFilter === 'LOCKED' && !user.status);
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      return matchesText && matchesStatus && matchesRole;
    });
  }, [users, query, statusFilter, roleFilter]);

  async function handleRoleChange(user: AdminUser, role: UserRole) {
    if (user.role === role) return;

    setSavingId(user.id);
    setError(null);

    try {
      const updated = await updateAdminUserRole(user.id, role);
      setUsers(prev => prev.map(item => (item.id === user.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the cap nhat vai tro');
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggleStatus(user: AdminUser) {
    setSavingId(user.id);
    setError(null);

    try {
      const updated = await updateAdminUserStatus(user.id, !user.status);
      setUsers(prev => prev.map(item => (item.id === user.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the cap nhat trang thai');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Admin</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-950">Quan ly tai khoan</h2>
          <p className="mt-2 text-sm text-slate-500">Phan quyen va khoa/mo khoa tai khoan nguoi dung.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label="Tong" value={stats.total} />
          <StatBox label="Hoat dong" value={stats.active} />
          <StatBox label="Da khoa" value={stats.locked} />
          <StatBox label="Admin" value={stats.admin} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">search</span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Tim theo ten, email hoac so dien thoai"
              className="w-full rounded-md border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <select
            value={roleFilter}
            onChange={event => setRoleFilter(event.target.value as 'ALL' | UserRole)}
            className="rounded-md border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option value="ALL">Tat ca vai tro</option>
            {ROLE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value as 'ALL' | 'ACTIVE' | 'LOCKED')}
            className="rounded-md border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option value="ALL">Tat ca trang thai</option>
            <option value="ACTIVE">Dang hoat dong</option>
            <option value="LOCKED">Da khoa</option>
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
                <th className="px-5 py-4 font-bold">Tai khoan</th>
                <th className="px-5 py-4 font-bold">Vai tro</th>
                <th className="px-5 py-4 font-bold">Trang thai</th>
                <th className="px-5 py-4 font-bold">Ngay tao</th>
                <th className="px-5 py-4 text-right font-bold">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">Dang tai danh sach tai khoan...</td>
                </tr>
              )}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">Khong co tai khoan phu hop.</td>
                </tr>
              )}

              {!loading && filteredUsers.map(user => {
                const isSaving = savingId === user.id;

                return (
                  <tr key={user.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold uppercase text-white">
                          {(user.fullName?.trim() || user.email).slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">{user.fullName?.trim() || 'Chua cap nhat ten'}</p>
                          <p className="truncate text-xs text-slate-500">{user.email}</p>
                          <p className="truncate text-xs text-slate-400">{user.phone || 'Chua co so dien thoai'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${ROLE_BADGE[user.role]}`}>
                          {getRoleLabel(user.role)}
                        </span>
                        <select
                          value={user.role}
                          onChange={event => handleRoleChange(user, event.target.value as UserRole)}
                          disabled={isSaving}
                          className="block w-44 rounded-md border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {ROLE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${user.status ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {user.status ? 'Dang hoat dong' : 'Da khoa'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={isSaving}
                        className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          user.status
                            ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50'
                            : 'border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{user.status ? 'lock' : 'lock_open'}</span>
                        {isSaving ? 'Dang luu...' : user.status ? 'Khoa' : 'Mo khoa'}
                      </button>
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

export default UserManagement;
