import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../components/ProductCard';

export const HomePage = () => {
  const featuredProducts: Product[] = [
    {
      id: '1',
      name: 'D-28 Modern Deluxe',
      brand: 'Martin & Co.',
      price: 3999,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhklimPm47pgr1mkBVowHdoogFz4Y7Rz1vxJCi5tKlTD9XMqA6F_4ofpbJzYbFaey8aRaSAzIX3YViGUXtwfZePZ1fmucnwr6N0FGKdsiaYzPy1B3SJTOsaI25Tsjq24C844gtgNegn8zVC65kbdPX5GPhdGKvmmIxQ_fmuNLAu13kcXj1W2pzRPJ86NbpGHvkiFFhigl76DmIuvLfB6Tj522IhF4upyA82FwqavoF7i7OPshIgMcp1e1C2n6eNgUKd5aIlAL_trdV',
      badge: 'HÀNG MỚI VỀ',
    },
    {
      id: '2',
      name: 'Model K-52 Upright',
      brand: 'Steinway & Sons',
      price: 42500,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHDZvxU4mBWHylJydE80uJd5Im2ZG725cpY3YktzS27wyHimUO3lSVoTaJKEgx_JvGOoIiFVVgwxkjXVsZQquUaNk3QAMhU7pq2224egZc3PSDIQveEKUQ6-ne15RQJxsm5FUm08q7-UBzaep2CA3s9PWiphWBUcb_ZPWmTLcp6OXAtnH-z2Y6yqTldj-EzLeQgkrXAGuSHDU_qR-2c5ETPlnU0ikr7D5TLMtkggb0n36Uew8Ej7RvL052VfinZ_ETEo1yMgdP95Nx',
    },
    {
      id: '3',
      name: 'ES-335 Figured',
      brand: 'Gibson Custom Shop',
      price: 4299,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSRy952QJvM9LjOMQOaf32y1mlaHO4EJmNXE0VsXfYIqHE2ChZnMMXNeRcFaFzvHzLpDQa6jrjMeVjq6JBzEsYHtq_OPHhlR0Rh2a1pxfJPay-ynIn329n-fmcI17AXRkaNSxLPXJmATCRyqfEoZ9PfnsQvc-3DEtWPOJeXNFvzCoYYcnfxOJf47qdgfMhhhkqW29KMS9wEZMw9Kl1LtrVILPsgZvyrdHgsTtdnL_9OkZRo27NBR6KfnbyFVYoIjC4nC-sF-7xqNCI',
      badge: 'PHIÊN BẢN CỔ ĐIỂN',
    },
    {
      id: '4',
      name: 'Cremona Professional',
      brand: 'Stentor',
      price: 2150,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtPSa8f1Rro2kUJXTpX7zGnhnnvV4Kk1kyWBWCvd3gbDJwfidALdpZwZpaDGItE1kjr5vi7Z2VuUvbWvKxZOqTh7VVfiq1YbyvuoOgDOLlZTGzDi0bq8hijt54-mXwnHzfe0sTx0_fL_Gf23wtalKq22hB67drAda9hfidAq_aYakF_ADXbFIxD6Kg0zOPaeOmUKSYxZKhDkGWp16rYgiRJdUy0GOZMmINwTlRMr5UTDsJrZ9ttCGYTgijZ1shUt_f02sLf_czcDp5',
    },
  ];

  return (
  <div className="min-h-screen bg-white w-full md:max-w-[80vw] md:mx-auto">
      {/* Hero Section */}
      <section className="relative min-h-[620px] md:min-h-[921px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="A masterfully crafted acoustic guitar in a high-end woodshop"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiThRslBqsnD1uMVOa8YEcNsHf5QLGdLVYSrAv44uP3YkQnJmdtQIcrETOV8e_s5-Pzzl3TB6NNNafIQJgIvY_dyy8C4v-kfvIRlbt3Rn2j3aij4Dzj1dvyinotBHPIz_qAckPfN6NaedIgs3RBO6nf23N_32lNbc1SRA-CoASpe5ZyQp6NRv3Kx-Ww_i_TZKp5Gw4ON-IxoW2GcMKe20dFany7JQuDXAddm9aCZ005lmoK37rSADJubbk72K-CRtlE73B1AzfARe7"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent"></div>
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
              Chúng tôi tin rằng một nhạc cụ thực thụ không chỉ là một công cụ—nó là một thực thể sống hoàn thiện dần theo thời gian.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2 md:pt-4">
              <button className="px-8 md:px-10 py-4 md:py-5 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800 transition-colors active:scale-[0.98]">
                Khám phá Bộ sưu tập
              </button>
              <button className="px-8 md:px-10 py-4 md:py-5 border-2 border-slate-900 text-slate-900 font-semibold rounded hover:bg-slate-900 hover:text-white transition-colors active:scale-[0.98]">
                Xưởng chế tác
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Featured Instruments */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Story Section */}
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
              <div className="w-16 h-1 bg-slate-900"></div>
              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                Từ năm 1924, Luthier & Co. đã đứng tại điểm giao thoa giữa nghề mộc truyền thống và khoa học âm học hiện đại.
                Chúng tôi tin rằng một nhạc cụ thực thụ không chỉ là một công cụ—nó là một thực thể sống hoàn thiện dần theo thời gian.
              </p>
              <p className="text-base text-slate-700 leading-relaxed">
                Các nhạc cụ của chúng tôi được chế tác từ những loại gỗ âm sắc được khai thác có trách nhiệm, được sấy khô trong nhiều thập kỷ
                để đảm bảo độ cộng hưởng tối ưu. Mỗi đường cong, mỗi thanh giằng và mỗi lớp hoàn thiện đều được thực hiện với sự tỉ mỉ
                không khoan nhượng. Khi bạn chơi một nhạc cụ của Luthier & Co., bạn đang tiếp nối một thế kỷ lịch sử âm nhạc.
              </p>
              <button className="flex items-center gap-4 group hover:gap-6 transition-all">
                <span className="w-12 h-[1.5px] bg-slate-900 group-hover:w-20 transition-all"></span>
                <span className="font-semibold text-slate-900 uppercase tracking-widest text-sm">KHÁM PHÁ QUY TRÌNH</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
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
