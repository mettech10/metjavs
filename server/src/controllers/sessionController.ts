import { Request, Response } from 'express';
import { Role, TestType } from '@prisma/client';
import { z } from 'zod';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { prisma } from '../config/prisma.js';
import { classifyAuditory, classifyOlfactory, classifyVisual, compositeRiskScore, toNormalizedVisual } from '../utils/scoring.js';
import { logAudit } from '../services/auditService.js';

const createSessionSchema = z.object({
  userId: z.string().optional(),
  testType: z.nativeEnum(TestType),
  deviceInfo: z.record(z.any()),
  environmentData: z.record(z.any()),
  rawResponses: z.array(z.record(z.any())),
  computedScores: z.record(z.any()),
  calibrationData: z.record(z.any()),
});

export async function createSession(req: Request, res: Response) {
  const parsed = createSessionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.flatten() });

  const targetUserId = req.user?.role === Role.PATIENT ? req.user.id : parsed.data.userId ?? req.user?.id;
  if (!targetUserId) return res.status(400).json({ message: 'userId is required' });

  const session = await prisma.testSession.create({
    data: {
      ...parsed.data,
      userId: targetUserId,
      createdById: req.user?.id,
    },
  });

  await logAudit('CREATE_TEST_SESSION', req.user?.id, 'TEST_SESSION', session.id, { testType: session.testType });
  return res.status(201).json(session);
}

export async function getMySessions(req: Request, res: Response) {
  const sessions = await prisma.testSession.findMany({
    where: req.user?.role === Role.PATIENT ? { userId: req.user.id } : {},
    orderBy: { timestamp: 'desc' },
    take: 200,
  });
  await logAudit('VIEW_SESSIONS', req.user?.id, 'TEST_SESSION');
  return res.json(sessions);
}

export async function simulate(req: Request, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) return res.status(401).json({ message: 'Unauthorized' });

  const visualLogmar = Number((Math.random() * 0.8).toFixed(2));
  const auditory = Number((-9 + Math.random() * 8).toFixed(2));
  const olfactoryRaw = Math.floor(5 + Math.random() * 8);
  const cognitive = Math.floor(50 + Math.random() * 50);
  const visualNorm = toNormalizedVisual(visualLogmar);
  const auditoryNorm = Math.max(0, Math.min(100, Number((((-auditory + 6) / 12) * 100).toFixed(1))));
  const olfactoryNorm = Number(((olfactoryRaw / 12) * 100).toFixed(1));
  const composite = compositeRiskScore({ cognitive, olfactory: olfactoryNorm, auditory: auditoryNorm, visual: visualNorm });

  const base = {
    userId: patientId,
    deviceInfo: { model: 'Sim Device', os: 'SimOS', browser: 'Chrome', screenSize: '428x926' },
    environmentData: { ambientNoise: 39.3, screenBrightness: 0.76, headphoneType: 'Wired' },
    calibrationData: { pixelDensity: 2.9, viewingDistanceCm: 40, noiseFloor: 31 },
  };

  const sessions = await prisma.$transaction([
    prisma.testSession.create({ data: { ...base, testType: TestType.VISUAL, rawResponses: [], computedScores: { logMar: visualLogmar, normalizedScore: visualNorm, classification: classifyVisual(visualLogmar) } } }),
    prisma.testSession.create({ data: { ...base, testType: TestType.AUDITORY, rawResponses: [], computedScores: { srtDbSnr: auditory, normalizedScore: auditoryNorm, classification: classifyAuditory(auditory) } } }),
    prisma.testSession.create({ data: { ...base, testType: TestType.OLFACTORY, rawResponses: [], computedScores: { rawCorrect: olfactoryRaw, normalizedScore: olfactoryNorm, classification: classifyOlfactory(olfactoryRaw) } } }),
    prisma.testSession.create({ data: { ...base, testType: TestType.COMPOSITE, rawResponses: [], computedScores: { ...composite, cognitiveScore: cognitive, visualScore: visualNorm, olfactoryScore: olfactoryNorm, auditoryScore: auditoryNorm } } }),
  ]);

  await logAudit('SIMULATE_TESTS', req.user?.id, 'TEST_SESSION', undefined, { count: sessions.length });
  return res.json({ sessions });
}

export async function exportCsv(req: Request, res: Response) {
  const sessions = await prisma.testSession.findMany({ where: { userId: req.user?.id }, orderBy: { timestamp: 'desc' } });
  const header = 'session_id,test_type,timestamp,classification,normalized_score\n';
  const rows = sessions
    .map((s) => `${s.id},${s.testType},${s.timestamp.toISOString()},${(s.computedScores as any).classification ?? ''},${(s.computedScores as any).normalizedScore ?? (s.computedScores as any).score ?? ''}`)
    .join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sessions.csv"');
  await logAudit('EXPORT_CSV', req.user?.id, 'TEST_SESSION');
  return res.send(header + rows);
}

export async function exportExcel(req: Request, res: Response) {
  const sessions = await prisma.testSession.findMany({ where: { userId: req.user?.id }, orderBy: { timestamp: 'desc' } });
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sessions');
  ws.columns = [
    { header: 'Session ID', key: 'id' },
    { header: 'Type', key: 'type' },
    { header: 'Timestamp', key: 'ts' },
    { header: 'Classification', key: 'classification' },
  ];
  sessions.forEach((s) => ws.addRow({ id: s.id, type: s.testType, ts: s.timestamp.toISOString(), classification: (s.computedScores as any).classification ?? '' }));
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="sessions.xlsx"');
  await logAudit('EXPORT_XLSX', req.user?.id, 'TEST_SESSION');
  await wb.xlsx.write(res);
  res.end();
}

export async function exportPdf(req: Request, res: Response) {
  const sessions = await prisma.testSession.findMany({ where: { userId: req.user?.id }, orderBy: { timestamp: 'desc' }, take: 12 });
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="neuro-sensory-report.pdf"');
  doc.pipe(res);
  doc.fontSize(16).text('Neuro-Sensory Cognitive Risk Report');
  doc.moveDown().fontSize(10).text('Screening only; not a medical diagnosis.');
  doc.text('Reference DOI: 10.1002/alz.70439');
  sessions.forEach((s) => {
    doc.moveDown().fontSize(11).text(`${s.testType} | ${s.timestamp.toISOString()} | ${(s.computedScores as any).classification ?? 'n/a'}`);
  });
  doc.end();
  await logAudit('EXPORT_PDF', req.user?.id, 'TEST_SESSION');
}

export async function clinicianPatients(req: Request, res: Response) {
  const risk = req.query.risk as string | undefined;
  const users = await prisma.user.findMany({ where: { role: Role.PATIENT }, take: 200, orderBy: { createdAt: 'desc' } });

  const data = await Promise.all(users.map(async (u) => {
    const latestComposite = await prisma.testSession.findFirst({ where: { userId: u.id, testType: TestType.COMPOSITE }, orderBy: { timestamp: 'desc' } });
    return {
      id: u.id,
      email: u.email,
      latestComposite: latestComposite?.computedScores ?? null,
      latestDate: latestComposite?.timestamp ?? null,
    };
  }));

  const filtered = risk ? data.filter((d) => (d.latestComposite as any)?.classification === risk) : data;
  await logAudit('CLINICIAN_VIEW_PATIENTS', req.user?.id, 'USER');
  return res.json(filtered);
}
