import { Link, useRouteError } from 'react-router-dom';
import Button from '@/components/common/Button';

export default function ErrorPage() {
  const error = useRouteError() as { statusText?: string; message?: string };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-8">
          {error?.statusText ?? error?.message ?? 'An unexpected error occurred.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.location.reload()}>
            <Button variant="outline">Reload page</Button>
          </button>
          <Link to="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
