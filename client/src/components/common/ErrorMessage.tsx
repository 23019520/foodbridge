import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  className?: string;
}

export default function ErrorMessage({
  message = 'Something went wrong. Please try again.',
  className = '',
}: ErrorMessageProps) {
  return (
    <div className={`flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 ${className}`}>
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** Empty state with optional action */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <p className="text-2xl mb-2">🌿</p>
      <p className="font-semibold text-gray-800">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
