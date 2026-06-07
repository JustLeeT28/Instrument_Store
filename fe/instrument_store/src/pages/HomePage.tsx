import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { API_BASE } from '../services/api';
import type { Product } from '../components/ProductCard';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x800?text=No+Image';

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
      <section className="relative min-h-[620px] md:min-h-[921px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="A masterfully crafted acoustic guitar in a high-end woodshop"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiThRslBqsnD1uMVOa8YEcNsHf5QLGdLVYSrAv44uP3YkQnJmdtQIcrETOV8e_s5-Pzzl3TB6NNNafIQJgIvY_dyy8C4v-kfvIRlbt3Rn2j3aij4Dzj1dvyinotBHPIz_qAckPfN6NaedIgs3RBO6nf23N_32lNbc1SRA-CoASpe5ZyQp6NRv3Kx-Ww_i_TZKp5Gw4ON-IxoW2GcMKe20dFany7JQuDXAddm9aCZ005lmoK37rSADJubbk72K-CRtlE73B1AzfARe7"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-16 relative z-10">
          <div className="max-w-2xl space-y-6 md:space-y-8">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-[0.3em]">CÂU CHUYỆN CỦA CHÚNG TÔI</span>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
              Linh hồn của một <br />
              <span className="italic text-amber-700">Kiệt tác</span>.
            </h1>
            <p className="text-base md:text-lg text-slate-700 max-w-lg leading-relaxed">
              Từ năm 1924, Luthier & Co. đã đứng tại điểm giao thoa giữa nghề mộc truyền thống và khoa học âm học hiện đại.
              Chúng tôi tin rằng một nhạc cụ thực thụ không chỉ là một công cụ, nó là một thực thể sống hoàn thiện dần theo thời gian.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2 md:pt-4">
              <Link
                to="/products"
                className="px-8 md:px-10 py-4 md:py-5 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800 transition-colors active:scale-[0.98] text-center"
              >
                Khám phá Bộ sưu tập
              </Link>
              <button className="px-8 md:px-10 py-4 md:py-5 border-2 border-slate-900 text-slate-900 font-semibold rounded hover:bg-slate-900 hover:text-white transition-colors active:scale-[0.98]">
                Xưởng chế tác
              </button>
            </div>
          </div>
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
                alt="Master luthier crafting a guitar neck"
                className="w-full h-[420px] md:h-[520px] lg:h-[600px] object-cover shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPPOG9If11Yrv-2k2_fHnpa8uqp5l1KJHDrQqMLQsaAiVm2uxU0fa9PjmGtbquwQvS0QZ9zhqXOvn2rdJP1gFRCE2ApREk4kbRoMe2TEUW4VvC0cTZdcYcFZtpzrw0hzRCec7jKUcdwzGeA2yvnKq8tThwf98Z-cXdYHli-tqNLnLsEX4reZFJh2ayhB8L-JShIX5WmWTujgCzCM65P_t2mZSOYmXUVK6wUExq6AWtLoUHii6jaJDvtYQH6qhZGeOUuHrrAWiWpo9f"
              />
              <div className="absolute -bottom-6 md:-bottom-10 right-4 md:-right-10 bg-white p-6 md:p-12 max-w-xs border border-slate-200 shadow-lg">
                <p className="text-2xl italic text-slate-900 leading-tight mb-4">
                  "Âm thanh không chỉ để nghe, mà còn để cảm nhận qua đôi tay của những người tạo hình nên nó."
                </p>
                <p className="text-xs text-amber-700 mt-4 uppercase font-semibold">ELIAS VANCE, NGHỆ NHÂN CHẾ TÁC BẬC THẦY</p>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8 lg:pl-12">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-[0.2em]">CÂU CHUYỆN CỦA CHÚNG TÔI</span>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
                Nghệ thuật của <br /> Nhạc cụ Tinh xảo
              </h2>
              <div className="w-16 h-1 bg-slate-900" />
              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                Từ năm 1924, Luthier & Co. đã đứng tại điểm giao thoa giữa nghề mộc truyền thống và khoa học âm học hiện đại.
                Chúng tôi tin rằng một nhạc cụ thực thụ không chỉ là một công cụ, nó là một thực thể sống hoàn thiện dần theo thời gian.
              </p>
              <p className="text-base text-slate-700 leading-relaxed">
                Các nhạc cụ của chúng tôi được chế tác từ những loại gỗ âm sắc được khai thác có trách nhiệm, được sấy khô trong nhiều thập kỷ
                để đảm bảo độ cộng hưởng tối ưu.
              </p>
              <button className="flex items-center gap-4 group hover:gap-6 transition-all">
                <span className="w-12 h-[1.5px] bg-slate-900 group-hover:w-20 transition-all" />
                <span className="font-semibold text-slate-900 uppercase tracking-widest text-sm">KHÁM PHÁ QUY TRÌNH</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-slate-100 border-y border-slate-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 text-center max-w-4xl">
          <span className="material-symbols-outlined text-4xl text-amber-600 mb-6 inline-block">auto_awesome</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Tham gia Cộng đồng Người sành sỏi</h2>
          <p className="text-base md:text-lg text-slate-700 mb-8 leading-relaxed">
            Nhận lời mời độc quyền tới các sự kiện trưng bày riêng tư, quyền tiếp cận sớm các phiên bản tùy chỉnh hiếm có
            và những kiến thức chuyên sâu từ các nghệ nhân bậc thầy của chúng tôi.
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
