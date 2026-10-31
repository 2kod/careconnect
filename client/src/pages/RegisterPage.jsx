import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle, HeartPulse, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AccessibleButton from '../components/common/AccessibleButton';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address with an @ symbol.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Please enter a password with at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        fullName,
        email,
        phone,
        password
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to register. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="max-w-md mx-auto px-4 py-14 focus:outline-none">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Create Patient Account
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Sign up to securely book and manage your healthcare visits
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div role="alert" className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-sm font-bold text-slate-900 mb-1">
              Full Name:
            </label>
            <input
              id="reg-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Sharma"
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-bold text-slate-900 mb-1">
              Email Address:
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ramesh@example.com"
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="reg-phone" className="block text-sm font-bold text-slate-900 mb-1">
              Phone Number (Optional):
            </label>
            <input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-bold text-slate-900 mb-1">
              Create Password:
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-3.5 pr-12 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters.</p>
          </div>

          <AccessibleButton
            type="submit"
            size="lg"
            loading={loading}
            className="w-full mt-2"
            icon={UserPlus}
          >
            Create My Account
          </AccessibleButton>
        </form>

        {/* Login link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-indigo-700 hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </main>
  );
};

export default RegisterPage;

