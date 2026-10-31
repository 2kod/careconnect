import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartPulse, 
  Calendar, 
  Search, 
  ShieldCheck, 
  Volume2, 
  Clock, 
  Users, 
  ArrowRight, 
  HeartHandshake, 
  Eye, 
  Activity, 
  Brain, 
  Stethoscope, 
  Shield 
} from 'lucide-react';
import AccessibleButton from '../components/common/AccessibleButton';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';

const specIconMap = {
  'Stethoscope': Stethoscope,
  'HeartHandshake': HeartHandshake,
  'Heart': HeartPulse,
  'Eye': Eye,
  'Activity': Activity,
  'Brain': Brain,
  'ShieldCheck': ShieldCheck,
};

export const HomePage = () => {
  const { speak } = useAccessibility();
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const res = await api.getSpecializations();
        if (res.success) {
          setSpecializations(res.data);
        }
      } catch (e) {
        console.error('Error fetching specializations:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecializations();
  }, []);

  const handleReadIntro = () => {
    speak(
      'Welcome to CareConnect. This healthcare booking platform is designed to be calm, accessible, and simple to use. You can search doctors, choose dates and times without rush, and adjust text size or colors anytime from the top bar.'
    );
  };

  return (
    <main id="main-content" className="focus:outline-none">
      
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50/70 to-white py-12 md:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 text-indigo-800 text-sm font-bold border border-indigo-200 mb-6">
              <HeartPulse className="w-4 h-4 text-indigo-700" aria-hidden="true" />
              <span>HCI Universal Healthcare Initiative</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Healthcare appointment booking that works for everyone.
            </h1>

            <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8">
              CareConnect is built from the ground up for older adults, people with visual impairments, and first-time digital users. Large text, calm screens, voice assistance, and zero confusion.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/doctors">
                <AccessibleButton size="lg" icon={Search}>
                  Find & Book a Doctor
                </AccessibleButton>
              </Link>

              <AccessibleButton
                variant="outline"
                size="lg"
                icon={Volume2}
                onClick={handleReadIntro}
                ariaLabel="Listen to audio overview of CareConnect"
              >
                Listen to Audio Guide
              </AccessibleButton>

              <Link to="/accessibility-settings">
                <AccessibleButton variant="secondary" size="lg">
                  Accessibility Controls
                </AccessibleButton>
              </Link>
            </div>

            {/* Reassurance Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-200 text-sm text-slate-700">
              <div className="flex items-center gap-2.5 font-medium">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>No hidden steps or spam</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium">
                <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span>Instant confirmed slots</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium">
                <HeartHandshake className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span>Easy mistake recovery</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Specializations / Browse Section */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Select a Healthcare Department
            </h2>
            <p className="text-slate-600 text-base mt-1">
              Choose the specialty that matches your care needs, or search by doctor name.
            </p>
          </div>
          <Link to="/doctors" className="text-indigo-700 font-bold hover:underline flex items-center gap-1.5 text-base">
            <span>View All Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Specialization Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {specializations.map((spec) => {
            const IconComponent = specIconMap[spec.icon_name] || Stethoscope;
            return (
              <Link
                key={spec.id}
                to={`/doctors?spec=${spec.id}`}
                className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <IconComponent className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {spec.name}
                </h3>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {spec.description}
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-indigo-700 gap-1">
                  <span>Browse Specialists</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. 3-Step Simple Booking Process (HCI Principle: Minimal Cognitive Load) */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Booking Made Simple in 3 Clear Steps
            </h2>
            <p className="text-slate-600 text-base mt-2">
              We eliminated complicated forms so you can secure your appointment with total confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Find Your Doctor</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Search by name or department. Compare verified experience, hospital locations, and transparent consultation fees.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pick a Comfortable Time</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Choose a morning or afternoon time slot. Clear visual indicators show you what is open with no double-booking surprises.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirmed with Peace of Mind</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Review your appointment summary before confirming. Receive your booking reference, calendar link, and cancellation safeguard.
              </p>
            </div>

          </div>

          <div className="text-center mt-10">
            <Link to="/doctors">
              <AccessibleButton size="lg">
                Start Booking Your Appointment Now
              </AccessibleButton>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
};

export default HomePage;

