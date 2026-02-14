import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import Client from '../models/Client';

const router = Router();

// List clients
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const clients = await Client.find({ tenantId }).sort({ name: 1 }).exec();
  res.json({ clients });
});

// Create client
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { name, domain } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const client = await Client.create({ tenantId, name, domain });
    res.status(201).json({ client: { id: client._id, name: client.name, domain: client.domain } });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Client already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

export default router;
