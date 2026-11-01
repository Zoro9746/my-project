import { Router } from 'express';
import { StockController } from '../controllers/stockController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { dispensePrescriptionSchema, addStockInSchema } from '../validators/stockValidators';

const router = Router();

// Atomic Dispensing (Pharmacist / Admin)
router.post('/dispense', authenticateToken, requireRole(['PHARMACIST', 'ADMIN']), validateRequest(dispensePrescriptionSchema), StockController.dispensePrescription);

// Stock Inward
router.post('/in', authenticateToken, requireRole(['PHARMACIST', 'ADMIN']), validateRequest(addStockInSchema), StockController.addStockIn);

// Stock Transactions Log
router.get('/transactions', authenticateToken, requireRole(['PHARMACIST', 'ADMIN']), StockController.getStockTransactions);

// Low-Stock and Near-Expiry Alerts
router.get('/alerts', authenticateToken, requireRole(['PHARMACIST', 'ADMIN', 'DOCTOR']), StockController.getStockAlerts);

export default router;
