import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../../services/products';
import type { ProductItem } from '../../services/products';

export function ProductManagement() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <div>
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
              <button onClick={() => alert('Edit chức năng đang phát triển')} className="px-3 py-1 border rounded">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductManagement;
