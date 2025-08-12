import { validationResult } from 'express-validator';

export function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return res.status(400).json({
      message: firstError,
      errors: errors.array()
    });
  }
  next();
}
