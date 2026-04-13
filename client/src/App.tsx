import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import EditProfilePage from '@/pages/EditProfilePage';

// Layout
import PageWrapper from '@/components/layout/PageWrapper';

// Public pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ListingDetailPage from '@/pages/ListingDetailPage';
import SearchPage from '@/pages/SearchPage';
import ProducerProfilePage from '@/pages/ProducerProfilePage';

// Protected pages
import CheckoutPage from '@/pages/CheckoutPage';
import OrderConfirmPage from '@/pages/OrderConfirmPage';
import ProducerDashboard from '@/pages/dashboard/ProducerDashboard';
import ConsumerDashboard from '@/pages/dashboard/ConsumerDashboard';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';

// Error pages
import NotFoundPage from '@/pages/errors/NotFoundPage';

// Route guards
import ProtectedRoute from '@/components/common/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public routes — wrapped in the shared Navbar/Footer layout */}
            <Route element={<PageWrapper />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/listings/:id" element={<ListingDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/producers/:id" element={<ProducerProfilePage />} />
            </Route>

            {/* Auth routes — no Navbar/Footer */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route element={<ProtectedRoute allowedRoles={['consumer', 'producer', 'admin']} />}>
  <Route element={<PageWrapper />}>
    <Route path="/profile/edit" element={<EditProfilePage />} />
  </Route>
</Route>

            {/* Protected consumer routes */}
            <Route element={<ProtectedRoute allowedRoles={['consumer']} />}>
              <Route element={<PageWrapper />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirm/:orderId" element={<OrderConfirmPage />} />
                <Route path="/dashboard/consumer" element={<ConsumerDashboard />} />
              </Route>
            </Route>

            {/* Protected producer routes */}
            <Route element={<ProtectedRoute allowedRoles={['producer']} />}>
              <Route element={<PageWrapper />}>
                <Route path="/dashboard/producer" element={<ProducerDashboard />} />
              </Route>
            </Route>

            {/* Protected admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<PageWrapper />}>
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
              </Route>
            </Route>

            {/* Redirect /dashboard to the right dashboard based on role */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
