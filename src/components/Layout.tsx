import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../store';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CubeIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChartBarIcon,
  BuildingLibraryIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: HomeIcon,
      color: 'text-blue-500',
      activeColor: 'bg-blue-50'
    },
    { 
      name: 'Müşteriler', 
      path: '/customers', 
      icon: UsersIcon,
      color: 'text-violet-500',
      activeColor: 'bg-violet-50'
    },
    { 
      name: 'Tedarikçiler', 
      path: '/suppliers', 
      icon: BuildingOfficeIcon,
      color: 'text-indigo-500',
      activeColor: 'bg-indigo-50'
    },
    { 
      name: 'Ürünler', 
      path: '/products', 
      icon: CubeIcon,
      color: 'text-emerald-500',
      activeColor: 'bg-emerald-50'
    },
    { 
      name: 'Faturalar', 
      path: '/invoices', 
      icon: DocumentTextIcon,
      color: 'text-orange-500',
      activeColor: 'bg-orange-50'
    },
    { 
      name: 'Gelir & Gider', 
      path: '/transactions', 
      icon: BanknotesIcon,
      color: 'text-green-500',
      activeColor: 'bg-green-50'
    },
    { 
      name: 'Raporlar', 
      path: '/reports', 
      icon: ChartBarIcon,
      color: 'text-rose-500',
      activeColor: 'bg-rose-50'
    },
    { 
      name: 'Banka Hesapları', 
      path: '/bank-accounts', 
      icon: BuildingLibraryIcon,
      color: 'text-cyan-500',
      activeColor: 'bg-cyan-50'
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 w-64 transition duration-300 transform bg-white shadow-lg md:relative md:translate-x-0 z-50`}
      >
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold text-gray-800">Muhasebe</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden rounded-md hover:bg-gray-100 p-1"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <nav className="mt-5 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`mt-1 group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md w-full text-left transition ease-in-out duration-150
                  ${isActive 
                    ? `${item.activeColor} ${item.color} font-semibold` 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <item.icon 
                  className={`mr-4 h-6 w-6 transition-colors duration-150
                    ${isActive ? item.color : 'text-gray-500 group-hover:text-gray-600'}`} 
                />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 relative">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden rounded-md hover:bg-gray-100 p-1"
            >
              <Bars3Icon className="h-6 w-6 text-gray-500" />
            </button>

            <div className="flex items-center">
              <span className="text-sm text-gray-500">
                {profile?.full_name || user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 relative">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 