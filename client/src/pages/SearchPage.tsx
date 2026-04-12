import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useDebounce } from '@/hooks/useDebounce';
import { ListingCategory, ListingFilters } from '@/types/listing.types';
import { CATEGORIES, SORT_OPTIONS } from '@/utils/constants';
import ListingGrid from '@/components/listings/ListingGrid';
import CategoryFilter from '@/components/listings/CategoryFilter';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { PageSpinner } from '@/components/common/Spinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { clsx } from 'clsx';

export default function SearchPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ListingCategory | undefined>();
  const [sortBy, setSortBy] = useState<ListingFilters['sortBy']>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const filters: ListingFilters = {
    search: debouncedSearch || undefined,
    category,
    sortBy,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    limit: 40,
  };

  const { data, isLoading, isError, error } = useListings(filters);

  const hasActiveFilters = category || minPrice || maxPrice || sortBy !== 'newest';

  const clearFilters = () => {
    setCategory(undefined);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse listings</h1>
        {data && (
          <p className="text-sm text-gray-500">
            {data.meta.total} listing{data.meta.total !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Search bar */}
      <Input
        placeholder="Search for vegetables, meals, baked goods…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        rightIcon={
          search ? (
            <button onClick={() => setSearch('')} aria-label="Clear search">
              <X className="w-4 h-4 cursor-pointer" />
            </button>
          ) : null
        }
      />

      {/* Category filter pills */}
      <CategoryFilter selected={category} onChange={setCategory} />

      {/* Filter toggle + sort row */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters {hasActiveFilters && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
        </Button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as ListingFilters['sortBy'])}
          className="ml-auto text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-600"
          aria-label="Sort listings"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Expandable filter panel */}
      {showFilters && (
        <div className="card p-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min price (R)"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              label="Max price (R)"
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:underline text-left"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {isLoading && <PageSpinner />}
      {isError && <ErrorMessage message={(error as Error).message} />}
      {data && (
        <>
          <ListingGrid
            listings={data.listings}
            emptyMessage={
              debouncedSearch
                ? `No listings found for "${debouncedSearch}". Try a different search term.`
                : 'No listings match your filters.'
            }
          />

          {/* Pagination */}
          {data.meta.totalPages > 1 && (
            <p className="text-center text-sm text-gray-500 py-4">
              Showing page 1 of {data.meta.totalPages}. More pagination coming soon.
            </p>
          )}
        </>
      )}
    </div>
  );
}
