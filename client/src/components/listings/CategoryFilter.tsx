import { CATEGORIES, CATEGORY_ICONS } from '@/utils/constants';
import { ListingCategory } from '@/types/listing.types';
import { clsx } from 'clsx';

interface CategoryFilterProps {
  selected?: ListingCategory;
  onChange: (category: ListingCategory | undefined) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {/* "All" pill */}
      <button
        onClick={() => onChange(undefined)}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap',
          'border transition-colors shrink-0',
          !selected
            ? 'bg-primary-700 text-white border-primary-700'
            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'
        )}
      >
        All
      </button>

      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat === selected ? undefined : cat)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap',
            'border transition-colors shrink-0',
            selected === cat
              ? 'bg-primary-700 text-white border-primary-700'
              : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'
          )}
        >
          <span>{CATEGORY_ICONS[cat]}</span>
          {cat}
        </button>
      ))}
    </div>
  );
}
