import { Request, Response } from 'express';
import multer from 'multer';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
): void {
  console.error('Runtime Failure Captured:', err);
  if (req.file) {
    req.file = undefined as any;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: 'File upload exceeds the 10MB maximum limit.',
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    });
    return;
  }

  if (err.message && err.message.includes('Only PDF and TXT files')) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(422).json({
      success: false,
      error: err.message,
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: 'Invalid identifier format.',
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'An unexpected server error occurred.' : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
