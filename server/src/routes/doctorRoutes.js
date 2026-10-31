import express from 'express';
import { getSpecializations, getDoctors, getDoctorById } from '../controllers/doctorController.js';
import { getDoctorSlots } from '../controllers/slotController.js';

const router = express.Router();

router.get('/specializations', getSpecializations);
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:doctorId/slots', getDoctorSlots);

export default router;

