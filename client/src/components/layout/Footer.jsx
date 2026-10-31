import React from 'react';
import { HeartPulse, CheckCircle2, Keyboard, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800" aria-label="CareConnect footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          
          {/* Brand & Academic Context */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
                <HeartPulse className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CareConnect</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              An accessible, universal healthcare appointment booking web application built according to Nielsen's Usability Heuristics and WCAG 2.1 guidelines.
            </p>
            <div className="text-xs text-teal-400 font-medium">
              🎓 Human-Computer Interaction (HCI) Mini Project <br />
              Manipal University Jaipur
            </div>
          </div>

          {/* HCI & Accessibility Guarantees */}
          <div>
            <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-400" aria-hidden="true" />
              <span>Universal Design Standards</span>
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>WCAG 2.1 AA/AAA Contrast & Large Touch Targets</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Full Keyboard Operability & Zero Focus Traps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Multimodal Audio (Text-to-Speech) Guidance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Double-Booking Concurrency Protection</span>
              </li>
            </ul>
          </div>

          {/* Keyboard Shortcuts Guide */}
          <div>
            <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-teal-400" aria-hidden="true" />
              <span>Accessibility Navigation Tips</span>
            </h3>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">Tab</kbd> Move focus forward</p>
              <p><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">Shift + Tab</kbd> Move focus backward</p>
              <p><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">Enter / Space</kbd> Activate buttons and slots</p>
              <p><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">Esc</kbd> Close popups and dialogs</p>
            </div>
            <div className="mt-4">
              <Link 
                to="/accessibility-settings" 
                className="text-xs text-teal-400 underline hover:text-teal-300 font-semibold"
              >
                Open Full Accessibility Guide & Controls →
              </Link>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CareConnect. Academic Demonstration. Fictional healthcare data for research.</p>
          <p className="text-slate-400 font-medium">Built with React, Tailwind CSS, Express, and PostgreSQL</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
