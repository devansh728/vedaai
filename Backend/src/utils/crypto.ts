import crypto from 'crypto';

export class CryptoUtils {
  public static generateConfigHash(config: Record<string, any>): string {
    const sortedConfigString = JSON.stringify(config, Object.keys(config).sort());
    return crypto
      .createHash('sha256')
      .update(sortedConfigString)
      .digest('hex');
  }
}
