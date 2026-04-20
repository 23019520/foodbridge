import { query } from '../config/database';

export interface ReviewRow {
  id: string;
  consumer_id: string;
  producer_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  created_at: Date;
  // Joined
  consumer_name?: string;
  consumer_avatar?: string;
}

export const createOrUpdateReview = async (data: {
  consumer_id: string;
  producer_id: string;
  order_id?: string;
  rating: number;
  comment?: string;
}): Promise<ReviewRow> => {
  const result = await query(
    `INSERT INTO reviews (consumer_id, producer_id, order_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (consumer_id, producer_id)
     DO UPDATE SET rating = $4, comment = $5, updated_at = NOW()
     RETURNING *`,
    [data.consumer_id, data.producer_id, data.order_id ?? null, data.rating, data.comment ?? null]
  );
  return result.rows[0];
};

export const getReviewsByProducer = async (
  producerId: string
): Promise<{ reviews: ReviewRow[]; averageRating: number; totalReviews: number }> => {
  const result = await query(
    `SELECT r.*, u.name as consumer_name, u.avatar_url as consumer_avatar
     FROM reviews r
     JOIN users u ON r.consumer_id = u.id
     WHERE r.producer_id = $1
     ORDER BY r.created_at DESC`,
    [producerId]
  );

  const reviews = result.rows;
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? parseFloat(
          (reviews.reduce((sum: number, r: ReviewRow) => sum + r.rating, 0) / totalReviews).toFixed(1)
        )
      : 0;

  return { reviews, averageRating, totalReviews };
};

export const getExistingReview = async (
  consumerId: string,
  producerId: string
): Promise<ReviewRow | null> => {
  const result = await query(
    `SELECT * FROM reviews WHERE consumer_id = $1 AND producer_id = $2`,
    [consumerId, producerId]
  );
  return result.rows[0] ?? null;
};