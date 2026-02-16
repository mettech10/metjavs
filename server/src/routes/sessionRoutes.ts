import { Router } from 'express';
import { Role } from '@prisma/client';
import { clinicianPatients, createSession, exportCsv, exportExcel, exportPdf, getMySessions, simulate } from '../controllers/sessionController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getMySessions);
router.post('/', createSession);
router.post('/dev/simulate', simulate);
router.get('/export/csv', exportCsv);
router.get('/export/excel', exportExcel);
router.get('/export/pdf', exportPdf);
router.get('/clinician/patients', requireRole([Role.CLINICIAN, Role.ADMIN]), clinicianPatients);

export default router;
