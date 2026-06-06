import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';

export class StorageService {
  private static s3Client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
    region: env.AWS_REGION,
    forcePathStyle: true, 
  });
  public static async uploadPDF(buffer: Buffer, fileName: string): Promise<string> {
    const key = `assessments/${fileName}.pdf`;
    
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: 'application/pdf',
      })
    );
    const baseUrl = env.S3_ENDPOINT.endsWith('/') ? env.S3_ENDPOINT : `${env.S3_ENDPOINT}/`;
    return `${baseUrl}${env.S3_BUCKET_NAME}/${key}`;
  }
}
