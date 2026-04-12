import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, ImagePlus, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Listing, CreateListingInput, ListingCategory } from '@/types/listing.types';
import { CATEGORIES } from '@/utils/constants';
import { uploadImage } from '@/services/upload.service';
import { useCreateListing, useUpdateListing } from '@/hooks/useListings';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().max(1000, 'Max 1000 characters').optional(),
  price: z.coerce
    .number({ invalid_type_error: 'Enter a valid price' })
    .positive('Price must be greater than 0'),
  category: z.enum(
    CATEGORIES as [ListingCategory, ...ListingCategory[]],
    { errorMap: () => ({ message: 'Please select a category' }) }
  ),
  quantity: z.coerce
    .number({ invalid_type_error: 'Enter a valid quantity' })
    .int()
    .positive('Quantity must be at least 1')
    .default(1),
  location: z.string().max(100).optional(),
  status: z.enum(['available', 'sold_out', 'seasonal']).default('available'),
});

type FormData = z.infer<typeof schema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ListingFormProps {
  /** Pass an existing listing to enter edit mode; omit for create mode */
  listing?: Listing;
  onSuccess: () => void;
  onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListingForm({ listing, onSuccess, onCancel }: ListingFormProps) {
  const isEditMode = !!listing;

  // Images are managed separately from RHF because they involve async uploads
  const [images, setImages] = useState<string[]>(listing?.images ?? []);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [serverError, setServerError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createListing } = useCreateListing();
  const { mutateAsync: updateListing } = useUpdateListing();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: listing?.title ?? '',
      description: listing?.description ?? '',
      price: listing?.price ?? undefined,
      category: listing?.category ?? undefined,
      quantity: listing?.quantity ?? 1,
      location: listing?.location ?? '',
      status: listing?.status === 'inactive' ? 'available' : (listing?.status ?? 'available'),
    },
  });

  const descriptionValue = watch('description') ?? '';

  // ─── Image upload handler ──────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = 5 - images.length;
    if (remaining <= 0) {
      setUploadError('Maximum 5 images per listing.');
      return;
    }

    const toUpload = files.slice(0, remaining);
    setUploadError('');
    setUploadingCount(toUpload.length);

    const results = await Promise.allSettled(toUpload.map((f) => uploadImage(f)));

    const uploaded: string[] = [];
    const failed: string[] = [];

    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        uploaded.push(result.value.url);
      } else {
        failed.push(toUpload[i].name);
      }
    });

    setImages((prev) => [...prev, ...uploaded]);
    setUploadingCount(0);

    if (failed.length) {
      setUploadError(`Failed to upload: ${failed.join(', ')}. Try again.`);
    }

    // Reset the input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Form submit ──────────────────────────────────────────────────────────

  const onSubmit = async (data: FormData) => {
    setServerError('');

    const payload: CreateListingInput = {
      title: data.title,
      description: data.description || undefined,
      price: data.price,
      category: data.category,
      quantity: data.quantity,
      location: data.location || undefined,
      status: data.status,
      images,
    };

    try {
      if (isEditMode) {
        await updateListing({ id: listing.id, data: payload });
      } else {
        await createListing(payload);
      }
      onSuccess();
    } catch (err) {
      setServerError((err as Error).message);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

      {serverError && <ErrorMessage message={serverError} />}

      {/* Title */}
      <Input
        label="Product name"
        placeholder="e.g. Fresh spinach bundle, Homemade vetkoek, Mango chutney"
        error={errors.title?.message}
        required
        {...register('title')}
      />

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Description
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Describe your product — ingredients, how it's made, serving size, anything customers should know…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none transition-colors"
          {...register('description')}
        />
        <p className="text-xs text-gray-400 text-right">{descriptionValue.length}/1000</p>
        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </div>

      {/* Price + Quantity row */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price (R)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.price?.message}
          required
          {...register('price')}
        />
        <Input
          label="Quantity available"
          type="number"
          min="1"
          placeholder="1"
          error={errors.quantity?.message}
          required
          {...register('quantity')}
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          className={clsx(
            'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors',
            errors.category ? 'border-red-400 bg-red-50' : 'border-gray-300'
          )}
          {...register('category')}
        >
          <option value="">Select a category…</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
      </div>

      {/* Location */}
      <Input
        label="Location / pickup area"
        placeholder="e.g. Soshanguve Block X, Mamelodi East"
        hint="Where customers can collect or where you deliver from"
        error={errors.location?.message}
        {...register('location')}
      />

      {/* Status */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Availability</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'available', label: 'Available', color: 'green' },
            { value: 'sold_out', label: 'Sold out', color: 'red' },
            { value: 'seasonal', label: 'Seasonal', color: 'orange' },
          ] as const).map(({ value, label, color }) => {
            const checked = watch('status') === value;
            return (
              <label
                key={value}
                className={clsx(
                  'flex items-center justify-center gap-1.5 p-2.5 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors text-center',
                  checked
                    ? color === 'green'
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : color === 'red'
                      ? 'border-red-400 bg-red-50 text-red-800'
                      : 'border-orange-400 bg-orange-50 text-orange-800'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                <input type="radio" value={value} className="sr-only" {...register('status')} />
                {label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Image upload */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Product photos
          <span className="text-gray-400 font-normal ml-1">({images.length}/5)</span>
        </label>

        {/* Image preview grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((url, i) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                <img src={url} alt={`Product image ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
              </div>
            ))}

            {/* Upload more slot */}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCount > 0}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                {uploadingCount > 0 ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ImagePlus className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Upload drop zone — shown when no images yet */}
        {images.length === 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingCount > 0}
            className={clsx(
              'w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-2 transition-colors',
              uploadingCount > 0
                ? 'border-primary-300 bg-primary-50 cursor-wait'
                : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50 cursor-pointer'
            )}
          >
            {uploadingCount > 0 ? (
              <>
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                <p className="text-sm text-primary-600 font-medium">
                  Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}…
                </p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Click to upload photos</p>
                <p className="text-xs text-gray-400">JPG, PNG or WebP · Max 5MB each · Up to 5 photos</p>
              </>
            )}
          </button>
        )}

        {/* Uploading indicator when images already exist */}
        {images.length > 0 && uploadingCount > 0 && (
          <p className="text-sm text-primary-600 flex items-center gap-1.5">
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}…
          </p>
        )}

        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Upload product images"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={onCancel}
          disabled={isSubmitting || uploadingCount > 0}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          disabled={uploadingCount > 0}
        >
          {uploadingCount > 0
            ? 'Waiting for upload…'
            : isEditMode
            ? 'Save changes'
            : 'Create listing'}
        </Button>
      </div>
    </form>
  );
}