import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Mail, CheckCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
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
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="w-12 h-12 text-primary-600" strokeWidth={1.5} />
              <p className="font-semibold text-gray-900">Check your email</p>
              <p className="text-sm text-gray-500">
                If an account exists for that email, a reset link has been sent. Check your spam folder too.
              </p>
              <Link to="/login" className="mt-2">
                <Button variant="secondary" size="sm">Back to login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              {serverError && <ErrorMessage message={serverError} />}
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                required
                {...register('email')}
              />
              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Send reset link
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Remembered it?{' '}
          <Link to="/login" className="text-primary-700 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}