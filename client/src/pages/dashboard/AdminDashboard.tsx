import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import StatCard from '@/components/dashboard/StatCard';
import { PageSpinner } from '@/components/common/Spinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { Users, Package, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';
import Button from '@/components/common/Button';
import { clsx } from 'clsx';

interface PlatformStats {
  totalUsers: number;
  totalListings: number;
  totalCompletedOrders: number;
  grossMerchandiseValue: number;
  pendingCommissions: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const useAdminStats = () =>
  useQuery<PlatformStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data;
    },
  });

const useAdminUsers = () =>
  useQuery<{ users: AdminUser[] }>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users?limit=20');
      return res.data.data;
    },
  });

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useAdminStats();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!window.confirm(`${currentStatus ? 'Deactivate' : 'Activate'} this user?`)) return;
    await api.patch(`/admin/users/${userId}/status`, { is_active: !currentStatus });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform overview</p>
      </div>

      {/* Stats */}
      {statsLoading && <PageSpinner />}
      {statsError && <ErrorMessage message="Could not load platform stats." />}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Total users" value={stats.totalUsers} icon={<Users className="w-4 h-4" />} />
          <StatCard label="Listings" value={stats.totalListings} icon={<Package className="w-4 h-4" />} />
          <StatCard label="Completed orders" value={stats.totalCompletedOrders} icon={<ShoppingBag className="w-4 h-4" />} />
          <StatCard label="Gross sales" value={formatCurrency(stats.grossMerchandiseValue)} icon={<TrendingUp className="w-4 h-4" />} />
          <StatCard
            label="Commission owed"
            value={formatCurrency(stats.pendingCommissions)}
            icon={<DollarSign className="w-4 h-4" />}
            subtext="Pending collection"
          />
        </div>
      )}

      {/* Users table */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Recent users</h2>
        {usersLoading && <PageSpinner />}
        {usersData && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {usersData.users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'badge',
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'producer' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-600'
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('badge', u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant={u.is_active ? 'danger' : 'secondary'}
                          onClick={() => toggleUserStatus(u.id, u.is_active)}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
