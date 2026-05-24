export const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-noto-serif text-sm tracking-wide w-full mt-24 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-16 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <span className="text-xl font-semibold text-slate-900 dark:text-slate-50 block mb-6 uppercase tracking-widest">
            Luthier & Co.
          </span>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Gìn giữ linh hồn của âm thanh thông qua nghệ thuật thủ công và chất lượng không khoan nhượng kể từ năm 1924.
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-xl text-slate-400 hover:text-amber-600 cursor-pointer transition-colors">
              share
            </span>
            <span className="material-symbols-outlined text-xl text-slate-400 hover:text-amber-600 cursor-pointer transition-colors">
              public
            </span>
            <span className="material-symbols-outlined text-xl text-slate-400 hover:text-amber-600 cursor-pointer transition-colors">
              mail
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">Di sản</h3>
          <ul className="space-y-3">
            <li>
              <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                Chế tác thủ công
              </a>
            </li>
            <li>
              <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                Showroom
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">Hỗ trợ</h3>
          <ul className="space-y-3">
            <li>
              <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                Hỗ trợ
              </a>
            </li>
            <li>
              <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                Bản tin
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">Pháp lý</h3>
          <ul className="space-y-3">
            <li>
              <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                Quyền riêng tư
              </a>
            </li>
            <li>
              <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                Điều khoản
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
