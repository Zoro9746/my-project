import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middleware/validateMiddleware';
import { registerStudentSchema, loginSchema } from '../validators/authValidators';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', validateRequest(registerStudentSchema), AuthController.registerStudent);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticateToken, AuthController.getCurrentUser);
router.post('/logout', authenticateToken, AuthController.logout);

export default router;
