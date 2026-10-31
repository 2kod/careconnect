import express from 'express';
import { getPreferences, updatePreferences } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

export default router;

