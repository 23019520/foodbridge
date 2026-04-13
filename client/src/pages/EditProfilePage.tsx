import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/services/users.service';
import { uploadImage } from '@/services/upload.service';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { User, Phone, MapPin, Briefcase, Camera } from 'lucide-react';
import { useRef } from 'react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  area: z.string().optional(),
  business_name: z.string().optional(),
  bio: z.string().max(300, 'Max 300 characters').optional(),
});
type FormData = z.infer<typeof schema>;

export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      area: user?.area ?? '',
      business_name: user?.business_name ?? '',
      bio: user?.bio ?? '',
    },
  });

  const bioValue = watch('bio') ?? '';

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const result = await uploadImage(file);
      setAvatarUrl(result.url);
    } catch {
      setServerError('Failed to upload photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await updateProfile({ ...data, avatar_url: avatarUrl || undefined });
      const dashPath = user?.role === 'producer' ? '/dashboard/producer' : '/dashboard/consumer';
      navigate(dashPath);
    } catch (err) {
      setServerError((err as Error).message);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {serverError && <ErrorMessage message={serverError} />}

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full bg-primary-100 overflow-hidden shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-400" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full"
              aria-label="Change profile photo"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="text-sm text-primary-700 font-medium hover:underline"
            >
              {uploadingAvatar ? 'Uploading…' : 'Change photo'}
            </button>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP · Max 5MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="sr-only"
            onChange={handleAvatarChange}
          />
        </div>

        <Input
          label="Full name"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          required
          {...register('name')}
        />
        <Input
          label="Phone number"
          type="tel"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Area / neighbourhood"
          placeholder="e.g. Soshanguve, Mamelodi"
          leftIcon={<MapPin className="w-4 h-4" />}
          error={errors.area?.message}
          {...register('area')}
        />

        {user?.role === 'producer' && (
          <>
            <Input
              label="Business / stall name"
              leftIcon={<Briefcase className="w-4 h-4" />}
              error={errors.business_name?.message}
              {...register('business_name')}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <textarea
                rows={3}
                placeholder="Tell customers about yourself…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
                {...register('bio')}
              />
              <p className="text-xs text-gray-400 text-right">{bioValue.length}/300</p>
              {errors.bio && <p className="text-xs text-red-600">{errors.bio.message}</p>}
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}