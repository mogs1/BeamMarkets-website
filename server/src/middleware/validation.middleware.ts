import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './error.middleware';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    // If there are errors, format them and throw an error
    const extractedErrors: { [key: string]: string } = {};
    errors.array().forEach(err => {
      extractedErrors[err.type] = err.msg;
    });
    
    throw new AppError(JSON.stringify(extractedErrors), 400);
  };
};