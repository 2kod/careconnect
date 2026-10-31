import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartPulse, 
  Calendar, 
  LogOut, 
  Menu, 
  X, 
  Volume2, 
  VolumeX, 
  Eye, 
  Settings,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import AccessibleButton from '../common/AccessibleButton';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const {
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    isSpeaking,
    stopSpeaking,
    speak,
  } = useAccessibility();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showA11yMenu, setShowA11yMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const handleReadPage = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const headings = Array.from(document.querySelectorAll('main h1, main h2, main p'))
      .slice(0, 5)
      .map(el => el.innerText)
      .filter(text => text.length > 5)
      .join('. ');

    const readText = headings || 'CareConnect: Accessible Healthcare Appointment Booking platform. Navigate doctors, choose slots, and manage your health appointments easily.';
    speak(readText);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      {/* Skip to main content for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-700 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. Clean Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 rounded-xl py-1 px-1.5 -ml-1.5"
            aria-label="CareConnect Homepage"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
              <HeartPulse className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              CareConnect
            </span>
          </Link>

          {/* 2. Focused Navigation Links (Center) */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <Link
              to="/doctors"
              className={`px-3.5 py-2 rounded-lg font-semibold text-sm transition-colors ${
                isActive('/doctors')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Find Doctors
            </Link>

            <Link
              to="/dashboard"
              className={`px-3.5 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-1.5 ${
                isActive('/dashboard')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              <span>My Appointments</span>
            </Link>
          </nav>

          {/* 3. Right Utilities: Compact Accessibility Tools & Auth */}
          <div className="hidden md:flex items-center gap-2.5">
            
            {/* Quick Text Sizer */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200" role="group" aria-label="Text size">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                aria-pressed={fontSize === 'normal'}
                title="Normal text size"
                className={`px-2 py-1 text-xs font-bold rounded ${
                  fontSize === 'normal' 
                    ? 'bg-white text-indigo-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                aria-pressed={fontSize === 'large'}
                title="Large text size"
                className={`px-2 py-1 text-xs font-bold rounded ${
                  fontSize === 'large' 
                    ? 'bg-white text-indigo-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A+
              </button>
            </div>

            {/* Quick Contrast Switch */}
            <button
              type="button"
              onClick={toggleHighContrast}
              aria-pressed={highContrast}
              title={highContrast ? "Disable high contrast" : "Enable high contrast"}
              className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                highContrast 
                  ? 'bg-yellow-400 text-black border-yellow-400' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Contrast</span>
            </button>

            {/* Text-to-Speech Button */}
            <button
              type="button"
              onClick={handleReadPage}
              aria-label={isSpeaking ? "Stop reading" : "Read page aloud"}
              title="Voice Reader"
              className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                isSpeaking 
                  ? 'bg-rose-500 text-white border-rose-500 animate-pulse' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              )}
              <span className="hidden lg:inline">{isSpeaking ? 'Stop' : 'Read'}</span>
            </button>

            {/* Subtle Divider */}
            <div className="h-5 w-px bg-slate-200 mx-1" aria-hidden="true" />

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                  {user?.fullName?.split(' ')[0]}
                </span>
                <AccessibleButton
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  icon={LogOut}
                  ariaLabel="Sign out"
                  className="text-xs py-1.5 px-3 min-h-[36px]"
                >
                  Sign Out
                </AccessibleButton>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register">
                  <AccessibleButton variant="primary" size="sm" className="text-xs py-1.5 px-4 min-h-[36px]">
                    Register
                  </AccessibleButton>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={handleReadPage}
              aria-label="Read page aloud"
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {isSpeaking ? <VolumeX className="w-5 h-5 text-rose-600" /> : <Volume2 className="w-5 h-5 text-indigo-600" />}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2.5 shadow-lg">
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg font-semibold text-base text-slate-800 hover:bg-indigo-50 hover:text-indigo-800"
          >
            Find Doctors
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg font-semibold text-base text-slate-800 hover:bg-indigo-50 hover:text-indigo-800"
          >
            My Appointments
          </Link>
          <Link
            to="/accessibility-settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg font-semibold text-base text-slate-800 hover:bg-indigo-50 hover:text-indigo-800"
          >
            Accessibility Settings
          </Link>

          {/* Mobile Quick A11y Controls */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Text Size:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-3 py-1 rounded text-xs font-bold ${fontSize === 'normal' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-3 py-1 rounded text-xs font-bold ${fontSize === 'large' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('x-large')}
                className={`px-3 py-1 rounded text-xs font-bold ${fontSize === 'x-large' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
              >
                A++
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">High Contrast:</span>
            <button
              type="button"
              onClick={toggleHighContrast}
              className={`px-3 py-1 rounded text-xs font-bold ${highContrast ? 'bg-yellow-400 text-black' : 'bg-slate-100 text-slate-700'}`}
            >
              {highContrast ? 'On' : 'Off'}
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600 px-1">Signed in as {user?.fullName}</p>
                <AccessibleButton
                  variant="danger"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleLogout}
                  icon={LogOut}
                >
                  Sign Out
                </AccessibleButton>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <AccessibleButton variant="secondary" size="sm" className="w-full text-xs">
                    Sign In
                  </AccessibleButton>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <AccessibleButton variant="primary" size="sm" className="w-full text-xs">
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
