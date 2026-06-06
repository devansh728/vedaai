import { Response, NextFunction } from 'express';
import { AuthUtils } from '../utils/auth';
import { AuthenticatedRequest } from '../types/auth.types'; 

export function checkAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Access token is missing or malformed',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = AuthUtils.verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Access token is expired or invalid',
    });
    return;
  }

  req.userId = payload.userId;
  req.userEmail = payload.email;
  next();
}
