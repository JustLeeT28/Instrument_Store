import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFavorites, removeFavorite, type FavoriteProduct } from '../services/favorites';
import { isAuthenticated } from '../services/auth';

const formatPrice = (price: number) => `${price.toLocaleString()} d`;

export const FavoritePage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadFavorites = async () => {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchFavorites();
        if (mounted) setFavorites(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Khong tai duoc danh sach yeu thich');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleRemove = async (id: string) => {
    const previousFavorites = favorites;
    setFavorites((current) => current.filter((item) => item.id !== id));

    try {
      await removeFavorite(id);
    } catch (err) {
      setFavorites(previousFavorites);
      setError(err instanceof Error ? err.message : 'Khong xoa duoc san pham yeu thich');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-16 py-12">
      <div className="mb-12 border-b border-slate-200 pb-8 flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
        <div>
          <nav className="flex items-center gap-2 text-slate-400 font-label-sm mb-4">
            <Link className="hover:text-secondary" to="/">Trang chu</Link>
            <span>/</span>
            <span className="text-slate-900">Danh sach yeu thich</span>
          </nav>
          <h1 className="font-headline-lg text-slate-900">Danh sach yeu thich</h1>
        </div>
        <p className="font-label-md text-slate-500">{favorites.length} san pham trong danh sach</p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-500">Dang tai...</div>
      ) : error ? (
        <div className="py-24 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map((item) => (
            <div key={item.id} className="group bg-white border border-slate-100 shadow-[0_8px_30px_rgb(15,23,42,0.04)] hover:shadow-[0_20px_40px_rgb(15,23,42,0.08)] transition-all duration-500">
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                <Link to={`/product/${item.slug ?? item.id}`}>
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={item.image ?? 'https://via.placeholder.com/600x800?text=No+Image'}
                    alt={item.name}
                  />
                </Link>
                <button
                  type="button"
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-error transition-colors shadow-sm"
                  onClick={() => handleRemove(item.id)}
                  aria-label="Xoa khoi danh sach yeu thich"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-emerald-50 text-emerald-700 font-label-sm px-3 py-1 rounded-full border border-emerald-100">
                    {(item.stockQty ?? 0) > 0 ? 'Con hang' : 'Het hang'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="font-label-sm text-slate-400 uppercase tracking-widest mb-2">{item.category ?? item.brand ?? 'San pham'}</p>
                <Link to={`/product/${item.slug ?? item.id}`} className="hover:underline">
                  <h3 className="font-headline-sm text-slate-900 mb-2 truncate">{item.name}</h3>
                </Link>
                <p className="text-base font-semibold text-amber-600 mb-6">{formatPrice(item.price ?? 0)}</p>
                <button className="w-full py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]">
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  Them vao gio
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
          <span className="material-symbols-outlined text-slate-200 text-8xl mb-6">favorite</span>
          <h2 className="font-headline-md text-slate-900 mb-4">Danh sach cua ban dang trong</h2>
          <p className="font-body-md text-slate-500 mb-10">Luu lai nhung nhac cu ban yeu thich de de dang theo doi sau nay.</p>
          <Link className="px-6 py-3 border border-slate-200 rounded-full font-label-md hover:border-secondary hover:text-secondary transition-all" to="/products">
            Xem san pham
          </Link>
        </div>
      )}
    </main>
  );
};
