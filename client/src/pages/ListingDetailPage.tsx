import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ShoppingCart, ChevronLeft, ChevronRight, User, Share2 } from 'lucide-react';
import { useListing } from '@/hooks/useListings';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { timeAgo } from '@/utils/formatDate';
import { CATEGORY_ICONS, LISTING_STATUS_COLORS, LISTING_STATUS_LABELS } from '@/utils/constants';
import { PageSpinner } from '@/components/common/Spinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import CartDrawer from '@/components/orders/CartDrawer';
import { clsx } from 'clsx';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: listing, isLoading, isError, error } = useListing(id!);
  const { addItem, producerId, itemCount } = useCart();
  const { user } = useAuth();

  const [imageIndex, setImageIndex] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  if (isLoading) return <PageSpinner />;
  if (isError || !listing) return <ErrorMessage message={(error as Error)?.message} />;

  const images = listing.images.length > 0 ? listing.images : [];
  const isConsumer = user?.role === 'consumer';
  const isAvailable = listing.status === 'available';
  const willClearCart = producerId && producerId !== listing.producer_id;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    if (willClearCart && !window.confirm('Your cart has items from another seller. This will clear your cart. Continue?')) return;

    addItem({
      listing_id: listing.id,
      producer_id: listing.producer_id,
      title: listing.title,
      price: listing.price,
      quantity: 1,
      image_url: listing.images[0] ?? null,
    });

    setCartOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700 mb-4">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-10">

        {/* Images */}
        <div className="flex flex-col gap-2">
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            {images.length > 0 ? (
              <img src={images[imageIndex]} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200">
                {CATEGORY_ICONS[listing.category]}
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={clsx(
                    'w-14 h-14 rounded-lg overflow-hidden border-2',
                    i === imageIndex ? 'border-primary-600' : 'border-transparent'
                  )}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {CATEGORY_ICONS[listing.category]} {listing.category}
            </span>
            <span className={clsx('badge', LISTING_STATUS_COLORS[listing.status])}>
              {LISTING_STATUS_LABELS[listing.status]}
            </span>
          </div>

          <h1 className="text-2xl font-bold">{listing.title}</h1>

          <p className="text-3xl font-bold text-primary-800">
            {formatCurrency(listing.price)}
          </p>

          {listing.description && (
            <p className="text-sm text-gray-600">{listing.description}</p>
          )}

          <div className="text-sm text-gray-500 space-y-1">
            {listing.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {listing.location}
              </div>
            )}
            <div>Available: {listing.quantity}</div>
            <div>Listed {timeAgo(listing.created_at)}</div>
          </div>

          {isConsumer && (
            <Button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              size="lg"
              leftIcon={<ShoppingCart className="w-5 h-5" />}
              fullWidth
            >
              {isAvailable ? 'Add to cart' : 'Unavailable'}
            </Button>
          )}

          {!user && (
            <Link to="/login">
              <Button variant="outline" fullWidth>
                Log in to order
              </Button>
            </Link>
          )}

          {/* Producer */}
          <Link to={`/producers/${listing.producer_id}`} className="flex items-center gap-3 p-4 border rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              {listing.producer_avatar ? (
                <img src={listing.producer_avatar} className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {listing.business_name ?? listing.producer_name}
              </p>
              <p className="text-xs text-primary-700">View profile →</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Floating Share Button */}
      <button
        onClick={() => setShareOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg hover:bg-primary-700 transition"
      >
        <Share2 className="w-6 h-6" />
      </button>

      {/* Cart Modal */}
      <Modal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        title={`Cart (${itemCount} item${itemCount !== 1 ? 's' : ''})`}
      >
        <CartDrawer />
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share this listing"
      >
        <div className="flex flex-col gap-3">

          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Check out ${listing.title} for ${formatCurrency(listing.price)} on FoodBridge!\n\n${window.location.href}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border hover:bg-green-50 hover:text-green-700"
          >
            <Share2 className="w-4 h-4" />
            Share on WhatsApp
          </a>

          {/* Twitter */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `Check out ${listing.title} for ${formatCurrency(listing.price)} on FoodBridge!`
            )}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border hover:bg-blue-50 hover:text-blue-700"
          >
            <Share2 className="w-4 h-4" />
            Share on Twitter
          </a>

          {/* Copy */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied!');
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border hover:bg-gray-100"
          >
            <Share2 className="w-4 h-4" />
            Copy Link
          </button>

        </div>
      </Modal>
    </div>
  );
}