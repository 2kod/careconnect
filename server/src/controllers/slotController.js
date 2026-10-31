import pool from '../config/database.js';

export const getDoctorSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Please specify an appointment date (format: YYYY-MM-DD).',
        code: 'DATE_REQUIRED'
      });
    }

    const result = await pool.query(`
      SELECT 
        id,
        doctor_id,
        slot_date,
        TO_CHAR(start_time, 'HH12:MI AM') as formatted_start,
        TO_CHAR(end_time, 'HH12:MI AM') as formatted_end,
        start_time,
        end_time,
        status,
        CASE 
          WHEN start_time < '12:00:00' THEN 'Morning'
          ELSE 'Afternoon'
        END as period
      FROM appointment_slots
      WHERE doctor_id = $1 AND slot_date = $2
      ORDER BY start_time ASC
    `, [doctorId, date]);

    // Grouping by period for reduced cognitive load
    const morningSlots = [];
    const afternoonSlots = [];

    result.rows.forEach(slot => {
      const slotData = {
        id: slot.id,
        doctorId: slot.doctor_id,
        slotDate: slot.slot_date,
        formattedStart: slot.formatted_start,
        formattedEnd: slot.formatted_end,
        label: `${slot.formatted_start} - ${slot.formatted_end}`,
        status: slot.status,
        isAvailable: slot.status === 'AVAILABLE',
        period: slot.period
      };

      if (slot.period === 'Morning') {
        morningSlots.push(slotData);
      } else {
        afternoonSlots.push(slotData);
      }
    });

    res.status(200).json({
      success: true,
      date,
      totalSlots: result.rows.length,
      availableSlotsCount: result.rows.filter(s => s.status === 'AVAILABLE').length,
      grouped: {
        morning: morningSlots,
        afternoon: afternoonSlots
      },
      allSlots: result.rows.map(slot => ({
        id: slot.id,
        doctorId: slot.doctor_id,
        slotDate: slot.slot_date,
        formattedStart: slot.formatted_start,
        formattedEnd: slot.formatted_end,
        label: `${slot.formatted_start} - ${slot.formatted_end}`,
        status: slot.status,
        isAvailable: slot.status === 'AVAILABLE',
        period: slot.period
      }))
    });
  } catch (err) {
    next(err);
  }
};
