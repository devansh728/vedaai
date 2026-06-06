import { User, IUser } from '../models/User';
import { AuthUtils } from '../utils/auth';
import { CacheService } from './cache.service';

export class AuthService {
  public static async signUp(userData: { name: string; email: string; password: string }): Promise<IUser> {
    const emailLower = userData.email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    
    if (existingUser) {
      throw new Error('A user with this email address already exists.');
    }

    const passwordHash = await AuthUtils.hashPassword(userData.password);
    const user = new User({
      name: userData.name,
      email: emailLower,
      passwordHash,
      isOnboarded: false,
    });

    return user.save();
  }

  public static async login(credentials: { email: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: IUser;
  }> {
    const emailLower = credentials.email.toLowerCase();
    const user = await User.findOne({ email: emailLower });
    
    if (!user) {
      throw new Error('Invalid email or password credentials.');
    }

    const isValid = await AuthUtils.verifyPassword(credentials.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password credentials.');
    }

    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken = AuthUtils.generateAccessToken(payload);
    const refreshToken = AuthUtils.generateRefreshToken(payload);
    const cacheKey = `refresh_token:${user._id.toString()}`;
    await CacheService.set(cacheKey, refreshToken, 604800);

    return { accessToken, refreshToken, user };
  }

  public static async refreshTokens(incomingRefreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = AuthUtils.verifyRefreshToken(incomingRefreshToken);
    if (!payload) {
      throw new Error('Refresh token is invalid or expired.');
    }

    const cacheKey = `refresh_token:${payload.userId}`;
    const storedToken = await CacheService.get(cacheKey);

    if (!storedToken || storedToken !== incomingRefreshToken) {
      await CacheService.del(cacheKey);
      throw new Error('Refresh token reuse detected or session expired.');
    }

    const newPayload = { userId: payload.userId, email: payload.email };
    const newAccessToken = AuthUtils.generateAccessToken(newPayload);
    const newRefreshToken = AuthUtils.generateRefreshToken(newPayload);
    await CacheService.set(cacheKey, newRefreshToken, 604800);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  public static async logout(userId: string): Promise<void> {
    const cacheKey = `refresh_token:${userId}`;
    await CacheService.del(cacheKey);
  }
}
