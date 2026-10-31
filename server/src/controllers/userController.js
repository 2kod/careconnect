import pool from '../config/database.js';

export const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT font_size, high_contrast, voice_guidance, reduced_motion FROM user_accessibility_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        preferences: {
          font_size: 'normal',
          high_contrast: false,
          voice_guidance: false,
          reduced_motion: false
        }
      });
    }

    res.status(200).json({
      success: true,
      preferences: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fontSize, highContrast, voiceGuidance, reducedMotion } = req.body;

    const result = await pool.query(`
      INSERT INTO user_accessibility_preferences (user_id, font_size, high_contrast, voice_guidance, reduced_motion, updated_at)
      VALUES ($1, COALESCE($2, 'normal'), COALESCE($3, false), COALESCE($4, false), COALESCE($5, false), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        font_size = COALESCE(EXCLUDED.font_size, user_accessibility_preferences.font_size),
        high_contrast = COALESCE(EXCLUDED.high_contrast, user_accessibility_preferences.high_contrast),
        voice_guidance = COALESCE(EXCLUDED.voice_guidance, user_accessibility_preferences.voice_guidance),
        reduced_motion = COALESCE(EXCLUDED.reduced_motion, user_accessibility_preferences.reduced_motion),
        updated_at = NOW()
      RETURNING font_size, high_contrast, voice_guidance, reduced_motion;
    `, [userId, fontSize, highContrast, voiceGuidance, reducedMotion]);

    res.status(200).json({
      success: true,
      message: 'Accessibility preferences saved successfully.',
      preferences: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
