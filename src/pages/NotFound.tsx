import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex items-center justify-center px-4 pt-16">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-sky-100 font-sora leading-none">404</div>
        <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto -mt-8 mb-6">
          <span className="text-2xl">🔍</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">Page Not Found</h1>
        <p className="text-slate-500 text-sm mb-8">
          The page at <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{location.pathname}</code> doesn't exist. You may have followed an outdated link.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors"
          >
            <Home size={16} />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
        <div className="mt-10 text-sm text-slate-400">
          Need help? <Link to="/help" className="text-sky-600 hover:underline">Visit Help Center</Link> or <Link to="/contact" className="text-sky-600 hover:underline">Contact Support</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
