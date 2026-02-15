import mongoose from 'mongoose';
import { SensoryResult } from '../models/SensoryResult.js';

const testModules = [
  {
    id: 'reaction-time',
    title: 'Reaction Time',
    description: 'Measure stimulus response speed in milliseconds.',
    scoringHint: 'Lower score is better.'
  },
  {
    id: 'memory-sequence',
    title: 'Memory Sequence',
    description: 'Evaluate short-term memory recall capacity.',
    scoringHint: 'Higher score is better.'
  },
  {
    id: 'focus-score',
    title: 'Focus Score',
    description: 'Assess sustained attention using timed tasks.',
    scoringHint: 'Higher score is better.'
  }
];

export const getModules = (_, res) => {
  res.json(testModules);
};

export const submitResult = async (req, res) => {
  try {
    const { moduleType, score, metadata } = req.body;

    if (!moduleType || typeof score !== 'number' || Number.isNaN(score) || !Number.isFinite(score)) {
      return res.status(400).json({ message: 'moduleType and a valid numeric score are required.' });
    }

    const moduleExists = testModules.some((module) => module.id === moduleType);
    if (!moduleExists) {
      return res.status(400).json({ message: 'Invalid sensory module type.' });
    }

    const result = await SensoryResult.create({
      user: req.user.id,
      moduleType,
      score,
      metadata: metadata || {}
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save result.', error: error.message });
  }
};

export const getResults = async (req, res) => {
  try {
    const results = await SensoryResult.find({ user: req.user.id }).sort({ completedAt: -1 });
    return res.json(results);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch results.', error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const stats = await SensoryResult.aggregate([
      { $match: { user: userId } },
      { $sort: { completedAt: 1 } },
      {
        $group: {
          _id: '$moduleType',
          averageScore: { $avg: '$score' },
          latestScore: { $last: '$score' },
          attempts: { $sum: 1 }
        }
      }
    ]);

    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to build dashboard.', error: error.message });
  }
};
