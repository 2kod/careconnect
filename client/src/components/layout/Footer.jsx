import React from 'react';
import { HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800" aria-label="CareConnect footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <Link 
              to="/" 
              className="flex items-center gap-2.5 text-white font-bold text-lg hover:text-indigo-400 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <HeartPulse className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">CareConnect</span>
            </Link>
            <span className="hidden sm:inline text-slate-600">•</span>
            <p className="text-sm text-slate-400">
              Healthcare appointment booking designed for everyone
            </p>
          </div>

          {/* Quick Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium" aria-label="Footer navigation">
            <Link to="/doctors" className="text-slate-300 hover:text-white transition-colors">
              Find Doctors
            </Link>
            <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors">
              My Appointments
            </Link>
            <Link to="/accessibility-settings" className="text-slate-300 hover:text-white transition-colors">
              Accessibility Settings
            </Link>
          </nav>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 CareConnect • Manipal University Jaipur</p>
          <p className="text-slate-500">Dedicated to gentle, caring healthcare</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
