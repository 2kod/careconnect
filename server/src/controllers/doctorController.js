import pool from '../config/database.js';

export const getSpecializations = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, icon_name FROM specializations ORDER BY name ASC'
    );
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

export const getDoctors = async (req, res, next) => {
  try {
    const { search, specializationId } = req.query;

    let queryText = `
      SELECT 
        d.id,
        d.full_name,
        d.qualification,
        d.experience_years,
        d.hospital_clinic_name,
        d.consultation_fee,
        d.bio,
        d.image_url,
        d.is_available,
        s.id as specialization_id,
        s.name as specialization_name,
        s.icon_name as specialization_icon
      FROM doctors d
      JOIN specializations s ON d.specialization_id = s.id
      WHERE d.is_available = true
    `;
    const params = [];

    if (specializationId) {
      params.push(specializationId);
      queryText += ` AND d.specialization_id = $${params.length}`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (d.full_name ILIKE $${params.length} OR s.name ILIKE $${params.length} OR d.hospital_clinic_name ILIKE $${params.length})`;
    }

    queryText += ' ORDER BY d.experience_years DESC';

    const result = await pool.query(queryText, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        d.id,
        d.full_name,
        d.qualification,
        d.experience_years,
        d.hospital_clinic_name,
        d.consultation_fee,
        d.bio,
        d.image_url,
        d.is_available,
        s.id as specialization_id,
        s.name as specialization_name,
        s.icon_name as specialization_icon
      FROM doctors d
      JOIN specializations s ON d.specialization_id = s.id
      WHERE d.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found. Please choose from our available healthcare providers.',
        code: 'DOCTOR_NOT_FOUND'
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
