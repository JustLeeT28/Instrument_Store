import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../services/api';
import { fetchCart, removeCartItem, updateCartItem, type CartItem, type CartResponse } from '../services/cart';
import { checkout } from '../services/orders';
import type { Product } from '../components/ProductCard';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const fallbackImage = 'https://via.placeholder.com/600x800?text=No+Image';

const recommendationScore = (product: Product) => (product.rating ?? 0) * 100 + product.price / 1_000_000;

export const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setError('');
        setLoading(true);

        const [cartResponse, productsResponse] = await Promise.all([
          fetchCart(),
          fetch(`${API_BASE}/products`, { headers: { Accept: 'application/json' } }),
        ]);

        if (!productsResponse.ok) {
          throw new Error('Khong the tai san pham goi y');
        }

        const productsData = (await productsResponse.json()) as Array<{
          id: string;
          slug?: string;
          name: string;
          brand?: string | null;
          category?: string | null;
          price?: number;
          rating?: number | null;
          badge?: string | null;
          image?: string | null;
        }>;

        if (!mounted) return;

        setCart(cartResponse);
        // Auto-select all items on first load
        setSelectedIds(new Set(cartResponse.items.map((i) => i.product.id)));
        setRecommendations(
          productsData
            .map((product) => ({
              id: product.id,
              slug: product.slug,
              name: product.name,
              brand: product.brand ?? product.category ?? 'Unknown',
              price: product.price ?? 0,
              image: product.image ?? fallbackImage,
              rating: product.rating ?? undefined,
              badge: product.badge ?? undefined,
            }))
            .filter((product) => !cartResponse.items.some((item) => item.product.id === product.id))
            .sort((a, b) => recommendationScore(b) - recommendationScore(a))
            .slice(0, 4),
        );
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Co loi xay ra');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const cartItems = cart?.items ?? [];

  const selectedItems = useMemo(
    () => cartItems.filter((item) => selectedIds.has(item.product.id)),
    [cartItems, selectedIds],
  );

  const selectedCount = selectedItems.length;
  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0),
    [selectedItems],
  );
  const shipping = 0;
  const vat = 0;
  const total = selectedSubtotal + shipping + vat;
  const allSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < cartItems.length;

  const toggleItem = useCallback((productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === cartItems.length) {
        return new Set();
      }
      return new Set(cartItems.map((i) => i.product.id));
    });
  }, [cartItems]);

  const handleQuantityChange = async (item: CartItem, nextQuantity: number) => {
    try {
      setSavingId(item.product.id);
      const nextCart = await updateCartItem(item.product.id, nextQuantity);
      setCart(nextCart);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Co loi xay ra');
    } finally {
      setSavingId(null);
    }
  };

  const handleRemove = async (item: CartItem) => {
    try {
      setSavingId(item.product.id);
      const nextCart = await removeCartItem(item.product.id);
      setCart(nextCart);
      // Remove from selection if still present
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.product.id);
        return next;
      });
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Co loi xay ra');
    } finally {
      setSavingId(null);
    }
  };

  const handleCheckout = useCallback(async () => {
    const selected = Array.from(selectedIds);
    if (selected.length === 0) {
      setError('Vui long chon it nhat 1 san pham de thanh toan');
      return;
    }

    try {
      setCheckingOut(true);
      setError('');
      const result = await checkout(selected, couponCode.trim() || undefined);
      if (!result.checkoutUrl) {
        throw new Error('PayOS khong tra ve duong dan thanh toan');
      }
      window.location.assign(result.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Co loi xay ra');
    } finally {
      setCheckingOut(false);
    }
  }, [couponCode, navigate, selectedIds]);

  const handleApplyCoupon = useCallback(() => {
    setCouponCode((current) => current.trim().toUpperCase());
  }, []);

  const summaryRows = useMemo(
    () => [
      { label: 'Tạm tính', value: formatCurrency(selectedSubtotal) },
      { label: 'Phí vận chuyển', value: 'Miễn phí' },
      { label: 'Thuế GTGT', value: formatCurrency(vat) },
    ],
    [selectedSubtotal, vat],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f9fb_0%,#f8fafc_55%,#fdf7f2_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="absolute right-[-8%] top-[-6%] h-[32rem] w-[32rem] rounded-full bg-[#ffdbcc] blur-[120px]" />
        <div className="absolute bottom-[-8%] left-[-10%] h-[28rem] w-[28rem] rounded-full bg-[#dae2fd] blur-[120px]" />
      </div>

      <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-10 lg:px-16 lg:pb-24 lg:pt-12">
        <div className="mb-10 animate-[fadeIn_0.8s_ease-out_forwards]">
          <nav className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            <Link to="/" className="transition-colors hover:text-amber-700">
              Trang chủ
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-900">Giỏ hàng</span>
          </nav>
          <h1 className="font-['Noto_Serif'] text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Giỏ hàng
          </h1>
          <p className="mt-3 max-w-2xl text-base italic leading-7 text-slate-600 md:text-lg">
            Sự tuyển chọn của bạn cho những âm thanh thuần khiết và tinh tế nhất.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-8">
          <section className="space-y-4 lg:col-span-8">
            {loading ? (
              <div className="rounded-2xl border border-white/70 bg-white/90 p-8 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Đang tải giỏ hàng</p>
                <p className="mt-2 text-slate-600">Đang tải đơn hàng...</p>
              </div>
            ) : cartItems.length > 0 ? (
              <>
                {/* Select all row */}
                <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="flex h-5 w-5 items-center justify-center rounded border border-slate-400 bg-white transition-colors hover:border-amber-600"
                  >
                    {allSelected ? (
                      <span className="material-symbols-outlined text-[16px] text-amber-700">check</span>
                    ) : someSelected ? (
                      <span className="material-symbols-outlined text-[16px] text-amber-500">remove</span>
                    ) : null}
                  </button>
                  <span className="text-sm font-semibold text-slate-700">
                    Chọn tất cả ({cartItems.length} sản phẩm)
                  </span>
                </div>

                {cartItems.map((item, index) => {
                  const product = item.product;
                  const image = product.image ?? fallbackImage;
                  const lineTotal = item.lineTotal;
                  const isSelected = selectedIds.has(product.id);

                  return (
                    <article
                      key={product.id}
                      className={`group flex flex-col gap-4 rounded-2xl border p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] md:flex-row md:items-start md:gap-6 md:p-5 ${
                        isSelected
                          ? 'border-amber-300 bg-amber-50/70'
                          : 'border-white/70 bg-white/90'
                      }`}
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      {/* Checkbox */}
                      <div className="flex-shrink-0 pt-2 md:pt-0">
                        <button
                          type="button"
                          onClick={() => toggleItem(product.id)}
                          className={`flex h-6 w-6 items-center justify-center rounded border-2 transition-colors ${
                            isSelected
                              ? 'border-amber-600 bg-amber-600'
                              : 'border-slate-400 bg-white hover:border-amber-600'
                          }`}
                        >
                          {isSelected && (
                            <span className="material-symbols-outlined text-[16px] text-white">check</span>
                          )}
                        </button>
                      </div>

                      <div className="flex-shrink-0 self-start">
                        <div className="h-28 w-28 overflow-hidden rounded-xl bg-slate-100 md:h-36 md:w-36">
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="min-w-0">
                          <h2 className="break-words font-['Noto_Serif'] text-lg font-medium leading-tight text-slate-950 md:text-xl">
                            {product.name}
                          </h2>
                          <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {product.brand ?? product.category ?? 'Nhạc cụ'}
                          </p>
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                            {product.description ?? 'Sản phẩm được đồng bộ từ backend.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            disabled={savingId === product.id}
                            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                            Xóa
                          </button>
                        </div>

                        <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500">Giá</span>
                            <span className="whitespace-nowrap text-sm font-semibold text-slate-900 md:text-base">
                              {formatCurrency(product.price)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500">Số lượng</span>
                            <div className="flex items-center gap-4 rounded-full border border-slate-300 bg-white px-4 py-2">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                disabled={savingId === product.id}
                                className="text-slate-500 transition-colors hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={`Giảm số lượng ${product.name}`}
                              >
                                <span className="material-symbols-outlined text-[18px]">remove</span>
                              </button>
                              <span className="w-7 text-center text-sm font-semibold text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                disabled={savingId === product.id}
                                className="text-slate-500 transition-colors hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={`Tăng số lượng ${product.name}`}
                              >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500">Tổng cộng</span>
                            <span className="whitespace-nowrap font-['Noto_Serif'] text-lg font-medium text-amber-700 md:text-xl">
                              {formatCurrency(lineTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-900">Giỏ hàng đang trống</p>
                <p className="mt-2 text-sm text-slate-600">
                  Hãy quay lại danh sách sản phẩm để thêm nhạc cụ phù hợp.
                </p>
                <Link
                  to="/products"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-900 px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Tiếp tục mua sắm
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-amber-700"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Tiếp tục mua sắm
              </Link>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-900 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white"
              >
                Cập nhật giỏ hàng
              </button>
            </div>
          </section>

          <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-8">
            <div className="rounded-3xl border border-white/70 bg-slate-50/95 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur">
              <h2 className="font-['Noto_Serif'] text-3xl font-medium text-slate-950">Tổng đơn hàng</h2>
              <p className="mt-2 text-sm text-slate-500">
                {selectedCount > 0
                  ? `${selectedCount} sản phẩm đã chọn`
                  : `${cartItems.length} sản phẩm trong giỏ`}
              </p>

              {selectedCount === 0 && cartItems.length > 0 && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Vui lòng chọn ít nhất 1 sản phẩm để thanh toán
                </div>
              )}

              <div className="mt-8 space-y-5 border-b border-slate-200 pb-8">
                {summaryRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-600">{row.label}</span>
                    <span className="text-base text-slate-900">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="py-8">
                <div className="flex items-end justify-between gap-4">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Tổng cộng</span>
                  <span className="font-['Noto_Serif'] text-3xl font-semibold text-amber-700 md:text-[1.9rem]">
                    {formatCurrency(total)}
                  </span>
                </div>
                <p className="mt-2 text-right text-[12px] italic text-slate-500">(Đã bao gồm VAT nếu có)</p>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkingOut || selectedCount === 0}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg transition-all hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkingOut
                  ? 'Đang xử lý...'
                  : selectedCount > 0
                    ? `Thanh toán (${selectedCount})`
                    : 'Thanh toán ngay'}
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </button>

              <div className="mt-8 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-amber-700">verified_user</span>
                  <span>Thanh toán bảo mật 100%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-amber-700">local_shipping</span>
                  <span>Giao hàng thủ công chuyên nghiệp</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-amber-700">workspace_premium</span>
                  <span>Bảo hành 5 năm chính hãng</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur">
              <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-slate-600">Mã giảm giá</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã của bạn"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                    onClick={handleApplyCoupon}
                  className="rounded-full border border-slate-900 px-5 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-900 hover:text-white"
                >
                  Áp dụng
                </button>
              </div>
                {couponCode.trim() && (
                  <p className="mt-3 text-xs text-slate-500">
                    Voucher <span className="font-semibold text-slate-900">{couponCode.trim().toUpperCase()}</span> sẽ được kiểm tra khi thanh toán.
                  </p>
                )}
            </div>
          </aside>
        </div>

        <section className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="mb-10 text-center font-['Noto_Serif'] text-3xl font-medium text-slate-950 md:text-4xl">
            Có thể bạn sẽ cần
          </h2>

          {recommendations.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {recommendations.map((item, index) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-square overflow-hidden bg-slate-100">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-5">
                    <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      {item.brand}
                    </p>
                    <h3 className="mt-2 font-['Noto_Serif'] text-[18px] font-medium text-slate-950">{item.name}</h3>
                    <p className="mt-2 text-sm font-medium text-amber-700">{formatCurrency(item.price)}</p>
                    <Link
                      to={`/product/${item.slug ?? item.id}`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500">Chưa có sản phẩm gợi ý.</p>
          )}
        </section>
      </main>
    </div>
  );
};
