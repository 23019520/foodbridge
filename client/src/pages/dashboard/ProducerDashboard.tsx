import { useState } from 'react';
import { useMyListings, useDeleteListing } from '@/hooks/useListings';
import { useReceivedOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { LISTING_STATUS_COLORS, LISTING_STATUS_LABELS } from '@/utils/constants';
import StatCard from '@/components/dashboard/StatCard';
import OrderCard from '@/components/orders/OrderCard';
import Button from '@/components/common/Button';
import { PageSpinner } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/ErrorMessage';
import { Plus, Pencil, Trash2, Package, ShoppingBag, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';

type Tab = 'listings' | 'orders';

export default function ProducerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('listings');

  const { data: listings, isLoading: listingsLoading } = useMyListings();
  const { data: orders, isLoading: ordersLoading } = useReceivedOrders();
  const { mutate: deleteListing, isPending: deleting } = useDeleteListing();
  const { mutate: updateStatus } = useUpdateOrderStatus();

  const pendingOrders = orders?.filter((o) => o.status === 'pending') ?? [];
  const activeListings = listings?.filter((l) => l.status === 'available') ?? [];
  const totalSales = orders
    ?.filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total_amount, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Seller dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {user?.business_name ?? user?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="Active listings"
          value={activeListings.length}
          icon={<Package className="w-4 h-4" />}
        />
        <StatCard
          label="Pending orders"
          value={pendingOrders.length}
          icon={<ShoppingBag className="w-4 h-4" />}
          subtext={pendingOrders.length > 0 ? 'Need your attention' : 'All clear'}
        />
        <StatCard
          label="Total sales"
          value={formatCurrency(totalSales)}
          icon={<DollarSign className="w-4 h-4" />}
          subtext="Completed orders"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['listings', 'orders'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium capitalize transition-colors',
              tab === t
                ? 'text-primary-700 border-b-2 border-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t}
            {t === 'orders' && pendingOrders.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Listings tab */}
      {tab === 'listings' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => alert('Listing form coming soon — implement with the ListingForm component')}
            >
              Add listing
            </Button>
          </div>

          {listingsLoading && <PageSpinner />}
          {listings && listings.length === 0 && (
            <EmptyState
              title="No listings yet"
              description="Add your first product to start selling."
            />
          )}
          {listings && listings.length > 0 && (
            <div className="flex flex-col gap-2">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="card p-4 flex items-center gap-3"
                >
                  {/* Image */}
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {listing.images[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">🛒</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{listing.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-primary-700 font-medium">{formatCurrency(listing.price)}</span>
                      <span className={clsx('badge text-xs', LISTING_STATUS_COLORS[listing.status])}>
                        {LISTING_STATUS_LABELS[listing.status]}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      aria-label="Edit listing"
                      onClick={() => alert(`Edit listing ${listing.id} — implement with the ListingForm component`)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Delete listing"
                      disabled={deleting}
                      onClick={() => {
                        if (window.confirm('Remove this listing?')) deleteListing(listing.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="flex flex-col gap-4">
          {ordersLoading && <PageSpinner />}
          {orders && orders.length === 0 && (
            <EmptyState
              title="No orders yet"
              description="Orders will appear here once customers place them."
            />
          )}
          {orders && orders.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {orders.map((order) => (
                <div key={order.id} className="flex flex-col gap-2">
                  <OrderCard order={order} viewAs="producer" />

                  {/* Status action buttons */}
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        fullWidth
                        onClick={() => updateStatus({ id: order.id, status: 'confirmed' })}
                      >
                        Confirm order
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        fullWidth
                        onClick={() => updateStatus({ id: order.id, status: 'cancelled' })}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {order.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      fullWidth
                      onClick={() => updateStatus({ id: order.id, status: 'ready' })}
                    >
                      Mark as ready
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button
                      size="sm"
                      fullWidth
                      onClick={() => updateStatus({ id: order.id, status: 'completed' })}
                    >
                      Mark as completed
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
