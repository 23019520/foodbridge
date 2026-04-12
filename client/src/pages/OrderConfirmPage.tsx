import { Link, useParams } from 'react-router-dom';
import { useOrder } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/formatCurrency';
import { PageSpinner } from '@/components/common/Spinner';
import Button from '@/components/common/Button';
import { CheckCircle } from 'lucide-react';
export default function OrderConfirmPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrder(orderId!);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-md mx-auto text-center py-12 px-4">

      {/* Success icon */}
      <div className="flex justify-center mb-5">
        <CheckCircle className="w-16 h-16 text-primary-600" strokeWidth={1.5} />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order placed!</h1>
      <p className="text-gray-500 text-sm mb-6">
        Your order has been sent to the seller. They will confirm shortly.
      </p>

      {/* Order reference */}
      {order && (
        <div className="card p-5 text-left mb-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Reference</span>
            <span className="font-mono font-semibold text-gray-900 text-sm">{order.reference}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Seller</span>
            <span className="text-sm text-gray-900">{order.business_name ?? order.producer_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Total</span>
            <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Fulfilment</span>
            <span className="text-sm capitalize text-gray-900">{order.delivery_type}</span>
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="bg-primary-50 rounded-xl p-4 text-left mb-6">
        <p className="text-sm font-semibold text-primary-800 mb-2">What happens next?</p>
        <ol className="text-sm text-primary-700 flex flex-col gap-1.5 list-decimal list-inside">
          <li>The seller reviews your order</li>
          <li>They confirm and contact you on your number</li>
          <li>Arrange payment directly with the seller</li>
          <li>Collect or receive your order</li>
        </ol>
      </div>

      <div className="flex flex-col gap-3">
        <Link to="/dashboard/consumer">
          <Button variant="secondary" fullWidth>View my orders</Button>
        </Link>
        <Link to="/">
          <Button variant="ghost" fullWidth>Continue browsing</Button>
        </Link>
      </div>
    </div>
  );
}
