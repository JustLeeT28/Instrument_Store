import { Link, useNavigate } from 'react-router-dom';
import type { FormEvent, ChangeEvent } from 'react';
import { useState, useEffect, useRef } from 'react';
import { register } from '../services/auth';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

type PasswordStrength = {
  score: number;
  label: string;
  color: string;
};

const getPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: PasswordStrength[] = [
    { score: 0, label: 'Rất yếu', color: 'bg-red-500' },
    { score: 1, label: 'Yếu', color: 'bg-orange-500' },
    { score: 2, label: 'Yếu', color: 'bg-orange-400' },
    { score: 3, label: 'Trung bình', color: 'bg-yellow-500' },
    { score: 4, label: 'Khá', color: 'bg-lime-500' },
    { score: 5, label: 'Mạnh', color: 'bg-green-500' },
    { score: 6, label: 'Rất mạnh', color: 'bg-emerald-500' },
  ];

  return levels[Math.min(score, 6)];
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

  // Track touched fields
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Debounce ref for async email check
  const emailCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Sync validation functions
  const validateFullNameSync = (value: string): string | null => {
    if (!value.trim()) return 'Họ và tên không được để trống';
    if (value.trim().length < 2) return 'Họ và tên phải có ít nhất 2 ký tự';
    return null;
  };

  const validateEmailSync = (value: string): string | null => {
    if (!value.trim()) return 'Email không được để trống';
    if (!EMAIL_REGEX.test(value)) return 'Email không đúng định dạng';
    return null;
  };

  const validatePasswordSync = (value: string): string | null => {
    if (!value) return 'Mật khẩu không được để trống';
    if (value.length < MIN_PASSWORD_LENGTH) return `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
    return null;
  };

  const validateConfirmPasswordSync = (value: string, originalPassword: string): string | null => {
    if (!value) return 'Vui lòng xác nhận mật khẩu';
    if (value !== originalPassword) return 'Mật khẩu xác nhận không khớp';
    return null;
  };

  // Handle full name change
  const handleFullNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    if (error) setError(null);
    if (touched.fullName) {
      setFullNameError(validateFullNameSync(value));
    }
  };

  // Handle email change with sync + async validation
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (error) setError(null);

    // Sync validation
    const syncError = validateEmailSync(value);
    setEmailError(syncError);

    // Cancel previous debounced async check
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
            setEmailError('Email đã được đăng ký. Vui lòng sử dụng email khác');
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

  // Handle password change with strength check
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (error) setError(null);

    // Update strength indicator (always, not just when touched)
    if (value) {
      setPasswordStrength(getPasswordStrength(value));
    } else {
      setPasswordStrength(null);
    }

    // Validate password when touched
    if (touched.password) {
      setPasswordError(validatePasswordSync(value));
    }

    // Re-validate confirm password if it has value
    if (confirmPassword && touched.confirmPassword) {
      setConfirmPasswordError(validateConfirmPasswordSync(confirmPassword, value));
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (error) setError(null);
    if (touched.confirmPassword) {
      setConfirmPasswordError(validateConfirmPasswordSync(value, password));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate on blur
    switch (field) {
      case 'fullName':
        setFullNameError(validateFullNameSync(fullName));
        break;
      case 'email':
        setEmailError(validateEmailSync(email));
        break;
      case 'password':
        setPasswordError(validatePasswordSync(password));
        break;
      case 'confirmPassword':
        setConfirmPasswordError(validateConfirmPasswordSync(confirmPassword, password));
        break;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Validate all fields
    const nameErr = validateFullNameSync(fullName);
    const emailErr = validateEmailSync(email);
    const passwordErr = validatePasswordSync(password);
    const confirmErr = validateConfirmPasswordSync(confirmPassword, password);

    setFullNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmErr);

    if (nameErr || emailErr || passwordErr || confirmErr) return;

    if (!agree) {
      setError('Vui lòng đồng ý với điều khoản và điều kiện');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({ email: email.trim(), password, fullName: fullName.trim() });
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setIsSubmitting(false);
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

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Họ và tên
                </label>
                <input
                  className={`mt-3 w-full border-0 border-b-2 bg-transparent px-1 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 ${
                    touched.fullName && fullNameError
                      ? 'border-red-400 focus:border-red-600'
                      : 'border-slate-200 focus:border-amber-600'
                  }`}
                  type="text"
                  value={fullName}
                  onChange={handleFullNameChange}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="Nguyễn Văn A"
                  disabled={isSubmitting}
                  autoComplete="name"
                />
                {touched.fullName && fullNameError && (
                  <p className="mt-1.5 text-xs text-red-600">{fullNameError}</p>
                )}
              </div>

              {/* Email */}
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

              {/* Password */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Mật khẩu
                </label>
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
                  autoComplete="new-password"
                />
                {touched.password && passwordError && (
                  <p className="mt-1.5 text-xs text-red-600">{passwordError}</p>
                )}

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                            passwordStrength && i < passwordStrength.score
                              ? passwordStrength.color
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength && (
                      <p className="mt-1 text-xs" style={{ color: passwordStrength.color.replace('bg-', '').replace('red', '#ef4444').replace('orange', '#f97316').replace('yellow', '#eab308').replace('lime', '#84cc16').replace('green', '#22c55e').replace('emerald', '#10b981') }}>
                        Độ mạnh: {passwordStrength.label}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Xác nhận mật khẩu
                </label>
                <input
                  className={`mt-3 w-full border-0 border-b-2 bg-transparent px-1 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 ${
                    touched.confirmPassword && confirmPasswordError
                      ? 'border-red-400 focus:border-red-600'
                      : 'border-slate-200 focus:border-amber-600'
                  }`}
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                {touched.confirmPassword && confirmPasswordError && (
                  <p className="mt-1.5 text-xs text-red-600">{confirmPasswordError}</p>
                )}
              </div>

              {/* Agree Checkbox */}
              <label className="flex items-start gap-3 text-sm text-slate-500">
                <input
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                    if (error === 'Vui lòng đồng ý với điều khoản và điều kiện') setError(null);
                  }}
                  disabled={isSubmitting}
                />
                Tôi đồng ý với các
                <span className="font-semibold text-amber-600">điều khoản và điều kiện</span>
              </label>

              {/* Submit Button */}
              <button
                className="flex w-full items-center justify-center gap-2 rounded-none bg-slate-900 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Tạo tài khoản
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
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