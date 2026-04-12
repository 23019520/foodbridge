import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/formatCurrency';
import Button from '@/components/common/Button';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { items, totalAmount, removeItem, updateQuantity, producerId } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl mb-3">🛒</p>
        <p className="font-semibold text-gray-700">Your cart is empty</p>
        <p className="text-sm text-gray-500 mt-1">Browse listings and add items to get started.</p>
        <Link to="/search" className="mt-4">
          <Button variant="secondary" size="sm">Browse listings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500">
        Items from one seller only — ordering from multiple sellers requires separate orders.
      </p>

      {/* Items list */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.listing_id} className="flex gap-3 items-start">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl shrink-0">🛒</div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
              <p className="text-sm text-primary-700 font-semibold">{formatCurrency(item.price)}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => updateQuantity(item.listing_id, item.quantity - 1)}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.listing_id, item.quantity + 1)}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={() => removeItem(item.listing_id)}
                className="ml-1 w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50"
                aria-label="Remove item"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total + checkout */}
      <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
        <div className="flex justify-between items-center font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
        <Link to="/checkout">
          <Button fullWidth>Proceed to checkout</Button>
        </Link>
      </div>
    </div>
  );
}
