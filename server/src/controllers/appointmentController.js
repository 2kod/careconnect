import pool from '../config/database.js';

export const createAppointment = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const { slotId, doctorId, patientNotes } = req.body;

    if (!slotId || !doctorId) {
      return res.status(400).json({
        success: false,
        error: 'Slot and doctor identifiers are required to confirm booking.',
        code: 'VALIDATION_FAILED'
      });
    }

    // Begin ACID transaction
    await client.query('BEGIN');

    // Acquire row-level lock on the target appointment slot
    const slotCheck = await client.query(`
      SELECT id, doctor_id, slot_date, start_time, end_time, status 
      FROM appointment_slots 
      WHERE id = $1 AND doctor_id = $2
      FOR UPDATE;
    `, [slotId, doctorId]);

    if (slotCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'The requested appointment slot does not exist or has been removed.',
        code: 'SLOT_NOT_FOUND'
      });
    }

    const slot = slotCheck.rows[0];

    // Concurrency check: If already reserved or booked, fail with 409 Conflict
    if (slot.status !== 'AVAILABLE') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        error: 'This time slot was just booked by another patient. Please choose an adjacent time or date.',
        code: 'SLOT_ALREADY_BOOKED'
      });
    }

    // Mark slot as booked
    await client.query(`
      UPDATE appointment_slots 
      SET status = 'BOOKED' 
      WHERE id = $1;
    `, [slotId]);

    // Insert appointment record
    const apptResult = await client.query(`
      INSERT INTO appointments (user_id, doctor_id, slot_id, status, patient_notes)
      VALUES ($1, $2, $3, 'CONFIRMED', $4)
      RETURNING id, user_id, doctor_id, slot_id, status, patient_notes, booked_at;
    `, [userId, doctorId, slotId, patientNotes ? patientNotes.trim() : null]);

    const appointment = apptResult.rows[0];

    // Fetch full enriched receipt data for immediate confirmation display
    const detailsResult = await client.query(`
      SELECT 
        a.id as appointment_id,
        a.status as appointment_status,
        a.patient_notes,
        a.booked_at,
        d.id as doctor_id,
        d.full_name as doctor_name,
        d.qualification as doctor_qualification,
        d.hospital_clinic_name,
        d.consultation_fee,
        d.image_url as doctor_image,
        s.name as specialization_name,
        sl.id as slot_id,
        sl.slot_date,
        TO_CHAR(sl.start_time, 'HH12:MI AM') as formatted_start,
        TO_CHAR(sl.end_time, 'HH12:MI AM') as formatted_end,
        u.full_name as patient_name,
        u.email as patient_email,
        u.phone as patient_phone
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN specializations s ON d.specialization_id = s.id
      JOIN appointment_slots sl ON a.slot_id = sl.id
      JOIN users u ON a.user_id = u.id
      WHERE a.id = $1;
    `, [appointment.id]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Appointment confirmed successfully! Your healthcare provider has been scheduled.',
      data: detailsResult.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

export const getMyAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await clientOrPoolQuery(`
      SELECT 
        a.id as appointment_id,
        a.status as appointment_status,
        a.patient_notes,
        a.booked_at,
        a.cancelled_at,
        a.cancellation_reason,
        d.id as doctor_id,
        d.full_name as doctor_name,
        d.qualification as doctor_qualification,
        d.hospital_clinic_name,
        d.consultation_fee,
        d.image_url as doctor_image,
        s.name as specialization_name,
        sl.id as slot_id,
        sl.slot_date,
        TO_CHAR(sl.start_time, 'HH12:MI AM') as formatted_start,
        TO_CHAR(sl.end_time, 'HH12:MI AM') as formatted_end,
        sl.start_time,
        CASE 
          WHEN sl.slot_date >= CURRENT_DATE AND a.status = 'CONFIRMED' THEN true
          ELSE false
        END as is_upcoming
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN specializations s ON d.specialization_id = s.id
      JOIN appointment_slots sl ON a.slot_id = sl.id
      WHERE a.user_id = $1
      ORDER BY sl.slot_date DESC, sl.start_time DESC;
    `, [userId]);

    const upcoming = [];
    const past = [];

    result.rows.forEach(item => {
      if (item.is_upcoming) {
        upcoming.push(item);
      } else {
        past.push(item);
      }
    });

    res.status(200).json({
      success: true,
      totalCount: result.rows.length,
      upcoming,
      past,
      all: result.rows
    });
  } catch (err) {
    next(err);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        a.id as appointment_id,
        a.status as appointment_status,
        a.patient_notes,
        a.booked_at,
        a.cancelled_at,
        a.cancellation_reason,
        d.id as doctor_id,
        d.full_name as doctor_name,
        d.qualification as doctor_qualification,
        d.hospital_clinic_name,
        d.consultation_fee,
        d.image_url as doctor_image,
        s.name as specialization_name,
        sl.id as slot_id,
        sl.slot_date,
        TO_CHAR(sl.start_time, 'HH12:MI AM') as formatted_start,
        TO_CHAR(sl.end_time, 'HH12:MI AM') as formatted_end,
        u.full_name as patient_name,
        u.email as patient_email,
        u.phone as patient_phone
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN specializations s ON d.specialization_id = s.id
      JOIN appointment_slots sl ON a.slot_id = sl.id
      JOIN users u ON a.user_id = u.id
      WHERE a.id = $1 AND (a.user_id = $2 OR $3 = 'admin');
    `, [id, userId, req.user.role]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment details not found or access denied.',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

export const cancelAppointment = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    await client.query('BEGIN');

    // Check appointment ownership
    const apptCheck = await client.query(`
      SELECT id, slot_id, status 
      FROM appointments 
      WHERE id = $1 AND (user_id = $2 OR $3 = 'admin')
      FOR UPDATE;
    `, [id, userId, req.user.role]);

    if (apptCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Appointment not found or you do not have permission to cancel it.',
        code: 'NOT_FOUND'
      });
    }

    const appt = apptCheck.rows[0];

    if (appt.status === 'CANCELLED') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'This appointment is already cancelled.',
        code: 'ALREADY_CANCELLED'
      });
    }

    // Update appointment status to CANCELLED
    await client.query(`
      UPDATE appointments 
      SET status = 'CANCELLED', cancelled_at = NOW(), cancellation_reason = $1 
      WHERE id = $2;
    `, [reason || 'Cancelled by patient', id]);

    // Free the slot back to AVAILABLE so other patients can book it
    await client.query(`
      UPDATE appointment_slots 
      SET status = 'AVAILABLE' 
      WHERE id = $1;
    `, [appt.slot_id]);

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Your appointment has been safely cancelled. The slot has been released.',
      appointmentId: id
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Helper query function
const clientOrPoolQuery = (text, params) => pool.query(text, params);
