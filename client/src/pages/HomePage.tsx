import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { ListingCategory } from '@/types/listing.types';
import ListingGrid from '@/components/listings/ListingGrid';
import CategoryFilter from '@/components/listings/CategoryFilter';
import { PageSpinner } from '@/components/common/Spinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | undefined>();
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useListings({
    category: selectedCategory,
    limit: 20,
  });

  return (
    <div className="flex flex-col gap-6">

      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white px-6 py-10 md:py-14 text-center">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">
          Fresh food from your community
        </h1>
        <p className="text-primary-100 text-sm md:text-base max-w-md mx-auto mb-6">
          Discover home-cooked meals, fresh vegetables, baked goods and more — sold by people right in your area.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/search">
            <Button variant="secondary" size="lg" leftIcon={<Search className="w-4 h-4" />}>
              Search listings
            </Button>
          </Link>
          {!user && (
            <Link to="/register">
              <Button
  size="lg"
  variant="outline"
  className="!bg-white !text-primary-800 hover:!bg-primary-50 border-white font-semibold"
>
  Sell your food
</Button>
            </Link>
          )}
        </div>
      </section>

      {/* How it works — shown to guests only */}
      {!user && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🌿', title: 'Producers list', desc: 'Local farmers and home cooks post their available products for free.' },
            { icon: '🔍', title: 'Consumers browse', desc: 'Anyone in the community can discover and order fresh local food.' },
            { icon: '🤝', title: 'Community grows', desc: 'Every sale supports a local entrepreneur in your neighbourhood.' },
          ].map((step) => (
            <div key={step.title} className="card p-5 text-center">
              <p className="text-3xl mb-2">{step.icon}</p>
              <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
              <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
            </div>
          ))}
        </section>
      )}

      {/* Listings section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {selectedCategory ? selectedCategory : 'All listings'}
          </h2>
          <Link to="/search" className="text-sm text-primary-700 hover:underline">
            See all →
          </Link>
        </div>

        {/* Category pills */}
        <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />

        {isLoading && <PageSpinner />}
        {isError && <ErrorMessage message={(error as Error).message} />}
        {data && <ListingGrid listings={data.listings} />}
      </section>
    </div>
  );
}
