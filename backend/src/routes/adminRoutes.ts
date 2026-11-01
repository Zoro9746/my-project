import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import {
  updateUserStatusSchema,
  adminResetPasswordSchema,
  updateDoctorProfileSchema,
} from '../validators/adminValidators';

const router = Router();

// Require ADMIN role for all routes under /api/admin
router.use(authenticateToken, requireRole(['ADMIN']));

// Analytics
router.get('/analytics', AdminController.getAnalyticsOverview);

// User Management
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', validateRequest(updateUserStatusSchema), AdminController.updateUserStatus);
router.post('/users/:id/reset-password', validateRequest(adminResetPasswordSchema), AdminController.resetUserPassword);

// Doctor Roster & Schedule Controls
router.get('/doctors', AdminController.getDoctorsRoster);
router.put('/doctors/:id', validateRequest(updateDoctorProfileSchema), AdminController.updateDoctorInfo);

export default router;
