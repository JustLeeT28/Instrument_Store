import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addCartItem } from '../services/cart';

export interface Product {
  id: string;
  slug?: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  images?: string[];
  rating?: number;
  badge?: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  const handleAddToCart = async () => {
    if (addingToCart) return;

    try {
      setAddingToCart(true);
      setCartMessage('');
      await addCartItem(product.id, 1);
      setCartMessage('Đã thêm vào giỏ hàng');
    } catch (error) {
      setCartMessage(error instanceof Error ? error.message : 'Không thêm được vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="group">
      <div className="relative aspect-[3/4] bg-slate-100 mb-6 overflow-hidden border border-transparent group-hover:border-slate-300 transition-all">
        <img
          alt={product.name}
          className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
          src={product.image}
        />
        {product.badge && (
          <div className="absolute top-4 left-4 bg-white px-3 py-1 text-xs font-semibold uppercase">
            {product.badge}
          </div>
        )}
        <Link
          to={`/product/${product.slug ?? product.id}`}
          className="absolute bottom-0 left-0 w-full py-4 bg-black text-white translate-y-full group-hover:translate-y-0 transition-transform font-semibold text-sm flex items-center justify-center"
        >
          XEM NHANH
        </Link>
      </div>
      <Link to={`/product/${product.slug ?? product.id}`} className="hover:underline">
        <h4 className="text-base font-semibold text-slate-900 mb-1">{product.name}</h4>
      </Link>
      <p className="text-xs text-slate-500 mb-3 uppercase tracking-tight">{product.brand}</p>
      <div className="flex items-center justify-between gap-3">
        {product.price > 0 && <p className="text-base font-semibold text-amber-600">{product.price.toLocaleString()} đ</p>}
        {product.rating && (
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="text-xs text-slate-600">{product.rating}</span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={addingToCart}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
        {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
      </button>
      {cartMessage && <p className="mt-2 text-xs text-slate-600">{cartMessage}</p>}
    </div>
  );
};
