import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '../services/auth';
import { fetchCategories, getCachedCategories, type Category } from '../services/categories';

export const Header = () => {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const initialCategories = getCachedCategories();
  const [productCategories, setProductCategories] = useState<Category[]>(initialCategories);
  const [productLoading, setProductLoading] = useState(() => initialCategories.length === 0);
  const courseCategories = ['Guitar', 'Violin', 'Piano', 'Trống'];

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await fetchCategories();
        if (isMounted) {
          setProductCategories(data);
        }
      } catch (err) {
        console.error('Load categories error:', err);
        if (isMounted) {
          setProductCategories(getCachedCategories());
        }
      } finally {
        if (isMounted) {
          setProductLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="bg-black/70 backdrop-blur-md text-white sticky top-0 z-50 border-b border-slate-800 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)]">
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .dropdown-menu {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-16 h-20 md:h-24 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-widest text-white uppercase font-noto-serif">
          Melody House
        </Link>

        <nav className="hidden lg:flex items-center gap-8 relative">
          {/* Sản phẩm Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setHoveredMenu('products')}
            onMouseLeave={() => {
              setHoveredMenu(null);
              setHoveredItem(null);
            }}
          >
            <button className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
              hoveredMenu === 'products'
                ? 'bg-amber-900/40 text-amber-400'
                : 'text-gray-300 hover:text-white'
            }`}>
              Sản phẩm
              <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${hoveredMenu === 'products' ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {hoveredMenu === 'products' && (
              <div className="dropdown-menu absolute top-full left-0 mt-0 bg-white border border-gray-200 rounded-xl shadow-xl py-3 w-56 z-50">
                {productLoading ? (
                  <div className="px-4 py-3 text-sm text-slate-500">Đang tải...</div>
                ) : (
                  productCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.slug ?? ''}`}
                      onMouseEnter={() => setHoveredItem(category.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`block px-4 py-3 transition-all duration-150 border-l-3 ${
                        hoveredItem === category.name
                          ? 'border-l-amber-500 bg-amber-50 text-amber-600 translate-x-1'
                          : 'border-l-transparent text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      {category.name}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Khóa học Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setHoveredMenu('courses')}
            onMouseLeave={() => {
              setHoveredMenu(null);
              setHoveredItem(null);
            }}
          >
            <button className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
              hoveredMenu === 'courses'
                ? 'bg-amber-900/40 text-amber-400'
                : 'text-gray-300 hover:text-white'
            }`}>
              Khóa học
              <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${hoveredMenu === 'courses' ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {hoveredMenu === 'courses' && (
              <div className="dropdown-menu absolute top-full left-0 mt-0 bg-white border border-gray-200 rounded-xl shadow-xl py-3 w-56 z-50">
                {courseCategories.map((category) => (
                  <a
                    key={category}
                    href="#"
                    onMouseEnter={() => setHoveredItem(category)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`block px-4 py-3 transition-all duration-150 border-l-3 ${
                      hoveredItem === category
                        ? 'border-l-amber-500 bg-amber-50 text-amber-600 translate-x-1'
                        : 'border-l-transparent text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {category}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Lịch học */}
          <a href="#" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg">
            Lịch học
          </a>
        </nav>

        <div className="flex items-center gap-6">
          <div className="relative group hidden xl:block">
            <input
              type="text"
              placeholder="Tìm kiếm nhạc cụ..."
              className="pl-4 pr-10 py-2 bg-white border-none rounded-full text-sm text-slate-900 placeholder-gray-500 focus:ring-1 focus:ring-amber-500 w-64 transition-all"
            />
            <span className="material-symbols-outlined absolute right-3 top-2 text-slate-400 text-xl">search</span>
          </div>
          {/* Auth actions: show login/register when not authenticated, profile when authenticated */}
          <AuthActions />
          <Link to="/cart" className="hover:bg-slate-800 transition-all duration-300 p-2 rounded-full active:scale-[0.98] relative">
            <span className="material-symbols-outlined text-white">shopping_cart</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-600 rounded-full"></span>
          </Link>
        </div>
      </div>
    </header>
  );
};

function AuthActions() {
  const [authed, setAuthed] = useState(() => isAuthenticated());

  useEffect(() => {
    const syncAuth = () => setAuthed(isAuthenticated());
    syncAuth();

    const timer = window.setInterval(syncAuth, 60_000);
    window.addEventListener('focus', syncAuth);
    window.addEventListener('auth-change', syncAuth);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', syncAuth);
      window.removeEventListener('auth-change', syncAuth);
    };
  }, []);

  if (!authed) {
    return (
      <div className="hidden lg:flex items-center gap-3">
        <Link to="/login" className="text-sm text-slate-200 hover:text-white transition-colors">Đăng nhập</Link>
        <Link to="/register" className="text-sm font-semibold bg-amber-600 text-white px-3 py-2 rounded-md hover:brightness-95 transition">Đăng ký</Link>
      </div>
    );
  }

  return (
    <Link to="/profile" className="hover:bg-slate-800 transition-all duration-300 p-2 rounded-full active:scale-[0.98]">
      <span className="material-symbols-outlined text-white">person</span>
    </Link>
  );
}
