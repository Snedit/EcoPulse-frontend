import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  LayoutGrid, 
  Droplets, 
  Trash2, 
  PlusCircle, 
  Settings, 
  User, 
  Menu, 
  X, 
  CircleFadingPlus,
  Bell, 
  LogOut, 
  Triangle
} from 'lucide-react';


import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Devices', path: '/devices', icon: <LayoutGrid className="w-5 h-5" /> },
    { name: 'Interfaces', path: '/interfaces', icon: <LayoutGrid className="w-5 h-5" /> },
    { name: 'Water Tanks', path: '/water-tanks', icon: <Droplets className="w-5 h-5" /> },
    { name: 'Waste Bins', path: '/waste-bins', icon: <Trash2 className="w-5 h-5" /> },
    { name: 'Add Device', path: '/device/setup', icon: <PlusCircle className="w-5 h-5" /> },
    { name: 'Add Interface', path: '/interface/setup', icon: <CircleFadingPlus className="w-5 h-5" /> },
    { name: 'Trace the mystery', path: '/trace', icon: <Triangle className="w-5 h-5" /> },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden bg-white dark:bg-navy-900 p-2 rounded-md shadow-md dark:shadow-glow-sm"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white dark:bg-navy-900 shadow-xl dark:shadow-glow transition-transform duration-300 z-50 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:w-64 md:shadow-none md:z-10`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and brand */}
          <div className="p-4 border-b border-gray-200 dark:border-navy-800">
            <Link 
              to="/" 
              className="flex items-center space-x-2"
              onClick={() => setIsOpen(false)}
            >
              <Droplets className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                EcoMonitor
              </span>
            </Link>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 py-4 px-2 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User and settings */}
          <div className="border-t border-gray-200 dark:border-navy-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <ThemeToggle />
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => logout()}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800 text-error-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {user && (
              <Link
                to="/profile"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800"
                onClick={() => setIsOpen(false)}
              >
                <img
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0075FF&color=fff`}
                  alt={user?.fullName}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-medium text-sm">{user.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                    {user.email}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}