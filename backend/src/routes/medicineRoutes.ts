import { Router } from 'express';
import { MedicineController } from '../controllers/medicineController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { createMedicineSchema, updateMedicineSchema } from '../validators/stockValidators';

const router = Router();

router.get('/', authenticateToken, MedicineController.getAllMedicines);
router.get('/:id', authenticateToken, MedicineController.getMedicineById);
router.post('/', authenticateToken, requireRole(['PHARMACIST', 'ADMIN']), validateRequest(createMedicineSchema), MedicineController.createMedicine);
router.put('/:id', authenticateToken, requireRole(['PHARMACIST', 'ADMIN']), validateRequest(updateMedicineSchema), MedicineController.updateMedicine);

export default router;
