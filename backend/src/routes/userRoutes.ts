import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { updateProfileSchema } from '../validators/authValidators';

const router = Router();

router.get('/profile', authenticateToken, UserController.getProfile);
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), UserController.updateProfile);

// Admin-only endpoints
router.get('/', authenticateToken, requireRole(['ADMIN']), UserController.getAllUsers);
router.patch('/:id/status', authenticateToken, requireRole(['ADMIN']), UserController.toggleUserStatus);

export default router;
