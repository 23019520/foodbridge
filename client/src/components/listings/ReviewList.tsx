import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import StarRating, { RatingDisplay } from '@/components/common/StarRating';
import { timeAgo } from '@/utils/formatDate';
import { User } from 'lucide-react';
import { PageSpinner } from '@/components/common/Spinner';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  consumer_name: string;
  consumer_avatar: string | null;
}

interface ReviewData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export default function ReviewList({ producerId }: { producerId: string }) {
  const { data, isLoading } = useQuery<ReviewData>({
    queryKey: ['producer-reviews', producerId],
    queryFn: async () => {
      const res = await api.get(`/reviews/producer/${producerId}`);
      return res.data.data;
    },
  });

  if (isLoading) return <PageSpinner />;
  if (!data || data.totalReviews === 0) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">
        No reviews yet — be the first to leave one.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">{data.averageRating.toFixed(1)}</p>
          <StarRating value={Math.round(data.averageRating)} readonly size="sm" />
          <p className="text-xs text-gray-500 mt-1">{data.totalReviews} review{data.totalReviews !== 1 ? 's' : ''}</p>
        </div>
        {/* Rating breakdown bars */}
        <div className="flex-1 flex flex-col gap-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = data.reviews.filter((r) => r.rating === star).length;
            const pct = data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-3">{star}</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual reviews */}
      {data.reviews.map((review) => (
        <div key={review.id} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
            {review.consumer_avatar ? (
              <img src={review.consumer_avatar} alt={review.consumer_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-primary-500" />
            )}
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-900">{review.consumer_name}</p>
              <span className="text-xs text-gray-400">{timeAgo(review.created_at)}</span>
            </div>
            <StarRating value={review.rating} readonly size="sm" />
            {review.comment && (
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}