import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function runSeed() {
  console.log('🌱 Starting database seeding for CareConnect (Patient-Centered Care)...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Clear existing data
    await client.query('TRUNCATE TABLE appointments, appointment_slots, doctors, user_accessibility_preferences, users, specializations CASCADE;');

    // 2. Insert Specializations with warm, human descriptions
    console.log('Inserting Specializations...');
    const specResult = await client.query(`
      INSERT INTO specializations (name, description, icon_name) VALUES
      ('Senior & Elder Care', 'Warm, respectful care for our beloved parents and grandparents. Unhurried visits focused on comfort, healthy aging, and everyday independence.', 'HeartHandshake'),
      ('Family & General Medicine', 'Your trusted family doctor. Gentle checkups for everyday health, fevers, coughs, and keeping your whole family feeling their best.', 'Stethoscope'),
      ('Heart Wellness', 'Dedicated, caring heart and blood pressure care, helping you and your loved ones stay active, energetic, and worry-free.', 'Heart'),
      ('Eye & Vision Care', 'Gentle, clear vision checkups so you can comfortably read, navigate, and see the precious faces of your loved ones.', 'Eye'),
      ('Bone & Joint Relief', 'Caring support for knee comfort, arthritis, and back ease, helping you walk with balance, confidence, and comfort.', 'Activity'),
      ('Memory & Nerve Care', 'Patient, attentive care for memory, headaches, and balance with physicians who truly take the time to listen.', 'Brain'),
      ('Skin & Allergy Care', 'Kind and soothing care for sensitive skin, rashes, and allergies with simple, easy-to-follow daily routines.', 'ShieldCheck')
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
      ('Care Team Lead', 'admin@careconnect.org', $1, '+91 98765 00000', 'admin')
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

    // 5. Insert Doctors with Warm, Empathetic Bios
    console.log('Inserting Doctors...');
    const doctorData = [
      {
        spec: 'Senior & Elder Care',
        name: 'Dr. Anita Deshmukh',
        qualification: 'MBBS, MD (Senior Health & Wellness)',
        experience: 22,
        hospital: 'CareConnect Senior Wellness Centre, Jaipur',
        fee: 500.00,
        bio: 'Known for her gentle smile and unhurried consultation pace. She takes all the time needed to listen to seniors and their family members, explaining every medication simply with genuine love and care.',
        image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=500&q=80'
      },
      {
        spec: 'Heart Wellness',
        name: 'Dr. Rajesh Sen',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experience: 18,
        hospital: 'Apex Heart & Family Institute, Jaipur',
        fee: 750.00,
        bio: 'A warm-hearted heart specialist who believes in treating patients like his own family. He is passionate about healthy aging and answers every question calmly without any confusing medical jargon.',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80'
      },
      {
        spec: 'Eye & Vision Care',
        name: 'Dr. Sunita Varma',
        qualification: 'MBBS, MS (Ophthalmology)',
        experience: 14,
        hospital: 'Drishti Vision Care & Family Clinic',
        fee: 450.00,
        bio: 'Beloved by patients for her reassuring and calming presence. She treats vision care with immense gentleness so you and your family always feel safe, respected, and completely comfortable.',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80'
      },
      {
        spec: 'Family & General Medicine',
        name: 'Dr. Vikram Malhotra',
        qualification: 'MBBS, MD (Family Medicine)',
        experience: 12,
        hospital: 'City Community Health Center',
        fee: 400.00,
        bio: 'A friendly family physician who listens attentively without glancing at the clock. Known for his kindness, practical advice, and making every visit feel reassuring rather than stressful.',
        image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=80'
      },
      {
        spec: 'Bone & Joint Relief',
        name: 'Dr. Meera Nambiar',
        qualification: 'MBBS, MS (Joint & Mobility Care)',
        experience: 16,
        hospital: 'Metro Bone & Joint Institute',
        fee: 600.00,
        bio: 'Passionate about helping older adults walk pain-free and regain their independence. She designs gentle, encouraging recovery steps with warmth, patience, and compassion.',
        image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=500&q=80'
      },
      {
        spec: 'Memory & Nerve Care',
        name: 'Dr. Arvind Joshi',
        qualification: 'MBBS, MD, DM (Neurology)',
        experience: 20,
        hospital: 'Jaipur Neurological Sciences Hospital',
        fee: 800.00,
        bio: 'A thoughtful physician who understands how worrying memory or balance issues can feel for families. He provides compassionate, step-by-step guidance so you never feel alone.',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80'
      },
      {
        spec: 'Skin & Allergy Care',
        name: 'Dr. Kavita Reddy',
        qualification: 'MBBS, MD (Dermatology)',
        experience: 10,
        hospital: 'Aura Skin & Allergy Care',
        fee: 500.00,
        bio: 'Approachable and warm, Dr. Kavita provides soothing care for sensitive skin, rashes, and allergies with simple, easy-to-follow daily routines that bring relief.',
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

    // 7. Seed Sample Appointments for Ramesh
    console.log('Seeding demo patient appointments...');
    if (bookedSlotSample1) {
      await client.query(`
        UPDATE appointment_slots SET status = 'BOOKED' WHERE id = $1;
      `, [bookedSlotSample1.id]);

      await client.query(`
        INSERT INTO appointments (user_id, doctor_id, slot_id, status, patient_notes)
        VALUES ($1, $2, $3, 'CONFIRMED', 'Routine wellness checkup and blood pressure review with Dr. Anita.');
      `, [rameshId, bookedSlotSample1.doctor_id, bookedSlotSample1.id]);
    }

    if (bookedSlotSample2) {
      await client.query(`
        UPDATE appointment_slots SET status = 'BOOKED' WHERE id = $1;
      `, [bookedSlotSample2.id]);

      await client.query(`
        INSERT INTO appointments (user_id, doctor_id, slot_id, status, patient_notes)
        VALUES ($1, $2, $3, 'CONFIRMED', 'Checking in about mild tiredness after walking.');
      `, [rameshId, bookedSlotSample2.doctor_id, bookedSlotSample2.id]);
    }

    await client.query('COMMIT');
    console.log('🎉 CareConnect database successfully seeded with compassionate care data!');
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
