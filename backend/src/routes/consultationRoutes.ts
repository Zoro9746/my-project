import { Router } from 'express';
import { ConsultationController } from '../controllers/consultationController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { completeConsultationSchema } from '../validators/consultationValidators';

const router = Router();

// Complete consultation (Doctor only)
router.post('/', authenticateToken, requireRole(['DOCTOR']), validateRequest(completeConsultationSchema), ConsultationController.completeConsultation);

// Doctor patient search
router.get('/patients/search', authenticateToken, requireRole(['DOCTOR', 'ADMIN']), ConsultationController.searchPatients);

// Patient history
router.get('/my-history', authenticateToken, requireRole(['STUDENT']), ConsultationController.getMyMedicalHistory);
router.get('/patients/:studentId/history', authenticateToken, requireRole(['DOCTOR', 'ADMIN']), ConsultationController.getPatientHistory);

export default router;
