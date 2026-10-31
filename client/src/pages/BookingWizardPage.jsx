import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  MapPin, 
  Receipt, 
  Sun, 
  Moon, 
  Volume2, 
  Printer, 
  Download,
  CalendarPlus
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import BookingStepper from '../components/booking/BookingStepper';
import AccessibleButton from '../components/common/AccessibleButton';

export const BookingWizardPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { speak, announce } = useAccessibility();

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  // Date selection state
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  // Available dates (next 10 days)
  const [availableDates, setAvailableDates] = useState([]);

  // Slots state
  const [slotsData, setSlotsData] = useState({ morning: [], afternoon: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Patient notes
  const [patientNotes, setPatientNotes] = useState('');

  // Booking result state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // 1. Generate available date range (Next 10 days)
  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = d.getDate();

      dates.push({
        iso,
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayName,
        fullDayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
        formatted: `${monthName} ${dayNum}`,
        isToday: i === 0
      });
    }
    setAvailableDates(dates);
  }, []);

  // 2. Fetch Doctor Profile
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.getDoctorById(doctorId);
        if (res.success) {
          setDoctor(res.data);
        }
      } catch (err) {
        setBookingError('Unable to load doctor information.');
      } finally {
        setLoadingDoctor(false);
      }
    };
    fetchDoc();
  }, [doctorId]);

  // 3. Fetch Slots when Date changes
  useEffect(() => {
    if (!doctorId || !selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await api.getDoctorSlots(doctorId, selectedDate);
        if (res.success) {
          setSlotsData(res.grouped);
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [doctorId, selectedDate]);

  // Handle Stepper progression
  const handleProceedToSlot = () => {
    setCurrentStep(2);
    announce('Step 2: Choose your preferred time slot.');
  };

  const handleProceedToReview = () => {
    if (!selectedSlot) {
      announce('Please select a time slot first.');
      return;
    }
    setCurrentStep(3);
    announce('Step 3: Review your appointment details.');
  };

  const handleConfirmAppointment = async () => {
    if (!isAuthenticated) {
      // Save pending booking details in sessionStorage and redirect to login
      sessionStorage.setItem('careconnect_pending_booking', JSON.stringify({
        doctorId,
        slotId: selectedSlot.id,
        patientNotes
      }));
      navigate('/login?redirect=' + encodeURIComponent(`/book/${doctorId}`));
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      const res = await api.createAppointment({
        slotId: selectedSlot.id,
        doctorId,
        patientNotes
      });

      if (res.success) {
        setConfirmedBooking(res.data);
        setCurrentStep(4);
        announce('Appointment successfully confirmed! Booking reference generated.');
        speak(
          `Congratulations! Your appointment with ${doctor.full_name} is confirmed for ${selectedDate} at ${selectedSlot.formattedStart}.`
        );
      }
    } catch (err) {
      // Concurrency conflict check or error
      setBookingError(err.message || 'Booking conflict encountered.');
      announce(`Error: ${err.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loadingDoctor) {
    return (
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-bold text-slate-700">Loading appointment booking system...</p>
      </main>
    );
  }

  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 focus:outline-none">
      
      {/* Top Breadcrumb & Doctor Bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          to="/doctors" 
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-indigo-700 font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Doctor</span>
        </Link>

        {doctor && (
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Consulting with</span>
            <span className="text-sm font-bold text-slate-900">{doctor.full_name} ({doctor.specialization_name})</span>
          </div>
        )}
      </div>

      {/* Visual Stepper */}
      <BookingStepper currentStep={currentStep} />

      {/* Conflict / Error Banner */}
      {bookingError && (
        <div 
          role="alert"
          className="mb-8 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3"
        >
          <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-base">Booking Conflict or Error</h2>
            <p className="text-sm mt-1">{bookingError}</p>
            {currentStep === 3 && (
              <button
                type="button"
                onClick={() => { setBookingError(''); setCurrentStep(2); }}
                className="mt-3 text-sm font-bold underline text-rose-800 hover:text-rose-950"
              >
                ← Return to step 2 to choose another time slot
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 1: SELECT DATE */}
      {currentStep === 1 && (
        <section aria-labelledby="step1-heading" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm animate-fade-in">
          <div className="mb-6">
            <h1 id="step1-heading" className="text-2xl sm:text-3xl font-black text-slate-900">
              Step 1: Choose Your Preferred Date
            </h1>
            <p className="text-slate-600 text-base mt-1">
              Select any of the upcoming days below to check available consultation hours.
            </p>
          </div>

          {/* Date Picker Grid */}
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8"
            role="radiogroup"
            aria-label="Available appointment dates"
          >
            {availableDates.map((item) => {
              const isSelected = selectedDate === item.iso;
              return (
                <button
                  key={item.iso}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedDate(item.iso)}
                  className={`
                    p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center min-h-[96px]
                    focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500
                    ${isSelected 
                      ? 'bg-indigo-700 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/20' 
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                    }
                  `}
                >
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {item.dayName}
                  </span>
                  <span className="text-lg font-black mt-1">
                    {item.formatted}
                  </span>
                  {item.isToday && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${isSelected ? 'bg-indigo-800 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Step 1 Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <Link to="/doctors">
              <AccessibleButton variant="secondary" size="md">
                Cancel
              </AccessibleButton>
            </Link>

            <AccessibleButton 
              size="lg" 
              onClick={handleProceedToSlot}
              icon={ArrowRight}
            >
              Next: Select Time Slot
            </AccessibleButton>
          </div>
        </section>
      )}

      {/* STEP 2: SELECT TIME SLOT */}
      {currentStep === 2 && (
        <section aria-labelledby="step2-heading" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm animate-fade-in">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 id="step2-heading" className="text-2xl sm:text-3xl font-black text-slate-900">
                Step 2: Choose a Time Slot
              </h1>
              <p className="text-slate-600 text-base mt-1">
                Showing available timings for <strong>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-indigo-700 font-bold hover:underline text-sm self-start sm:self-auto"
            >
              Change Date
            </button>
          </div>

          {loadingSlots ? (
            <div className="py-16 text-center">
              <div className="inline-block w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-slate-600 font-bold">Checking doctor schedule...</p>
            </div>
          ) : (
            <div className="space-y-8 mb-8">
              
              {/* Morning Slots */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-500" aria-hidden="true" />
                  <span>Morning Consultations (9:00 AM – 12:00 PM)</span>
                </h2>
                
                {slotsData.morning?.length === 0 ? (
                  <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">No morning slots available on this date.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" role="radiogroup" aria-label="Morning slots">
                    {slotsData.morning.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`
                            p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between min-h-[58px]
                            focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500
                            ${!slot.isAvailable 
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                              : isSelected
                                ? 'bg-indigo-700 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/20'
                                : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                            }
                          `}
                        >
                          <span className="font-bold text-base">{slot.formattedStart}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            !slot.isAvailable 
                              ? 'bg-slate-200 text-slate-500' 
                              : isSelected 
                                ? 'bg-indigo-800 text-indigo-100' 
                                : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {slot.isAvailable ? 'Available' : 'Booked'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Afternoon Slots */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                  <span>Afternoon Consultations (2:00 PM – 5:00 PM)</span>
                </h2>

                {slotsData.afternoon?.length === 0 ? (
                  <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">No afternoon slots available on this date.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" role="radiogroup" aria-label="Afternoon slots">
                    {slotsData.afternoon.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`
                            p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between min-h-[58px]
                            focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500
                            ${!slot.isAvailable 
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                              : isSelected
                                ? 'bg-indigo-700 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/20'
                                : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                            }
                          `}
                        >
                          <span className="font-bold text-base">{slot.formattedStart}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            !slot.isAvailable 
                              ? 'bg-slate-200 text-slate-500' 
                              : isSelected 
                                ? 'bg-indigo-800 text-indigo-100' 
                                : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {slot.isAvailable ? 'Available' : 'Booked'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Step 2 Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <AccessibleButton 
              variant="secondary" 
              size="md" 
              onClick={() => setCurrentStep(1)}
              icon={ArrowLeft}
            >
              Back to Dates
            </AccessibleButton>

            <AccessibleButton 
              size="lg" 
              disabled={!selectedSlot} 
              onClick={handleProceedToReview}
              icon={ArrowRight}
            >
              Next: Review Details
            </AccessibleButton>
          </div>
        </section>
      )}

      {/* STEP 3: REVIEW DETAILS & CONFIRM */}
      {currentStep === 3 && (
        <section aria-labelledby="step3-heading" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm animate-fade-in">
          <div className="mb-6">
            <h1 id="step3-heading" className="text-2xl sm:text-3xl font-black text-slate-900">
              Step 3: Review & Confirm Your Appointment
            </h1>
            <p className="text-slate-600 text-base mt-1">
              Please check your appointment information below before completing your booking.
            </p>
          </div>

          {/* Summary Card (HCI Principle: Recognition rather than Recall) */}
          <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200 space-y-6 mb-8">
            
            {/* Doctor info */}
            <div className="flex items-start gap-4">
              <img
                src={doctor?.image_url}
                alt={`Photo of ${doctor?.full_name}`}
                className="w-16 h-16 rounded-2xl object-cover bg-white border border-slate-200 flex-shrink-0"
              />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  {doctor?.specialization_name}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{doctor?.full_name}</h2>
                <p className="text-sm text-slate-600">{doctor?.qualification}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  {doctor?.hospital_clinic_name}
                </p>
              </div>
            </div>

            {/* Date and Time pill */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Date of Consultation</span>
                <span className="text-base font-bold text-slate-900 flex items-center gap-2 mt-1">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Time Slot</span>
                <span className="text-base font-bold text-slate-900 flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  {selectedSlot?.formattedStart} – {selectedSlot?.formattedEnd}
                </span>
              </div>
            </div>

            {/* Fee */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div>
                <span className="text-sm font-semibold text-slate-700">Total Consultation Fee:</span>
                <p className="text-xs text-slate-500">Payable at clinic reception</p>
              </div>
              <span className="text-2xl font-black text-slate-900">
                ₹{parseInt(doctor?.consultation_fee, 10)}
              </span>
            </div>

          </div>

          {/* Optional Health Notes */}
          <div className="mb-8">
            <label htmlFor="patient-notes" className="block text-sm font-bold text-slate-900 mb-2">
              Reason for Visit or Symptoms (Optional):
            </label>
            <textarea
              id="patient-notes"
              rows="3"
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              placeholder="e.g. Follow-up for knee discomfort, routine checkup, blood pressure prescription renewal..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 text-base focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">
              This helps the doctor prepare for your consultation.
            </p>
          </div>

          {/* Auth check message if user not logged in */}
          {!isAuthenticated && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-sm flex items-start gap-3">
              <User className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Signing in is required to confirm:</span>
                <p className="mt-0.5">Clicking "Confirm" will prompt you to quickly sign in or create an account. Your selected slot will be held.</p>
              </div>
            </div>
          )}

          {/* Step 3 Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <AccessibleButton 
              variant="secondary" 
              size="md" 
              onClick={() => setCurrentStep(2)}
              icon={ArrowLeft}
            >
              Back to Time Slots
            </AccessibleButton>

            <AccessibleButton 
              size="lg" 
              loading={bookingLoading}
              onClick={handleConfirmAppointment}
              icon={CheckCircle2}
            >
              {isAuthenticated ? 'Confirm & Book Appointment' : 'Sign In & Confirm Booking'}
            </AccessibleButton>
          </div>
        </section>
      )}

      {/* STEP 4: CONFIRMED & RECEIPT */}
      {currentStep === 4 && confirmedBooking && (
        <section aria-labelledby="step4-heading" className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-lg text-center animate-fade-in">
          
          {/* Success Check Badge */}
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" aria-hidden="true" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            Appointment Confirmed
          </span>

          <h1 id="step4-heading" className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
            You are all set, {confirmedBooking.patient_name}!
          </h1>

          <p className="text-slate-600 text-lg max-w-xl mx-auto mb-8">
            Your appointment has been successfully scheduled. A confirmation has been registered to your patient profile.
          </p>

          {/* Receipt Print Area */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto text-left mb-8 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Booking Reference</span>
                <p className="text-base font-mono font-bold text-indigo-800">{confirmedBooking.appointment_id}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg uppercase">
                {confirmedBooking.appointment_status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Doctor</span>
                <span className="font-bold text-slate-900">{confirmedBooking.doctor_name}</span>
                <p className="text-xs text-slate-600">{confirmedBooking.specialization_name}</p>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Clinic / Hospital</span>
                <span className="font-bold text-slate-900">{confirmedBooking.hospital_clinic_name}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Date</span>
                <span className="font-bold text-slate-900">
                  {new Date(confirmedBooking.slot_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Time</span>
                <span className="font-bold text-slate-900">
                  {confirmedBooking.formatted_start} – {confirmedBooking.formatted_end}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
              <span className="text-slate-600">Consultation Fee</span>
              <span className="text-lg font-black text-slate-900">₹{parseInt(confirmedBooking.consultation_fee, 10)}</span>
            </div>
          </div>

          {/* Actions: Print & View Dashboard */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <AccessibleButton 
              variant="outline" 
              size="md" 
              icon={Printer}
              onClick={handlePrint}
            >
              Print Receipt
            </AccessibleButton>

            <Link to="/dashboard">
              <AccessibleButton size="md" icon={CalendarIcon}>
                Go to My Appointments Dashboard
              </AccessibleButton>
            </Link>
          </div>

        </section>
      )}

    </main>
  );
};

export default BookingWizardPage;

