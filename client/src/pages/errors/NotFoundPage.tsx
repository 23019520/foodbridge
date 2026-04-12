import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-6xl mb-4">🌿</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-lg font-semibold text-gray-700 mb-1">Page not found</p>
        <p className="text-sm text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg">Go to homepage</Button>
        </Link>
      </div>
    </div>
  );
}
