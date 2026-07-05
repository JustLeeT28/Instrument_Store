import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { fetchProducts, updateProduct, type ProductItem as ServiceProductItem } from '../../services/products';

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

interface SpecItem {
  key: string;
  value: string;
}

// Mở rộng interface cho form chỉnh sửa
interface EditProductData extends Omit<AdminProductItem, 'images' | 'specs'> {
  slug?: string;
  description?: string;
  images: ProductImage[];
  specs: SpecItem[];
}

export function ProductManagement() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State cho cửa sổ Edit
  const [editingProduct, setEditingProduct] = useState<EditProductData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);
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

    // Specs là Array rồi, không cần convert
    const normalizedSpecs: SpecItem[] = Array.isArray(p.specs) 
      ? (p.specs as any[]).map(spec => ({
          key: spec.key || '',
          value: spec.value || ''
        }))
      : [];

    setEditingProduct({
      ...p,
      slug: p.slug || '',
      description: p.description || '',
      images: normalizedImages,
      specs: normalizedSpecs
    });
  };

  const handleAddImage = () => {
    if (!newImgLink.trim() || !editingProduct) return;
    const hasPrimary = editingProduct.images.some(img => img.isPrimary);
    const isPrimary = editingProduct.images.length === 0 || !hasPrimary;
    setEditingProduct({
      ...editingProduct,
      images: [...editingProduct.images, { url: newImgLink.trim(), isPrimary }]
    });
    setNewImgLink('');
    setUploadImageError(null);
  };

  const uploadImageToCloudinary = async (file: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Thiếu cấu hình Cloudinary. Vui lòng thêm VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET vào file .env');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'instrument-store/products');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Upload ảnh lên Cloudinary thất bại');
    }

    const data = await res.json();
    return data.secure_url as string;
  };

  const handleImageFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length || !editingProduct) return;

    setIsUploadingImage(true);
    setUploadImageError(null);

    try {
      const uploadedUrls = await Promise.all(files.map(file => uploadImageToCloudinary(file)));
      const hasPrimary = editingProduct.images.some(img => img.isPrimary);

      setEditingProduct(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          images: [
            ...prev.images,
            ...uploadedUrls.map((url, index) => ({
              url,
              isPrimary: prev.images.length === 0 && !hasPrimary && index === 0,
            }))
          ]
        };
      });
    } catch (error) {
      setUploadImageError(error instanceof Error ? error.message : 'Upload ảnh thất bại');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
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

  // Logic xử lý Specs
  const addSpec = () => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      specs: [...editingProduct.specs, { key: '', value: '' }]
    });
  };

  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    if (!editingProduct) return;
    const newSpecs = [...editingProduct.specs];
    newSpecs[index] = { ...newSpecs[index], [field]: val };
    setEditingProduct({ ...editingProduct, specs: newSpecs });
  };

  const removeSpec = (index: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      specs: editingProduct.specs.filter((_, i) => i !== index)
    });
  };

  const moveSpec = (index: number, direction: 'up' | 'down') => {
    if (!editingProduct) return;
    const newSpecs = [...editingProduct.specs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSpecs.length) return;
    [newSpecs[index], newSpecs[targetIndex]] = [newSpecs[targetIndex], newSpecs[index]];
    setEditingProduct({ ...editingProduct, specs: newSpecs });
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    setIsSaving(true);
    setError(null);

    try {
      const specsArray = editingProduct.specs
        .filter(spec => spec.key.trim())
        .map(spec => ({ key: spec.key.trim(), value: spec.value }));

      const payload = {
        name: editingProduct.name,
        slug: editingProduct.slug,
        description: editingProduct.description,
        price: editingProduct.price,
        stockQty: editingProduct.stockQty ?? 0,
        images: editingProduct.images.map(({ url, isPrimary }) => ({ imageUrl: url, isPrimary })),
        specs: specsArray,
      };

      const updatedProduct = await updateProduct(editingProduct.id, payload);
      setProducts(prev => prev.map(item => item.id === editingProduct.id ? {
        ...item,
        name: updatedProduct.name ?? item.name,
        slug: updatedProduct.slug ?? item.slug,
        price: updatedProduct.price ?? item.price,
        stockQty: updatedProduct.stockQty ?? item.stockQty,
        image: updatedProduct.image ?? updatedProduct.images?.[0] ?? item.image,
        images: updatedProduct.images ?? item.images ?? [],
        specs: updatedProduct.specs ?? item.specs,
      } : item));
      setEditingProduct(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể lưu sản phẩm');
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
                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Dán link hình ảnh mới tại đây..."
                      className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-amber-500 transition shadow-inner"
                      value={newImgLink}
                      onChange={e => setNewImgLink(e.target.value)}
                    />
                    <button onClick={handleAddImage} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-xs hover:bg-amber-600 transition shadow-lg active:scale-95 uppercase tracking-widest">Thêm ảnh</button>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                      <span className="material-symbols-outlined text-base">cloud_upload</span>
                      <span>{isUploadingImage ? 'Đang upload...' : 'Tải ảnh từ máy tính'}</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageFilesSelected} className="hidden" />
                    </label>
                    <p className="text-xs text-slate-500">Ảnh sẽ upload lên Cloudinary rồi lưu URL vào sản phẩm.</p>
                  </div>
                  {uploadImageError && <p className="text-sm text-red-600">{uploadImageError}</p>}
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

              <div className="pt-10 border-t border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Thông số kỹ thuật</label>
                  <button 
                    onClick={addSpec}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    THÊM THÔNG SỐ
                  </button>
                </div>

                <div className="overflow-hidden border border-slate-100 rounded-[2rem] bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tên thông số (Key)</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giá trị (Value)</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-40 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {editingProduct.specs.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-8 py-10 text-center text-slate-400 italic text-sm">Chưa có thông số kỹ thuật nào.</td>
                        </tr>
                      )}
                      {editingProduct.specs.map((spec, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <input 
                              type="text" 
                              placeholder="Ví dụ: Chất liệu"
                              className="w-full bg-transparent border-none focus:ring-0 text-slate-900 font-semibold text-sm placeholder:text-slate-300"
                              value={spec.key}
                              onChange={e => updateSpec(idx, 'key', e.target.value)}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="text" 
                              placeholder="Ví dụ: Gỗ Mahogany"
                              className="w-full bg-transparent border-none focus:ring-0 text-slate-900 text-sm placeholder:text-slate-300"
                              value={spec.value}
                              onChange={e => updateSpec(idx, 'value', e.target.value)}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => moveSpec(idx, 'up')} disabled={idx === 0} className="p-2 text-slate-400 hover:text-amber-600 disabled:opacity-20">
                                <span className="material-symbols-outlined text-lg">arrow_upward</span>
                              </button>
                              <button onClick={() => moveSpec(idx, 'down')} disabled={idx === editingProduct.specs.length - 1} className="p-2 text-slate-400 hover:text-amber-600 disabled:opacity-20">
                                <span className="material-symbols-outlined text-lg">arrow_downward</span>
                              </button>
                              <button onClick={() => removeSpec(idx)} className="p-2 text-slate-400 hover:text-red-500">
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
