import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Volume2, 
  VolumeX,
  ShieldAlert, 
  History, 
  Receipt,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import AccessibleButton from '../components/common/AccessibleButton';
import AccessibleModal from '../components/common/AccessibleModal';

export const PatientDashboardPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { speak, stopSpeaking, isSpeaking, announce } = useAccessibility();

  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetAppointment, setTargetAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.getMyAppointments();
      if (res.success) {
        setAppointments({
          upcoming: res.upcoming || [],
          past: res.past || []
        });
      }
    } catch (err) {
      setError(err.message || 'Could not fetch your appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const handleOpenCancelModal = (appt) => {
    setTargetAppointment(appt);
    setCancelReason('');
    setCancelModalOpen(true);
    announce(`Opened cancellation dialog for appointment with ${appt.doctor_name}`);
  };

  const handleConfirmCancel = async () => {
    if (!targetAppointment) return;

    setCancelLoading(true);
    try {
      const res = await api.cancelAppointment(targetAppointment.appointment_id, cancelReason);
      if (res.success) {
        setCancelModalOpen(false);
        setActionMessage('Appointment successfully cancelled. The time slot has been freed.');
        announce('Appointment successfully cancelled.');
        fetchAppointments();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-slate-700">Loading your profile...</p>
      </main>
    );
  }

  // If not logged in
  if (!isAuthenticated) {
    return (
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-16 text-center focus:outline-none">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            Sign In to View Appointments
          </h1>
          <p className="text-slate-600 text-base mb-8 max-w-md mx-auto">
            Please log in to review your confirmed appointments, cancel visits, or check previous consultation history.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/login?redirect=/dashboard">
              <AccessibleButton size="lg">
                Sign In Now
              </AccessibleButton>
            </Link>
            <Link to="/register">
              <AccessibleButton variant="secondary" size="lg">
                Create Account
              </AccessibleButton>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 focus:outline-none">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md">
            Your Healthcare Space
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-1">
            My Appointments
          </h1>
          <p className="text-slate-600 text-base">
            Welcome back, <strong>{user?.fullName}</strong>. We are here to support your health journey with care and clarity.
          </p>
        </div>

        <div>
          <Link to="/doctors">
            <AccessibleButton size="md" icon={Plus}>
              Book New Appointment
            </AccessibleButton>
          </Link>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div 
          role="status"
          className="mb-8 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActionMessage('')}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-bold text-slate-700">Loading your appointments...</p>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* SECTION 1: UPCOMING APPOINTMENTS */}
          <section aria-labelledby="upcoming-heading">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6 text-indigo-600" aria-hidden="true" />
              <h2 id="upcoming-heading" className="text-2xl font-bold text-slate-900">
                Upcoming Consultations ({appointments.upcoming.length})
              </h2>
            </div>

            {appointments.upcoming.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center">
                <p className="text-slate-600 text-base mb-4">
                  You have no upcoming consultations scheduled at this time.
                </p>
                <Link to="/doctors">
                  <AccessibleButton size="md" icon={Plus}>
                    Browse Doctors to Schedule One
                  </AccessibleButton>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.upcoming.map((appt) => (
                  <article
                    key={appt.appointment_id}
                    className="bg-white rounded-3xl border-2 border-indigo-600/30 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      {/* Status & Date */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{appt.appointment_status}</span>
                        </span>

                        <span className="text-xs font-mono text-slate-400">
                          ID: {appt.appointment_id.slice(0, 8)}...
                        </span>
                      </div>

                      {/* Doctor info */}
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={appt.doctor_image}
                          alt={`Photo of ${appt.doctor_name}`}
                          className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80';
                          }}
                        />
                        <div>
                          <span className="text-xs font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {appt.specialization_name}
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 mt-1">
                            {appt.doctor_name}
                          </h3>
                          <p className="text-xs text-slate-500">{appt.doctor_qualification}</p>
                        </div>
                      </div>

                      {/* Details Box */}
                      <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-sm text-slate-700 mb-4 border border-slate-200">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span>
                            {new Date(appt.slot_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {appt.formatted_start} – {appt.formatted_end}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="truncate">{appt.hospital_clinic_name}</span>
                        </div>
                        {appt.patient_notes && (
                          <div className="pt-2 border-t border-slate-200">
                            {appt.patient_notes.includes('[FAMILY / CAREGIVER PROXY BOOKING]') ? (
                              <div className="bg-indigo-100/70 p-2.5 rounded-xl border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2">
                                <Users className="w-3.5 h-3.5 text-indigo-700 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold block uppercase tracking-wider text-[10px] text-indigo-800">
                                    Caregiver Proxy Booking
                                  </span>
                                  <p className="mt-0.5 font-medium leading-relaxed">
                                    {appt.patient_notes.replace('[FAMILY / CAREGIVER PROXY BOOKING] ', '')}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-600 italic">
                                Notes: "{appt.patient_notes}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions: Cancel */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        Fee: ₹{parseInt(appt.consultation_fee, 10)}
                      </span>

                      <AccessibleButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleOpenCancelModal(appt)}
                        ariaLabel={`Cancel appointment with ${appt.doctor_name}`}
                      >
                        Cancel Appointment
                      </AccessibleButton>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 2: APPOINTMENT HISTORY */}
          {appointments.past.length > 0 && (
            <section aria-labelledby="history-heading" className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-6 h-6 text-slate-500" aria-hidden="true" />
                <h2 id="history-heading" className="text-2xl font-bold text-slate-900">
                  Past & Cancelled Appointments ({appointments.past.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.past.map((appt) => (
                  <article
                    key={appt.appointment_id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        appt.appointment_status === 'CANCELLED' 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {appt.appointment_status}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(appt.slot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{appt.doctor_name}</h3>
                    <p className="text-xs text-slate-500">{appt.specialization_name} • {appt.hospital_clinic_name}</p>
                    
                    {appt.cancellation_reason && (
                      <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl mt-3">
                        Cancellation note: {appt.cancellation_reason}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      {/* CANCELLATION CONFIRMATION MODAL */}
      <AccessibleModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel This Visit?"
        description="Are you sure you wish to cancel? No worries at all if your plans changed — this will gently release the slot so another person who needs care can visit the doctor."
      >
        {targetAppointment && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
              <p className="font-bold text-slate-900">{targetAppointment.doctor_name}</p>
              <p className="text-slate-600">
                {new Date(targetAppointment.slot_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {targetAppointment.formatted_start}
              </p>
            </div>

            <div>
              <label htmlFor="cancel-reason" className="block text-sm font-bold text-slate-900 mb-1">
                A short note if you'd like to share (Optional):
              </label>
              <input
                id="cancel-reason"
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Feeling much better, needed another day, schedule change..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <AccessibleButton
                variant="secondary"
                size="md"
                onClick={() => setCancelModalOpen(false)}
              >
                Keep My Appointment
              </AccessibleButton>

              <AccessibleButton
                variant="danger"
                size="md"
                loading={cancelLoading}
                onClick={handleConfirmCancel}
              >
                Yes, Cancel Visit
              </AccessibleButton>
            </div>
          </div>
        )}
      </AccessibleModal>

    </main>
  );
};

export default PatientDashboardPage;

