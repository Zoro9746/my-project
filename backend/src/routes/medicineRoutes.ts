import { Router } from 'express';
import { MedicineController } from '../controllers/medicineController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, MedicineController.getAllMedicines);

export default router;
