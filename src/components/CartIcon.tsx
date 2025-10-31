import { useState } from 'react';
import { useCart } from '../features/cart/CartContext';

interface CartIconProps {
  onToggleCart: () => void;
  className?: string;
}

export function CartIcon({ onToggleCart, className = '' }: CartIconProps) {
  const { totalItems, isLoading } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onToggleCart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative flex items-center justify-center p-2 rounded-lg
        transition-all duration-200 ease-in-out
        hover:bg-gray-100 active:bg-gray-200
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
        ${className}
      `}
      aria-label={`Shopping cart with ${totalItems} items`}
      disabled={isLoading}
    >
      {/* Cart Icon SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`
          transition-transform duration-200
          ${isHovered ? 'scale-110' : 'scale-100'}
          ${isLoading ? 'opacity-50' : 'opacity-100'}
        `}
      >
        <path
          d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Item Count Badge */}
      {totalItems > 0 && (
        <span
          className={`
            absolute -top-1 -right-1 min-w-[20px] h-5 px-1
            bg-emerald-500 text-white text-xs font-semibold
            rounded-full flex items-center justify-center
            transition-all duration-200
            ${isHovered ? 'scale-110' : 'scale-100'}
          `}
          aria-hidden="true"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}