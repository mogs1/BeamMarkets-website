import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  console.error('Error:', err);
  
  if (err instanceof AppError) {
    return Promise.resolve(res.status(err.statusCode).json({
      message: err.message,
    }));
  }
  
  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    return Promise.resolve(res.status(400).json({
      message: err.message,
    }));
  }
  
  // Handle duplicate key errors
  if ((err as any).code === 11000) {
    return Promise.resolve(res.status(400).json({
      message: 'Duplicate field value entered',
    }));
  }
  
  // Default to 500 server error
  return Promise.resolve(res.status(500).json({
    message: 'Something went wrong',
  }));
};