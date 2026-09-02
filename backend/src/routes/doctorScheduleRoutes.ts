import { Router } from 'express';
import { DoctorScheduleController } from '../controllers/doctorScheduleController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { updateScheduleSchema } from '../validators/appointmentValidators';

const router = Router();

// Public / Authenticated doctor directory & slots
router.get('/', authenticateToken, DoctorScheduleController.getAllDoctors);
router.get('/:id', authenticateToken, DoctorScheduleController.getDoctorById);
router.get('/:id/availability', authenticateToken, DoctorScheduleController.getDoctorAvailability);

// Admin / Doctor schedule update
router.post('/:id/schedule', authenticateToken, requireRole(['DOCTOR', 'ADMIN']), validateRequest(updateScheduleSchema), DoctorScheduleController.updateSchedule);

export default router;
