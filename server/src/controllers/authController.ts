import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { encrypt } from '../utils/crypto.js';
import { logAudit } from '../services/auditService.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.nativeEnum(Role).optional(),
  dob: z.string().optional(),
  consentAccepted: z.boolean(),
});

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.flatten() });
  if (!parsed.data.consentAccepted) return res.status(400).json({ message: 'Informed consent is required.' });

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return res.status(409).json({ message: 'Email already exists' });

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      role: parsed.data.role ?? Role.PATIENT,
      firstNameEnc: encrypt(parsed.data.firstName),
      lastNameEnc: encrypt(parsed.data.lastName),
      dobEnc: parsed.data.dob ? encrypt(parsed.data.dob) : null,
    },
  });

  await logAudit('REGISTER', user.id, 'USER', user.id);
  return res.status(201).json({ id: user.id, email: user.email, role: user.role });
}

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.flatten() });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, env.jwtSecret, { expiresIn: env.jwtExpires });
  await logAudit('LOGIN', user.id, 'USER', user.id);
  return res.json({ token, role: user.role, id: user.id, email: user.email });
}
