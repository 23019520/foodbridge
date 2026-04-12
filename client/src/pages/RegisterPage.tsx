import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Mail, Lock, User, Phone, MapPin, Briefcase } from 'lucide-react';
import { clsx } from 'clsx';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  role: z.enum(['consumer', 'producer']),
  phone: z.string().optional(),
  area: z.string().optional(),
  business_name: z.string().optional(),
  bio: z.string().max(300, 'Max 300 characters').optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'consumer' },
  });

  const role = watch('role');

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await registerUser(data);
      navigate(role === 'producer' ? '/dashboard/producer' : '/');
    } catch (err) {
      setServerError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-800 font-bold text-xl">
            <span className="text-3xl">🌿</span> FoodBridge
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Free to join. Always.</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {serverError && <ErrorMessage message={serverError} />}

            {/* Role toggle */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">I want to…</p>
              <div className="grid grid-cols-2 gap-2">
                {(['consumer', 'producer'] as const).map((r) => (
                  <label
                    key={r}
                    className={clsx(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-colors text-center',
                      role === r
                        ? 'border-primary-600 bg-primary-50 text-primary-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    )}
                  >
                    <input type="radio" value={r} className="sr-only" {...register('role')} />
                    <span className="text-2xl">{r === 'consumer' ? '🛒' : '🌿'}</span>
                    <span className="text-sm font-medium">
                      {r === 'consumer' ? 'Buy food' : 'Sell food'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {r === 'consumer' ? 'Browse & order' : 'List my products'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Common fields */}
            <Input
              label="Full name"
              autoComplete="name"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              required
              {...register('name')}
            />
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              required
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              leftIcon={<Lock className="w-4 h-4" />}
              hint="Min 8 characters, one uppercase, one number"
              error={errors.password?.message}
              required
              {...register('password')}
            />
            <Input
              label="Phone number"
              type="tel"
              autoComplete="tel"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Your area / neighbourhood"
              placeholder="e.g. Soshanguve, Mamelodi"
              leftIcon={<MapPin className="w-4 h-4" />}
              error={errors.area?.message}
              {...register('area')}
            />

            {/* Producer-only fields */}
            {role === 'producer' && (
              <>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Seller details
                  </p>
                  <div className="flex flex-col gap-4">
                    <Input
                      label="Business / stall name"
                      placeholder="e.g. Mama Thabo's Kitchen"
                      leftIcon={<Briefcase className="w-4 h-4" />}
                      error={errors.business_name?.message}
                      {...register('business_name')}
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Short bio</label>
                      <textarea
                        rows={3}
                        placeholder="Tell customers a little about yourself and what you sell…"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
                        {...register('bio')}
                      />
                      {errors.bio && <p className="text-xs text-red-600">{errors.bio.message}</p>}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button type="submit" fullWidth isLoading={isSubmitting} className="mt-2">
              Create account
            </Button>

            <p className="text-xs text-gray-400 text-center">
              By signing up you agree to our terms of service.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-700 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
