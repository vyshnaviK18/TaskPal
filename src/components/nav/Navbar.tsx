import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from '../../lib/auth';
import { useAuthContext } from '../../context/AuthContext';
import { CheckSquare, Calendar, BarChart, LogOut, Menu, X, User } from 'lucide-react';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <CheckSquare size={24} className="text-primary-500 mr-2" />
              <span className="font-bold text-xl bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                TaskPal
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center">
                    <CheckSquare size={18} className="mr-1" />
                    Tasks
                  </span>
                </Link>
                <Link
                  to="/calendar"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center">
                    <Calendar size={18} className="mr-1" />
                    Calendar
                  </span>
                </Link>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center">
                    <BarChart size={18} className="mr-1" />
                    Dashboard
                  </span>
                </Link>
                <div className="pl-4 border-l border-gray-200">
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <LogOut size={16} className="mr-1" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-500 hover:text-primary-500 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center">
                    <CheckSquare size={18} className="mr-2" />
                    Tasks
                  </span>
                </Link>
                <Link
                  to="/calendar"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center">
                    <Calendar size={18} className="mr-2" />
                    Calendar
                  </span>
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center">
                    <BarChart size={18} className="mr-2" />
                    Dashboard
                  </span>
                </Link>
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    variant="outline"
                    fullWidth
                    className="flex items-center justify-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center">
                    <User size={18} className="mr-2" />
                    Sign In
                  </span>
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-primary-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center justify-center bg-primary-500 text-white p-2 rounded-md">
                    Sign Up
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;