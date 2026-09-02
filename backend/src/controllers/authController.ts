import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuthController {
  static async registerStudent(req: Request, res: Response) {
    try {
      const result = await AuthService.registerStudent(req.body);
      return sendSuccess(res, 'Student account registered successfully', result, 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Registration failed', 400);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return sendSuccess(res, 'Login successful', result);
    } catch (error: any) {
      return sendError(res, error.message || 'Login failed', 401);
    }
  }

  static async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthenticated', 401);
      }
      const user = await AuthService.getUserProfile(req.user.id);
      return sendSuccess(res, 'User profile fetched successfully', user);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch user profile', 400);
    }
  }

  static async logout(req: Request, res: Response) {
    // Stateles JWT logout acknowledgement
    return sendSuccess(res, 'Logged out successfully');
  }
}
