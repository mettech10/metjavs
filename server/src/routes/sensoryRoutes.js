import express from 'express';
import {
  getDashboardStats,
  getModules,
  getResults,
  submitResult
} from '../controllers/sensoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/modules', protect, getModules);
router.post('/results', protect, submitResult);
router.get('/results', protect, getResults);
router.get('/dashboard', protect, getDashboardStats);

export default router;
