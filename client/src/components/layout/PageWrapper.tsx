import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Wraps all public and authenticated pages with the shared Navbar and Footer.
 * Used as a layout route in App.tsx — the <Outlet> renders the matched child page.
 */
export default function PageWrapper() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
