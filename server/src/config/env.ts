import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5000),
  dbUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  jwtExpires: process.env.JWT_EXPIRES ?? '8h',
  encryptionKey: process.env.ENCRYPTION_KEY ?? '0123456789abcdef0123456789abcdef',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
