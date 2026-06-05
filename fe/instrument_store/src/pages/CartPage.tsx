import { Link } from 'react-router-dom';

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

export const CartPage = () => {
  const cartItems: CartItem[] = [
    {
      id: '1',
      name: 'Đàn Dreadnought Gỗ Mahogany Chạm Khắc Thủ Công',
      description: 'Mặt trước bằng gỗ thông Sitka nguyên tấm với mặt sau và hông bằng gỗ mahogany cao cấp.',
      price: 3450,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO9HXZmNfMk3khEqb7JN6B8dCQIHLN28J7WA3wvGKbNzqkTOTHyNboAbYU5H0nxTyCguXLbFDi-e-tkF20xRBzbejwFKvbgtujnpozeLjmH_iR1RtNVaZl7PfWPLjZYYBBAU9L43Q3uOyq_ElMpzJ1bKhm6-Ca5xynqXLhDrCDEw1UFnRhcXcFUX2bMRRHaad3jUt43jwYJWRa1o2_db2rhj-uV5ZWLAZyJOCNlEOW5rjqIkxy-YBbbfzF9VoIMgBc_ftfqZ_bGUJf',
      quantity: 1,
    },
    {
      id: '2',
      name: 'Đàn Studio Grand Dòng Ebony',
      description: 'Đàn studio grand nhỏ gọn với phím gõ nhạy bén và lớp sơn hoàn thiện bằng gỗ mun tiêu chuẩn.',
      price: 12800,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmrhgIP5cRzVcA8xwHUy_9mCy_6wriQUMOa4vmelHPHgaCE4cqb14vsqMvb-HafS-PTloVu8UQqBEgcdUUgWYPWS5D0njkfy58ZyiVpW2Adue3qK3oa7YPNmyuJ6GpMJpL1FlPNrQHd4vrVbDbn7lmQZ0qlSqmaOMmcBPxPnsYOsQH8I5pnqNgvrkvp3doPsfihJCAASRus1XcwWn-eTnsvOQem5xWau62HZAWY-t1baxCPIiJVzqR1rO-LTC_L1bKMo0AseiRHMfA',
      quantity: 1,
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 pt-24 md:pt-32 pb-16 md:pb-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Giỏ hàng của bạn</h1>
          <p className="text-base text-slate-600">
            Kiểm tra lại những nhạc cụ được chế tác bậc thầy mà bạn đã chọn trước khi thanh toán.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items */}
          <section className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col md:flex-row shadow-sm group">
                <div className="w-full md:w-64 h-56 md:h-64 bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={item.image}
                  />
                </div>

                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2 md:max-w-md">{item.description}</p>
                    </div>
                    <span className="text-lg font-bold text-amber-600">{item.price.toLocaleString()} đ</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                    <div className="flex items-center space-x-4 border border-slate-300 rounded-full px-4 py-2 w-fit">
                      <button className="text-slate-500 hover:text-slate-900 transition-colors">
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <button className="text-slate-500 hover:text-slate-900 transition-colors">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <button className="text-red-600 font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <span className="material-symbols-outlined">delete</span> XÓA
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-slate-900 font-semibold hover:underline decoration-amber-600/30 underline-offset-4"
              >
                <span className="material-symbols-outlined">arrow_back</span> TIẾP TỤC MUA SẮM
              </Link>
            </div>
          </section>

          {/* Order Summary */}
          <aside className="lg:col-span-4 lg:sticky lg:top-32">
            <div className="bg-white border border-slate-200 rounded-lg p-10 shadow-lg">
              <h2 className="text-xl font-semibold text-slate-900 mb-8 pb-4 border-b border-slate-100">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tạm tính</span>
                  <span className="text-slate-900 font-semibold">{subtotal.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-amber-600 font-semibold">Miễn phí</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Thuế dự kiến</span>
                  <span className="text-slate-900 font-semibold">{tax.toLocaleString()} đ</span>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs text-slate-600 mb-2 uppercase font-semibold">MÃ KHUYẾN MÃI</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã"
                    className="flex-1 bg-slate-50 border-0 border-b border-slate-300 focus:ring-0 focus:border-amber-600 transition-all px-0 py-2 font-base"
                  />
                  <button className="font-semibold text-slate-900 border border-slate-900 px-4 py-2 hover:bg-slate-900 hover:text-white transition-all">
                    ÁP DỤNG
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 mb-10">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-lg font-semibold text-slate-900">Tổng cộng</span>
                  <span className="text-4xl font-bold text-slate-900">{total.toLocaleString()} đ</span>
                </div>
                <p className="text-[10px] text-slate-500 text-right">THANH TOÁN ĐƯỢC BẢO MẬT SSL</p>
              </div>

              <button className="w-full bg-slate-900 text-white font-semibold py-5 rounded flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-[0.99]">
                THANH TOÁN NGAY <span className="material-symbols-outlined">lock</span>
              </button>

              <div className="mt-8 flex justify-center gap-4 opacity-40 grayscale">
                <span className="material-symbols-outlined text-4xl">credit_card</span>
                <span className="material-symbols-outlined text-4xl">account_balance</span>
                <span className="material-symbols-outlined text-4xl">wallet</span>
              </div>
            </div>

            <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-amber-600">verified</span>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Bảo hành âm thanh trọn đời</h4>
                  <p className="text-sm text-slate-600">
                    Tất cả các nhạc cụ cấp bậc thầy của chúng tôi đều bao gồm bảo hành trọn đời về cấu trúc.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
