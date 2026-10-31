import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in to proceed.',
      code: 'AUTH_TOKEN_MISSING'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'careconnect_super_secret_jwt_key_hci_2026_mujaipur', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Your session has expired or is invalid. Please log in again.',
        code: 'AUTH_TOKEN_INVALID'
      });
    }
    req.user = user;
    next();
  });
};

