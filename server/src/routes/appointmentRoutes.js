import express from 'express';
import { 
  createAppointment, 
  getMyAppointments, 
  getAppointmentById, 
  cancelAppointment 
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createAppointment);
router.get('/my', getMyAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/cancel', cancelAppointment);

export default router;
