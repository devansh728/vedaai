import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export class AuthUtils {
  private static readonly SALT_LENGTH = 16;
  public static hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(this.SALT_LENGTH).toString('hex');
      crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }
  public static verifyPassword(password: string, storedHash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = storedHash.split(':');
      crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex') === key);
      });
    });
  }
  public static generateAccessToken(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
  }
  public static generateRefreshToken(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }
  public static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch {
      return null;
    }
  }
  public static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch {
      return null;
    }
  }
}
