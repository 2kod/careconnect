-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if resetting (in dependency order)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS appointment_slots CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS user_accessibility_preferences CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS specializations CASCADE;

-- 1. Specializations Table
CREATE TABLE specializations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Stethoscope',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Accessibility Preferences Table
CREATE TABLE user_accessibility_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    font_size VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (font_size IN ('normal', 'large', 'x-large')),
    high_contrast BOOLEAN NOT NULL DEFAULT FALSE,
    reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
    screen_reader_hints BOOLEAN NOT NULL DEFAULT TRUE,
    voice_guidance BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Doctors Table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    specialization_id UUID NOT NULL REFERENCES specializations(id) ON DELETE RESTRICT,
    full_name VARCHAR(150) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
    hospital_clinic_name VARCHAR(200) NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL CHECK (consultation_fee >= 0),
    bio TEXT,
    image_url VARCHAR(500),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Appointment Slots Table
CREATE TABLE appointment_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'BOOKED', 'BLOCKED')),
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT slot_time_order CHECK (end_time > start_time),
    CONSTRAINT unique_doctor_slot_time UNIQUE (doctor_id, slot_date, start_time)
);

-- 6. Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    slot_id UUID NOT NULL UNIQUE REFERENCES appointment_slots(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'COMPLETED', 'CANCELLED')),
    patient_notes TEXT,
    booked_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance & responsive UI query paths
CREATE INDEX idx_doctors_specialization ON doctors(specialization_id);
CREATE INDEX idx_slots_doctor_date ON appointment_slots(doctor_id, slot_date, status);
CREATE INDEX idx_appointments_user ON appointments(user_id, status);

