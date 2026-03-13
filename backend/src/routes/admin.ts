import { Router } from 'express';
import { dlqQueue } from '../queue';
import { requireAuth, requireAdmin } from '../middleware/auth';
import logger from '../shared/utils/logger';

const router = Router();

// This should be protected by admin role
router.use(requireAuth);
router.use(requireAdmin);

// List failed jobs in DLQ (or global fail list if managed differently)
router.get('/dlq', async (req, res) => {
  try {
    const queue = dlqQueue as any;
    if (!queue.getJobs) return res.json([]);
    const jobs = await queue.getJobs(['failed', 'waiting', 'active']);
    res.json(jobs.map((j: any) => ({
      id: j.id,
      name: j.name,
      data: j.data,
      failedReason: j.failedReason,
      stacktrace: j.stacktrace,
      timestamp: j.timestamp
    })));
  } catch (error: any) {
    logger.error(`Failed to list DLQ jobs: ${error.message}`);
    res.status(500).json({ error: 'Failed to list DLQ' });
  }
});

// Retry a specific job from DLQ
router.post('/dlq/:id/retry', async (req, res) => {
  try {
    const job = await dlqQueue.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    await job.retry();
    res.json({ success: true });
  } catch (error: any) {
    logger.error(`Failed to retry job ${req.params.id}: ${error.message}`);
    res.status(500).json({ error: 'Failed to retry job' });
  }
});

// Delete a job from DLQ
router.delete('/dlq/:id', async (req, res) => {
  try {
    const job = await dlqQueue.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    await job.remove();
    res.json({ success: true });
  } catch (error: any) {
    logger.error(`Failed to delete job ${req.params.id}: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

export default router;
