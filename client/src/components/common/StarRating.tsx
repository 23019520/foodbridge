import { useState } from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div
      className={clsx('flex gap-0.5', !readonly && 'cursor-pointer')}
      onMouseLeave={() => !readonly && setHovered(0)}
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={`Rating: ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          className={clsx(
            'transition-colors',
            readonly ? 'cursor-default' : 'hover:scale-110 transition-transform'
          )}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <Star
            className={clsx(
              sizes[size],
              star <= active
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        </button>
      ))}
    </div>
  );
}

/** Compact display-only version with number */
export function RatingDisplay({
  average,
  total,
  size = 'sm',
}: {
  average: number;
  total: number;
  size?: 'sm' | 'md';
}) {
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-1">
      <StarRating value={Math.round(average)} readonly size={size} />
      <span className="text-xs text-gray-500">
        {average.toFixed(1)} ({total})
      </span>
    </div>
  );
}