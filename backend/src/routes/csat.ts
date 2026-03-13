import { Router } from 'express';
import jwt from 'jsonwebtoken';
import CSAT from '../models/CSAT';
import Ticket from '../models/Ticket';
import { tenantScope } from '../shared/utils/tenantGuard';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { ticketId: string; tenantId: string };
    
    // Check if CSAT already exists
    const existing = await CSAT.findOne({ ticketId: decoded.ticketId, ...tenantScope(decoded.tenantId) });
    if (existing) {
      return res.status(400).json({ error: 'CSAT already submitted for this ticket' });
    }

    const csat = await CSAT.create({
      ticketId: decoded.ticketId,
      tenantId: decoded.tenantId,
      rating,
      comment,
    });

    res.status(201).json(csat);
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
    next(err);
  }
});

export default router;
