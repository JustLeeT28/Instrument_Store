import { Link, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { register } from '../services/auth';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!value) {
      setEmailError('Email không được để trống');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Email không đúng định dạng');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!agree) {
      setError('Vui lòng đồng ý điều khoản');
      return;
    }

    try {
      await register({ email, password, fullName });
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section className="flex items-center justify-center bg-white px-6 py-16 sm:px-12 lg:px-16">
          <div className="w-full max-w-md text-left">
            <div className="mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-600">Melody House</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900">Đăng ký tài khoản</h2>
              <p className="mt-3 text-sm text-slate-500">
                Tham gia cộng đồng những người yêu âm nhạc đích thực.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Họ và tên
                </label>
                <input
                  className="mt-3 w-full border-0 border-b-2 border-slate-200 bg-transparent px-1 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:ring-0"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Email
                </label>
                <input
                  className="mt-3 w-full border-0 border-b-2 border-slate-200 bg-transparent px-1 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:ring-0"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="name@example.com"
                />
                {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Mật khẩu
                </label>
                <input
                  className="mt-3 w-full border-0 border-b-2 border-slate-200 bg-transparent px-1 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:ring-0"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Xác nhận mật khẩu
                </label>
                <input
                  className="mt-3 w-full border-0 border-b-2 border-slate-200 bg-transparent px-1 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:ring-0"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-500">
                <input
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                Tôi đồng ý với các
                <span className="font-semibold text-amber-600">điều khoản và điều kiện</span>
              </label>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-none bg-slate-900 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-white transition-colors hover:bg-amber-700"
                type="submit"
              >
                Tạo tài khoản
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </form>

            <p className="mt-10 text-center text-sm text-slate-500">
              Đã có tài khoản?
              <Link className="ml-2 font-semibold text-amber-600 hover:underline" to="/login">
                Đăng nhập
              </Link>
            </p>
          </div>
        </section>

        <section className="relative hidden overflow-hidden lg:block">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDW7_Qq28DwFlWqvWIc2eRQDPWJKXBlQjELo5Y1KjrWUIYiHygoYwswqW4YpHvjDow9oeruKeI7uj3RljZf7qrNL9mUmG5wgg8vppI0HWXy-CF20CGDSJTGoEoHTNEj-NT6A8f9QQ1fZRTEcDNxEyn7wZkX7GE6T7EPyxIVNyrVMuGyVMj5__XV71Bq1Xu24o_KLOfC_zDFhxXBvFIfH1hBtdgPmu2AnXhURBe72z6R1eMg-vWGKsZdSmq6qWq7oeLX_RH_1ts5NkmT"
            alt="Xưởng nhạc cụ thủ công của Melody House"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute bottom-16 left-16 max-w-md text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200">
              Craftsmanship Beyond Sound
            </p>
            <h3 className="mt-4 font-noto-serif text-4xl font-semibold leading-tight">
              Nơi những tâm hồn đồng điệu tìm thấy thanh âm tuyệt mỹ.
            </h3>
            <p className="mt-4 text-sm text-slate-200">
              "Mỗi nhạc cụ là một câu chuyện, và chúng tôi ở đây để giúp bạn viết nên chương tiếp theo của chính mình."
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};
