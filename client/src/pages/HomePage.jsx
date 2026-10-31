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
  Sparkles,
  Heart
} from 'lucide-react';
import AccessibleButton from '../components/common/AccessibleButton';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';

const specIconMap = {
  'Stethoscope': Stethoscope,
  'HeartHandshake': HeartHandshake,
  'Heart': Heart,
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
        console.error('Error fetching care areas:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecializations();
  }, []);

  const handleReadIntro = () => {
    speak(
      'Welcome to CareConnect. We are here to make finding and booking a doctor gentle, unhurried, and easy for you and your family. You can look through our doctors, pick a day and time that suits your routine, and listen to any page read aloud whenever you wish.'
    );
  };

  return (
    <main id="main-content" className="focus:outline-none">
      
      {/* 1. Hero Section - Warm, Human & Caring */}
      <section className="bg-gradient-to-b from-indigo-50/70 via-white to-white py-12 md:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-900 text-sm font-bold border border-indigo-200 mb-6 shadow-sm">
              <Heart className="w-4 h-4 text-indigo-600 fill-indigo-600" aria-hidden="true" />
              <span>Compassionate Care for You & Your Loved Ones</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Doctor visits made gentle, unhurried, and simple.
            </h1>

            <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8">
              When you or an elderly family member need to see a doctor, technology should feel like a helping hand — not a puzzle. CareConnect is built with calm screens, big readable letters, and friendly voice guidance so you can book care with total peace of mind.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/doctors">
                <AccessibleButton size="lg" icon={Search} className="shadow-md">
                  Find a Caring Doctor
                </AccessibleButton>
              </Link>

              <AccessibleButton
                variant="outline"
                size="lg"
                icon={Volume2}
                onClick={handleReadIntro}
                ariaLabel="Listen to audio overview of CareConnect"
              >
                Listen to Voice Guide
              </AccessibleButton>

              <Link to="/accessibility-settings">
                <AccessibleButton variant="secondary" size="lg">
                  Adjust Text & Display
                </AccessibleButton>
              </Link>
            </div>

            {/* Reassurance Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-200 text-sm text-slate-700">
              <div className="flex items-center gap-2.5 font-bold">
                <HeartHandshake className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span>Doctors who take time to listen</span>
              </div>
              <div className="flex items-center gap-2.5 font-bold">
                <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span>Clear, unhurried timings</span>
              </div>
              <div className="flex items-center gap-2.5 font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Easy mistake recovery & free changes</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Specializations / Browse Care Categories */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              What kind of care do you or your family need?
            </h2>
            <p className="text-slate-600 text-base mt-1">
              Select an area of care below, or search for a trusted physician by name.
            </p>
          </div>
          <Link to="/doctors" className="text-indigo-700 font-bold hover:underline flex items-center gap-1.5 text-base">
            <span>View All Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Care Categories Grid */}
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
                <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {spec.description}
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-indigo-700 gap-1">
                  <span>See available doctors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. 3-Step Simple Booking Process (Emotional Peace of Mind) */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Getting the care you need should never feel stressful
            </h2>
            <p className="text-slate-600 text-base mt-2">
              We eliminated long forms and tricky screens so you can secure a visit with total confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-sm">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Find a Doctor Who Listens</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Browse physicians by department or name. Read about their background, where their clinic is located, and honest fees upfront.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-sm">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pick a Time That Fits Your Day</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Choose a morning or afternoon consultation that feels right for your family. Clear green badges show you what is open with no guesswork.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-sm">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Rest Easy, You're Confirmed</h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Review your summary and confirm. We will keep your appointment details safe. If your plans change, cancelling or rescheduling is always easy.
              </p>
            </div>

          </div>

          <div className="text-center mt-10">
            <Link to="/doctors">
              <AccessibleButton size="lg" className="shadow-md">
                Find Your Doctor Now
              </AccessibleButton>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
};

export default HomePage;
