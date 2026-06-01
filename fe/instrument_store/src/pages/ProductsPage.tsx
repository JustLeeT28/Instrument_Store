import { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../components/ProductCard';

type ProductFilters = {
  brands: string[];
  woodTypes: string[];
  bodyTypes: string[];
};

type Brand = {
  id: string;
  name?: string;
  band?: string;
  slug?: string;
};

export const ProductsPage = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    brands: [],
    woodTypes: ['Gỗ Vân sam'],
    bodyTypes: [],
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandLoading, setBrandLoading] = useState(true);

  const fallbackBrands = ['Martin & Co.', 'Taylor Guitars', 'Gibson Acoustic', 'Collings'];

  const products: Product[] = [
    {
      id: '1',
      name: '814ce Builders Edition',
      brand: 'Taylor Guitars',
      price: 3999,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4--xxDPCio48j9Qf9iZ-N52pllM6IvBIOjLRLO9J6VW7Z5oxTIpW_DSHMUpdooDTeVjQHjR0-1tEX6liPQ1is2uTpvSRKwN0yy_6kg5UtQnn0J_dsz-NwC-Qt5vRE6ExTbKJJKBHMUYbSVQeOxfRzF1als5OOxCtyrL4vlJfA9CWMtnso0HAGmgP9VmEoYV2vh2yv2VlnemIeSZjzldvC089NfBmg5GM1q0flrDrBz8IOs5MHvq1ZEEF_sOHgXwLdjVSoG6PQpL08',
      rating: 4.9,
    },
    {
      id: '2',
      name: 'D-28 Standard Series',
      brand: 'Martin & Co.',
      price: 3199,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvRnXQtPA4-pAGhjVHR0T8d-aoQbKzcNbGfzqW8TQA-AlRnbQDky_Si-55Ap4Nrq0wnHyMdI19XhHDhY44EsHfuWKKDJWzW4S6U8ms12CzR9TKHceqYNWuN-chyTgVIp5V4BzJ_gELeIoOcRALeAtvwAk6TSVkKrKQ7e0GoTathbpUPKT9n6grZ35O2Eki5z6FVFACq3hoYnttdEAr5LnkX-jdz5N0LlMiQq0zMtt8uLrF4jCw-LiqKZ-0dKTZFXXGwkNqlPZAyAdI',
      rating: 5.0,
    },
    {
      id: '3',
      name: 'K24ce All-Koa Series',
      brand: 'Taylor Guitars',
      price: 5499,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQPpRwChuIvftqFfaFSjInxAvFSHvKrqMfHbfxZ9gD-u71cRPCBJp5B2giVVEBqgoq1mteGyN-rufH26u1HxPDbXCQSXFWZjHCDY9vNb2VkSCGM2D6vMqVwAqu-4QXTW5Qn8oPTSwMP4sUHFstTgB3gP-foii-kLVmJoENy5C5FO8HzQyu_9tfkraAVWsPc3JWTdjk0rOMCd7Oj6tnjLhq8MlTMSwRkCbVvIaPUkiXcz97XI4wGatqErTuuPZZDvyt7O5i4_J7D3AP',
      rating: 4.8,
    },
    {
      id: '4',
      name: 'D-41 Premium Deluxe',
      brand: 'Martin & Co.',
      price: 4500,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhklimPm47pgr1mkBVowHdoogFz4Y7Rz1vxJCi5tKlTD9XMqA6F_4ofpbJzYbFaey8aRaSAzIX3YViGUXtwfZePZ1fmucnwr6N0FGKdsiaYzPy1B3SJTOsaI25Tsjq24C844gtgNegn8zVC65kbdPX5GPhdGKvmmIxQ_fmuNLAu13kcXj1W2pzRPJ86NbpGHvkiFFhigl76DmIuvLfB6Tj522IhF4upyA82FwqavoF7i7OPshIgMcp1e1C2n6eNgUKd5aIlAL_trdV',
      rating: 4.9,
    },
    {
      id: '5',
      name: 'GN93 New Yorker',
      brand: 'Gibson Acoustic',
      price: 2899,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9KmqWxy-YiXsa9y-RItQ6VkH5rwCwXVVRbq51rHFV0NayNlsOz3ZFA4mY4UcPJWksFqRz94VV85v5x2mgPxLN590jUUu_1pAYF4TwIH6Eaws_0ieCbhVKlU5EDd5xpb_Y0w2Uy-kUJB2duf4LRU2zQPLflRg90Gw7_rh6lp7Z-G02jkYbMLN52l9I3bGcehsNxH5ogI1BjLp2V-mW0XPYYvXU6d7qakV-4DPz0H3wo6Pw-71ZwTTXSZ7SuR0yR5bdpvych7Mdi6ea',
      rating: 4.7,
    },
    {
      id: '6',
      name: 'OM-28 Standard',
      brand: 'Martin & Co.',
      price: 2699,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHYdvJVZ8jYBszs-afbFHbkwKxKN8RF0vzgBlN2FQilYxPH-h1KHjICZBp_iRlF23cGy5t981cwAifXpdw5Rm6iFhZnttvsQBmnPJeErd7HK9XK953g-Wazqc1k_Tu5O2czyCGcncj-suW-m-35_GuQcgRS2yrEtlUchdoDp-hrzrJc5JKuGQBFuh3chgr9OY43hsL7N8Jk00Q5mG3RAnurKYPL1ZfdeKJAHoda0NAzZXLNeCbHorXIKHPjGaxmlHcFpUwXUdLmPPQ',
      rating: 4.8,
    },
  ];

  useEffect(() => {
    const loadBrands = async () => {
      try {
        // Thay đổi port 8080 cho đúng với Backend của bạn
        const response = await fetch('http://localhost:8080/brands');
        if (!response.ok) {
          throw new Error('Failed to load brands');
        }
        const data: Brand[] = await response.json();
        setBrands(data);
      } catch (error) {
        console.error('Brand fetch error:', error);
      } finally {
        setBrandLoading(false);
      }
    };

    loadBrands();
  }, []);

  const productBrands = Array.from(new Set(products.map((p) => p.brand)));

  const brandOptions =
    brands.length > 0
      ? brands.map((brand) => brand.name ?? brand.band ?? brand.slug ?? '')
      : productBrands.length > 0
      ? productBrands
      : fallbackBrands;

  const filteredProducts = products.filter((product) =>
    filters.brands.length === 0 || filters.brands.includes(product.brand),
  );

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
                <h3 className="text-xs font-semibold text-slate-600 uppercase mb-4">Giá</h3>
                <div className="px-2">
                  <input type="range" min="500" max="15000" step="500" className="w-full accent-amber-600" />
                  <div className="flex justify-between mt-2 text-xs text-slate-600">
                    <span>$500</span>
                    <span>$15,000+</span>
                  </div>
                </div>
              </div>

              {/* Wood Type */}
              <div>
                <h3 className="text-xs font-semibold text-slate-600 uppercase mb-4">Loại gỗ</h3>
                <div className="flex flex-wrap gap-2">
                  {['Gỗ Gụ', 'Gỗ Hồng sắc', 'Gỗ Vân sam', 'Gỗ Tuyết tùng', 'Gỗ Koa'].map((wood) => (
                    <span
                      key={wood}
                      onClick={() => {
                        setFilters({
                          ...filters,
                          woodTypes: filters.woodTypes.includes(wood)
                            ? filters.woodTypes.filter((w) => w !== wood)
                            : [...filters.woodTypes, wood],
                        });
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        filters.woodTypes.includes(wood)
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-900 hover:bg-amber-600 hover:text-white'
                      }`}
                    >
                      {wood}
                    </span>
                  ))}
                </div>
              </div>

              {/* Body Type */}
              <div>
                <h3 className="text-xs font-semibold text-slate-600 uppercase mb-4">Hình dáng</h3>
                <div className="space-y-3">
                  {['Dreadnought', 'Grand Auditorium', 'Parlor'].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="body"
                        checked={filters.bodyTypes.includes(type)}
                        onChange={() => {
                          setFilters({
                            ...filters,
                            bodyTypes: filters.bodyTypes.includes(type) ? [] : [type],
                          });
                        }}
                        className="w-4 h-4 border-slate-300 text-amber-600 focus:ring-amber-500/20"
                      />
                      <span className="text-sm text-slate-900 group-hover:text-amber-600 transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="flex-1">
            {/* Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-slate-200 pb-4">
              <span className="text-sm text-slate-600">Hiển thị {filteredProducts.length} trong số {products.length} Đàn Guitar</span>
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
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
