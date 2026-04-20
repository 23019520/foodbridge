import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import StarRating from '@/components/common/StarRating';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const schema = z.object({
  comment: z.string().max(500, 'Max 500 characters').optional(),
});
type FormData = z.infer<typeof schema>;

interface ReviewFormProps {
  producerId: string;
  existingRating?: number;
  existingComment?: string;
  onSuccess: () => void;
}

export default function ReviewForm({
  producerId,
  existingRating = 0,
  existingComment = '',
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingRating);
  const [ratingError, setRatingError] = useState('');
  const [serverError, setServerError] = useState('');
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { comment: existingComment },
  });

  const commentValue = watch('comment') ?? '';

  const onSubmit = async (data: FormData) => {
    if (rating === 0) {
      setRatingError('Please select a star rating.');
      return;
    }
    setRatingError('');
    setServerError('');

    try {
      await api.post('/reviews', { producer_id: producerId, rating, comment: data.comment });
      queryClient.invalidateQueries({ queryKey: ['producer-reviews', producerId] });
      onSuccess();
    } catch (err) {
      setServerError((err as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {serverError && <ErrorMessage message={serverError} />}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Your rating</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {ratingError && <p className="text-xs text-red-600">{ratingError}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Comment <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Share your experience with this seller…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
          {...register('comment')}
        />
        <p className="text-xs text-gray-400 text-right">{commentValue.length}/500</p>
        {errors.comment && <p className="text-xs text-red-600">{errors.comment.message}</p>}
      </div>

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        {existingRating ? 'Update review' : 'Submit review'}
      </Button>
    </form>
  );
}