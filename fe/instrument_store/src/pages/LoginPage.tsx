import { Link, useNavigate } from 'react-router-dom';
import type { FormEvent, ChangeEvent } from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { login } from '../services/auth';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Track touched fields
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Debounce ref for async email check
  const emailCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Sync validation functions
  const validateEmailSync = useCallback((value: string): string | null => {
    if (!value.trim()) return 'Email không được để trống';
    if (!EMAIL_REGEX.test(value)) return 'Email không đúng định dạng';
    return null;
  }, []);

  const validatePasswordSync = useCallback((value: string): string | null => {
    if (!value) return 'Mật khẩu không được để trống';
    if (value.length < MIN_PASSWORD_LENGTH) return `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
    return null;
  }, []);

  // Handle email change with sync + async validation
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Clear error when user starts typing
    if (error) setError(null);

    // Sync validation
    const syncError = validateEmailSync(value);
    setEmailError(syncError);

    // Cancel previous debounced check
    if (emailCheckTimerRef.current) {
      clearTimeout(emailCheckTimerRef.current);
    }
    setIsCheckingEmail(false);

    // Only async check when sync valid & has value
    if (!syncError && value.trim()) {
      setIsCheckingEmail(true);
      emailCheckTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/check-email?email=${encodeURIComponent(value.trim())}`);
          const data = await res.json();
          if (data.exists) {
            setEmailError('Email đã được đăng ký');
          }
        } catch {
          // Silently ignore network errors for email check
        } finally {
          setIsCheckingEmail(false);
        }
      }, 500);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimerRef.current) {
        clearTimeout(emailCheckTimerRef.current);
      }
    };
  }, []);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (error) setError(null);
    if (touched.password) {
      setPasswordError(validatePasswordSync(value));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    // Validate on blur
    if (field === 'email') {
      setEmailError(validateEmailSync(email));
    }
    if (field === 'password') {
      setPasswordError(validatePasswordSync(password));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate all fields
    const emailErr = validateEmailSync(email);
    const passwordErr = validatePasswordSync(password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) return;

    try {
      setIsSubmitting(true);
      const resp = await login({ email: email.trim(), password });
      if (resp?.token) {
        localStorage.setItem('token', resp.token);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
      } else {
        setError('Đăng nhập thất bại');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi đăng nhập');
    } finally {
      setIsSubmitting(false);
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

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Email
                </label>
                <div className="relative mt-3">
                  <input
                    className={`w-full border-0 border-b-2 bg-transparent px-1 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 ${
                      touched.email && emailError
                        ? 'border-red-400 focus:border-red-600'
                        : 'border-slate-200 focus:border-amber-600'
                    }`}
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="name@example.com"
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                  {isCheckingEmail && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </span>
                  )}
                </div>
                {touched.email && emailError && (
                  <p className="mt-1.5 text-xs text-red-600">{emailError}</p>
                )}
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
                  className={`mt-3 w-full border-0 border-b-2 bg-transparent px-1 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 ${
                    touched.password && passwordError
                      ? 'border-red-400 focus:border-red-600'
                      : 'border-slate-200 focus:border-amber-600'
                  }`}
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                {touched.password && passwordError && (
                  <p className="mt-1.5 text-xs text-red-600">{passwordError}</p>
                )}
              </div>

              <button
                className="flex w-full items-center justify-center gap-3 rounded-none bg-slate-900 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </form>

            <div className="my-10 flex items-center gap-4 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200"></span>
              Hoặc đăng nhập bằng
              <span className="h-px flex-1 bg-slate-200"></span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="flex items-center justify-center gap-2 border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-amber-300 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined text-base">google</span>
                Google
              </button>
              <button
                className="flex items-center justify-center gap-2 border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-amber-300 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              >
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