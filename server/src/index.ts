import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import { env } from './config/env.js';
import { apiRateLimiter, enforceHttps, sanitizeBody } from './middleware/security.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));
app.use(enforceHttps);
app.use(apiRateLimiter);
app.use(sanitizeBody);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.port, () => {
    console.log(`Server running on ${env.port}`);
  });
}

export default app;
