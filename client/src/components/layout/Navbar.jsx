import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, Calendar, User, LogOut, Menu, X, Stethoscope, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AccessibleButton from '../common/AccessibleButton';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* WCAG 2.4.1: Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-700 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* 1. Left: Brand Logo & Title (Protected against shrinking & wrapping) */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 rounded-xl p-1 flex-shrink-0"
            aria-label="CareConnect Homepage"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md group-hover:bg-indigo-700 transition-colors flex-shrink-0">
              <HeartPulse className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 whitespace-nowrap">
                CareConnect
              </span>
              <span className="hidden xl:inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 uppercase tracking-wide whitespace-nowrap">
                Accessible Healthcare
              </span>
            </div>
          </Link>

          {/* 2. Center: Navigation Links (Strictly single-line, zero wrapping) */}
          <nav 
            className="hidden lg:flex items-center gap-2 xl:gap-4 flex-nowrap" 
            aria-label="Main navigation"
          >
            <Link
              to="/doctors"
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl font-semibold text-sm xl:text-base transition-colors ${
                isActive('/doctors')
                  ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                  : 'text-slate-700 hover:text-indigo-700 hover:bg-slate-50'
              }`}
            >
              Find Doctors
            </Link>

            <Link
              to="/dashboard"
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl font-semibold text-sm xl:text-base transition-colors flex items-center gap-2 ${
                isActive('/dashboard')
                  ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                  : 'text-slate-700 hover:text-indigo-700 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" aria-hidden="true" />
              <span>My Appointments</span>
            </Link>

            <Link
              to="/accessibility-settings"
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl font-semibold text-sm xl:text-base transition-colors ${
                isActive('/accessibility-settings')
                  ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                  : 'text-slate-700 hover:text-indigo-700 hover:bg-slate-50'
              }`}
            >
              Accessibility Settings
            </Link>
          </nav>

          {/* 3. Right: Auth Actions (Clean, aligned single-line flex) */}
          <div className="hidden md:flex items-center gap-3.5 flex-shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 whitespace-nowrap">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-tight whitespace-nowrap">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-slate-500 whitespace-nowrap">
                    {user?.role === 'admin' ? 'Administrator' : 'Patient'}
                  </p>
                </div>
                <AccessibleButton
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  icon={LogOut}
                  ariaLabel="Sign out of your CareConnect account"
                  className="whitespace-nowrap"
                >
                  Sign Out
                </AccessibleButton>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 whitespace-nowrap">
                <Link to="/login">
                  <AccessibleButton variant="ghost" size="md" className="whitespace-nowrap font-bold text-slate-700">
                    Sign In
                  </AccessibleButton>
                </Link>
                <Link to="/register">
                  <AccessibleButton variant="primary" size="md" className="whitespace-nowrap font-bold shadow-sm">
                    Register
                  </AccessibleButton>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="lg:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile / Tablet Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-5 pt-4 pb-6 space-y-3 animate-fade-in shadow-xl">
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-xl font-bold text-base text-slate-800 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
          >
            Find Doctors
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-xl font-bold text-base text-slate-800 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
          >
            My Appointments
          </Link>
          <Link
            to="/accessibility-settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-xl font-bold text-base text-slate-800 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
          >
            Accessibility Settings
          </Link>

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-4">
                  <p className="font-bold text-slate-900">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <AccessibleButton
                  variant="danger"
                  size="md"
                  className="w-full"
                  onClick={handleLogout}
                  icon={LogOut}
                >
                  Sign Out
                </AccessibleButton>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <AccessibleButton variant="secondary" size="md" className="w-full">
                    Sign In
                  </AccessibleButton>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <AccessibleButton variant="primary" size="md" className="w-full">
                    Register
                  </AccessibleButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
