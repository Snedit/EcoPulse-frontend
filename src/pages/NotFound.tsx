import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-6">
          404
        </h1>
        
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-full animate-ping opacity-30"></div>
          <div className="relative flex items-center justify-center w-24 h-24 bg-white dark:bg-navy-900 rounded-full shadow-lg dark:shadow-glow-sm">
            <span className="text-4xl">🔍</span>
          </div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <button 
          onClick={() => navigate('/')}
          className="btn-primary inline-flex items-center"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}