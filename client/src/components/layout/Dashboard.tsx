import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiHome, FiCreditCard, FiUser, FiDollarSign, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <FiHome className="h-5 w-5" /> },
    { name: 'Fund Wallet', href: '/wallet/fund', icon: <FiDollarSign className="h-5 w-5" /> },
    { name: 'Transfer', href: '/wallet/transfer', icon: <FiCreditCard className="h-5 w-5" /> },
    { name: 'Profile', href: '/profile', icon: <FiUser className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-400 w-10 h-10 flex items-center justify-center text-primary font-bold text-xl">
              B.
            </div>
            <span className="ml-2 font-semibold text-gray-900">Beam Finance</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-500 focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="bg-white border-b">
            <nav className="px-4 py-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center py-3 px-4 rounded-md ${
                    router.pathname === item.href
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center w-full py-3 px-4 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <FiLogOut className="h-5 w-5" />
                <span className="ml-3">Logout</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex items-center h-16 px-6 border-b">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-400 w-10 h-10 flex items-center justify-center text-primary font-bold text-xl">
              B.
            </div>
            <span className="ml-2 font-semibold text-gray-900">Beam Finance</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center py-3 px-4 rounded-md ${
                  router.pathname === item.href
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="px-4 py-6 border-t">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <FiUser className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {state.user?.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500">{state.user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full py-2 px-4 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <FiLogOut className="h-5 w-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
