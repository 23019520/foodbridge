import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Lock } from 'lucide-react';

const schema = z.object({
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const token = searchParams.get('token');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-700 font-medium mb-3">Invalid or expired reset link.</p>
          <Link to="/forgot-password">
            <Button variant="secondary">Request a new link</Button>
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      navigate('/login', { state: { message: 'Password updated! Please log in.' } });
    } catch (err) {
      setServerError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-800 font-bold text-xl">
            <span className="text-3xl">🌿</span> FoodBridge
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Choose a new password</h1>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {serverError && <ErrorMessage message={serverError} />}
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              leftIcon={<Lock className="w-4 h-4" />}
              hint="Min 8 characters, one uppercase, one number"
              error={errors.password?.message}
              required
              {...register('password')}
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Update password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}