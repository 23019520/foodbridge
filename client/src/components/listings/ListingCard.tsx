import { Link } from 'react-router-dom';
import { MapPin, ShoppingCart } from 'lucide-react';
import { Listing } from '@/types/listing.types';
import { formatCurrency } from '@/utils/formatCurrency';
import { LISTING_STATUS_COLORS, LISTING_STATUS_LABELS } from '@/utils/constants';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { addItem, producerId } = useCart();
  const { user } = useAuth();

  const isAvailable = listing.status === 'available';
  const isConsumer = user?.role === 'consumer';

  // Warn user if adding from a different producer will clear their cart
  const willClearCart = producerId && producerId !== listing.producer_id;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Don't navigate to listing detail
    if (!isAvailable) return;

    if (willClearCart && !window.confirm('Your cart has items from another seller. Adding this will clear your cart. Continue?')) {
      return;
    }

    addItem({
      listing_id: listing.id,
      producer_id: listing.producer_id,
      title: listing.title,
      price: listing.price,
      quantity: 1,
      image_url: listing.images[0] ?? null,
    });
  };

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="card group flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {listing.images[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            🛒
          </div>
        )}
        {/* Status badge overlay */}
        {listing.status !== 'available' && (
          <div className="absolute top-2 left-2">
            <span className={clsx('badge', LISTING_STATUS_COLORS[listing.status])}>
              {LISTING_STATUS_LABELS[listing.status]}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <p className="text-xs text-primary-700 font-medium truncate">
          {listing.business_name ?? listing.producer_name}
        </p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {listing.title}
        </h3>

        {listing.location && (
          <p className="flex items-center gap-1 text-xs text-gray-500 mt-auto">
            <MapPin className="w-3 h-3 shrink-0" />
            {listing.location}
          </p>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <span className="font-bold text-gray-900 text-sm">
            {formatCurrency(listing.price)}
          </span>

          {isConsumer && (
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              aria-label={`Add ${listing.title} to cart`}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                isAvailable
                  ? 'text-primary-700 hover:bg-primary-50 active:bg-primary-100'
                  : 'text-gray-300 cursor-not-allowed'
              )}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
