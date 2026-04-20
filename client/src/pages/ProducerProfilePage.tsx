import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, User, Star, ChevronLeft } from 'lucide-react';
import { getPublicProfile } from '@/services/users.service';
import api from '@/services/api';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatDate';
import ListingGrid from '@/components/listings/ListingGrid';
import ReviewList from '@/components/listings/ReviewList';
import ReviewForm from '@/components/listings/ReviewForm';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { PageSpinner } from '@/components/common/Spinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { RatingDisplay } from '@/components/common/StarRating';

interface ReviewData { averageRating: number; totalReviews: number; }

export default function ProducerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ['producer-profile', id],
    queryFn: () => getPublicProfile(id!),
    enabled: !!id,
  });

  const { data: listingsData, isLoading: listingsLoading } = useListings({ limit: 20 });

  const { data: reviewData } = useQuery<ReviewData>({
    queryKey: ['producer-reviews', id],
    queryFn: async () => { const res = await api.get(`/reviews/producer/${id}`); return res.data.data; },
    enabled: !!id,
  });

  const { data: myReview, refetch: refetchMyReview } = useQuery({
    queryKey: ['my-review', id],
    queryFn: async () => { const res = await api.get(`/reviews/my/${id}`); return res.data.data.review; },
    enabled: !!id && user?.role === 'consumer',
  });

  const producerListings = listingsData?.listings.filter((l) => l.producer_id === id) ?? [];
  const isConsumer = user?.role === 'consumer';
  const isOwnProfile = user?.id === id;

  if (profileLoading) return <PageSpinner />;
  if (profileError || !profile) return <ErrorMessage message="Producer not found." />;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>

      <div className="card p-6 flex flex-col sm:flex-row gap-5 items-start">
        <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center overflow-hidden shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-9 h-9 text-primary-600" />
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <h1 className="text-xl font-bold text-gray-900">{profile.business_name ?? profile.name}</h1>
          {profile.business_name && <p className="text-sm text-gray-500">{profile.name}</p>}
          {profile.area && (
            <p className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-4 h-4 shrink-0" /> {profile.area}
            </p>
          )}
          {reviewData && reviewData.totalReviews > 0 && (
            <RatingDisplay average={reviewData.averageRating} total={reviewData.totalReviews} size="sm" />
          )}
          {profile.bio && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{profile.bio}</p>}
          <p className="text-xs text-gray-400 mt-1">Selling on FoodBridge since {formatDate(profile.created_at)}</p>
        </div>

        {isConsumer && !isOwnProfile && (
          <Button
            variant={myReview ? 'secondary' : 'primary'}
            size="sm"
            leftIcon={<Star className="w-4 h-4" />}
            onClick={() => setReviewModalOpen(true)}
            className="shrink-0"
          >
            {myReview ? 'Edit review' : 'Leave a review'}
          </Button>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {producerListings.length > 0 ? `${producerListings.length} listing${producerListings.length !== 1 ? 's' : ''}` : 'Listings'}
        </h2>
        {listingsLoading ? <PageSpinner /> : (
          <ListingGrid listings={producerListings} emptyMessage="This seller has no active listings right now." />
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews</h2>
        <ReviewList producerId={id!} />
      </div>

      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title={myReview ? 'Edit your review' : 'Leave a review'} size="sm">
        <ReviewForm
          producerId={id!}
          existingRating={myReview?.rating}
          existingComment={myReview?.comment ?? ''}
          onSuccess={() => { setReviewModalOpen(false); refetchMyReview(); }}
        />
      </Modal>
    </div>
  );
}