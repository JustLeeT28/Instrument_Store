import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  createProduct,
  fetchProducts,
  updateProduct,
  type ProductItem as ServiceProductItem,
} from '../../services/products';
import { fetchBrands, type Brand } from '../../services/brands';
import { fetchCategories, type Category } from '../../services/categories';

const OTHER_BRAND_VALUE = '__other_brand__';

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
  description?: string | null;
  image?: string | null;
  images?: string[] | null;
  specs?: Array<Record<string, string>> | null;
}

interface ProductImage {
  url: string;
  isPrimary: boolean;
}

interface SpecItem {
  key: string;
  value: string;
}

interface EditProductData extends Omit<AdminProductItem, 'images' | 'specs'> {
  id: string;
  slug?: string;
  description?: string | null;
  brandId?: string;
  brandName?: string;
  categoryId?: string;
  images: ProductImage[];
  specs: SpecItem[];
  isNew?: boolean;
}

const emptyProduct: EditProductData = {
  id: 'new',
  name: '',
  slug: '',
  brandId: '',
  brandName: '',
  categoryId: '',
  description: '',
  price: 0,
  stockQty: 0,
  image: null,
  images: [],
  specs: [],
  isNew: true,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function toEditProduct(product: AdminProductItem, brands: Brand[], categories: Category[]): EditProductData {
  const matchedBrand = brands.find(brand => brand.name === product.brand);
  const normalizedImages: ProductImage[] = (product.images ?? []).map(image => ({
    url: image,
    isPrimary: image === product.image,
  }));

  if (normalizedImages.length === 0 && product.image) {
    normalizedImages.push({ url: product.image, isPrimary: true });
  }

  const normalizedSpecs: SpecItem[] = Array.isArray(product.specs)
    ? product.specs.map(spec => ({
        key: spec.key ?? '',
        value: spec.value ?? '',
      }))
    : [];

  return {
    ...product,
    slug: product.slug ?? '',
    brandId: matchedBrand?.id ?? (product.brand ? OTHER_BRAND_VALUE : ''),
    brandName: matchedBrand ? '' : product.brand ?? '',
    categoryId: categories.find(category => category.name === product.category)?.id ?? '',
    description: product.description ?? '',
    images: normalizedImages,
    specs: normalizedSpecs,
  };
}

export function ProductManagement() {
  const [query, setQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<EditProductData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);
  const [newImgLink, setNewImgLink] = useState('');

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    Promise.all([fetchProducts(), fetchBrands(), fetchCategories()])
      .then(([productData, brandData, categoryData]) => {
        if (!mounted) return;
        setProducts(productData as unknown as AdminProductItem[]);
        setBrands(brandData);
        setCategories(categoryData);
        setError(null);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    return products.reduce(
      (result, product) => {
        const stock = product.stockQty ?? 0;
        result.total += 1;
        result.inventory += stock;
        result.value += stock * (product.price ?? 0);
        if (stock === 0) result.outOfStock += 1;
        if (stock > 0 && stock <= 5) result.lowStock += 1;
        return result;
      },
      { total: 0, inventory: 0, value: 0, lowStock: 0, outOfStock: 0 }
    );
  }, [products]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return products.filter(product => {
      const stock = product.stockQty ?? 0;
      const matchesText =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        (product.slug ?? '').toLowerCase().includes(keyword) ||
        (product.brand ?? '').toLowerCase().includes(keyword) ||
        (product.category ?? '').toLowerCase().includes(keyword);
      const matchesStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'IN_STOCK' && stock > 5) ||
        (stockFilter === 'LOW_STOCK' && stock > 0 && stock <= 5) ||
        (stockFilter === 'OUT_OF_STOCK' && stock === 0);

      return matchesText && matchesStock;
    });
  }, [products, query, stockFilter]);

  const handleAddNew = () => {
    setUploadImageError(null);
    setNewImgLink('');
    setEditingProduct({ ...emptyProduct, images: [], specs: [] });
  };

  const handleEdit = (product: AdminProductItem) => {
    setUploadImageError(null);
    setNewImgLink('');
    setEditingProduct(toEditProduct(product, brands, categories));
  };

  const handleAddImage = () => {
    if (!newImgLink.trim() || !editingProduct) return;
    const hasPrimary = editingProduct.images.some(image => image.isPrimary);
    setEditingProduct({
      ...editingProduct,
      images: [...editingProduct.images, { url: newImgLink.trim(), isPrimary: editingProduct.images.length === 0 || !hasPrimary }],
    });
    setNewImgLink('');
    setUploadImageError(null);
  };

  const uploadImageToCloudinary = async (file: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Thiếu cấu hình Cloudinary trong file .env');
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

      setEditingProduct(prev => {
        if (!prev) return prev;
        const hasPrimary = prev.images.some(image => image.isPrimary);
        return {
          ...prev,
          images: [
            ...prev.images,
            ...uploadedUrls.map((url, index) => ({
              url,
              isPrimary: prev.images.length === 0 && !hasPrimary && index === 0,
            })),
          ],
        };
      });
    } catch (err) {
      setUploadImageError(err instanceof Error ? err.message : 'Upload ảnh thất bại');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const setPrimaryImage = (index: number) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      images: editingProduct.images.map((image, imageIndex) => ({
        ...image,
        isPrimary: imageIndex === index,
      })),
    });
  };

  const removeImage = (index: number) => {
    if (!editingProduct) return;
    const updated = editingProduct.images.filter((_, imageIndex) => imageIndex !== index);
    if (updated.length > 0 && !updated.some(image => image.isPrimary)) {
      updated[0] = { ...updated[0], isPrimary: true };
    }
    setEditingProduct({ ...editingProduct, images: updated });
  };

  const addSpec = () => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, specs: [...editingProduct.specs, { key: '', value: '' }] });
  };

  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    if (!editingProduct) return;
    const specs = [...editingProduct.specs];
    specs[index] = { ...specs[index], [field]: value };
    setEditingProduct({ ...editingProduct, specs });
  };

  const removeSpec = (index: number) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, specs: editingProduct.specs.filter((_, specIndex) => specIndex !== index) });
  };

  const moveSpec = (index: number, direction: 'up' | 'down') => {
    if (!editingProduct) return;
    const specs = [...editingProduct.specs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= specs.length) return;
    [specs[index], specs[targetIndex]] = [specs[targetIndex], specs[index]];
    setEditingProduct({ ...editingProduct, specs });
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name: editingProduct.name.trim(),
        slug: editingProduct.slug?.trim() || undefined,
        description: editingProduct.description ?? '',
        price: editingProduct.price,
        stockQty: editingProduct.stockQty ?? 0,
        brandId: editingProduct.brandId && editingProduct.brandId !== OTHER_BRAND_VALUE ? editingProduct.brandId : undefined,
        brandName: editingProduct.brandId === OTHER_BRAND_VALUE ? editingProduct.brandName?.trim() || undefined : undefined,
        categoryId: editingProduct.categoryId || undefined,
        images: editingProduct.images.map(({ url, isPrimary }) => ({ imageUrl: url, isPrimary })),
        specs: editingProduct.specs
          .filter(spec => spec.key.trim())
          .map(spec => ({ key: spec.key.trim(), value: spec.value })),
      };

      const savedProduct: ServiceProductItem = editingProduct.isNew
        ? await createProduct(payload)
        : await updateProduct(editingProduct.id, payload);

      setProducts(prev => {
        const nextProduct = savedProduct as unknown as AdminProductItem;
        return editingProduct.isNew
          ? [nextProduct, ...prev]
          : prev.map(item => (item.id === editingProduct.id ? nextProduct : item));
      });
      setEditingProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu sản phẩm');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .window-drop { animation: slideDown 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .field-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(226 232 240);
          background: white;
          padding: 0.75rem 0.875rem;
          color: rgb(15 23 42);
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .field-input:focus {
          border-color: rgb(245 158 11);
          box-shadow: 0 0 0 3px rgb(254 243 199);
        }
      `}</style>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Admin</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-950">Quản lý sản phẩm</h2>
          <p className="mt-2 text-sm text-slate-500">Theo dõi tồn kho, giá bán và cập nhật nội dung sản phẩm.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm sản phẩm
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatBox label="Tổng sản phẩm" value={stats.total.toLocaleString('vi-VN')} />
        <StatBox label="Tồn kho" value={stats.inventory.toLocaleString('vi-VN')} />
        <StatBox label="Giá trị kho" value={formatCurrency(stats.value)} />
        <StatBox label="Sắp hết" value={stats.lowStock.toLocaleString('vi-VN')} tone="amber" />
        <StatBox label="Hết hàng" value={stats.outOfStock.toLocaleString('vi-VN')} tone="red" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">search</span>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Tìm theo tên, slug, thương hiệu hoặc danh mục"
              className="w-full rounded-md border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <select
            value={stockFilter}
            onChange={event => setStockFilter(event.target.value as typeof stockFilter)}
            className="rounded-md border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          >
            <option value="ALL">Tất cả tồn kho</option>
            <option value="IN_STOCK">Còn hàng</option>
            <option value="LOW_STOCK">Sắp hết hàng</option>
            <option value="OUT_OF_STOCK">Hết hàng</option>
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
                <th className="px-5 py-4 font-bold">Sản phẩm</th>
                <th className="px-5 py-4 font-bold">Phân loại</th>
                <th className="px-5 py-4 font-bold">Giá bán</th>
                <th className="px-5 py-4 font-bold">Tồn kho</th>
                <th className="px-5 py-4 font-bold">Đánh giá</th>
                <th className="px-5 py-4 text-right font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">Đang tải danh sách sản phẩm...</td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">Không có sản phẩm phù hợp.</td>
                </tr>
              )}

              {!loading && filtered.map(product => {
                const stock = product.stockQty ?? 0;
                const stockTone =
                  stock === 0
                    ? 'bg-red-50 text-red-700'
                    : stock <= 5
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700';

                return (
                  <tr key={product.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image || '/favicon.svg'}
                          alt={product.name}
                          className="h-16 w-16 shrink-0 rounded-lg border border-slate-100 bg-slate-50 object-contain p-1"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">{product.name}</p>
                          <p className="truncate text-xs text-slate-500">{product.slug || 'Chưa có slug'}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-400">{product.description || 'Chưa có mô tả'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <p className="font-medium text-slate-800">{product.brand || 'Chưa có hãng'}</p>
                      <p className="text-xs text-slate-400">{product.category || 'Chưa có danh mục'}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-950">{formatCurrency(product.price)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${stockTone}`}>
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {stock.toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      <div className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px] text-amber-500">star</span>
                        <span>{product.rating ?? 0}</span>
                        <span className="text-xs text-slate-400">({product.reviewCount ?? 0})</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleEdit(product)}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Sửa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-4 pb-12 pt-6 backdrop-blur-sm">
          <div className="window-drop flex w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 md:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                  {editingProduct.isNew ? 'Thêm sản phẩm' : 'Cập nhật sản phẩm'}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-950">
                  {editingProduct.isNew ? 'Sản phẩm mới' : editingProduct.name}
                </h3>
                {!editingProduct.isNew && (
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-slate-400">ID: {editingProduct.id}</p>
                )}
              </div>
              <button onClick={() => setEditingProduct(null)} className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <div className="space-y-8 p-6 md:p-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-5">
                  <FieldLabel label="Tên nhạc cụ">
                    <input
                      type="text"
                      className="field-input"
                      value={editingProduct.name}
                      onChange={event => setEditingProduct({ ...editingProduct, name: event.target.value })}
                    />
                  </FieldLabel>
                  <FieldLabel label="Slug đường dẫn">
                    <input
                      type="text"
                      className="field-input font-mono text-sm"
                      value={editingProduct.slug}
                      onChange={event => setEditingProduct({ ...editingProduct, slug: event.target.value })}
                    />
                  </FieldLabel>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FieldLabel label="Thương hiệu">
                      <select
                        className="field-input"
                        value={editingProduct.brandId || ''}
                        onChange={event => setEditingProduct({
                          ...editingProduct,
                          brandId: event.target.value,
                          brandName: event.target.value === OTHER_BRAND_VALUE ? editingProduct.brandName ?? '' : '',
                        })}
                      >
                        <option value="">Chưa chọn thương hiệu</option>
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                        <option value={OTHER_BRAND_VALUE}>Thương hiệu khác</option>
                      </select>
                    </FieldLabel>
                    <FieldLabel label="Danh mục">
                      <select
                        className="field-input"
                        value={editingProduct.categoryId || ''}
                        onChange={event => setEditingProduct({ ...editingProduct, categoryId: event.target.value })}
                      >
                        <option value="">Chưa chọn danh mục</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </FieldLabel>
                  </div>
                  {editingProduct.brandId === OTHER_BRAND_VALUE && (
                    <FieldLabel label="Tên thương hiệu khác">
                      <input
                        type="text"
                        className="field-input"
                        value={editingProduct.brandName ?? ''}
                        onChange={event => setEditingProduct({ ...editingProduct, brandName: event.target.value })}
                        placeholder="Ví dụ: Yamaha, Fender, Taylor..."
                      />
                    </FieldLabel>
                  )}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FieldLabel label="Giá niêm yết">
                      <input
                        type="number"
                        className="field-input font-bold"
                        value={editingProduct.price}
                        onChange={event => setEditingProduct({ ...editingProduct, price: Number(event.target.value) })}
                      />
                    </FieldLabel>
                    <FieldLabel label="Tồn kho">
                      <input
                        type="number"
                        className="field-input"
                        value={editingProduct.stockQty ?? 0}
                        onChange={event => setEditingProduct({ ...editingProduct, stockQty: Number(event.target.value) })}
                      />
                    </FieldLabel>
                  </div>
                </div>

                <FieldLabel label="Mô tả sản phẩm">
                  <textarea
                    rows={10}
                    className="field-input min-h-[238px] resize-none leading-relaxed"
                    value={editingProduct.description ?? ''}
                    onChange={event => setEditingProduct({ ...editingProduct, description: event.target.value })}
                  />
                </FieldLabel>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <SectionTitle title="Thư viện hình ảnh" />
                <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto]">
                  <input
                    type="text"
                    placeholder="Dán link hình ảnh mới tại đây"
                    className="field-input"
                    value={newImgLink}
                    onChange={event => setNewImgLink(event.target.value)}
                  />
                  <button onClick={handleAddImage} className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-600">
                    Thêm ảnh
                  </button>
                </div>

                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                    <span className="material-symbols-outlined text-base">cloud_upload</span>
                    <span>{isUploadingImage ? 'Đang upload...' : 'Tải ảnh từ máy tính'}</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageFilesSelected} className="hidden" />
                  </label>
                  <p className="text-xs text-slate-500">Ảnh sẽ upload lên Cloudinary rồi lưu URL vào sản phẩm.</p>
                </div>
                {uploadImageError && <p className="mb-4 text-sm text-red-600">{uploadImageError}</p>}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {editingProduct.images.length === 0 && (
                    <div className="col-span-full rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                      Chưa có hình ảnh nào.
                    </div>
                  )}
                  {editingProduct.images.map((image, index) => (
                    <div key={`${image.url}-${index}`} className={`rounded-lg border p-3 transition ${image.isPrimary ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200 bg-white'}`}>
                      <img src={image.url} alt="" className="aspect-[4/5] w-full rounded-md bg-white object-contain p-2" />
                      <p className="mt-3 truncate font-mono text-[10px] text-slate-400">{image.url}</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => setPrimaryImage(index)}
                          className={`flex-1 rounded-md px-3 py-2 text-[10px] font-bold uppercase transition ${
                            image.isPrimary ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-amber-100'
                          }`}
                        >
                          {image.isPrimary ? 'Ảnh chính' : 'Đặt chính'}
                        </button>
                        <button onClick={() => removeImage(index)} className="rounded-md bg-red-50 p-2 text-red-500 transition hover:bg-red-500 hover:text-white">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <SectionTitle title="Thông số kỹ thuật" />
                  <button onClick={addSpec} className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100">
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Thêm thông số
                  </button>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                      <tr>
                        <th className="px-5 py-4 font-bold">Tên thông số</th>
                        <th className="px-5 py-4 font-bold">Giá trị</th>
                        <th className="w-40 px-5 py-4 text-center font-bold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editingProduct.specs.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-500">Chưa có thông số kỹ thuật nào.</td>
                        </tr>
                      )}
                      {editingProduct.specs.map((spec, index) => (
                        <tr key={index} className="transition hover:bg-slate-50/70">
                          <td className="px-5 py-3">
                            <input
                              type="text"
                              placeholder="Ví dụ: Chất liệu"
                              className="w-full rounded-md border border-transparent bg-transparent px-3 py-2 font-semibold outline-none transition focus:border-amber-300 focus:bg-white"
                              value={spec.key}
                              onChange={event => updateSpec(index, 'key', event.target.value)}
                            />
                          </td>
                          <td className="px-5 py-3">
                            <input
                              type="text"
                              placeholder="Ví dụ: Gỗ Mahogany"
                              className="w-full rounded-md border border-transparent bg-transparent px-3 py-2 outline-none transition focus:border-amber-300 focus:bg-white"
                              value={spec.value}
                              onChange={event => updateSpec(index, 'value', event.target.value)}
                            />
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <IconButton icon="arrow_upward" label="Lên" onClick={() => moveSpec(index, 'up')} disabled={index === 0} />
                              <IconButton icon="arrow_downward" label="Xuống" onClick={() => moveSpec(index, 'down')} disabled={index === editingProduct.specs.length - 1} />
                              <IconButton icon="delete" label="Xóa" onClick={() => removeSpec(index)} danger />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50/60 p-6 sm:flex-row sm:justify-end">
              <button onClick={() => setEditingProduct(null)} className="rounded-md px-6 py-3 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-slate-950">
                Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !editingProduct.name.trim() || editingProduct.price < 0}
                className="rounded-md bg-slate-950 px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Đang lưu...' : editingProduct.isNew ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, tone = 'slate' }: { label: string; value: string; tone?: 'slate' | 'amber' | 'red' }) {
  const toneClass = {
    slate: 'text-slate-950',
    amber: 'text-amber-700',
    red: 'text-red-700',
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700">{title}</h4>;
}

function IconButton({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md p-2 transition disabled:cursor-not-allowed disabled:opacity-30 ${
        danger ? 'text-slate-400 hover:bg-red-50 hover:text-red-500' : 'text-slate-400 hover:bg-amber-50 hover:text-amber-600'
      }`}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
    </button>
  );
}

export default ProductManagement;
