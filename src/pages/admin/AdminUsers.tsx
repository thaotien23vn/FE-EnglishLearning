import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, type BackendAdminUser } from '../../services/admin.service';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<BackendAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<'student' | 'teacher'>('student');

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.listUsers();
      setUsers(data);
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi tải danh sách user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      const hay = `${u.name} ${u.username || ''} ${u.email} ${u.role}`.toLowerCase();
      return hay.includes(s);
    });
  }, [users, q]);

  const onCreate = async () => {
    try {
      if (!createUsername.trim() || !createEmail.trim() || !createPassword.trim()) {
        toast.error('Vui lòng nhập username, email, password');
        return;
      }

      await adminService.createUser({
        username: createUsername.trim(),
        email: createEmail.trim(),
        password: createPassword,
        role: createRole,
      });

      toast.success('Tạo user thành công');
      setIsCreateOpen(false);
      setCreateUsername('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('student');
      await load();
    } catch (e: any) {
      toast.error(e?.message || 'Tạo user thất bại');
    }
  };

  const onChangeRole = async (u: BackendAdminUser, role: 'student' | 'teacher') => {
    try {
      await adminService.updateUser(String(u.id), { role });
      toast.success('Cập nhật role thành công');
      setUsers((prev) => prev.map((x) => (String(x.id) === String(u.id) ? { ...x, role } : x)));
    } catch (e: any) {
      toast.error(e?.message || 'Cập nhật role thất bại');
    }
  };

  const onResetPassword = async (u: BackendAdminUser) => {
    const newPassword = window.prompt(`Nhập mật khẩu mới cho ${u.email}`);
    if (!newPassword) return;
    try {
      await adminService.updateUser(String(u.id), { newPassword });
      toast.success('Reset mật khẩu thành công');
    } catch (e: any) {
      toast.error(e?.message || 'Reset mật khẩu thất bại');
    }
  };

  const onDelete = async (u: BackendAdminUser) => {
    const ok = window.confirm(`Xóa user ${u.email}?`);
    if (!ok) return;
    try {
      await adminService.deleteUser(String(u.id));
      toast.success('Xóa user thành công');
      setUsers((prev) => prev.filter((x) => String(x.id) !== String(u.id)));
    } catch (e: any) {
      toast.error(e?.message || 'Xóa user thất bại');
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Quản lý người dùng</h1>
            <p className="text-gray-500 font-medium mt-1">Tạo / phân quyền / xóa user</p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-amber-600 transition-all shadow-xl shadow-gray-200 active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            TẠO USER
          </button>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
              <Search size={18} />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên, email, role..."
              className="w-full outline-none font-bold text-gray-700"
            />
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900">Danh sách user</h2>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{filtered.length} users</span>
          </div>

          {loading ? (
            <div className="p-10 text-center font-bold text-gray-400">Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Verified</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((u) => (
                    <tr key={String(u.id)} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div>
                          <div className="text-sm font-black text-gray-900">{u.name}</div>
                          <div className="text-[11px] font-bold text-gray-400">{u.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          value={u.role}
                          disabled={u.role === 'admin'}
                          onChange={(e) => onChangeRole(u, e.target.value as any)}
                          className="text-xs font-black uppercase tracking-widest bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-gray-700"
                        >
                          <option value="student">STUDENT</option>
                          <option value="teacher">TEACHER</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${u.isEmailVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500'}`}>
                          {u.isEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onResetPassword(u)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Reset password"
                          >
                            <UserCog size={18} />
                          </button>
                          <button
                            onClick={() => onDelete(u)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Xóa user"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-gray-500 font-bold">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-xl bg-white rounded-[28px] border border-gray-100 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h3 className="text-lg font-black text-gray-900">Tạo user mới</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Username</label>
                    <input
                      value={createUsername}
                      onChange={(e) => setCreateUsername(e.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Role</label>
                    <select
                      value={createRole}
                      onChange={(e) => setCreateRole(e.target.value as any)}
                      className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 font-black uppercase tracking-widest outline-none"
                    >
                      <option value="student">STUDENT</option>
                      <option value="teacher">TEACHER</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Email</label>
                  <input
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Password</label>
                  <input
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-50 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-3 rounded-2xl font-black text-gray-500 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={onCreate}
                  className="px-5 py-3 rounded-2xl font-black bg-gray-900 text-white hover:bg-amber-600"
                >
                  Tạo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
