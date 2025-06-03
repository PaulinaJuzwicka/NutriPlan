import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  User as UserIcon,
  LogOut, 
  Home,
  Activity,
  Pill,
  Settings,
  Utensils,
  LayoutDashboard
} from 'lucide-react';
import { User } from '../../types';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Medications', path: '/medications', icon: <Pill className="w-5 h-5" /> },
    { name: 'Health', path: '/health', icon: <Activity className="w-5 h-5" /> },
    { name: 'Diet Planner', path: '/diet-planner', icon: <Utensils className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">NutriPlan</Link>
            </div>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={
                    isActive(link.path)
                      ? 'border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                  }
                >
                  {link.icon}
                  <span className="ml-2">{link.name}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={toggleProfileMenu}
                  >
                    <span className="sr-only">Open user menu</span>
                    <UserIcon className="h-8 w-8 rounded-full text-white" />
                  </button>
                </div>

                {isProfileMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      {user?.email}
                    </div>
                    <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                    <button onClick={logout} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                       <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/login"
                  className={
                    isActive('/login')
                      ? 'inline-flex items-center px-1 pt-1 border-b-2 border-primary-500 text-gray-900 text-sm font-medium'
                      : 'inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 text-sm font-medium'
                  }
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={
                    isActive('/register')
                      ? 'inline-flex items-center px-1 pt-1 border-b-2 border-primary-500 text-gray-900 text-sm font-medium'
                      : 'inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 text-sm font-medium'
                  }
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {}
      {isMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={
                  isActive(link.path)
                    ? 'bg-primary-50 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                }
                onClick={closeMenu}
              >
                 {link.icon}
                 <span className="ml-2">{link.name}</span>
              </Link>
            ))}
          </div>
          {isAuthenticated && (
             <div className="pt-4 pb-3 border-t border-gray-200">
               <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                     <UserIcon className="h-10 w-10 rounded-full text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                       {user?.email}
                    </div>
                     <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
               </div>
               <div className="mt-3 space-y-1">
                 <Link to="/settings" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100" onClick={closeMenu}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                 </Link>
                 <button onClick={() => { logout(); closeMenu(); }} className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                 </button>
               </div>
             </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;