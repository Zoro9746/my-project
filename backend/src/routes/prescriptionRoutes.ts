import { Router } from 'express';
import { PrescriptionController } from '../controllers/prescriptionController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, PrescriptionController.getAllPrescriptions);
router.get('/:id', authenticateToken, PrescriptionController.getPrescriptionById);

export default router;
