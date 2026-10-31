import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';
import AccessibilityBar from './components/accessibility/AccessibilityBar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import RouteAnnouncer from './components/common/RouteAnnouncer';

// Pages
import HomePage from './pages/HomePage';
import DoctorListPage from './pages/DoctorListPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import BookingWizardPage from './pages/BookingWizardPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccessibilitySettingsPage from './pages/AccessibilitySettingsPage';
import PatientProfilePage from './pages/PatientProfilePage';

function NotFoundPage() {
  return (
    <main id="main-content" className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-600 mb-6">
          The healthcare page or service you were looking for does not exist.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
        >
          Return to Homepage
        </Link>
      </div>
    </main>
  );
}

export function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors">
            {/* 1. Sticky Universal Accessibility Toolbar */}
            <AccessibilityBar />

            {/* 2. Main Navigation Bar */}
            <Navbar />

            {/* 3. Screen-reader and dynamic page focus announcer */}
            <RouteAnnouncer />

            {/* 4. Main Page View Content */}
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/doctors" element={<DoctorListPage />} />
                <Route path="/doctors/:id" element={<DoctorDetailPage />} />
                <Route path="/book/:doctorId" element={<BookingWizardPage />} />
                <Route path="/dashboard" element={<PatientDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/accessibility-settings" element={<AccessibilitySettingsPage />} />
                <Route path="/profile" element={<PatientProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>

            {/* 5. Accessible Footer with Keyboard Shortcuts */}
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;

