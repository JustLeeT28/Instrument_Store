import { useEffect, useState } from 'react';
import { fetchCategories, getCachedCategories, type Category } from '../services/categories';

type Props = {
  selected: string[];
  onChange: (selected: string[]) => void;
};

export const Categories = ({ selected, onChange }: Props) => {
  const initialCategories = getCachedCategories();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(() => initialCategories.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setError(null);
        const data = await fetchCategories();
        if (isMounted) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Load categories error:', err);
        const cachedCategories = getCachedCategories();
        if (cachedCategories.length > 0) {
          if (isMounted) {
            setCategories(cachedCategories);
            setError(null);
          }
        } else if (isMounted) {
          setError('Không thể tải danh mục. Vui lòng thử lại sau.');
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
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
