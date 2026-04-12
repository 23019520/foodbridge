import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'orange' | 'gray';
  size?: 'sm' | 'md';
}

const variants = {
  green:  'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red:    'bg-red-100 text-red-800',
  blue:   'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
  gray:   'bg-gray-100 text-gray-600',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({ children, variant = 'gray', size = 'md' }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center rounded-full font-medium', variants[variant], sizes[size])}>
      {children}
    </span>
  );
}
