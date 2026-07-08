import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createAdminBrand, deleteAdminBrand, fetchBrands, type Brand } from '../../services/brands';
import { createAdminCategory, deleteAdminCategory, fetchCategories, type Category } from '../../services/categories';

type ItemKind = 'brand' | 'category';

export function CategoryManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brandName, setBrandName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryPosition, setCategoryPosition] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<ItemKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    Promise.all([fetchBrands(), fetchCategories()])
      .then(([brandData, categoryData]) => {
        if (!mounted) return;
        setBrands(brandData);
        setCategories(categoryData);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Không thể tải danh mục');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredBrands = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return brands;
    return brands.filter((brand) => brand.name.toLowerCase().includes(keyword) || (brand.slug ?? '').toLowerCase().includes(keyword));
  }, [brands, query]);

  const filteredCategories = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(keyword) || (category.slug ?? '').toLowerCase().includes(keyword));
  }, [categories, query]);

  async function handleCreateBrand() {
    const name = brandName.trim();
    if (!name) {
      setError('Vui lòng nhập tên thương hiệu');
      return;
    }

    setSaving('brand');
    setError(null);

    try {
      const created = await createAdminBrand(name);
      setBrands((prev) => [created, ...prev]);
      setBrandName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể thêm thương hiệu');
    } finally {
      setSaving(null);
    }
  }

  async function handleCreateCategory() {
    const name = categoryName.trim();
    if (!name) {
      setError('Vui lòng nhập tên danh mục');
      return;
    }

    const position = categoryPosition.trim() ? Number(categoryPosition) : undefined;
    if (position !== undefined && Number.isNaN(position)) {
      setError('Vị trí danh mục phải là số');
      return;
    }

    setSaving('category');
    setError(null);

    try {
      const created = await createAdminCategory(name, position);
      setCategories((prev) => [...prev, created].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
      setCategoryName('');
      setCategoryPosition('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể thêm danh mục');
    } finally {
      setSaving(null);
    }
  }

  async function handleDeleteBrand(brand: Brand) {
    const confirmed = window.confirm(`Xóa thương hiệu ${brand.name}?`);
    if (!confirmed) return;

    setSaving('brand');
    setError(null);

    try {
      await deleteAdminBrand(brand.id);
      setBrands((prev) => prev.filter((item) => item.id !== brand.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa thương hiệu');
    } finally {
      setSaving(null);
    }
  }

  async function handleDeleteCategory(category: Category) {
    const confirmed = window.confirm(`Xóa danh mục ${category.name}?`);
    if (!confirmed) return;

    setSaving('category');
    setError(null);

    try {
      await deleteAdminCategory(category.id);
      setCategories((prev) => prev.filter((item) => item.id !== category.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa danh mục');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">Admin</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-950">Quản lý danh mục</h2>
          <p className="mt-2 text-sm text-slate-500">Thêm hoặc xóa thương hiệu và danh mục sản phẩm.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:w-fit">
          <StatBox label="Thương hiệu" value={brands.length} />
          <StatBox label="Danh mục" value={categories.length} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên hoặc slug"
            className="w-full rounded-md border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ManagementPanel
          title="Thương hiệu"
          emptyText={loading ? 'Đang tải thương hiệu...' : 'Chưa có thương hiệu phù hợp.'}
          form={
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleCreateBrand();
                }}
                placeholder="Tên thương hiệu"
                className="min-w-0 flex-1 rounded-md border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
              <button
                type="button"
                onClick={handleCreateBrand}
                disabled={saving === 'brand'}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Thêm
              </button>
            </div>
          }
        >
          {filteredBrands.map((brand) => (
            <ItemRow key={brand.id} name={brand.name} slug={brand.slug} disabled={saving === 'brand'} onDelete={() => handleDeleteBrand(brand)} />
          ))}
        </ManagementPanel>

        <ManagementPanel
          title="Danh mục"
          emptyText={loading ? 'Đang tải danh mục...' : 'Chưa có danh mục phù hợp.'}
          form={
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_auto]">
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleCreateCategory();
                }}
                placeholder="Tên danh mục"
                className="min-w-0 rounded-md border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
              <input
                type="number"
                value={categoryPosition}
                onChange={(event) => setCategoryPosition(event.target.value)}
                placeholder="Vị trí"
                className="rounded-md border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={saving === 'category'}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Thêm
              </button>
            </div>
          }
        >
          {filteredCategories.map((category) => (
            <ItemRow
              key={category.id}
              name={category.name}
              slug={category.slug}
              meta={category.position == null ? undefined : `Vị trí ${category.position}`}
              disabled={saving === 'category'}
              onDelete={() => handleDeleteCategory(category)}
            />
          ))}
        </ManagementPanel>
      </div>
    </div>
  );
}

function ManagementPanel({ title, emptyText, form, children }: { title: string; emptyText: string; form: ReactNode; children: ReactNode }) {
  const itemCount = Array.isArray(children) ? children.length : children ? 1 : 0;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <div className="mt-4">{form}</div>
      </div>
      <div className="divide-y divide-slate-100">
        {itemCount > 0 ? children : <p className="px-5 py-10 text-center text-sm text-slate-500">{emptyText}</p>}
      </div>
    </section>
  );
}

function ItemRow({
  name,
  slug,
  meta,
  disabled,
  onDelete,
}: {
  name: string;
  slug?: string;
  meta?: string;
  disabled: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/70">
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-950">{name}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{[slug, meta].filter(Boolean).join(' · ') || 'Chưa có slug'}</p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className="inline-flex shrink-0 items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
        Xóa
      </button>
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

export default CategoryManagement;
