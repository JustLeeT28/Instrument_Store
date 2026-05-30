import { useState } from 'react';
import { Link } from 'react-router-dom';

const initialFavorites = [
  {
    id: 'fav-1',
    category: 'Acoustic Guitars',
    title: 'Acoustic Custom Series X1',
    price: '45.000.000₫',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPvNoFs3fI5sETJVjmineV6pZe_VAeH4ve48owlHTQf2MdBeXAYOkYTAY4PuMAZEJN2r5z2J7qzBLs7fy93M5aBVso9NLW36bd1e7glda29pPf4WIwb9qAUjlNtCPaGZhR2hRMnqNaDzA_vGzn3eidGfbOsnuBmQwWwyg1X6oQNJ6tHfjL8_rq2aO04P6V7foSL8MsOyA06s8Xc2eX6zeS8BO_K4DkXAZZkM9hTX2aUWE_cMr-_UcebKXi5RBE99acbJSyP4orGhMx',
    inStock: true,
  },
  {
    id: 'fav-2',
    category: 'Grand Pianos',
    title: 'Maestro Concert Grand',
    price: '820.000.000₫',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjKmeEwZ1Gl9kU5nupP93x7_Mb7ppFmRb3aCas8KlEHTaMEWwp_hMET2kALTtDIixxyH-oM5GMMJn4KtjYhFwaa8Tk0M1JlQPpXWFufaNASsh3pUb74yZmHyX_kAyqYZbCrcgrIP_8Jx4HiMbGCRA9vDQSCMSPatkOCWXwsWveuqRe07Gt8eAHIxmlCirS4nwnIPzdM-mdNzk4COr-LKs1OkRv7n0duzbYBebSx1FyMDgYtLpXkWoUAs0kVXoztVcAA3f47qpsrmAP',
    inStock: true,
  },
  {
    id: 'fav-3',
    category: 'Orchestral',
    title: 'Heritage Cello V2',
    price: '115.000.000₫',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM-7mZAzO_ljyQMVsZ7sBIPkE_FEnW6hjaVwLL0MtuQizOhE6V0QH7VlG3XlEnTz1QWB8hB3_SdhICcWuJFwGQmbwu5qFXU8_Vu7VE52lHAhxWDppySQ1dKqw8CoXP_0UqiqHE-nOHqwx5-yb_azr39caYdxtKS11DvFQ8T-gBnPO7QiPCBHc9HC4Ena0ZhUFAuC28AV4wyoDbjC4fuTOPCgSmN0JyrZhKIZTg9RwbLxhQhXLzSkLja1drpUfBydiLU2fykJe4idZU',
    inStock: true,
  },
  {
    id: 'fav-4',
    category: 'Studio',
    title: 'Pro-Series Condenser',
    price: '28.500.000₫',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk0ReKycmIIBeZ15UjF2omwEYIgu0iqUZu-0IcFm8ZLgghNUnLC4AcHP987yQ3fPvV2ZlsZt3cop8g0U2vV8zMLiDdvNu8VmOpcXKbcIBc7RflKCsgUDFrLwaGU07xqBYk2247roLqmRgnEgloFqZXHGeaFPs-fC63beMIpaXE5MYFYEpnJ1-qst0Nsa4Dq6uiTNemsd6rMsGLDwtmSyGn8kot6C0tDbpl98BaCn7S59S4TOksODh7ACFrAzknMCEDtFv44w1ZIigP',
    inStock: true,
  },
];

export const FavoritePage = () => {
  const [favorites, setFavorites] = useState(initialFavorites);

  const handleRemove = (id: string) => {
    setFavorites((current) => current.filter((item) => item.id !== id));
  };

  return (
    <main className="max-w-7xl mx-auto px-16 py-12">
      <div className="mb-12 border-b border-slate-200 pb-8 flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
        <div>
          <nav className="flex items-center gap-2 text-slate-400 font-label-sm mb-4">
            <Link className="hover:text-secondary" to="/">Trang chủ</Link>
            <span>/</span>
            <span className="text-slate-900">Danh sách yêu thích</span>
          </nav>
          <h1 className="font-headline-lg text-slate-900">Danh sách yêu thích</h1>
        </div>
        <p className="font-label-md text-slate-500">{favorites.length} sản phẩm trong danh sách</p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map((item) => (
            <div key={item.id} className="group bg-white border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)] hover:shadow-[0_20px_40px_rgb(15,23,42,0.08)] transition-all duration-500">
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.image} alt={item.title} />
                <button
                  type="button"
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-error transition-colors shadow-sm"
                  onClick={() => handleRemove(item.id)}
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-emerald-50 text-emerald-700 font-label-sm px-3 py-1 rounded-full border border-emerald-100">Còn hàng</span>
                </div>
              </div>
              <div className="p-6">
                <p className="font-label-sm text-slate-400 uppercase tracking-widest mb-2">{item.category}</p>
                <h3 className="font-headline-sm text-slate-900 mb-2 truncate">{item.title}</h3>
                <p className="text-base font-semibold text-amber-600 mb-6">{item.price}</p>
                <button className="w-full py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]">
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
          <span className="material-symbols-outlined text-slate-200 text-8xl mb-6">favorite</span>
          <h2 className="font-headline-md text-slate-900 mb-4">Danh sách của bạn đang trống</h2>
          <p className="font-body-md text-slate-500 mb-10">Lưu lại những nhạc cụ bạn yêu thích để dễ dàng theo dõi và sở hữu sau này.</p>
          <div className="w-full">
            <p className="font-label-sm text-slate-400 uppercase tracking-widest mb-6">Gợi ý cho bạn</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link className="px-6 py-3 border border-slate-200 rounded-full font-label-md hover:border-secondary hover:text-secondary transition-all" to="/products">Guitars</Link>
              <Link className="px-6 py-3 border border-slate-200 rounded-full font-label-md hover:border-secondary hover:text-secondary transition-all" to="/products">Pianos</Link>
              <Link className="px-6 py-3 border border-slate-200 rounded-full font-label-md hover:border-secondary hover:text-secondary transition-all" to="/products">Studio</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
