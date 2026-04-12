import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, User } from 'lucide-react';
import { getPublicProfile } from '@/services/users.service';
import { useListings } from '@/hooks/useListings';
import { formatDate } from '@/utils/formatDate';
import ListingGrid from '@/components/listings/ListingGrid';
import { PageSpinner } from '@/components/common/Spinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ChevronLeft } from 'lucide-react';

export default function ProducerProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ['producer-profile', id],
    queryFn: () => getPublicProfile(id!),
    enabled: !!id,
  });

  const { data: listingsData, isLoading: listingsLoading } = useListings({
    limit: 20,
  });

  // Filter listings to only this producer's
  const producerListings = listingsData?.listings.filter(
    (l) => l.producer_id === id
  ) ?? [];

  if (profileLoading) return <PageSpinner />;
  if (profileError || !profile) return <ErrorMessage message="Producer not found." />;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>

      {/* Profile header */}
      <div className="card p-6 flex flex-col sm:flex-row gap-5 items-start">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center overflow-hidden shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-9 h-9 text-primary-600" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">
            {profile.business_name ?? profile.name}
          </h1>
          {profile.business_name && (
            <p className="text-sm text-gray-500">{profile.name}</p>
          )}
          {profile.area && (
            <p className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-4 h-4 shrink-0" /> {profile.area}
            </p>
          )}
          {profile.bio && (
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{profile.bio}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Selling on FoodBridge since {formatDate(profile.created_at)}
          </p>
        </div>
      </div>

      {/* Listings */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {producerListings.length > 0
            ? `${producerListings.length} listing${producerListings.length !== 1 ? 's' : ''}`
            : 'Listings'}
        </h2>
        {listingsLoading ? (
          <PageSpinner />
        ) : (
          <ListingGrid
            listings={producerListings}
            emptyMessage="This seller has no active listings right now."
          />
        )}
      </div>
    </div>
  );
}
