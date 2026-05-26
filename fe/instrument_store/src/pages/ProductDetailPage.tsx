import { useParams } from 'react-router-dom';

export const ProductDetailPage = () => {
  const { id } = useParams();

  const product = {
    id: id || '1',
    name: 'The Heritage D-28',
    brand: 'Martin & Co.',
    price: 3850,
    rating: 4.8,
    reviewCount: 124,
    badge: 'Phiên bản giới hạn',
    description: `Được chế tác thủ công trong xưởng boutique của chúng tôi, Heritage D-28 đại diện cho đỉnh cao của cộng hưởng âm thanh.
                  Được làm từ gỗ Thông Sitka 50 năm tuổi và gỗ Hồng sắc Ấn Độ cao cấp, nó mang lại âm thanh tâm hồn, vang dội,
                  kế thừa di sản của nhiều thế hệ.`,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB8k40c-NIY0f72jQ3zYgibJPrTWxSNQiKFyWU6IP66j1pVt4nNkf0shng49_CCFzIl5kqSOfxa_8S4gxBGS27G1CYAW_8yDCzxtSy7gqVFCRSFD30_ncS8qY0-BwAR5SFlkf6cu_NXtm1opDr5Udd10EOYoibnBtCBSaVSRPLpyVXVbVzpifc__u10ztDZ0xZ1L3Y09v7tnHFLxuZRy07t5OUqDQzvLCBXwM6-cOPZuh5NNmgxtCWpuyBN9BNbvwD1OwiZmW4Kkzde',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCHYdvJVZ8jYBszs-afbFHbkwKxKN8RF0vzgBlN2FQilYxPH-h1KHjICZBp_iRlF23cGy5t981cwAifXpdw5Rm6iFhZnttvsQBmnPJeErd7HK9XK953g-Wazqc1k_Tu5O2czyCGcncj-suW-m-35_GuQcgRS2yrEtlUchdoDp-hrzrJc5JKuGQBFuh3chgr9OY43hsL7N8Jk00Q5mG3RAnurKYPL1ZfdeKJAHoda0NAzZXLNeCbHorXIKHPjGaxmlHcFpUwXUdLmPPQ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDUXLAXYDFh37vpwSNELqQU1oKzAMi2JVV0m3hXeyn4CZOijFI3XiXfHcVur4sMo19dLHei3KKrAnTKa_IOC4laH2UVPxKNjcDrcF8yUXQMwOElAAJFL8yzYk0XHhqlAkP7700te9ggorqsAeUJOukdOHSKjmEcfQhu4jFylA_AkGu4gfU_Rafvx7MsEdfgKcruM0099FpJjpntKgPr8VCi7Ri2vZ_nHbYCmDgIRIZ4VwwHnAnbwh0mem-Sl2IFBNg0TCDI7SgW0QAk',
    ],
    specs: {
      'Hình dáng thân': 'Dreadnought 14-Fret',
      'Chất liệu mặt trước': 'Solid Sitka Spruce',
      'Mặt lưng & Hông': 'East Indian Rosewood',
      'Hình dáng cần': 'Modified Low Oval',
      'Dây đàn': 'Martin® Authentic Acoustic® Lifespan® 2.0',
      'Chất liệu lược đàn': 'Bone',
    },
    reviews: [
      {
        id: '1',
        rating: 5,
        title: 'Sự cộng hưởng tuyệt vời',
        content:
          'Tôi đã chơi hàng chục cây D-28 cổ điển, và mẫu Heritage này ngang ngửa với những cây tốt nhất. Độ rõ nét ở âm trầm thật sự không gì sánh bằng.',
        author: 'Julian D.',
        role: 'Nghệ sĩ chuyên nghiệp',
      },
      {
        id: '2',
        rating: 4,
        title: 'Một kiệt tác hiện đại',
        content:
          'Sự thủ công thật hoàn mỹ. Mọi khớp nối, mọi lớp đánh bóng, mọi chi tiết đều hoàn hảo. Điểm trừ duy nhất là phải mất 4 tháng mới nhận được hàng.',
        author: 'Sarah M.',
        role: 'Nhà sưu tầm',
      },
      {
        id: '3',
        rating: 5,
        title: 'Chi tiết hài hòa phong phú',
        content:
          'Tôi sử dụng cây này cho tất cả các bản thu âm studio của mình. Nó thu âm rất sạch với EQ tối thiểu. Mặt trước gỗ Thông có độ sáng không bao giờ gây chói.',
        author: 'Robert K.',
        role: 'Kỹ sư Studio',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-16 py-12 md:py-20">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-slate-600 font-sm">
          <a href="#" className="hover:text-slate-900">
            Cửa hàng
          </a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <a href="#" className="hover:text-slate-900">
            Đàn Guitar
          </a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Gallery */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2 aspect-[4/5] bg-slate-100 rounded-lg overflow-hidden group">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={product.images[0]}
                  alt={product.name}
                />
              </div>
              {product.images.slice(1).map((img, idx) => (
                <div key={idx} className="aspect-square bg-slate-100 rounded-lg overflow-hidden group">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={img} alt={`View ${idx + 2}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 flex flex-col space-y-8 lg:sticky lg:top-32 h-fit">
            <div className="space-y-4">
              <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
                {product.badge}
              </span>
              <h1 className="text-4xl font-bold text-slate-900">{product.name}</h1>

              <div className="flex items-center space-x-2">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <span className="text-sm text-slate-600">
                  {product.rating} ({product.reviewCount} Đánh giá)
                </span>
              </div>

              <p className="text-3xl font-bold text-amber-600">${product.price.toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-900">Câu chuyện sản phẩm</h3>
              <p className="text-base text-slate-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-grow bg-slate-900 text-white font-semibold py-4 md:py-5 rounded-lg active:scale-[0.98] transition-all hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">shopping_bag</span>
                  <span>Thêm vào giỏ hàng</span>
                </button>
                <button className="px-6 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-all active:scale-[0.98] flex items-center justify-center">
                  <span className="material-symbols-outlined">favorite</span>
                </button>
              </div>
              <p className="text-center text-xs text-slate-600 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">local_shipping</span> Miễn phí Vận chuyển Toàn cầu & Bảo hiểm
              </p>
            </div>

            {/* Specifications */}
            <div className="border border-slate-300 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b border-slate-300">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-900">Thông số kỹ thuật</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {Object.entries(product.specs).map(([key, value], idx) => (
                  <div key={idx} className={`grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 px-6 py-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <span className="text-xs text-slate-600 font-semibold">{key}</span>
                    <span className="sm:col-span-2 text-sm text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Audio Sample */}
        <section className="mt-16 md:mt-20 p-6 md:p-12 bg-slate-900 text-white rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Trải nghiệm Tâm hồn</h2>
              <p className="text-white/80">Được ghi âm trực tiếp tại studio của chúng tôi bằng cặp micro U47 cổ điển.</p>
            </div>
            <div className="flex-grow max-w-xl w-full">
              <div className="flex items-end gap-1 h-12 mb-4">
                <div className="flex-grow bg-white/20 h-1 rounded-full relative">
                  <div className="absolute top-0 left-0 h-full w-1/3 bg-amber-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs opacity-60">
                <span>0:45</span>
                <span>2:15</span>
              </div>
            </div>
            <button className="w-16 h-16 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
            </button>
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="mt-16 md:mt-20">
          <div className="flex flex-col md:flex-row justify-between items-start mb-10 md:mb-12 gap-8">
            <div className="max-w-md">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Đánh giá từ khách hàng</h2>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-slate-900">{product.rating}</div>
                  <div className="text-xs text-slate-600 uppercase tracking-tighter mt-1">Đánh giá trung bình</div>
                </div>
                <div className="flex flex-col gap-2 flex-grow">
                  {[5, 4, 3].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs w-4">{stars}</span>
                      <div className="h-1.5 flex-grow bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${stars === 5 ? '85%' : stars === 4 ? '10%' : '3%'}` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button className="px-8 py-4 border-2 border-slate-900 text-slate-900 font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-colors">
              Viết đánh giá
            </button>
          </div>

          {/* Review Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex text-amber-500">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900">{review.title}</h4>
                  <p className="text-sm text-slate-700 italic">{review.content}</p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-900 font-semibold text-xs">
                    {review.author.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{review.author}</p>
                    <p className="text-xs text-slate-600">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
