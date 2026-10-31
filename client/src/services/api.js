// Clean API service client with automatic JWT token attachment and error extraction
const BASE_URL = '/api';

export const getAuthToken = () => {
  return localStorage.getItem('careconnect_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('careconnect_token', token);
  } else {
    localStorage.removeItem('careconnect_token');
  }
};

export async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'A problem occurred with your request.');
    error.status = response.status;
    error.code = data.code;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),

  // Doctors & Specializations
  getSpecializations: () => request('/doctors/specializations'),
  getDoctors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctors${query ? `?${query}` : ''}`);
  },
  getDoctorById: (id) => request(`/doctors/${id}`),
  getDoctorSlots: (doctorId, date) => request(`/doctors/${doctorId}/slots?date=${date}`),

  // Appointments
  createAppointment: (payload) => request('/appointments', { method: 'POST', body: JSON.stringify(payload) }),
  getMyAppointments: () => request('/appointments/my'),
  getAppointmentById: (id) => request(`/appointments/${id}`),
  cancelAppointment: (id, reason) => request(`/appointments/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) }),

  // User Preferences
  getPreferences: () => request('/users/preferences'),
  updatePreferences: (prefs) => request('/users/preferences', { method: 'PUT', body: JSON.stringify(prefs) }),
};

