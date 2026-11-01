import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticateToken, requireRole(['ADMIN', 'PHARMACIST', 'DOCTOR']));

router.get('/appointments', ReportController.getAppointmentSummaryReport);
router.get('/medications', ReportController.getMedicationConsumptionReport);
router.get('/stock-alerts', ReportController.getStockAndExpiryReport);
router.get('/visits', ReportController.getPatientVisitsReport);

export default router;
