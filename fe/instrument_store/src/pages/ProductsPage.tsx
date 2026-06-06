import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Categories } from '../components/Categories';
import { API_BASE } from '../services/api';
import type { Product } from '../components/ProductCard';

type ProductFilters = {
  brands: string[];
  categories?: string[];
  minPrice: number;
  maxPrice: number;
};

type Brand = {
  id: string;
  name?: string;
  band?: string;
  slug?: string;
};

export const ProductsPage = () => {
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState<ProductFilters>({
    brands: searchParams.getAll('brand'),
    categories: searchParams.getAll('category'),
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 300000000,
  });

  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandLoading, setBrandLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  // Hàm tải sản phẩm dựa trên tham số trên URL
  const loadProductsFromUrl = useCallback(async () => {
    try {
      const hasParams = searchParams.toString().length > 0;
      const url = hasParams 
        ? `${API_BASE}/products/search?${searchParams.toString()}`
        : `${API_BASE}/products`;

      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Failed to load products');
      const data = await resp.json();
      
      setProducts(data.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand ?? p.category ?? 'Unknown',
        price: p.price ?? 0,
        image: p.image ?? 'https://via.placeholder.com/600x800?text=No+Image',
        rating: p.rating ?? undefined,
        badge: p.badge ?? undefined,
      })));
    } catch (error) {
      console.error('Product fetch error:', error);
    }
  }, [searchParams]);

  // Định nghĩa hàm handleApplyFilters để cập nhật URL
  const handleApplyFilters = () => {
    const newParams = new URLSearchParams();
    filters.brands.forEach(b => newParams.append('brand', b));
    filters.categories?.forEach(c => newParams.append('category', c));
    if (filters.minPrice > 0) newParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 300000000) newParams.set('maxPrice', filters.maxPrice.toString());
    
    // Sử dụng window.location.search để buộc trình duyệt tải lại trang với các tham số mới
    window.location.search = newParams.toString();
  };

  useEffect(() => {
    loadProductsFromUrl();
  }, [loadProductsFromUrl]);

  useEffect(() => {
    let isMounted = true;

    const loadBrands = async () => {
      try {
        const response = await fetch(`${API_BASE}/brands`);
        if (!response.ok) {
          throw new Error('Failed to load brands');
        }
        const data: Brand[] = await response.json();
        setBrands(data);
        if (isMounted) {
          setBrands(data);
        }
      } catch (error) {
        console.error('Brand fetch error:', error);
      } finally {
        setBrandLoading(false);
        if (isMounted) {
          setBrandLoading(false);
        }
      }
    };

    loadBrands();

    return () => { isMounted = false; };
  }, []);

  const productBrands = Array.from(new Set(products.map((p) => p.brand)));

  const brandOptions =
    brands.length > 0
      ? brands.map((brand) => brand.name ?? brand.band ?? brand.slug ?? '')
      : productBrands;

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-16 py-12 md:py-20">
        {/* Hero Section */}
        <header className="mb-12 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Đàn Guitar Acoustic</h1>
          <p className="text-base md:text-lg text-slate-700 leading-relaxed">
            Từ độ trầm ấm vang dội của gỗ Sitka Spruce lâu năm đến những nốt cao trong trẻo của gỗ Koa thượng hạng,
            bộ sưu tập của chúng tôi đại diện cho đỉnh cao của nghệ thuật chế tác đàn. Mỗi nhạc cụ đều được tuyển
            chọn thủ công vì âm thanh độc bản, kết cấu vững chãi và linh hồn mà nó mang lại.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="space-y-8 lg:sticky lg:top-32">
              {/* Nút lọc kích hoạt gọi API Backend */}
              <button 
                onClick={handleApplyFilters}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <span className="material-symbols-outlined">filter_alt</span>
                LỌC SẢN PHẨM
              </button>

              {/* Categories */}
              <div>
                <Categories
                  selected={filters.categories ?? []}
                  onChange={(cats) => setFilters({ ...filters, categories: cats })}
                />
              </div>

              {/* Divider between categories and other filters */}
              <div className="border-t border-slate-200 my-4" />
              {/* Brand Filter */}
              <div>
                <h3 className="text-xs font-semibold text-slate-600 uppercase mb-4">Thương hiệu</h3>
                <div className="space-y-3">
                  {brandLoading ? (
                    <p className="text-sm text-slate-500">Đang tải thương hiệu...</p>
                  ) : (
                    brandOptions.map((brand) => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={(e) => {
                            setFilters({
                              ...filters,
                              brands: e.target.checked
                                ? [...filters.brands, brand]
                                : filters.brands.filter((b) => b !== brand),
                            });
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500/20"
                        />
                        <span className="text-sm text-slate-900 group-hover:text-amber-600 transition-colors">{brand}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs font-semibold text-slate-600 uppercase mb-6">Khoảng giá (VNĐ)</h3>
                <div className="px-2 space-y-6">
                  {/* Dual Range Slider */}
                  <div className="relative h-6 w-full flex items-center">
                    {/* Background Track */}
                    <div className="absolute w-full h-2 bg-slate-200 rounded-full" />
                    <div 
                      className="absolute h-2 bg-amber-600 rounded-full"
                      style={{
                        left: `${(filters.minPrice / 300000000) * 100}%`,
                        right: `${100 - (filters.maxPrice / 300000000) * 100}%`
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="300000000"
                      step="1000000"
                      value={filters.minPrice}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), filters.maxPrice - 1000000);
                        setFilters({ ...filters, minPrice: val });
                      }}
                      className="absolute w-full h-6 bg-transparent appearance-none pointer-events-none cursor-pointer m-0 top-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent"
                    />
                    <input
                      type="range"
                      min="0"
                      max="300000000"
                      step="1000000"
                      value={filters.maxPrice}
                      onChange={(e) => {
                        const val = Math.max(Number(e.target.value), filters.minPrice + 1000000);
                        setFilters({ ...filters, maxPrice: val });
                      }}
                      className="absolute w-full h-6 bg-transparent appearance-none pointer-events-none cursor-pointer m-0 top-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent"
                    />
                  </div>

                  {/* Price Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Tối thiểu</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={filters.minPrice.toLocaleString('vi-VN')}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            const val = Math.min(Number(rawValue), 300000000);
                            setFilters({ ...filters, minPrice: val });
                          }}
                          className="w-full text-xs font-semibold p-2 border border-slate-200 rounded focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-slate-400">₫</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Tối đa</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={filters.maxPrice.toLocaleString('vi-VN')}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            const val = Math.min(Number(rawValue), 300000000);
                            setFilters({ ...filters, maxPrice: val });
                          }}
                          className="w-full text-xs font-semibold p-2 border border-slate-200 rounded focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-slate-400">₫</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="flex-1">
            {/* Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-slate-200 pb-4">
              <span className="text-sm text-slate-600">Hiển thị {products.length} sản phẩm</span>
              <div className="flex items-center gap-4">
                <label className="text-sm text-slate-600 font-semibold">Sắp xếp theo:</label>
                <select className="bg-transparent border-none text-sm text-slate-900 focus:ring-0 cursor-pointer">
                  <option>Cao cấp: Mới nhất</option>
                  <option>Giá: Cao đến Thấp</option>
                  <option>Giá: Thấp đến Cao</option>
                  <option>Phổ biến nhất</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
