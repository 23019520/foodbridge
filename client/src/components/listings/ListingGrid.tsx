import { Listing } from '@/types/listing.types';
import ListingCard from './ListingCard';
import { EmptyState } from '@/components/common/ErrorMessage';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';

interface ListingGridProps {
  listings: Listing[];
  emptyMessage?: string;
}

export default function ListingGrid({ listings, emptyMessage }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        title="No listings found"
        description={emptyMessage ?? 'Try adjusting your filters or check back later.'}
        action={
          <Button variant="secondary" size="sm">
            <Link to="/search">Browse all listings</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
