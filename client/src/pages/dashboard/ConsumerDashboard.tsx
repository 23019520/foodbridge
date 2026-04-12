import { useMyOrders } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import OrderCard from '@/components/orders/OrderCard';
import StatCard from '@/components/dashboard/StatCard';
import { PageSpinner } from '@/components/common/Spinner';
import ErrorMessage, { EmptyState } from '@/components/common/ErrorMessage';
import { formatCurrency } from '@/utils/formatCurrency';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';

export default function ConsumerDashboard() {
  const { user } = useAuth();
  const { data: orders, isLoading, isError, error } = useMyOrders();

  const completedOrders = orders?.filter((o) => o.status === 'completed') ?? [];
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const activeOrders = orders?.filter(
    (o) => !['completed', 'cancelled'].includes(o.status)
  ) ?? [];

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.name}</p>
        </div>
        <Link to="/search">
          <Button variant="secondary" size="sm">Browse listings</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="Total orders"
          value={orders?.length ?? 0}
          icon={<ShoppingBag className="w-4 h-4" />}
        />
        <StatCard
          label="Completed"
          value={completedOrders.length}
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <StatCard
          label="Total spent"
          value={formatCurrency(totalSpent)}
          subtext="On completed orders"
        />
      </div>

      {/* Active orders */}
      {activeOrders.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Active orders
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} viewAs="consumer" />
            ))}
          </div>
        </div>
      )}

      {/* All orders */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Order history
        </h2>
        {isLoading && <PageSpinner />}
        {isError && <ErrorMessage message={(error as Error).message} />}
        {orders && orders.length === 0 && (
          <EmptyState
            title="No orders yet"
            description="Start browsing local food and place your first order."
            action={<Link to="/search"><Button size="sm">Browse listings</Button></Link>}
          />
        )}
        {orders && orders.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} viewAs="consumer" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
