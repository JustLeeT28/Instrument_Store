import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFavorites, removeFavorite, type FavoriteProduct } from '../services/favorites';
import { isAuthenticated } from '../services/auth';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../components/ProductCard';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x800?text=No+Image';

const toProductCardItem = (item: FavoriteProduct): Product => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  brand: item.brand ?? item.category ?? 'Sản phẩm',
  price: item.price ?? 0,
  image: item.image ?? item.images?.[0] ?? PLACEHOLDER_IMAGE,
  images: Array.isArray(item.images) ? item.images : [],
  rating: item.rating ?? undefined,
  badge: item.badge ?? undefined,
});

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
        if (mounted) setError(err instanceof Error ? err.message : 'Không tải được danh sách yêu thích');
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
      setError(err instanceof Error ? err.message : 'Không xóa được sản phẩm yêu thích');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-16 py-12">
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

      {loading ? (
        <div className="py-24 text-center text-slate-500">Đang tải...</div>
      ) : error ? (
        <div className="py-24 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map((item) => (
            <div key={item.id} className="relative">
              <ProductCard product={toProductCardItem(item)} />
              <button
                type="button"
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-500 shadow-sm backdrop-blur-sm transition-colors hover:text-red-600"
                onClick={() => handleRemove(item.id)}
                aria-label="Xóa khỏi danh sách yêu thích"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
          <span className="material-symbols-outlined text-slate-200 text-8xl mb-6">favorite</span>
          <h2 className="font-headline-md text-slate-900 mb-4">Danh sách của bạn đang trống</h2>
          <p className="font-body-md text-slate-500 mb-10">Lưu lại những nhạc cụ bạn yêu thích để dễ dàng theo dõi sau này.</p>
          <Link className="px-6 py-3 border border-slate-200 rounded-full font-label-md hover:border-secondary hover:text-secondary transition-all" to="/products">
            Xem sản phẩm
          </Link>
        </div>
      )}
    </main>
  );
};
