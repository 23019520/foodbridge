import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  subtext?: string;
}

export default function StatCard({ label, value, icon, subtext }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        {icon && <span className="text-primary-600">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
    </div>
  );
}
