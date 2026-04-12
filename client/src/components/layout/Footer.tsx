import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-primary-800 font-bold">
            <span className="text-xl">🌿</span>
            <span>FoodBridge</span>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Connecting local food producers with consumers in your community.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link to="/search" className="hover:text-primary-700 transition-colors">Browse</Link>
            <Link to="/register" className="hover:text-primary-700 transition-colors">Sell with us</Link>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} FoodBridge. Built with 💚 for local communities.
        </p>
      </div>
    </footer>
  );
}
