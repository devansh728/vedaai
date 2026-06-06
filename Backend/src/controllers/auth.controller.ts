import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { User } from '../models/User';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, 
};

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.signUp(req.body);
      const userObj = user.toObject();
      delete (userObj as any).passwordHash;

      res.status(201).json({
        success: true,
        user: userObj,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accessToken, refreshToken, user } = await AuthService.login(req.body);
      
      const userObj = user.toObject();
      delete (userObj as any).passwordHash;

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      res.status(200).json({
        success: true,
        accessToken,
        user: userObj,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
      
      if (!incomingRefreshToken || typeof incomingRefreshToken !== 'string') {
        res.status(401).json({
          success: false,
          error: 'Session expired or refresh token missing.',
        });
        return;
      }

      const { accessToken, refreshToken } = await AuthService.refreshTokens(incomingRefreshToken);

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      if (userId) {
        await AuthService.logout(userId);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.userId).select('-passwordHash');
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User account not found.',
        });
        return;
      }
      res.status(200).json({
        success: true,
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async onboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User account not found.',
        });
        return;
      }

      const { profile, institution, targetGrades, primarySubjects } = req.body;
      
      user.profile = {
        title: profile?.title,
        role: profile?.role,
        avatarUrl: profile?.avatarUrl || '',
      };
      user.institution = institution;
      user.targetGrades = targetGrades;
      user.primarySubjects = primarySubjects;
      user.isOnboarded = true;

      await user.save();

      const userObj = user.toObject();
      delete (userObj as any).passwordHash;

      res.status(200).json({
        success: true,
        user: userObj,
      });
    } catch (err) {
      next(err);
    }
  }
}
