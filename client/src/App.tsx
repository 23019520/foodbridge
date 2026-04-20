import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

import PageWrapper from '@/components/layout/PageWrapper';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ListingDetailPage from '@/pages/ListingDetailPage';
import SearchPage from '@/pages/SearchPage';
import ProducerProfilePage from '@/pages/ProducerProfilePage';

import CheckoutPage from '@/pages/CheckoutPage';
import OrderConfirmPage from '@/pages/OrderConfirmPage';
import EditProfilePage from '@/pages/EditProfilePage';
import ProducerDashboard from '@/pages/dashboard/ProducerDashboard';
import ConsumerDashboard from '@/pages/dashboard/ConsumerDashboard';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';

import NotFoundPage from '@/pages/errors/NotFoundPage';
import ProtectedRoute from '@/components/common/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<PageWrapper />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/listings/:id" element={<ListingDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/producers/:id" element={<ProducerProfilePage />} />
            </Route>

            {/* Auth routes — no navbar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Consumer protected */}
            <Route element={<ProtectedRoute allowedRoles={['consumer']} />}>
              <Route element={<PageWrapper />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirm/:orderId" element={<OrderConfirmPage />} />
                <Route path="/dashboard/consumer" element={<ConsumerDashboard />} />
              </Route>
            </Route>

            {/* Producer protected */}
            <Route element={<ProtectedRoute allowedRoles={['producer']} />}>
              <Route element={<PageWrapper />}>
                <Route path="/dashboard/producer" element={<ProducerDashboard />} />
              </Route>
            </Route>

            {/* Admin protected */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<PageWrapper />}>
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
              </Route>
            </Route>

            {/* All authenticated users */}
            <Route element={<ProtectedRoute allowedRoles={['consumer', 'producer', 'admin']} />}>
              <Route element={<PageWrapper />}>
                <Route path="/profile/edit" element={<EditProfilePage />} />
              </Route>
            </Route>

            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;