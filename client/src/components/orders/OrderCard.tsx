import { Order } from '@/types/order.types';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/utils/constants';
import { clsx } from 'clsx';

interface OrderCardProps {
  order: Order;
  viewAs: 'consumer' | 'producer';
  onStatusChange?: (orderId: string) => void;
}

export default function OrderCard({ order, viewAs }: OrderCardProps) {
  const statusColor = ORDER_STATUS_COLORS[order.status];

  return (
    <div className="card p-4 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-500 font-mono">{order.reference}</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            {viewAs === 'consumer'
              ? (order.business_name ?? order.producer_name)
              : order.consumer_name}
          </p>
        </div>
        <span className={clsx('badge shrink-0', statusColor)}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Items preview */}
      {order.items && order.items.length > 0 && (
        <div className="flex flex-col gap-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-8 h-8 rounded object-cover shrink-0" />
              )}
              <span className="truncate">{item.title}</span>
              <span className="ml-auto shrink-0 text-gray-500">×{item.quantity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-sm">
        <span className="text-gray-500">{formatDate(order.created_at)}</span>
        <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
      </div>

      {/* Delivery info */}
      <div className="text-xs text-gray-500 capitalize">
        {order.delivery_type === 'delivery' ? `🚚 Delivery to ${order.delivery_address ?? '—'}` : '🏪 Collection'}
      </div>
    </div>
  );
}
