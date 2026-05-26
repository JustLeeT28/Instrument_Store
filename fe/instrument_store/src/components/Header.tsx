import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md text-slate-900 dark:text-slate-50 sticky top-0 z-50 border-b border-slate-100 dark:border-slate-900 shadow-[0_4px_20px_-5px_rgba(15,23,42,0.08)]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-16 h-20 md:h-24 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-widest text-slate-900 dark:text-slate-50 uppercase font-noto-serif">
          Melody House
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/products" className="text-slate-900 dark:text-slate-50 border-b-2 border-amber-600 pb-1 hover:text-slate-700 transition-colors">
            Đàn Guitar
          </Link>
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            Đàn Piano
          </a>
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            Trống
          </a>
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            Dàn nhạc
          </a>
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            Studio
          </a>
        </nav>

        <div className="flex items-center gap-6">
          <div className="relative group hidden xl:block">
            <input
              type="text"
              placeholder="Tìm kiếm nhạc cụ..."
              className="pl-4 pr-10 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-1 focus:ring-amber-500 w-64 transition-all"
            />
            <span className="material-symbols-outlined absolute right-3 top-2 text-slate-400 text-xl">search</span>
          </div>
          <button className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300 p-2 rounded-full active:scale-[0.98]">
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-50">person</span>
          </button>
          <Link to="/cart" className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300 p-2 rounded-full active:scale-[0.98] relative">
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-50">shopping_cart</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-600 rounded-full"></span>
          </Link>
        </div>
      </div>
    </header>
  );
};
