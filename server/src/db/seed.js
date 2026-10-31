import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function runSeed() {
  console.log('🌱 Starting database seeding for CareConnect (HCI Demo)...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Clear existing data
    await client.query('TRUNCATE TABLE appointments, appointment_slots, doctors, user_accessibility_preferences, users, specializations CASCADE;');

    // 2. Insert Specializations
    console.log('Inserting Specializations...');
    const specResult = await client.query(`
      INSERT INTO specializations (name, description, icon_name) VALUES
      ('General Medicine', 'Primary care, preventive health, fever, routine checkups, and chronic disease management.', 'Stethoscope'),
      ('Geriatric Medicine', 'Specialized care for older adults, focusing on mobility, memory, healthy aging, and longevity.', 'HeartHandshake'),
      ('Cardiology', 'Heart health, blood pressure management, ECG review, and cardiovascular wellness.', 'Heart'),
      ('Ophthalmology', 'Comprehensive eye examinations, vision care, cataract evaluation, and glaucoma screening.', 'Eye'),
      ('Orthopedics', 'Bone, joint, spine, arthritis, mobility support, and physical rehabilitation.', 'Activity'),
      ('Neurology', 'Brain and nervous system health, memory support, headaches, and tremors.', 'Brain'),
      ('Dermatology', 'Skin health, allergies, rashes, lesion screenings, and dermatological care.', 'ShieldCheck')
      RETURNING id, name;
    `);

    const specMap = {};
    specResult.rows.forEach(r => {
      specMap[r.name] = r.id;
    });

    // 3. Insert Demo Users
    console.log('Inserting Demo Patient and Users...');
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const userResult = await client.query(`
      INSERT INTO users (full_name, email, password_hash, phone, role) VALUES
      ('Ramesh Sharma', 'ramesh@careconnect.org', $1, '+91 98765 43210', 'patient'),
      ('Priya Patel', 'priya@careconnect.org', $1, '+91 98765 43211', 'patient'),
      ('Dr. Admin', 'admin@careconnect.org', $1, '+91 98765 00000', 'admin')
      RETURNING id, full_name, email;
    `, [passwordHash]);

    const rameshId = userResult.rows[0].id;
    const priyaId = userResult.rows[1].id;

    // 4. Insert User Accessibility Preferences
    await client.query(`
      INSERT INTO user_accessibility_preferences (user_id, font_size, high_contrast, reduced_motion, screen_reader_hints, voice_guidance) VALUES
      ($1, 'large', false, false, true, true),
      ($2, 'normal', true, false, true, false);
    `, [rameshId, priyaId]);

    // 5. Insert Doctors
    console.log('Inserting Fictional Doctors...');
    const doctorData = [
      {
        spec: 'Geriatric Medicine',
        name: 'Dr. Anita Deshmukh',
        qualification: 'MBBS, MD (Geriatric Medicine, AIIMS)',
        experience: 22,
        hospital: 'CareConnect Senior Wellness Centre, Jaipur',
        fee: 500.00,
        bio: 'Dedicated to compassionate, patient-centered care for seniors. Specializes in multi-morbidity management, gentle consultation pace, and clear medication guidance.',
        image: 'https://images.unsplash.com/photo-1594824813637-2804b40700d3?auto=format&fit=crop&w=500&q=80'
      },
      {
        spec: 'Cardiology',
        name: 'Dr. Rajesh Sen',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: 18,
        hospital: 'Apex Heart & Vascular Institute, Jaipur',
        fee: 750.00,
        bio: 'Senior consultant cardiologist passionate about hypertension management, preventive cardiovascular health, and elderly heart wellness.',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80'
      },
      {
        spec: 'Ophthalmology',
        name: 'Dr. Sunita Varma',
        qualification: 'MBBS, MS (Ophthalmology)',
        experience: 14,
        hospital: 'Drishti Vision Care & Retina Clinic',
        fee: 450.00,
        bio: 'Expert in low-vision assistance, cataract screening, diabetic retinopathy, and accessible visual ergonomics for digital workers.',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80'
      },
      {
        spec: 'General Medicine',
        name: 'Dr. Vikram Malhotra',
        qualification: 'MBBS, MD (General Medicine)',
        experience: 12,
        hospital: 'City Community Health Center',
        fee: 400.00,
        bio: 'Holistic primary care physician known for taking the time to listen, explain medical concepts in plain everyday language, and coordinate comprehensive care.',
        image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=80'
      },
      {
        spec: 'Orthopedics',
        name: 'Dr. Meera Nambiar',
        qualification: 'MBBS, MS (Orthopedics), Fellowship in Joint Care',
        experience: 16,
        hospital: 'Metro Bone & Joint Institute',
        fee: 600.00,
        bio: 'Specialist in arthritis, knee and hip preservation, bone density, fall prevention in senior citizens, and gentle physical therapy plans.',
        image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=500&q=80'
      },
      {
        spec: 'Neurology',
        name: 'Dr. Arvind Joshi',
        qualification: 'MBBS, MD, DM (Neurology)',
        experience: 20,
        hospital: 'Jaipur Neurological Sciences Hospital',
        fee: 800.00,
        bio: 'Comprehensive neurological consultation focusing on neuropathy, memory retention, balance disorders, and patient-first neurological care.',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80'
      },
      {
        spec: 'Dermatology',
        name: 'Dr. Kavita Reddy',
        qualification: 'MBBS, MD (Dermatology)',
        experience: 10,
        hospital: 'Aura Skin & Allergy Care',
        fee: 500.00,
        bio: 'Focused on sensitive skin treatments, age-related skin conditions, rash diagnosis, and straightforward, easy-to-follow care regimens.',
        image: 'https://images.unsplash.com/photo-1594824813710-8549e5d4cb05?auto=format&fit=crop&w=500&q=80'
      }
    ];

    const insertedDoctors = [];
    for (const doc of doctorData) {
      const res = await client.query(`
        INSERT INTO doctors (specialization_id, full_name, qualification, experience_years, hospital_clinic_name, consultation_fee, bio, image_url, is_available)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
        RETURNING id, full_name;
      `, [
        specMap[doc.spec],
        doc.name,
        doc.qualification,
        doc.experience,
        doc.hospital,
        doc.fee,
        doc.bio,
        doc.image
      ]);
      insertedDoctors.push(res.rows[0]);
    }

    // 6. Generate appointment slots for next 14 days
    console.log('Generating appointment slots for the next 14 days...');
    const slotTimes = [
      { start: '09:00:00', end: '09:30:00' },
      { start: '09:30:00', end: '10:00:00' },
      { start: '10:00:00', end: '10:30:00' },
      { start: '10:30:00', end: '11:00:00' },
      { start: '11:00:00', end: '11:30:00' },
      { start: '11:30:00', end: '12:00:00' },
      { start: '14:00:00', end: '14:30:00' },
      { start: '14:30:00', end: '15:00:00' },
      { start: '15:00:00', end: '15:30:00' },
      { start: '15:30:00', end: '16:00:00' },
      { start: '16:00:00', end: '16:30:00' },
      { start: '16:30:00', end: '17:00:00' },
    ];

    const today = new Date();
    let bookedSlotSample1 = null;
    let bookedSlotSample2 = null;

    for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
      const dateObj = new Date(today);
      dateObj.setDate(today.getDate() + dayOffset);
      const dateString = dateObj.toISOString().split('T')[0];

      for (const doc of insertedDoctors) {
        for (let i = 0; i < slotTimes.length; i++) {
          const t = slotTimes[i];
          const slotRes = await client.query(`
            INSERT INTO appointment_slots (doctor_id, slot_date, start_time, end_time, status)
            VALUES ($1, $2, $3, $4, 'AVAILABLE')
            RETURNING id, slot_date, start_time, doctor_id;
          `, [doc.id, dateString, t.start, t.end]);

          // Save references for sample patient bookings
          if (dayOffset === 2 && i === 2 && doc.id === insertedDoctors[0].id) {
            bookedSlotSample1 = slotRes.rows[0];
          }
          if (dayOffset === 5 && i === 4 && doc.id === insertedDoctors[1].id) {
            bookedSlotSample2 = slotRes.rows[0];
          }
        }
      }
    }

    // 7. Seed Sample Appointments for Ramesh to demonstrate the Dashboard
    console.log('Seeding demo patient appointments...');
    if (bookedSlotSample1) {
      await client.query(`
        UPDATE appointment_slots SET status = 'BOOKED' WHERE id = $1;
      `, [bookedSlotSample1.id]);

      await client.query(`
        INSERT INTO appointments (user_id, doctor_id, slot_id, status, patient_notes)
        VALUES ($1, $2, $3, 'CONFIRMED', 'Routine elderly wellness follow-up and blood pressure review.');
      `, [rameshId, bookedSlotSample1.doctor_id, bookedSlotSample1.id]);
    }

    if (bookedSlotSample2) {
      await client.query(`
        UPDATE appointment_slots SET status = 'BOOKED' WHERE id = $1;
      `, [bookedSlotSample2.id]);

      await client.query(`
        INSERT INTO appointments (user_id, doctor_id, slot_id, status, patient_notes)
        VALUES ($1, $2, $3, 'CONFIRMED', 'Mild chest tightness after walking upstairs.');
      `, [rameshId, bookedSlotSample2.doctor_id, bookedSlotSample2.id]);
    }

    await client.query('COMMIT');
    console.log('🎉 CareConnect database successfully seeded!');
    console.log('👉 Demo patient login: ramesh@careconnect.org / Password123!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
