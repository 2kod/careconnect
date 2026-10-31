import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // HCI Input Validation with clear, empathetic guidance
    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your full name (at least 2 letters).',
        code: 'VALIDATION_FAILED'
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address (e.g. name@example.com).',
        code: 'VALIDATION_FAILED'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long for your account security.',
        code: 'VALIDATION_FAILED'
      });
    }

    // Check existing email
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Try logging in instead.',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(`
      INSERT INTO users (full_name, email, password_hash, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, phone, role, created_at;
    `, [fullName.trim(), email.toLowerCase().trim(), passwordHash, phone || null]);

    const newUser = result.rows[0];

    // Seed default accessibility preferences for this new user
    await pool.query(`
      INSERT INTO user_accessibility_preferences (user_id, font_size, high_contrast, voice_guidance)
      VALUES ($1, 'normal', false, false)
      ON CONFLICT DO NOTHING;
    `, [newUser.id]);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.full_name },
      process.env.JWT_SECRET || 'careconnect_super_secret_jwt_key_hci_2026_mujaipur',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to CareConnect.',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both your email address and password.',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const userRes = await pool.query(
      'SELECT id, full_name, email, password_hash, phone, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'No account was found with that email address. Please double check or create an account.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'The password entered is incorrect. Please try again.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Retrieve user's accessibility preferences
    const prefRes = await pool.query(
      'SELECT font_size, high_contrast, voice_guidance, reduced_motion FROM user_accessibility_preferences WHERE user_id = $1',
      [user.id]
    );

    const preferences = prefRes.rows[0] || {
      font_size: 'normal',
      high_contrast: false,
      voice_guidance: false,
      reduced_motion: false
    };

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
      process.env.JWT_SECRET || 'careconnect_super_secret_jwt_key_hci_2026_mujaipur',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      preferences
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userRes = await pool.query(
      'SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User account not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    const prefRes = await pool.query(
      'SELECT font_size, high_contrast, voice_guidance, reduced_motion FROM user_accessibility_preferences WHERE user_id = $1',
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      user: userRes.rows[0],
      preferences: prefRes.rows[0] || {
        font_size: 'normal',
        high_contrast: false,
        voice_guidance: false,
        reduced_motion: false
      }
    });
  } catch (err) {
    next(err);
  }
};

