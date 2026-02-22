import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextOptimized';
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Activity,
  Heart,
  Pill,
  LayoutDashboard,
  BookOpenText,
  ClipboardList,
  Plus,
} from 'lucide-react';
// import NotificationBell from '../notifications/NotificationBell';

const Navbar: React.FC = () => {
  const { state, logout } = useAuth();
  const { user, isAuthenticated, isLoading } = state;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    // Auth state update handled silently
  }, [isAuthenticated, isLoading, user]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const isLinkActive = (path: string) => {
    // Simple check if current path matches
    return window.location.pathname === path;
  };

  const navLinks = [
    { 
      name: 'Pulpit', 
      path: '/', 
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Podsumowanie' 
    },
    { 
      name: 'Zdrowie', 
      path: '/health', 
      icon: <Heart className="w-5 h-5" />,
      description: 'Panel zdrowia'
    },
    { 
      name: 'Przepisy', 
      path: '/recipes', 
      icon: <BookOpenText className="w-5 h-5" />,
      description: 'Twoje przepisy kulinarne'
    },
    { 
      name: 'Leki', 
      path: '/medications', 
      icon: <Pill className="w-5 h-5" />,
      description: 'Zarządzanie lekami'
    },
    { 
      name: 'Plany dietetyczne', 
      path: '/diet-plans', 
      icon: <ClipboardList className="w-5 h-5" />,
      description: 'Planowanie posiłków'
    }
    ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-lg sm:text-xl font-bold text-primary-600 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">🥗</span>
                <span className="hidden sm:inline">NutriPlan</span>
                <span className="sm:hidden">NP</span>
              </Link>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isLinkActive(link.path)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`text-lg ${isLinkActive(link.path) ? 'text-primary-600' : 'text-gray-400'}`}>
                    {link.icon}
                  </span>
                  <span className="hidden lg:inline">{link.name}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* <NotificationBell /> */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={toggleProfileMenu}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 truncate">
                        {user?.email}
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <UserIcon className="mr-2 h-4 w-4" /> Profil
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Wyloguj
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Zaloguj
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Zarejestruj
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* {isAuthenticated && <NotificationBell />} */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={toggleMenu}
            >
              <span className="sr-only">Otwórz menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isLinkActive(link.path)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={closeMenu}
              >
                <span className={`mr-3 flex-shrink-0 h-6 w-6 ${
                  isLinkActive(link.path) ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  {link.icon}
                </span>
                <div>
                  <div>{link.name}</div>
                  <div className="text-xs text-gray-500">{link.description}</div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="px-2 space-y-1">
                <div className="px-3 py-2 text-sm text-gray-700 font-medium truncate">
                  {user?.email}
                </div>
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={closeMenu}
                >
                  <UserIcon className="mr-2 h-4 w-4" /> Profil
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Wyloguj
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-700"
                  onClick={closeMenu}
                >
                  Zaloguj się
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 text-center"
                  onClick={closeMenu}
                >
                  Zarejestruj się
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default React.memo(Navbar);
