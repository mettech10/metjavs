import crypto from 'crypto';
import { env } from '../config/env.js';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(env.encryptionKey, 'utf-8');

export function encrypt(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}.${tag.toString('hex')}.${encrypted.toString('hex')}`;
}

export function decrypt(payload: string): string {
  const [ivHex, tagHex, encryptedHex] = payload.split('.');
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
