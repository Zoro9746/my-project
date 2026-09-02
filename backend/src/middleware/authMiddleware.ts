import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import { prisma } from '../config/prisma';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { id: string };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid format', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Check user active status in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user) {
      return sendError(res, 'User profile no longer exists', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'User account is deactivated. Contact Admin.', 403);
    }

    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error: any) {
    return sendError(res, 'Invalid or expired authentication token', 401, error.message);
  }
};
