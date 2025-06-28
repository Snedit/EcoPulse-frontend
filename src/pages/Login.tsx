import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex flex-col">
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Droplets className="w-8 h-8 text-primary-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            EcoMonitor
          </span>
        </div>
        <ThemeToggle />
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
      
      <footer className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>© 2025 EcoMonitor. All rights reserved.</p>
      </footer>
    </div>
  );
}