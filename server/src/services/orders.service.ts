import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { createOrder, createOrderItems } from '../models/order.model';
import { createCommission } from '../models/commission.model';
import { CreateOrderInput } from '../schemas/order.schemas';

/**
 * Places a new order:
 * 1. Fetches current prices from the database (never trust client-sent prices)
 * 2. Calculates the true total server-side
 * 3. Creates the order and order_items (with price snapshot)
 */
export const placeOrder = async (consumerId: string, data: CreateOrderInput) => {
  // Fetch current listing details to snapshot price/title and verify they exist
  const listingIds = data.items.map((i) => i.listing_id);
  const placeholders = listingIds.map((_, i) => `$${i + 1}`).join(', ');
  const listingsResult = await query(
    `SELECT id, title, price, images, status FROM listings
     WHERE id IN (${placeholders}) AND is_deleted = false`,
    listingIds
  );

  if (listingsResult.rows.length !== listingIds.length) {
    throw new AppError('One or more items in your order are no longer available.', 400);
  }

  const listingMap = new Map(listingsResult.rows.map((l) => [l.id, l]));

  // Check all items are still available
  for (const item of data.items) {
    const listing = listingMap.get(item.listing_id);
    if (listing?.status !== 'available') {
      throw new AppError(`"${listing?.title}" is currently not available.`, 400);
    }
  }

  // Calculate total from actual DB prices (never trust client)
  let totalAmount = 0;
  const orderItems = data.items.map((item) => {
    const listing = listingMap.get(item.listing_id)!;
    totalAmount += listing.price * item.quantity;
    return {
      listing_id: item.listing_id,
      title: listing.title,
      price: listing.price,
      quantity: item.quantity,
      image_url: listing.images?.[0] ?? null,
    };
  });

  // Create the order record
  const order = await createOrder({
    consumer_id: consumerId,
    producer_id: data.producer_id,
    total_amount: parseFloat(totalAmount.toFixed(2)),
    delivery_type: data.delivery_type,
    delivery_address: data.delivery_address,
    consumer_note: data.consumer_note,
    contact_number: data.contact_number,
  });

  // Create all order item snapshots
  await createOrderItems(
    orderItems.map((item) => ({ order_id: order.id, ...item }))
  );

  return order;
};

/**
 * Marks an order as completed and automatically creates the commission record.
 */
export const completeOrder = async (orderId: string, producerId: string) => {
  const orderResult = await query(
    `UPDATE orders SET status = 'completed', updated_at = NOW()
     WHERE id = $1 AND producer_id = $2 AND status != 'cancelled'
     RETURNING *`,
    [orderId, producerId]
  );

  const order = orderResult.rows[0];
  if (!order) throw new AppError('Order not found or cannot be completed.', 404);

  // Auto-create commission record on completion
  await createCommission(order.id, order.producer_id, order.total_amount);

  // Increment order_count on all listings in this order
  await query(
    `UPDATE listings SET order_count = order_count + 1
     WHERE id IN (SELECT listing_id FROM order_items WHERE order_id = $1)`,
    [orderId]
  );

  return order;
};
