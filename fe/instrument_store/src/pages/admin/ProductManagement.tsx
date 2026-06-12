import { useEffect, useMemo, useState } from 'react';
import { fetchProducts, type ProductItem as ServiceProductItem } from '../../services/products';

// Định nghĩa Interface riêng cho trang Admin để mở rộng thêm các trường UI cần thiết
// và tránh xung đột với định nghĩa gốc từ Service
export interface AdminProductItem {
  id: string;
  name: string;
  slug?: string;
  brand?: string | null;
  category?: string | null;
  price: number;
  rating?: number | null;
  reviewCount?: number | null;
  badge?: string | null;
  stockQty?: number | null;
  description?: string;
  image?: string; // URL ảnh chính
  images?: string[]; // Mảng các URL hình ảnh
  specs?: Record<string, any>; // Để chuẩn bị cho phần thông số kỹ thuật
}

interface ProductImage {
  url: string;
  isPrimary: boolean;
}

// Mở rộng interface cho form chỉnh sửa
interface EditProductData extends Omit<AdminProductItem, 'images'> {
  slug?: string;
  description?: string;
  images: ProductImage[];
}

export function ProductManagement() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State cho cửa sổ Edit
  const [editingProduct, setEditingProduct] = useState<EditProductData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newImgLink, setNewImgLink] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then((data) => setProducts(data as unknown as AdminProductItem[]))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const handleEdit = (p: AdminProductItem) => {
    // Chuẩn hóa dữ liệu ảnh sang dạng Object để dễ quản lý local
    const normalizedImages: ProductImage[] = (p.images || []).map(img => 
      typeof img === 'string' ? { url: img, isPrimary: img === p.image } : img
    );

    if (normalizedImages.length === 0 && p.image) {
      normalizedImages.push({ url: p.image, isPrimary: true });
    }

    setEditingProduct({
      ...p,
      slug: p.slug || '',
      description: p.description || '',
      images: normalizedImages
    });
  };

  const handleAddImage = () => {
    if (!newImgLink.trim() || !editingProduct) return;
    const isPrimary = editingProduct.images.length === 0;
    setEditingProduct({
      ...editingProduct,
      images: [...editingProduct.images, { url: newImgLink.trim(), isPrimary }]
    });
    setNewImgLink('');
  };

  const setPrimaryImage = (index: number) => {
    if (!editingProduct) return;
    const updated = editingProduct.images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    setEditingProduct({ ...editingProduct, images: updated });
  };

  const removeImage = (index: number) => {
    if (!editingProduct) return;
    const updated = editingProduct.images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setEditingProduct({ ...editingProduct, images: updated });
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      // Placeholder: Gọi API cập nhật sản phẩm ở đây
      console.log('Saving changes...', editingProduct);
      setEditingProduct(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .window-drop { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <h2 className="text-2xl font-semibold mb-4">Quản lý sản phẩm</h2>

      <div className="mb-4 flex">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên sản phẩm"
          className="flex-1 border p-2 rounded mr-2"
        />
        <button onClick={() => {}} className="px-4 py-2 bg-indigo-600 text-white rounded">Tìm</button>
      </div>

      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="flex items-center bg-white shadow-sm p-4 rounded">
            <img src={p.image || '/favicon.svg'} alt="" className="w-20 h-20 object-cover rounded mr-4" />
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">Giá: {p.price.toLocaleString()} VND</div>
              <div className="text-sm text-gray-600">Số lượng: {p.stockQty ?? 0}</div>
            </div>
            <div>
              <button onClick={() => handleEdit(p)} className="px-3 py-1 border rounded hover:bg-slate-50 transition shadow-sm">Edit</button>
            </div>
          </div>
        ))}
      </div>

      {/* Cửa sổ Edit (Overlay & Modal) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm pt-6 px-4 pb-12 overflow-y-auto">
          <div className="window-drop bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl flex flex-col">
            <div className="p-8 md:p-10 border-b flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-bold text-slate-900">Thông tin chi tiết</h3>
                <p className="text-xs text-slate-400 font-mono tracking-wider mt-1 uppercase">ID: {editingProduct.id}</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <div className="p-8 md:p-10 space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3">Tên nhạc cụ</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-slate-900 focus:ring-2 focus:ring-amber-500 transition shadow-inner font-medium"
                      value={editingProduct.name}
                      onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3">Slug (Đường dẫn)</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-slate-900 focus:ring-2 focus:ring-amber-500 transition shadow-inner font-mono text-sm"
                      value={editingProduct.slug}
                      onChange={e => setEditingProduct({...editingProduct, slug: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3">Giá niêm yết (đ)</label>
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-slate-900 focus:ring-2 focus:ring-amber-500 transition shadow-inner font-bold"
                        value={editingProduct.price}
                        onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3">Tồn kho</label>
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-slate-900 focus:ring-2 focus:ring-amber-500 transition shadow-inner"
                        value={editingProduct.stockQty ?? 0}
                        onChange={e => setEditingProduct({...editingProduct, stockQty: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3">Mô tả sản phẩm</label>
                  <textarea 
                    rows={10}
                    className="w-full bg-slate-50 border-none rounded-[2rem] px-6 py-5 text-slate-900 focus:ring-2 focus:ring-amber-500 transition shadow-inner resize-none h-full leading-relaxed"
                    value={editingProduct.description}
                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-6">Thư viện hình ảnh</label>
                <div className="flex gap-4 mb-8">
                  <input 
                    type="text" 
                    placeholder="Dán link hình ảnh mới tại đây..."
                    className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-amber-500 transition shadow-inner"
                    value={newImgLink}
                    onChange={e => setNewImgLink(e.target.value)}
                  />
                  <button onClick={handleAddImage} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-xs hover:bg-amber-600 transition shadow-lg active:scale-95 uppercase tracking-widest">Thêm ảnh</button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {editingProduct.images.map((img, idx) => (
                    <div key={idx} className={`group relative rounded-[2.5rem] border-2 transition-all p-4 ${img.isPrimary ? 'border-amber-500 bg-amber-50/30 shadow-md' : 'border-slate-100 bg-white'}`}>
                      <img src={img.url} alt="" className="w-full aspect-[4/5] object-contain bg-white rounded-3xl mb-4 shadow-sm" />
                      <div className="space-y-4">
                        <p className="text-[9px] text-slate-400 truncate px-2 font-mono text-center">{img.url}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setPrimaryImage(idx)} 
                            className={`flex-1 text-[9px] font-bold py-2.5 rounded-xl transition-all ${img.isPrimary ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-amber-100'}`}
                          >
                            {img.isPrimary ? 'ẢNH CHÍNH' : 'ĐẶT CHÍNH'}
                          </button>
                          <button onClick={() => removeImage(idx)} className="bg-red-50 text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 border-t bg-slate-50/30 flex justify-end gap-6 rounded-b-[3rem]">
              <button onClick={() => setEditingProduct(null)} className="px-10 py-4 font-bold text-slate-400 hover:text-slate-900 transition tracking-widest text-[10px] uppercase">Hủy bỏ</button>
              <button onClick={handleSave} disabled={isSaving} className="px-16 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-amber-600 transition shadow-2xl active:scale-[0.98] disabled:opacity-50 tracking-widest text-[10px] uppercase">
                {isSaving ? 'Đang xử lý...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
