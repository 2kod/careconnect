import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Sparkles, AlertCircle, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AccessibleButton from '../components/common/AccessibleButton';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Demo user autofill for quick academic testing
  const handleFillDemo = () => {
    setEmail('ramesh@careconnect.org');
    setPassword('Password123!');
    setError('');
  };

  return (
    <main id="main-content" className="max-w-md mx-auto px-4 py-16 focus:outline-none">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Sign In to CareConnect
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Access your healthcare bookings and preferences
          </p>
        </div>

        {/* Demo Fill Pill for Evaluators & Teachers */}
        <div className="mb-6 bg-teal-50 border border-teal-200 rounded-2xl p-4 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block mb-1">
            🎓 Academic Evaluation / Viva Quick Access
          </span>
          <p className="text-xs text-slate-600 mb-2">
            Click below to autofill the sample patient profile (Ramesh Sharma).
          </p>
          <AccessibleButton
            variant="secondary"
            size="sm"
            onClick={handleFillDemo}
            className="w-full text-xs font-bold text-teal-800 border-teal-300"
            icon={Sparkles}
          >
            Auto-Fill Demo Patient Credentials
          </AccessibleButton>
        </div>

        {/* Error Alert */}
        {error && (
          <div role="alert" className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-bold text-slate-900 mb-1.5">
              Email Address:
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base focus:bg-white focus:border-teal-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-bold text-slate-900 mb-1.5">
              Password:
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-3.5 pr-12 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base focus:bg-white focus:border-teal-600 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password text' : 'Show password text'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <AccessibleButton
            type="submit"
            size="lg"
            loading={loading}
            className="w-full"
            icon={LogIn}
          >
            Sign In
          </AccessibleButton>
        </form>

        {/* Register link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          <span>First time using CareConnect? </span>
          <Link to="/register" className="font-bold text-teal-700 hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </main>
  );
};

export default LoginPage;

