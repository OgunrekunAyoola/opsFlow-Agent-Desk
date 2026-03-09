import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import KBArticle from '../models/KBArticle';
import KBArticleProposal from '../models/KBArticleProposal';

const router = Router();

// --- Proposals (Level 4: Self-Learning) ---

router.get('/proposals', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const items = await KBArticleProposal.find({ tenantId, status: 'pending' })
    .sort({ confidenceScore: -1 })
    .exec();
  res.json({ items });
});

router.post('/proposals/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId, userId } = (req as any).currentUser;
  const { id } = req.params;
  const { title, body, tags } = req.body; // Allow override

  const proposal = await KBArticleProposal.findOne({ _id: id, tenantId });
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

  if (proposal.status !== 'pending') {
    return res.status(400).json({ error: 'Proposal already processed' });
  }

  // Create the actual article
  const article = await KBArticle.create({
    tenantId,
    title: title || proposal.title,
    body: body || proposal.content,
    tags: tags || proposal.tags,
    createdById: userId,
    updatedById: userId,
  });

  // Mark proposal as approved
  proposal.status = 'approved';
  await proposal.save();

  res.json({ article });
});

router.post('/proposals/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { id } = req.params;

  const proposal = await KBArticleProposal.findOneAndUpdate(
    { _id: id, tenantId },
    { status: 'rejected' },
    { new: true },
  );

  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
  res.json({ ok: true });
});

// --- Existing KB Routes ---

router.get('/', requireAuth, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { q } = (req.query as any) || {};

  const query: any = { tenantId };
  if (q && typeof q === 'string' && q.trim().length > 0) {
    const s = q.trim();
    query.$or = [
      { title: { $regex: s, $options: 'i' } },
      { body: { $regex: s, $options: 'i' } },
      { tags: { $elemMatch: { $regex: s, $options: 'i' } } },
    ];
  }

  const items = await KBArticle.find(query).sort({ updatedAt: -1 }).limit(100).exec();
  res.json({ items });
});

router.get('/:id', requireAuth, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { id } = req.params;

  const article = await KBArticle.findOne({ _id: id, tenantId }).exec();
  if (!article) {
    return res.status(404).json({ error: 'not_found' });
  }
  res.json({ article });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId, userId } = (req as any).currentUser;
  const { title, body, tags } = req.body || {};
  if (!title || !body) {
    return res.status(400).json({ error: 'title_and_body_required' });
  }

  const article = await KBArticle.create({
    tenantId,
    title,
    body,
    tags: Array.isArray(tags) ? tags : [],
    createdById: userId,
    updatedById: userId,
  });

  res.status(201).json({ article });
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId, userId } = (req as any).currentUser;
  const { id } = req.params;
  const { title, body, tags } = req.body || {};

  const article = await KBArticle.findOne({ _id: id, tenantId }).exec();
  if (!article) {
    return res.status(404).json({ error: 'not_found' });
  }

  if (typeof title === 'string' && title.trim()) {
    article.title = title.trim();
  }
  if (typeof body === 'string' && body.trim()) {
    article.body = body;
  }
  if (Array.isArray(tags)) {
    article.tags = tags;
  }
  article.updatedById = userId;

  await article.save();
  res.json({ article });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { id } = req.params;

  const article = await KBArticle.findOneAndDelete({ _id: id, tenantId }).exec();
  if (!article) {
    return res.status(404).json({ error: 'not_found' });
  }
  res.json({ ok: true });
});

export default router;
