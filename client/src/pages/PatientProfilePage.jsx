import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  LogOut, 
  Volume2, 
  Clock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import AccessibleButton from '../components/common/AccessibleButton';

export const PatientProfilePage = () => {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const { fontSize, highContrast, speak, announce } = useAccessibility();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('patient');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const [appointmentCounts, setAppointmentCounts] = useState({ upcoming: 0, total: 0 });

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setRole(user.role || 'patient');
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      const loadApptStats = async () => {
        try {
          const res = await api.getMyAppointments();
          if (res.success) {
            setAppointmentCounts({
              upcoming: res.upcoming?.length || 0,
              total: res.totalCount || 0
            });
          }
        } catch (e) {
          console.warn('Could not load appointment metrics:', e);
        }
      };
      loadApptStats();
    }
  }, [isAuthenticated]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      const res = await api.updateProfile({
        fullName,
        phone
      });
      if (res.success) {
        setSaveSuccess('Your profile details have been saved successfully.');
        announce('Profile updated successfully.');
        speak('Your profile has been updated.');
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile.');
      announce(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReadProfile = () => {
    speak(
      `Patient Profile for ${fullName}. Email is ${email}. You currently have ${appointmentCounts.upcoming} upcoming appointments scheduled.`
    );
  };

  if (authLoading) {
    return (
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-slate-700">Loading your profile...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main id="main-content" className="max-w-xl mx-auto px-4 py-16 text-center focus:outline-none">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            Sign In Required
          </h1>
          <p className="text-slate-600 text-base mb-8">
            Please sign in to view and manage your patient profile and medical contact information.
          </p>
          <Link to="/login?redirect=/profile">
            <AccessibleButton size="lg">
              Sign In to CareConnect
            </AccessibleButton>
          </Link>
        </div>
      </main>
    );
  }

  // Generate User Initials for Avatar
  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'P';

  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 focus:outline-none">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md">
            My Account
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-1">
            My Profile
          </h1>
          <p className="text-slate-600 text-base">
            Manage your personal healthcare contact details and consultation settings.
          </p>
        </div>

        <AccessibleButton
          variant="outline"
          size="sm"
          icon={Volume2}
          onClick={handleReadProfile}
          ariaLabel="Read my profile details aloud"
        >
          Read Profile Aloud
        </AccessibleButton>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div role="status" className="mb-6 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-center gap-2.5 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div role="alert" className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-center gap-2.5 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Verified {role}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{email}</span>
          </p>
        </div>

        <AccessibleButton
          variant="secondary"
          size="sm"
          icon={LogOut}
          onClick={logout}
          ariaLabel="Sign out of account"
        >
          Sign Out
        </AccessibleButton>
      </div>

      {/* Quick Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Upcoming Visits</span>
              <span className="text-2xl font-black text-slate-900">{appointmentCounts.upcoming}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Link to="/dashboard" className="text-xs text-indigo-700 font-bold hover:underline">
              View Appointments →
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Bookings</span>
              <span className="text-2xl font-black text-slate-900">{appointmentCounts.total}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Link to="/dashboard" className="text-xs text-indigo-700 font-bold hover:underline">
              Consultation History →
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Accessibility</span>
              <span className="text-sm font-bold text-slate-900 capitalize">
                {fontSize} Text {highContrast ? '• Contrast' : ''}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Link to="/accessibility-settings" className="text-xs text-indigo-700 font-bold hover:underline">
              Manage Preferences →
            </Link>
          </div>
        </div>
      </div>

      {/* Editable Contact Details Form */}
      <section aria-labelledby="contact-heading" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 id="contact-heading" className="text-xl font-bold text-slate-900 mb-2">
          Contact & Account Details
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Keep your contact information up to date so your healthcare providers can reach you regarding appointment updates.
        </p>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-bold text-slate-900 mb-1.5">
                Full Legal Name:
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="profile-phone" className="block text-sm font-bold text-slate-900 mb-1.5">
                Primary Phone Number:
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-sm font-bold text-slate-900 mb-1.5">
              Registered Email Address (Read-only):
            </label>
            <input
              id="profile-email"
              type="email"
              disabled
              value={email}
              className="w-full p-3.5 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-500 text-base cursor-not-allowed select-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              Your email serves as your secure account login identifier.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <AccessibleButton
              type="submit"
              size="lg"
              loading={saving}
              icon={Save}
            >
              Save Profile Changes
            </AccessibleButton>
          </div>
        </form>
      </section>

    </main>
  );
};

export default PatientProfilePage;

