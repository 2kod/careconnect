import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Calendar, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Volume2
} from 'lucide-react';
import { api } from '../services/api';
import AccessibleButton from '../components/common/AccessibleButton';
import { useAccessibility } from '../context/AccessibilityContext';

export const DoctorListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpec = searchParams.get('spec') || '';
  const initialSearch = searchParams.get('q') || '';

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState(initialSpec);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const { speak, announce } = useAccessibility();

  // Load Specializations once
  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const res = await api.getSpecializations();
        if (res.success) {
          setSpecializations(res.data);
        }
      } catch (err) {
        console.error('Failed to load specializations:', err);
      }
    };
    loadSpecs();
  }, []);

  // Fetch Doctors with search and filter
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedSpec) params.specializationId = selectedSpec;
        if (searchTerm.trim()) params.search = searchTerm.trim();

        const res = await api.getDoctors(params);
        if (res.success) {
          setDoctors(res.data);
          announce(`Found ${res.count} available doctors.`);
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedSpec, searchTerm]);

  // Synchronize URL search params
  const handleSpecChange = (specId) => {
    setSelectedSpec(specId);
    const newParams = new URLSearchParams(searchParams);
    if (specId) {
      newParams.set('spec', specId);
    } else {
      newParams.delete('spec');
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSelectedSpec('');
    setSearchTerm('');
    setSearchParams({});
    announce('Search and filters cleared.');
  };

  const handleReadDoctorList = () => {
    if (doctors.length === 0) {
      speak('No doctors found matching your current filter. Please clear filters to see all doctors.');
      return;
    }
    const doctorNames = doctors
      .slice(0, 4)
      .map(d => `${d.full_name}, specialist in ${d.specialization_name} with ${d.experience_years} years of experience`)
      .join('. ');
    speak(`Showing ${doctors.length} doctors. Here are the first few: ${doctorNames}.`);
  };

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 focus:outline-none">
      
      {/* Title & Top Audio Assist */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Meet Our Caring Doctors
          </h1>
          <p className="text-slate-600 text-lg mt-1">
            Choose a doctor who takes the time to listen to your health concerns. Transparent clinic timings and honest fees upfront.
          </p>
        </div>

        <AccessibleButton
          variant="outline"
          size="md"
          icon={Volume2}
          onClick={handleReadDoctorList}
          ariaLabel="Read list of available doctors aloud"
        >
          Listen to Doctor Names
        </AccessibleButton>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10 space-y-6">
        
        {/* Search Input Bar */}
        <div>
          <label htmlFor="doctor-search" className="block text-sm font-bold text-slate-900 mb-2">
            Search by doctor name, care area, or clinic:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" aria-hidden="true" />
            </div>
            <input
              id="doctor-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Dr. Anita, Senior Care, Heart, Bone, Jaipur..."
              className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 text-base focus:bg-white focus:border-indigo-600 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search text"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Specialization Filter Pills */}
        <div>
          <span className="block text-sm font-bold text-slate-900 mb-2" id="spec-filters-label">
            Filter by care department:
          </span>
          <div 
            className="flex flex-wrap gap-2" 
            role="group" 
            aria-labelledby="spec-filters-label"
          >
            <button
              type="button"
              onClick={() => handleSpecChange('')}
              aria-pressed={!selectedSpec}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                !selectedSpec
                  ? 'bg-indigo-700 text-white border-indigo-700 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              All Doctors ({doctors.length})
            </button>

            {specializations.map((spec) => {
              const isSelected = selectedSpec === spec.id;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => handleSpecChange(isSelected ? '' : spec.id)}
                  aria-pressed={isSelected}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                    isSelected
                      ? 'bg-indigo-700 text-white border-indigo-700 shadow-sm'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {spec.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Display & Clear Action */}
        {(selectedSpec || searchTerm) && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sm">
            <span className="text-slate-600">
              Showing filtered results
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-indigo-700 font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}

      </div>

      {/* Results Section */}
      {loading ? (
        <div className="text-center py-20" role="status" aria-label="Loading available doctors">
          <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-lg font-bold text-slate-700">Finding healthcare specialists...</p>
        </div>
      ) : doctors.length === 0 ? (
        /* Helpful Empty State */
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No doctors matched your criteria</h2>
          <p className="text-slate-600 mb-6">
            Try checking for spelling variations or clear the selected specialty filter to see all our available physicians.
          </p>
          <AccessibleButton onClick={handleClearFilters}>
            Show All Available Doctors
          </AccessibleButton>
        </div>
      ) : (
        /* Doctor Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <article
              key={doctor.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Doctor Header Banner with Photo */}
                <div className="p-6 flex items-start gap-4 border-b border-slate-100">
                  <img
                    src={doctor.image_url}
                    alt={`Photo of ${doctor.full_name}`}
                    className="w-20 h-20 rounded-2xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80';
                    }}
                  />
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-1">
                      {doctor.specialization_name}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 leading-snug">
                      {doctor.full_name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {doctor.qualification}
                    </p>
                  </div>
                </div>

                {/* Doctor Bio and Highlights */}
                <div className="p-6 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Briefcase className="w-4 h-4 text-indigo-600 flex-shrink-0" aria-hidden="true" />
                    <span><strong>{doctor.experience_years} years</strong> caring for patients</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{doctor.hospital_clinic_name}</span>
                  </div>

                  <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed pt-2 border-t border-slate-100">
                    {doctor.bio}
                  </p>
                </div>
              </div>

              {/* Bottom Consultation Fee & Booking CTA */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block">Consultation Fee</span>
                  <span className="text-xl font-black text-slate-900">
                    ₹{parseInt(doctor.consultation_fee, 10)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/doctors/${doctor.id}`}>
                    <AccessibleButton variant="secondary" size="sm">
                      Details
                    </AccessibleButton>
                  </Link>

                  <Link to={`/book/${doctor.id}`}>
                    <AccessibleButton variant="primary" size="sm" icon={Calendar}>
                      Book Visit
                    </AccessibleButton>
                  </Link>
                </div>
              </div>

            </article>
          ))}
        </div>
      )}

    </main>
  );
};

export default DoctorListPage;

