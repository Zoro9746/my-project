import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { bookAppointmentSchema, rescheduleAppointmentSchema } from '../validators/appointmentValidators';

const router = Router();

// Student appointment booking
router.post('/', authenticateToken, requireRole(['STUDENT']), validateRequest(bookAppointmentSchema), AppointmentController.bookAppointment);

// List appointments
router.get('/', authenticateToken, AppointmentController.getAppointments);

// Doctor today queue
router.get('/queue/today', authenticateToken, requireRole(['DOCTOR', 'ADMIN']), AppointmentController.getDoctorTodayQueue);

// Cancel & Reschedule
router.patch('/:id/cancel', authenticateToken, AppointmentController.cancelAppointment);
router.patch('/:id/reschedule', authenticateToken, validateRequest(rescheduleAppointmentSchema), AppointmentController.rescheduleAppointment);

export default router;
