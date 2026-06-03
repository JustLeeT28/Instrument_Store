import { Link, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { login } from '../services/auth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const resp = await login({ email, password });
      if (resp?.token) {
        localStorage.setItem('token', resp.token);
        navigate('/');
      } else {
        setError('Đăng nhập thất bại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi đăng nhập');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:block">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcUlFfINaYs0hzV1wRFL7353a5l-zf82d0pMGMGlLS0JSsWuRjubNYRi_9USKzQvJkS04R-aA7WYw2HcjNtuwiNG34Fdm2crAiUIjHaoy7hVeckjlIcjg6QBRVnw2JR7ruXrl9n4xMKHW9qCg8MlPmImew8gGvSf4PtFH67WHdU2D32SDaoEN6WNxcgZDPjdgOYvGwMzLk4anXIKiR51kD_4SSeie1h6Jaxuil5tLaN_odgsSYPrz7oSC61v99lLzurrm5IMOqrhlw"
            alt="Không gian xưởng thủ công của Melody House"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute bottom-16 left-16 max-w-md text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-200">Melody House</p>
            <h1 className="mt-4 font-noto-serif text-4xl font-semibold leading-tight">
              Âm thanh từ những đôi tay bậc thầy
            </h1>
            <p className="mt-4 text-sm text-slate-200">
              Nâng tầm nghệ thuật qua từng thớ gỗ. Đăng nhập để bước vào không gian của những
              nhạc cụ tinh xảo.
            </p>
          </div>
        </section>

        <section className="relative flex items-center justify-center bg-white px-6 py-16 sm:px-12 lg:px-16">
          <Link
            className="absolute right-10 top-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 transition-colors hover:text-slate-900"
            to="/"
          >
            Trang chủ
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>

          <div className="w-full max-w-md text-left">
            <header className="mb-10">
              <h2 className="text-3xl font-semibold text-slate-900">Đăng nhập</h2>
              <p className="mt-3 text-sm text-slate-500">
                Chào mừng bạn quay trở lại với không gian âm nhạc nghệ thuật.
              </p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Email
                </label>
                <input
                  className="mt-3 w-full border-0 border-b-2 border-slate-200 bg-transparent px-1 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:ring-0"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <div className="flex items-end justify-between">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                    Mật khẩu
                  </label>
                  <button className="text-xs font-semibold text-amber-600 hover:text-amber-700" type="button">
                    Quên mật khẩu?
                  </button>
                </div>
                <input
                  className="mt-3 w-full border-0 border-b-2 border-slate-200 bg-transparent px-1 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:ring-0"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button
                className="w-full rounded-none bg-slate-900 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-white transition-colors hover:bg-amber-700"
                type="submit"
              >
                Đăng nhập
              </button>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </form>

            <div className="my-10 flex items-center gap-4 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200"></span>
              Hoặc đăng nhập bằng
              <span className="h-px flex-1 bg-slate-200"></span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-amber-300 hover:text-amber-700">
                <span className="material-symbols-outlined text-base">google</span>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-amber-300 hover:text-amber-700">
                <span className="material-symbols-outlined text-base">ios</span>
                Apple
              </button>
            </div>

            <p className="mt-10 text-center text-sm text-slate-500">
              Chưa có tài khoản?
              <Link className="ml-2 font-semibold text-amber-600 hover:underline" to="/register">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};
