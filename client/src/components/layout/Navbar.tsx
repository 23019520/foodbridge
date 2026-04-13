import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardPath =
    user?.role === 'producer' ? '/dashboard/producer'
    : user?.role === 'admin' ? '/dashboard/admin'
    : '/dashboard/consumer';

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary-800">
          <span className="text-2xl">🌿</span>
          <span>FoodBridge</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/search" className="px-3 py-2 text-sm text-gray-600 hover:text-primary-700 rounded-lg hover:bg-primary-50 transition-colors">
            Browse
          </Link>
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className="px-3 py-2 text-sm text-gray-600 hover:text-primary-700 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/profile/edit" className="px-3 py-2 text-sm text-gray-600 hover:text-primary-700 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-1.5">
  <User className="w-4 h-4" />
  Edit profile
</Link>
              <button onClick={handleLogout} className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5">
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm text-gray-600 hover:text-primary-700 rounded-lg hover:bg-primary-50 transition-colors">
                Log in
              </Link>
              <Link to="/register" className="ml-1 px-4 py-2 text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors">
                Sign up
              </Link>
            </>
          )}

          {/* Cart — only consumers see this */}
          {user?.role === 'consumer' && (
            <Link to="/checkout" className="relative ml-2 p-2 text-gray-600 hover:text-primary-700 rounded-lg hover:bg-primary-50 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-xs font-bold text-white bg-primary-700 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {user?.role === 'consumer' && (
            <Link to="/checkout" className="relative p-2 text-gray-600">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-xs font-bold text-white bg-primary-700 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-600" aria-label="Toggle menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          <Link to="/search" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50">Browse listings</Link>
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <div className="px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
                <User className="w-3 h-3" /> {user?.name}
              </div>
              <button onClick={handleLogout} className="px-3 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50 text-left flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50">Log in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-white bg-primary-700 rounded-lg text-center">Sign up free</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
