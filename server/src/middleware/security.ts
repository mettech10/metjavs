import rateLimit from 'express-rate-limit';
import { NextFunction, Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 250,
  standardHeaders: true,
  legacyHeaders: false,
});

export function enforceHttps(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== 'development' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.status(400).json({ message: 'HTTPS required' });
  }
  return next();
}

export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== 'object') {
    return next();
  }

  const scrub = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
    }
    if (Array.isArray(value)) return value.map(scrub);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrub(v)]));
    }
    return value;
  };

  req.body = scrub(req.body);
  return next();
}
