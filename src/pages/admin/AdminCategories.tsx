import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, type BackendAdminCategory } from '../../services/admin.service';

const AdminCategories: React.FC = () => {
  const [items, setItems] = useState<BackendAdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const [newName, setNewName] = useState('');
  const [newSection, setNewSection] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.listCategories();
      setItems(data);
    } catch (e: any) {
      toast.error(e?.message || 'Lỗi tải categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((c) => `${c.name} ${c.menuSection || ''}`.toLowerCase().includes(s));
  }, [items, q]);

  const onCreate = async () => {
    try {
      if (!newName.trim()) {
        toast.error('Vui lòng nhập tên category');
        return;
      }
      const c = await adminService.createCategory({ name: newName.trim(), menuSection: newSection.trim() || null });
      toast.success('Tạo category thành công');
      setItems((prev) => [c, ...prev]);
      setNewName('');
      setNewSection('');
    } catch (e: any) {
      toast.error(e?.message || 'Tạo category thất bại');
    }
  };

  const onUpdate = async (c: BackendAdminCategory) => {
    try {
      const name = window.prompt('Tên category', c.name);
      if (!name) return;
      const menuSection = window.prompt('Menu section (optional)', c.menuSection || '') ?? '';
      const updated = await adminService.updateCategory(String(c.id), { name, menuSection: menuSection || null });
      toast.success('Cập nhật category thành công');
      setItems((prev) => prev.map((x) => (String(x.id) === String(c.id) ? updated : x)));
    } catch (e: any) {
      toast.error(e?.message || 'Cập nhật category thất bại');
    }
  };

  const onDelete = async (c: BackendAdminCategory) => {
    const ok = window.confirm(`Xóa category "${c.name}"?`);
    if (!ok) return;
    try {
      await adminService.deleteCategory(String(c.id));
      toast.success('Đã xóa category');
      setItems((prev) => prev.filter((x) => String(x.id) !== String(c.id)));
    } catch (e: any) {
      toast.error(e?.message || 'Xóa category thất bại');
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Quản lý danh mục</h1>
            <p className="text-gray-500 font-medium mt-1">CRUD categories</p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
              <Search size={18} className="text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm category..."
                className="w-full outline-none font-bold text-gray-700 bg-transparent"
              />
            </div>

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tên category mới"
              className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 font-bold outline-none"
            />

            <div className="flex items-center gap-2">
              <input
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                placeholder="Menu section (optional)"
                className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 font-bold outline-none"
              />
              <button
                onClick={onCreate}
                className="px-4 py-3 rounded-2xl font-black bg-gray-900 text-white hover:bg-amber-600 flex items-center gap-2"
              >
                <Plus size={16} />
                Tạo
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900">Categories</h2>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{filtered.length} items</span>
          </div>

          {loading ? (
            <div className="p-10 text-center font-bold text-gray-400">Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Menu Section</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((c) => (
                    <tr key={String(c.id)} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5 text-sm font-black text-gray-900">{c.name}</td>
                      <td className="px-6 py-5 text-sm font-bold text-gray-600">{c.menuSection || '-'}</td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onUpdate(c)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Cập nhật"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={() => onDelete(c)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center text-gray-500 font-bold">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
