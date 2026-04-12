import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { usePlaceOrder } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/formatCurrency';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Trash2, Phone, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

const schema = z.object({
  delivery_type: z.enum(['delivery', 'collection']),
  delivery_address: z.string().optional(),
  contact_number: z.string().min(10, 'Enter a valid phone number'),
  consumer_note: z.string().max(300).optional(),
}).refine(
  (d) => d.delivery_type !== 'delivery' || (d.delivery_address && d.delivery_address.trim().length > 0),
  { message: 'Please enter your delivery address', path: ['delivery_address'] }
);

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { items, totalAmount, producerId, removeItem, clearCart } = useCart();
  const { mutateAsync: placeOrder, isPending, error } = usePlaceOrder();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { delivery_type: 'collection' },
  });

  const deliveryType = watch('delivery_type');

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-4xl mb-4">🛒</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 text-sm mb-6">Add some items before checking out.</p>
        <Link to="/search">
          <Button variant="secondary">Browse listings</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    if (!producerId) return;
    try {
      const order = await placeOrder({
        producer_id: producerId,
        items: items.map((i) => ({ listing_id: i.listing_id, quantity: i.quantity })),
        delivery_type: data.delivery_type,
        delivery_address: data.delivery_address,
        contact_number: data.contact_number,
        consumer_note: data.consumer_note,
      });
      clearCart();
      navigate(`/order-confirm/${order.id}`);
    } catch {
      // error shown via mutation error state
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">

        {/* Left: form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

          {/* Delivery type */}
          <div className="card p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-900">How do you want to receive your order?</p>
            <div className="grid grid-cols-2 gap-2">
              {(['collection', 'delivery'] as const).map((type) => (
                <label
                  key={type}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors',
                    deliveryType === type
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input type="radio" value={type} className="sr-only" {...register('delivery_type')} />
                  <span className="text-xl">{type === 'collection' ? '🏪' : '🚚'}</span>
                  <span className="text-sm font-medium capitalize text-gray-800">{type}</span>
                </label>
              ))}
            </div>

            {deliveryType === 'delivery' && (
              <Input
                label="Delivery address"
                placeholder="Street, area, city"
                leftIcon={<MapPin className="w-4 h-4" />}
                error={errors.delivery_address?.message}
                required
                {...register('delivery_address')}
              />
            )}
          </div>

          {/* Contact */}
          <div className="card p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-900">Contact details</p>
            <Input
              label="Your phone number"
              type="tel"
              placeholder="The seller will contact you on this number"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.contact_number?.message}
              required
              {...register('contact_number')}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Note to seller (optional)</label>
              <textarea
                rows={2}
                placeholder="Any special requests or instructions…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
                {...register('consumer_note')}
              />
            </div>
          </div>

          {error && <ErrorMessage message={(error as Error).message} />}

          <Button type="submit" fullWidth size="lg" isLoading={isPending}>
            Place order
          </Button>

          <p className="text-xs text-gray-400 text-center">
            Payment is arranged directly with the seller after placing your order.
          </p>
        </form>

        {/* Right: order summary */}
        <div className="card p-4 flex flex-col gap-3 sticky top-24">
          <p className="text-sm font-semibold text-gray-900">Order summary</p>

          {items.map((item) => (
            <div key={item.listing_id} className="flex items-start gap-2">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{item.title}</p>
                <p className="text-xs text-gray-500">×{item.quantity} · {formatCurrency(item.price * item.quantity)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.listing_id)}
                className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                aria-label="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span className="text-base font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
          </div>

          <p className="text-xs text-gray-400">
            3% platform fee applies on completed orders.
          </p>
        </div>
      </div>
    </div>
  );
}
