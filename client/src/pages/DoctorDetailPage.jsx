import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Award, 
  Volume2, 
  HeartHandshake 
} from 'lucide-react';
import { api } from '../services/api';
import AccessibleButton from '../components/common/AccessibleButton';
import { useAccessibility } from '../context/AccessibilityContext';

export const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { speak } = useAccessibility();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.getDoctorById(id);
        if (res.success) {
          setDoctor(res.data);
        }
      } catch (err) {
        setError(err.message || 'Could not load doctor details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleReadProfile = () => {
    if (!doctor) return;
    speak(
      `Doctor profile: ${doctor.full_name}, ${doctor.qualification}, specializing in ${doctor.specialization_name} with ${doctor.experience_years} years of experience at ${doctor.hospital_clinic_name}. Consultation fee is ${parseInt(doctor.consultation_fee, 10)} rupees. Doctor summary: ${doctor.bio}`
    );
  };

  if (loading) {
    return (
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-bold text-slate-700">Loading doctor credentials...</p>
      </main>
    );
  }

  if (error || !doctor) {
    return (
      <main id="main-content" className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-8 rounded-2xl">
          <h1 className="text-xl font-bold mb-2">Doctor Profile Unavailable</h1>
          <p className="mb-6">{error || 'The requested doctor could not be found.'}</p>
          <AccessibleButton onClick={() => navigate('/doctors')}>
            Back to All Doctors
          </AccessibleButton>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 focus:outline-none">
      
      {/* Navigation breadcrumb */}
      <div className="mb-6">
        <Link 
          to="/doctors" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-700 font-bold text-base focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 rounded-lg p-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to All Doctors</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Profile Header */}
        <div className="p-8 md:p-10 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 via-white to-white flex flex-col md:flex-row items-start md:items-center gap-6">
          <img
            src={doctor.image_url}
            alt={`Photo of ${doctor.full_name}`}
            className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover bg-slate-100 border-2 border-indigo-600/20 shadow-md flex-shrink-0"
          />
          <div className="flex-1">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-200">
              {doctor.specialization_name}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {doctor.full_name}
            </h1>
            <p className="text-base text-slate-600 font-medium mt-1">
              {doctor.qualification}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-700">
              <span className="flex items-center gap-1.5 font-bold">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                {doctor.experience_years} Years Experience
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                {doctor.hospital_clinic_name}
              </span>
            </div>
          </div>

          <div className="md:self-start">
            <AccessibleButton
              variant="outline"
              size="sm"
              icon={Volume2}
              onClick={handleReadProfile}
              ariaLabel="Read doctor credentials aloud"
            >
              Read Profile
            </AccessibleButton>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="p-8 md:p-10 space-y-8">
          
          {/* Biography */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Doctor Biography & Approach</span>
            </h2>
            <p className="text-base md:text-lg text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-200">
              {doctor.bio}
            </p>
          </div>

          {/* Consultation Fee & Booking Action Banner */}
          <div className="bg-indigo-700 text-white p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <span className="text-sm font-semibold text-indigo-100 block">Consultation Fee</span>
              <span className="text-3xl font-black">
                ₹{parseInt(doctor.consultation_fee, 10)}
              </span>
              <p className="text-xs text-indigo-100 mt-1">Includes consultation and initial health review</p>
            </div>

            <Link to={`/book/${doctor.id}`}>
              <AccessibleButton
                size="lg"
                className="bg-white text-indigo-900 hover:bg-indigo-50 active:bg-indigo-100 font-black shadow-lg"
                icon={Calendar}
              >
                Proceed to Book Appointment
              </AccessibleButton>
            </Link>
          </div>

          {/* Reassurances */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Instant slot reservation with no waiting on hold</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <span>Free cancellation up to 2 hours before scheduled slot</span>
            </div>
          </div>

        </div>

      </div>

    </main>
  );
};

export default DoctorDetailPage;

