import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, Calendar, User, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm/50">
      {/* WCAG 2.4.1: Skip to main content link for keyboard-only users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-700 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 sm:py-5 min-h-[88px] gap-4 lg:gap-8">
          
          {/* 1. Logo & Brand Lockup with generous internal spacing */}
          <Link 
            to="/" 
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 rounded-2xl p-1.5 transition-all flex-shrink-0"
            aria-label="CareConnect Homepage"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md group-hover:bg-indigo-700 transition-colors flex-shrink-0">
              <HeartPulse className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                  CareConnect
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200 uppercase tracking-wide">
                  Accessible Healthcare
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 hidden sm:block">
                Healthcare booking designed for everyone
              </p>
            </div>
          </Link>

          {/* 2. Desktop Navigation Links with generous gaps */}
          <nav 
            className="hidden lg:flex items-center gap-4 xl:gap-6 mx-2" 
            aria-label="Main navigation"
          >
            <Link
              to="/doctors"
              className={`px-4 py-2.5 rounded-xl font-semibold text-base transition-colors ${
                isActive('/doctors')
                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-sm'
                  : 'text-slate-700 hover:text-indigo-700 hover:bg-slate-100/70'
              }`}
            >
              Find Doctors
            </Link>

            <Link
              to="/dashboard"
              className={`px-4 py-2.5 rounded-xl font-semibold text-base transition-colors flex items-center gap-2.5 ${
                isActive('/dashboard')
                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-sm'
                  : 'text-slate-700 hover:text-indigo-700 hover:bg-slate-100/70'
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              <span>My Appointments</span>
            </Link>

            <Link
              to="/accessibility-settings"
              className={`px-4 py-2.5 rounded-xl font-semibold text-base transition-colors ${
                isActive('/accessibility-settings')
                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-sm'
                  : 'text-slate-700 hover:text-indigo-700 hover:bg-slate-100/70'
              }`}
            >
              Accessibility Settings
            </Link>
          </nav>

          {/* 3. Divider & Desktop Auth Controls */}
          <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
            {/* Visual clean separator */}
            <div className="h-8 w-px bg-slate-200" aria-hidden="true" />

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{user?.role === 'admin' ? 'Administrator' : 'Patient'}</p>
                </div>
                <AccessibleButton
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  icon={LogOut}
                  ariaLabel="Sign out of your CareConnect account"
                >
                  Sign Out
                </AccessibleButton>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <AccessibleButton variant="ghost" size="md">
                    Sign In
                  </AccessibleButton>
                </Link>
                <Link to="/register">
                  <AccessibleButton variant="primary" size="md" className="shadow-md">
                    Register
                  </AccessibleButton>
                </Link>
              </div>
            )}
          </div>

          {/* Medium screen navigation fallback (when between md and lg) */}
          <div className="hidden md:flex lg:hidden items-center gap-2">
            <Link to="/doctors">
              <AccessibleButton variant="secondary" size="sm">
                Find Doctors
              </AccessibleButton>
            </Link>
            <Link to="/dashboard">
              <AccessibleButton variant="secondary" size="sm" icon={Calendar}>
                Appointments
              </AccessibleButton>
            </Link>
            {isAuthenticated ? (
              <AccessibleButton variant="outline" size="sm" onClick={handleLogout} icon={LogOut}>
                Sign Out
              </AccessibleButton>
            ) : (
              <Link to="/login">
                <AccessibleButton variant="primary" size="sm">
                  Sign In
                </AccessibleButton>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="p-3 rounded-2xl text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Navigation with comfortable spacing */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-5 pt-5 pb-7 space-y-4 animate-fade-in shadow-2xl">
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3.5 rounded-xl font-bold text-lg text-slate-800 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
          >
            Find Doctors
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3.5 rounded-xl font-bold text-lg text-slate-800 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
          >
            My Appointments
          </Link>
          <Link
            to="/accessibility-settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3.5 rounded-xl font-bold text-lg text-slate-800 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
          >
            Accessibility Settings & Help
          </Link>

          <div className="pt-5 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="px-4">
                  <p className="font-bold text-slate-900 text-base">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
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
              <div className="grid grid-cols-2 gap-4">
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
