import { useEffect, useState } from 'react';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

type Category = {
  id: string;
  name: string;
  slug?: string;
  position?: number;
};

type Props = {
  selected: string[];
  onChange: (selected: string[]) => void;
};

export const Categories = ({ selected, onChange }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const res = await fetch(`${API_BASE}/categories`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data: Category[] = await res.json();
        data.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        setCategories(data);
      } catch (err) {
        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-600 uppercase mb-4">Danh mục</h3>
      {loading ? (
        <p className="text-sm text-slate-500">Đang tải danh mục...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="space-y-3">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(c.name)}
                onChange={() => toggle(c.name)}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500/20"
              />
              <span className="text-sm text-slate-900 group-hover:text-amber-600 transition-colors">{c.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
