import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { API_BASE } from '../services/api';
import type { Product } from '../components/ProductCard';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x800?text=No+Image';

const storeBenefits = [
  { title: 'Sản phẩm chọn lọc', text: 'Nhạc cụ từ các thương hiệu uy tín, có thông tin rõ ràng.' },
  { title: 'Tư vấn theo nhu cầu', text: 'Chọn đàn học tập, biểu diễn hoặc phòng thu theo ngân sách.' },
  { title: 'Giao hàng toàn quốc', text: 'Đóng gói cẩn thận, hỗ trợ kiểm tra khi nhận hàng.' },
];

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadFeaturedProducts = async () => {
      try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) throw new Error('Failed to load featured products');
        const data = await response.json();

        const products = data.slice(0, 4).map((p: any) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          brand: p.brand ?? p.category ?? 'Unknown',
          price: p.price ?? 0,
          image: p.image ?? p.images?.[0] ?? PLACEHOLDER_IMAGE,
          images: Array.isArray(p.images) ? p.images : [],
          rating: p.rating ?? undefined,
          badge: p.badge ?? undefined,
        }));

        if (mounted) setFeaturedProducts(products);
      } catch (error) {
        console.error('Featured products fetch error:', error);
      }
    };

    loadFeaturedProducts();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-white w-full md:max-w-[80vw] md:mx-auto">
      <section className="relative min-h-[560px] md:min-h-[680px] overflow-hidden">
        <img
          alt="Cửa hàng nhạc cụ với guitar, piano và thiết bị âm nhạc"
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1800&q=85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/20" />
        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-screen-2xl items-center px-4 py-20 sm:px-6 lg:min-h-[680px] lg:px-16">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600">Cửa hàng nhạc cụ</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
              Tìm nhạc cụ phù hợp cho cách bạn chơi.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-700 md:text-lg">
              Mua guitar, piano, violin và phụ kiện âm nhạc với hình ảnh sản phẩm rõ ràng, giá minh bạch và tư vấn theo nhu cầu sử dụng.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded bg-slate-950 px-7 py-4 font-semibold text-white transition-colors hover:bg-amber-600"
              >
                <span className="material-symbols-outlined text-xl">storefront</span>
                Xem sản phẩm
              </Link>
              <Link
                to="/products?sort=price-asc"
                className="inline-flex items-center justify-center gap-2 rounded border-2 border-slate-950 px-7 py-4 font-semibold text-slate-950 transition-colors hover:bg-slate-950 hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">sell</span>
                Mua theo ngân sách
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 divide-y divide-slate-200 px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-16">
          {storeBenefits.map((item) => (
            <div key={item.title} className="py-6 md:px-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 md:mb-12">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">DÀNH RIÊNG CHO BẠN</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Nhạc cụ Nổi bật</h2>
            </div>
            <Link
              to="/products"
              className="font-semibold text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-amber-600 hover:border-amber-600 transition-colors"
            >
              XEM TẤT CẢ NHẠC CỤ
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] animate-pulse bg-slate-200" />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-20 overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <img
                alt="Bộ sưu tập nhạc cụ được trưng bày trong cửa hàng"
                className="w-full h-[420px] md:h-[520px] lg:h-[600px] object-cover shadow-2xl"
                src="https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1400&q=85"
              />
              <div className="absolute -bottom-6 md:-bottom-10 right-4 md:-right-10 bg-white p-6 md:p-12 max-w-xs border border-slate-200 shadow-lg">
                <p className="text-2xl italic text-slate-900 leading-tight mb-4">
                  "Một nhạc cụ phù hợp giúp việc luyện tập và biểu diễn trở nên tự nhiên hơn."
                </p>
                <p className="text-xs text-amber-700 mt-4 uppercase font-semibold">INSTRUMENT STORE</p>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8 lg:pl-12">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-[0.2em]">CỬA HÀNG CỦA CHÚNG TÔI</span>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
                Không gian chọn mua <br /> nhạc cụ đáng tin cậy
              </h2>
              <div className="w-16 h-1 bg-slate-900" />
              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                Chúng tôi tập trung vào những sản phẩm có thông tin rõ ràng, hình ảnh thực tế và mức giá dễ so sánh để bạn chọn được nhạc cụ phù hợp.
              </p>
              <p className="text-base text-slate-700 leading-relaxed">
                Dù bạn mới bắt đầu học đàn hay đang tìm một nhạc cụ để biểu diễn, cửa hàng luôn ưu tiên trải nghiệm mua sắm rõ ràng, dễ tra cứu và thuận tiện.
              </p>
              <Link to="/products" className="flex items-center gap-4 group hover:gap-6 transition-all">
                <span className="w-12 h-[1.5px] bg-slate-900 group-hover:w-20 transition-all" />
                <span className="font-semibold text-slate-900 uppercase tracking-widest text-sm">KHÁM PHÁ SẢN PHẨM</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-slate-100 border-y border-slate-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 text-center max-w-4xl">
          <span className="material-symbols-outlined text-4xl text-amber-600 mb-6 inline-block">auto_awesome</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Nhận thông tin sản phẩm mới</h2>
          <p className="text-base md:text-lg text-slate-700 mb-8 leading-relaxed">
            Theo dõi các mẫu nhạc cụ mới, chương trình ưu đãi và gợi ý chọn sản phẩm từ cửa hàng.
          </p>
          <form className="flex flex-col sm:flex-row max-w-2xl mx-auto gap-4">
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              className="flex-1 bg-white border-b-2 border-slate-900 focus:ring-0 focus:border-amber-600 px-6 py-4 font-base rounded-none"
            />
            <button className="px-10 py-4 bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">
              ĐĂNG KÝ
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
