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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* WCAG 2.4.1: Skip to main content link for keyboard-only users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-700 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500 rounded-xl p-1"
            aria-label="CareConnect Homepage"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md group-hover:bg-teal-700 transition-colors">
              <HeartPulse className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                CareConnect
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold border border-teal-200 uppercase tracking-wide">
                  HCI Accessible
                </span>
              </span>
              <p className="text-xs text-slate-500 hidden sm:block">Healthcare booking designed for everyone</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main navigation">
            <Link
              to="/doctors"
              className={`px-4 py-2.5 rounded-xl font-semibold text-base transition-colors ${
                isActive('/doctors')
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'text-slate-700 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              Find Doctors
            </Link>

            <Link
              to="/dashboard"
              className={`px-4 py-2.5 rounded-xl font-semibold text-base transition-colors flex items-center gap-2 ${
                isActive('/dashboard')
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'text-slate-700 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-teal-600" aria-hidden="true" />
              <span>My Appointments</span>
            </Link>

            <Link
              to="/accessibility-settings"
              className={`px-4 py-2.5 rounded-xl font-semibold text-base transition-colors ${
                isActive('/accessibility-settings')
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'text-slate-700 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              Accessibility Settings
            </Link>
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.role === 'admin' ? 'Administrator' : 'Patient'}</p>
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
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <AccessibleButton variant="ghost" size="md">
                    Sign In
                  </AccessibleButton>
                </Link>
                <Link to="/register">
                  <AccessibleButton variant="primary" size="md">
                    Register
                  </AccessibleButton>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-3 animate-fade-in shadow-xl">
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-xl font-bold text-lg text-slate-800 hover:bg-teal-50 hover:text-teal-800"
          >
            Find Doctors
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-xl font-bold text-lg text-slate-800 hover:bg-teal-50 hover:text-teal-800"
          >
            My Appointments
          </Link>
          <Link
            to="/accessibility-settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-xl font-bold text-lg text-slate-800 hover:bg-teal-50 hover:text-teal-800"
          >
            Accessibility Settings & Help
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

